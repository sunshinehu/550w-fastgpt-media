import {beforeEach,describe,it,expect,vi} from 'vitest';
const invoke=vi.hoisted(()=>vi.fn());
vi.mock('./vendor/runtime.cjs',()=>({invokeWithCredentials:invoke}));
import factory,{decodeImage} from './index';
const ctx=(userNo='user-a',apiKey='secret-a')=>({secrets:{userNo,apiKey},systemVar:{},invoke:{},streamResponse:()=>{}} as any);
const call=(id:string,input:any,context=ctx())=>factory.getToolHandler(id)!.handler(input,context);
beforeEach(()=>invoke.mockReset().mockResolvedValue({code:200,message:'OK',status:'processing',taskId:'task-123'}));
describe('FastGPT contract',()=>{
 it('registers exactly six stable tools and encrypted credentials',()=>{
  expect(factory.getChildManifests().map(x=>x.id)).toEqual(['query-credits','parse-share-link','submit-image','query-image','submit-video','query-video']);
  for(const field of Object.values((factory.getSecretSchema() as any).shape))expect((field as any).meta().isSecret).toBe(true);
 });
 it('blocks missing, false and coerced consent before decoding or network',async()=>{
  for(const confirmProcessing of [undefined,false,'true',1])await expect(call('submit-image',{fileName:'x.png',imageBase64:'invalid',operationId:'op-123456',confirmProcessing})).rejects.toThrow('输入无效');
  expect(invoke).not.toHaveBeenCalled();
 });
 it('rejects malformed image data and mismatched extension',()=>{
  for(const [name,data] of [['x.png','AAAA'],['x.jpg','iVBORw0KGgo='],['x.png','%%%'],['x.exe','iVBORw0KGgo=']])expect(()=>decodeImage(name!,data!)).toThrow();
 });
 it('submits valid bytes asynchronously with stable operation ID',async()=>{
  await call('submit-image',{fileName:'x.png',imageBase64:'iVBORw0KGgo=',operationId:'op-123456',confirmProcessing:true});
  const request=invoke.mock.calls[0]![0];
  expect(request.action).toBe('removeImageWatermark');expect(request.params.sync).toBe(false);
  expect(request.params.file.data).toEqual(Buffer.from('iVBORw0KGgo=','base64'));expect(request.params.operationId).toBe('op-123456');
 });
 it('passes credentials per invocation without returning them',async()=>{
  const results=await Promise.all([call('query-credits',{},ctx('user-a','secret-a')),call('query-credits',{},ctx('user-b','secret-b'))]);
  expect(invoke.mock.calls.map(c=>c[1])).toEqual([{userNo:'user-a',apiKey:'secret-a'},{userNo:'user-b',apiKey:'secret-b'}]);
  expect(JSON.stringify(results)).not.toContain('secret-');
 });
 it('rejects missing secrets without falling back to the process user',async()=>{
  await expect(call('query-credits',{}, {...ctx(),secrets:undefined})).rejects.toThrow('配置');expect(invoke).not.toHaveBeenCalled();
 });
 it('preserves pending state and makes one call without polling or retries',async()=>{
  const output=await call('query-video',{taskId:'task-123'});expect(output.result.status).toBe('processing');expect(output.result).not.toHaveProperty('downloadUrl');expect(invoke).toHaveBeenCalledTimes(1);
 });
 it('does not echo invalid secret input or raw validation details',async()=>{
  await expect(call('query-image',{taskId:''},ctx('user-a','secret-a'))).rejects.toThrow('输入无效');expect(invoke).not.toHaveBeenCalled();
 });
});
