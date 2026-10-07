import {createToolHandler, defineToolSet, type SecretSchemaMetaType} from '@fastgpt-plugin/sdk-factory';
import z from 'zod';
import packageMetadata from './package.json';
import {invokeWithCredentials, type ActionType} from './vendor/runtime.cjs';

export const secretSchema=z.object({
  userNo:z.string().min(1).max(256).meta({title:'550W 用户编号',isSecret:true} satisfies SecretSchemaMetaType),
  apiKey:z.string().min(1).max(256).meta({title:'550W API Key',isSecret:true} satisfies SecretSchemaMetaType)
});
const outputSchema=z.object({code:z.number().int(),message:z.string(),result:z.record(z.string(),z.unknown())});
const confirm=z.boolean().refine(value=>value===true,'必须取得本次发送素材及可能扣费的用户确认').meta({title:'用户已确认本次处理及可能扣费'});
const operationId=z.string().regex(/^[A-Za-z0-9._:-]{8,128}$/).meta({title:'稳定操作编号；查询结果前不要换编号重试'});
const taskId=z.string().min(1).max(128).meta({title:'提交返回的 taskId'});
export function decodeImage(name:string,base64:string) {
  if(!/\.(png|jpe?g|webp)$/i.test(name) || !base64.length || base64.length>69905068 || base64.length%4!==0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64))
    throw new Error('图片需为 PNG/JPEG/WebP 的标准 base64，最大 50MB');
  const data=Buffer.from(base64,'base64');
  if(data.toString('base64')!==base64 || data.length<1 || data.length>52428800)throw new Error('图片最大 50MB');
  const png=data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpeg=data[0]===255&&data[1]===216&&data[2]===255;
  const webp=data.subarray(0,4).toString()==='RIFF'&&data.subarray(8,12).toString()==='WEBP';
  if(!(/\.png$/i.test(name)?png:/\.jpe?g$/i.test(name)?jpeg:webp))throw new Error('图片内容与文件扩展名不符');
  return {name,size:data.length,data};
}
function tool<S extends z.ZodRawShape>(action:ActionType,inputSchema:z.ZodObject<S>,prepare?:(input:z.output<z.ZodObject<S>>)=>Record<string,unknown>){
  return createToolHandler({inputSchema,outputSchema,secretSchema,handler:async(input,ctx)=>{
    const parsed=inputSchema.safeParse(input);
    if(!parsed.success)throw new Error('输入无效：请核对文件、任务参数和本次处理确认');
    const secrets=secretSchema.safeParse(ctx.secrets);
    if(!secrets.success)throw new Error('请配置个人 550W 用户编号和 API Key');
    const response=await invokeWithCredentials({action,params:{...(prepare?prepare(parsed.data):parsed.data),region:'cn',locale:'zh-CN'}},secrets.data);
    const {code,message,...result}=response;
    return {code,message,result};
  }});
}
export default defineToolSet({manifest:{pluginId:'media550wCn',name:{en:'550W Media', 'zh-CN':'550W 媒体处理'},
 description:{en:'Async image and video cleanup with private credentials and explicit processing consent.', 'zh-CN':'私有凭据接入的图片、视频异步处理与任务查询。需用户确认，处理可能扣除 550W 积分。'},
 version:packageMetadata.version,versionDescription:{en:'Initial local candidate; host acceptance pending.', 'zh-CN':'初版本地候选，待宿主验收。'},author:'550W'},secretSchema,
 children:[
 {id:'query-credits',name:{en:'Query credits','zh-CN':'查询积分'},description:{en:'Read remaining credits.','zh-CN':'只读查询剩余积分。'},handler:tool('queryCredits',z.object({}))},
 {id:'parse-share-link',name:{en:'Parse video share link','zh-CN':'解析视频分享链接'},description:{en:'Send a copied video share link; may spend credits.','zh-CN':'发送复制的分享链接进行平台水印解析，可能扣费。'},handler:tool('removeVideoWatermark',z.object({videoUrl:z.string().min(1).max(4096),operationId,confirmProcessing:confirm}))},
 {id:'submit-image',name:{en:'Submit image','zh-CN':'提交图片处理'},description:{en:'Submit a base64 image asynchronously; query its task ID instead of retrying.','zh-CN':'标准 base64 图片异步提交，可能扣费；返回任务编号后查询，不自动重试。'},handler:tool('removeImageWatermark',z.object({fileName:z.string().min(1).max(200),imageBase64:z.string().min(1).max(69905068),operationId,confirmProcessing:confirm}),input=>({file:decodeImage(input.fileName,input.imageBase64),operationId:input.operationId,confirmProcessing:input.confirmProcessing,sync:false}))},
 {id:'query-image',name:{en:'Query image task','zh-CN':'查询图片任务'},description:{en:'Read task state and result URL.','zh-CN':'只读查询图片任务状态与结果链接，处理中不称完成。'},handler:tool('imageWatermarkTaskDetail',z.object({taskId}))},
 {id:'submit-video',name:{en:'Submit video','zh-CN':'提交视频处理'},description:{en:'Submit a direct video URL with actual dimensions and duration; may spend credits.','zh-CN':'提交公开视频直链及实际尺寸、时长，可能扣费。选区须完整，否则默认全画面处理。'},handler:tool('submitTask',z.object({videoUrl:z.string().url().max(4096),width:z.number().int().positive(),height:z.number().int().positive(),duration:z.number().positive(),x1:z.number().int().nonnegative().optional(),y1:z.number().int().nonnegative().optional(),x2:z.number().int().nonnegative().optional(),y2:z.number().int().nonnegative().optional(),idempotencyKey:operationId,confirmProcessing:confirm}))},
 {id:'query-video',name:{en:'Query video task','zh-CN':'查询视频任务'},description:{en:'Read task state and result URL.','zh-CN':'只读查询视频任务状态与结果链接，处理中不称完成。'},handler:tool('taskDetail',z.object({taskId}))}
 ]});
