import type { SkillRequest, SkillResponse, Credential } from "./types";
import { ErrorCode } from "./types";
import { ApiClient } from "./api-client";
import { validateCredential } from "./validator";
import { requireProcessingApproval } from "./processing-approval";
import { queryCredits } from "./actions/query-credits";
import { removeVideoWatermark } from "./actions/remove-video-watermark";
import { removeImageWatermark } from "./actions/remove-image-watermark";
import { imageWatermarkTaskDetail } from "./actions/image-watermark-task-detail";
import { submitTask } from "./actions/submit-task";
import { taskDetail } from "./actions/task-detail";

/** Restricted host entry: credentials are supplied per invocation; no local probes or credential store. */
export async function invokeWithCredentials(request: SkillRequest, credential: Credential): Promise<SkillResponse> {
  const approvalError = requireProcessingApproval(request.action, request.params);
  if (approvalError) return approvalError;
  const invalid = validateCredential(credential?.userNo, credential?.apiKey, request.params?.locale);
  if (invalid) return invalid;
  const client = new ApiClient({ userNo: credential.userNo.trim(), apiKey: credential.apiKey.trim() }, request.params?.locale);
  switch (request.action) {
    case "queryCredits": return queryCredits(request.params, client);
    case "removeVideoWatermark": return removeVideoWatermark(request.params, client);
    case "removeImageWatermark": return removeImageWatermark(request.params, client);
    case "imageWatermarkTaskDetail": return imageWatermarkTaskDetail(request.params, client);
    case "submitTask": return submitTask(request.params, client);
    case "taskDetail": return taskDetail(request.params, client);
    default: return { code: ErrorCode.INVALID_PARAMS, message: "Unsupported host action" };
  }
}

export type { ActionType } from "./types";
