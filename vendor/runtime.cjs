"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// host-tools.ts
var host_tools_exports = {};
__export(host_tools_exports, {
  invokeWithCredentials: () => invokeWithCredentials
});
module.exports = __toCommonJS(host_tools_exports);

// types.ts
var TIMEOUT_CONFIG = {
  upload: 18e4,
  submit: 15e4,
  query: 1e4,
  videoWatermark: 45e3,
  imageWatermark: 18e4
};
var MAX_FILE_SIZE = 1073741824;
var MAX_URL_LENGTH = 2048;
var MAX_DURATION = 600;
var MAX_DIMENSION = 1e4;
var MAX_TASK_ID_LENGTH = 64;
var MAX_CREDENTIAL_LENGTH = 128;
var MAX_IMAGE_FILE_SIZE = 52428800;
var RESOLUTION_720P_THRESHOLD = 921600;
var RATE_720P_OR_BELOW = 1.3;
var RATE_ABOVE_720P = 1.6;
var BASE_URL = "https://www.550wai.cn";
var SUPPORTED_VIDEO_EXTENSIONS = [".mp4", ".mov"];
var SUPPORTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".bmp", ".webp", ".avif", ".tif", ".tiff", ".svg"];

// integration-attribution.ts
function integrationHeaders() {
  return { "X-550W-Product": "adapter-fastgpt", "X-550W-Product-Version": "0.0.1", "X-550W-Distribution": "fastgpt-cn" };
}

// api-client.ts
var import_node_https = __toESM(require("node:https"), 1);
var import_node_crypto = require("node:crypto");
var import_node_stream = require("node:stream");

// i18n.ts
var fs = __toESM(require("fs"), 1);
var path = __toESM(require("path"), 1);
var distribution;
function packagedDistribution() {
  if (distribution !== void 0) return distribution;
  try {
    const value = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../distribution.json"), "utf8"));
    distribution = (value.region === "domestic" || value.region === "global") && typeof value.locale === "string" ? { region: value.region, locale: value.locale } : null;
  } catch {
    distribution = null;
  }
  return distribution;
}
var GLOBAL_API_LOCALES = /* @__PURE__ */ new Set([
  "zh-Hans",
  "zh-Hant",
  "ja",
  "ko",
  "es",
  "es-MX",
  "fr",
  "fr-CA",
  "de",
  "pt-BR",
  "pt-PT",
  "it",
  "ru",
  "ar",
  "he",
  "id",
  "ms",
  "nl",
  "pl",
  "th",
  "tr",
  "uk",
  "vi",
  "hi"
]);
var GLOBAL_LOCALE_ALIASES = {
  "es-419": "es-MX",
  pt: "pt-BR"
};
function resolveLocale(value) {
  const packaged = packagedDistribution();
  if (packaged?.region === "domestic") return "zh";
  const language = String(value || packaged?.locale || process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || "").toLowerCase();
  return language.startsWith("zh") || language.includes("zh_") || language.includes("zh-") ? "zh" : "en";
}
function localize(locale, zh, en) {
  return resolveLocale(locale) === "zh" ? zh : en;
}
function resolveGlobalApiLocale(value) {
  const raw = String(value || "").trim().replace(/_/g, "-").replace(/\..*$/, "");
  if (!raw) return "en";
  const normalized = raw.toLowerCase();
  if (["zh", "zh-cn", "zh-sg", "zh-hans"].includes(normalized)) return "zh-Hans";
  if (["zh-tw", "zh-hk", "zh-mo", "zh-hant"].includes(normalized)) return "zh-Hant";
  const exact = [...GLOBAL_API_LOCALES].find((item) => item.toLowerCase() === raw.toLowerCase());
  if (exact) return exact;
  const alias = Object.entries(GLOBAL_LOCALE_ALIASES).find(([key]) => key.toLowerCase() === raw.toLowerCase())?.[1];
  if (alias) return alias;
  const primary = raw.split("-")[0].toLowerCase();
  return [...GLOBAL_API_LOCALES].find((item) => item.toLowerCase() === primary) || "en";
}
function resolveServiceRegion(value, locale) {
  const packaged = packagedDistribution();
  if (packaged) return packaged.region;
  const configured = String(value || process.env.SUBTITLE_REMOVER_REGION || "").trim().toLowerCase();
  if (configured === "domestic" || configured === "cn" || configured === "china") return "domestic";
  if (configured === "global" || configured === "overseas" || configured === "international") return "global";
  return resolveLocale(locale) === "zh" ? "domestic" : "global";
}
function credentialApplyUrl(locale, region) {
  if (resolveServiceRegion(region, locale) === "domestic") return "https://qzm.550wai.cn/api-keys";
  const globalLocale = resolveGlobalApiLocale(locale);
  return globalLocale === "en" ? "https://eraser.550wai.com/api/" : `https://eraser.550wai.com/${globalLocale}/api/`;
}
function creditPurchaseUrl(locale, region) {
  if (resolveServiceRegion(region, locale) === "domestic") {
    return integrationHeaders()["X-550W-Distribution"] === "qianwen-cn" ? "https://qzm.550wai.cn/purchase?tab=speed&source=agent&agent=qianwen" : "https://qzm.550wai.cn/purchase?tab=speed&source=agent";
  }
  const globalLocale = resolveGlobalApiLocale(locale);
  return globalLocale === "en" ? "https://eraser.550wai.com/purchase/?source=agent" : `https://eraser.550wai.com/${globalLocale}/purchase/?source=agent`;
}

// api-client.ts
var ApiClient = class {
  credential;
  baseUrl;
  locale;
  constructor(credential, locale) {
    this.credential = credential;
    this.baseUrl = BASE_URL;
    this.locale = locale;
  }
  async post(endpoint, params, timeout) {
    try {
      const body = new URLSearchParams({
        userNo: this.credential.userNo,
        apiKey: this.credential.apiKey,
        ...params
      });
      return this.parseResponse(await this.request(endpoint, body.toString(), {
        "Content-Type": "application/x-www-form-urlencoded"
      }, timeout));
    } catch (error) {
      return this.handleError(error);
    }
  }
  async upload(endpoint, params, file, timeout, fieldName = "file") {
    try {
      const boundary = `550w-${(0, import_node_crypto.randomBytes)(16).toString("hex")}`;
      const fields = { userNo: this.credential.userNo, apiKey: this.credential.apiKey, ...params };
      const part = (name, value) => `--${boundary}\r
Content-Disposition: form-data; name="${this.safeHeader(name)}"\r
\r
${value}\r
`;
      const chunks = Object.entries(fields).map(([name, value]) => part(name, value));
      chunks.push(`--${boundary}\r
Content-Disposition: form-data; name="${this.safeHeader(fieldName)}"; filename="${this.safeHeader(file.name)}"\r
Content-Type: application/octet-stream\r
\r
`);
      const body = import_node_stream.Readable.from((async function* () {
        for (const chunk of chunks) yield chunk;
        if (Buffer.isBuffer(file.data)) yield file.data;
        else for await (const chunk of file.data) yield chunk;
        yield `\r
--${boundary}--\r
`;
      })());
      return this.parseResponse(await this.request(endpoint, body, {
        "Content-Type": `multipart/form-data; boundary=${boundary}`
      }, timeout));
    } catch (error) {
      return this.handleError(error);
    }
  }
  safeHeader(value) {
    return value.replace(/[\r\n"\\]/g, "_");
  }
  request(endpoint, body, headers, timeout) {
    return new Promise((resolve2, reject) => {
      const url = new URL(endpoint, this.baseUrl);
      if (url.origin !== new URL(this.baseUrl).origin) {
        reject(new Error("Invalid API endpoint"));
        return;
      }
      const request = import_node_https.default.request(url, { method: "POST", headers: { ...headers, ...integrationHeaders() } }, (response) => {
        const chunks = [];
        let size = 0;
        response.on("data", (chunk) => {
          size += chunk.length;
          if (size > 2 * 1024 * 1024) {
            request.destroy(new Error("API response too large"));
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () => {
          clearTimeout(timer);
          if ((response.statusCode ?? 0) >= 300 && (response.statusCode ?? 0) < 400) {
            reject(new Error("API redirects are not allowed"));
            return;
          }
          try {
            resolve2(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch (error) {
            reject(error);
          }
        });
        response.on("error", reject);
      });
      const timer = setTimeout(() => {
        const error = Object.assign(new Error("Request timed out"), { code: "ETIMEDOUT" });
        request.destroy(error);
      }, timeout);
      request.on("error", (error) => {
        clearTimeout(timer);
        if (body instanceof import_node_stream.Readable) body.destroy();
        reject(error);
      });
      if (body instanceof import_node_stream.Readable) {
        body.on("error", (error) => request.destroy(error));
        body.pipe(request);
      } else request.end(body);
    });
  }
  parseResponse(data) {
    if (data == null || typeof data.code === "undefined") {
      return { code: -500, message: localize(this.locale, "\u54CD\u5E94\u683C\u5F0F\u5F02\u5E38", "The service returned an invalid response") };
    }
    return data;
  }
  handleError(error) {
    const responseData = error?.response?.data;
    if (responseData != null && typeof responseData.code !== "undefined") {
      return this.parseResponse(responseData);
    }
    if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
      return { code: -500, message: localize(this.locale, "\u8BF7\u6C42\u8D85\u65F6\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5\u540E\u91CD\u8BD5", "The request timed out; check your connection and try again") };
    }
    return { code: -500, message: localize(this.locale, "\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5\u540E\u91CD\u8BD5", "Network request failed; check your connection and try again") };
  }
};

// video-url-safety.ts
var import_net = require("net");
function isBlockedAddress(address) {
  const value = address.toLowerCase();
  if ((0, import_net.isIP)(value) === 6 && (!/^[23]/.test(value) || value.startsWith("2001:db8:"))) return true;
  if (value === "::1" || value === "::" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("ff") || /^fe[89ab]/.test(value)) return true;
  const mapped = value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  const ipv4 = mapped || ((0, import_net.isIP)(value) === 4 ? value : null);
  if (!ipv4) return false;
  const [a, b] = ipv4.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || a >= 224 || a === 100 && b >= 64 && b <= 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && (b === 0 || b === 168) || a === 198 && (b === 18 || b === 19 || b === 51) || a === 203 && b === 0;
}
function assertSafeVideoUrlSyntax(videoUrl) {
  const parsed = new URL(videoUrl);
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password || parsed.hash || videoUrl.includes("\\")) {
    throw new Error("Only unauthenticated public HTTP(S) video URLs are allowed");
  }
  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new Error("Local and private video URLs are not allowed");
  }
  if ((0, import_net.isIP)(hostname) && isBlockedAddress(hostname)) {
    throw new Error("The video URL must resolve only to public network addresses");
  }
  return parsed;
}

// validator.ts
function validationError(locale, zh, en) {
  return { code: -200 /* INVALID_PARAMS */, message: localize(locale, zh, en) };
}
function getFileExtension(filename) {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot).toLowerCase();
}
function validateCredential(userNo, apiKey, locale) {
  if (typeof userNo !== "string" || userNo.trim().length === 0) {
    return validationError(locale, "userNo \u4E0D\u80FD\u4E3A\u7A7A", "userNo is required");
  }
  if (userNo.trim().length > MAX_CREDENTIAL_LENGTH) {
    return validationError(locale, `userNo \u957F\u5EA6\u4E0D\u80FD\u8D85\u8FC7 ${MAX_CREDENTIAL_LENGTH} \u4E2A\u5B57\u7B26`, `userNo must not exceed ${MAX_CREDENTIAL_LENGTH} characters`);
  }
  if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
    return validationError(locale, "apiKey \u4E0D\u80FD\u4E3A\u7A7A", "apiKey is required");
  }
  if (apiKey.trim().length > MAX_CREDENTIAL_LENGTH) {
    return validationError(locale, `apiKey \u957F\u5EA6\u4E0D\u80FD\u8D85\u8FC7 ${MAX_CREDENTIAL_LENGTH} \u4E2A\u5B57\u7B26`, `apiKey must not exceed ${MAX_CREDENTIAL_LENGTH} characters`);
  }
  return null;
}
function validateFile(file, locale) {
  if (!file) return validationError(locale, "\u6587\u4EF6\u4E0D\u80FD\u4E3A\u7A7A", "A video file is required");
  if (typeof file.name !== "string" || file.name.trim().length === 0) return validationError(locale, "\u6587\u4EF6\u540D\u4E0D\u80FD\u4E3A\u7A7A", "The video filename is required");
  const size = Number(file.size ?? file.data?.length);
  if (Number.isFinite(size) && size > MAX_FILE_SIZE) {
    return validationError(locale, `\u6587\u4EF6\u5927\u5C0F\u8D85\u9650\uFF0C\u6700\u5927\u652F\u6301 1GB\uFF0C\u5F53\u524D\u6587\u4EF6\u5927\u5C0F\u4E3A ${size} \u5B57\u8282`, `The video exceeds the 1 GB limit (${size} bytes)`);
  }
  const ext = getFileExtension(file.name);
  if (!SUPPORTED_VIDEO_EXTENSIONS.includes(ext)) {
    return validationError(locale, `\u4E0D\u652F\u6301\u7684\u89C6\u9891\u683C\u5F0F "${ext}"\uFF0C\u4EC5\u652F\u6301 mp4\u3001mov \u683C\u5F0F`, `Unsupported video format "${ext}"; use MP4 or MOV`);
  }
  return null;
}
function validateImageFile(file, locale) {
  if (!file) return validationError(locale, "\u56FE\u7247\u6587\u4EF6\u4E0D\u80FD\u4E3A\u7A7A", "An image file is required");
  if (typeof file.name !== "string" || file.name.trim().length === 0) return validationError(locale, "\u56FE\u7247\u6587\u4EF6\u540D\u4E0D\u80FD\u4E3A\u7A7A", "The image filename is required");
  const size = Number(file.size ?? file.data?.length);
  if (Number.isFinite(size) && size > MAX_IMAGE_FILE_SIZE) return validationError(locale, "\u56FE\u7247\u5927\u5C0F\u4E0D\u80FD\u8D85\u8FC7 50MB", "The image must not exceed 50 MB");
  const ext = getFileExtension(file.name);
  if (!SUPPORTED_IMAGE_EXTENSIONS.includes(ext)) {
    return validationError(locale, `\u4E0D\u652F\u6301\u7684\u56FE\u7247\u683C\u5F0F "${ext}"\uFF0C\u652F\u6301 JPG\u3001PNG\u3001BMP\u3001WebP\u3001AVIF\u3001TIFF\u3001SVG`, `Unsupported image format "${ext}"; use JPG, PNG, BMP, WebP, AVIF, TIFF, or SVG`);
  }
  return null;
}
function validateUrl(url, locale) {
  if (typeof url !== "string" || url.trim().length === 0) return validationError(locale, "videoUrl \u4E0D\u80FD\u4E3A\u7A7A", "videoUrl is required");
  url = url.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return validationError(locale, "videoUrl \u5FC5\u987B\u4EE5 http:// \u6216 https:// \u5F00\u5934", "videoUrl must start with http:// or https://");
  }
  if (url.length > MAX_URL_LENGTH) {
    return validationError(locale, `videoUrl \u957F\u5EA6\u4E0D\u80FD\u8D85\u8FC7 ${MAX_URL_LENGTH} \u4E2A\u5B57\u7B26`, `videoUrl must not exceed ${MAX_URL_LENGTH} characters`);
  }
  try {
    assertSafeVideoUrlSyntax(url);
  } catch {
    return validationError(locale, "videoUrl \u5FC5\u987B\u662F\u4E0D\u542B\u51ED\u636E\u3001\u7247\u6BB5\u6216\u5185\u7F51\u5730\u5740\u7684\u516C\u7F51 HTTP(S) \u94FE\u63A5", "videoUrl must be a public HTTP(S) URL without credentials, fragments, or a private address");
  }
  return null;
}
function validateResolution(width, height, locale) {
  if (Math.max(width, height) > 1920 || Math.min(width, height) > 1080) {
    return validationError(locale, `\u89C6\u9891\u5206\u8FA8\u7387\u8D85\u9650\uFF0C\u8981\u6C42\u6700\u5927\u8FB9\u4E0D\u8D85\u8FC7 1920 \u4E14\u6700\u5C0F\u8FB9\u4E0D\u8D85\u8FC7 1080\uFF08\u5F53\u524D ${width}\xD7${height}\uFF09`, `Video resolution exceeds the limit: longest side 1920 and shortest side 1080 (received ${width}\xD7${height})`);
  }
  return null;
}
function validateEraseRegion(params) {
  const values = [params.x1, params.y1, params.x2, params.y2];
  const supplied = values.filter((value) => value != null).length;
  if (supplied === 0) return null;
  if (supplied !== 4 || values.some((value) => !Number.isInteger(value) || value < 0)) {
    return validationError(params.locale, "\u64E6\u9664\u533A\u57DF\u5FC5\u987B\u540C\u65F6\u63D0\u4F9B\u975E\u8D1F\u6574\u6570 x1\u3001y1\u3001x2\u3001y2", "Provide all four non-negative integer erase coordinates: x1, y1, x2, y2");
  }
  const [x1, y1, x2, y2] = values;
  if (x1 === 0 && y1 === 0 && x2 === 0 && y2 === 0) return null;
  if (x2 <= x1 || y2 <= y1 || Number.isInteger(params.width) && x2 > params.width || Number.isInteger(params.height) && y2 > params.height) {
    return validationError(params.locale, "\u64E6\u9664\u533A\u57DF\u5FC5\u987B\u5728\u89C6\u9891\u753B\u9762\u5185\uFF0C\u4E14\u53F3\u4E0B\u89D2\u5750\u6807\u5927\u4E8E\u5DE6\u4E0A\u89D2", "Erase rectangle must be within the video and its bottom-right corner must follow the top-left corner");
  }
  return null;
}
function validateDuration(duration, locale) {
  if (duration == null || typeof duration !== "number" || !Number.isFinite(duration)) {
    return validationError(locale, "duration \u5FC5\u987B\u4E3A\u6709\u6548\u6570\u5B57", "duration must be a valid number");
  }
  if (duration < 1 || duration > MAX_DURATION) {
    return validationError(locale, `\u89C6\u9891\u65F6\u957F\u8D85\u9650\uFF0C\u6709\u6548\u8303\u56F4\u4E3A 1~${MAX_DURATION} \u79D2\uFF08\u5F53\u524D ${duration} \u79D2\uFF09`, `Video duration must be between 1 and ${MAX_DURATION} seconds (received ${duration})`);
  }
  return null;
}
function validateDimension(value, fieldName, locale) {
  if (value == null || typeof value !== "number" || !Number.isFinite(value)) {
    return validationError(locale, `${fieldName} \u5FC5\u987B\u4E3A\u6709\u6548\u6570\u5B57`, `${fieldName} must be a valid number`);
  }
  if (!Number.isInteger(value)) return validationError(locale, `${fieldName} \u5FC5\u987B\u4E3A\u6574\u6570`, `${fieldName} must be an integer`);
  if (value < 1 || value > MAX_DIMENSION) {
    return validationError(locale, `${fieldName} \u8D85\u51FA\u6709\u6548\u8303\u56F4\uFF0C\u6709\u6548\u8303\u56F4\u4E3A 1~${MAX_DIMENSION}\uFF08\u5F53\u524D ${value}\uFF09`, `${fieldName} must be between 1 and ${MAX_DIMENSION} (received ${value})`);
  }
  return null;
}
function validateTaskId(taskId, locale) {
  if (typeof taskId !== "string" || taskId.trim().length === 0) {
    return validationError(locale, "taskId \u4E0D\u80FD\u4E3A\u7A7A", "taskId is required");
  }
  if (taskId.trim().length > MAX_TASK_ID_LENGTH) {
    return validationError(locale, `taskId \u957F\u5EA6\u4E0D\u80FD\u8D85\u8FC7 ${MAX_TASK_ID_LENGTH} \u4E2A\u5B57\u7B26`, `taskId must not exceed ${MAX_TASK_ID_LENGTH} characters`);
  }
  return null;
}
function validateOperationId(operationId, locale) {
  if (operationId == null || operationId === "") return null;
  if (typeof operationId !== "string" || !/^[A-Za-z0-9._:-]{8,64}$/.test(operationId.trim())) {
    return validationError(
      locale,
      "operationId \u5FC5\u987B\u4E3A 8\u201364 \u4F4D\uFF0C\u4E14\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u5192\u53F7\u548C\u8FDE\u5B57\u7B26",
      "operationId must be 8\u201364 characters using only letters, numbers, periods, underscores, colons, and hyphens"
    );
  }
  return null;
}
function validateIdempotencyKey(value, locale) {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !/^[A-Za-z0-9._:-]{8,128}$/.test(value.trim())) {
    return validationError(
      locale,
      "idempotencyKey \u5FC5\u987B\u4E3A 8\u2013128 \u4F4D\uFF0C\u4E14\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u70B9\u3001\u4E0B\u5212\u7EBF\u3001\u5192\u53F7\u548C\u8FDE\u5B57\u7B26",
      "idempotencyKey must be 8\u2013128 characters using only letters, numbers, periods, underscores, colons, and hyphens"
    );
  }
  return null;
}
function validateSubUserId(value, locale) {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || value.trim().length > 128) {
    return validationError(locale, "subUserId \u957F\u5EA6\u4E0D\u80FD\u8D85\u8FC7 128 \u4E2A\u5B57\u7B26", "subUserId must not exceed 128 characters");
  }
  return null;
}
function estimateCredits(width, height, duration) {
  const pixels = width * height;
  const isAbove720p = pixels > RESOLUTION_720P_THRESHOLD;
  const rate = isAbove720p ? RATE_ABOVE_720P : RATE_720P_OR_BELOW;
  const estimatedCost = Math.ceil(duration * rate);
  return { estimatedCost, resolution: isAbove720p ? "above_720p" : "720p_or_below" };
}
function validateUploadVideo(params) {
  return validateFile(params.file, params.locale);
}
function validateSubmitTask(params) {
  const urlError = validateUrl(params.videoUrl, params.locale);
  if (urlError) return urlError;
  const widthError = validateDimension(params.width, "width", params.locale);
  if (widthError) return widthError;
  const heightError = validateDimension(params.height, "height", params.locale);
  if (heightError) return heightError;
  const durationError = validateDuration(params.duration, params.locale);
  if (durationError) return durationError;
  const resolutionError = validateResolution(params.width, params.height, params.locale);
  if (resolutionError) return resolutionError;
  const regionError = validateEraseRegion(params);
  if (regionError) return regionError;
  if (params.removeAudio != null && typeof params.removeAudio !== "boolean") {
    return validationError(params.locale, "removeAudio \u5FC5\u987B\u4E3A boolean", "removeAudio must be a boolean");
  }
  return validateIdempotencyKey(params.idempotencyKey, params.locale) || validateSubUserId(params.subUserId, params.locale);
}
function validateEstimateCredits(params) {
  const widthError = validateDimension(params.width, "width", params.locale);
  if (widthError) return widthError;
  const heightError = validateDimension(params.height, "height", params.locale);
  if (heightError) return heightError;
  const durationError = validateDuration(params.duration, params.locale);
  if (durationError) return durationError;
  return null;
}
function validate(action, params) {
  switch (action) {
    case "uploadVideo":
      return validateUploadVideo(params);
    case "submitTask":
      return validateSubmitTask(params);
    case "taskDetail":
      return validateTaskId(params.taskId, params.locale) || validateSubUserId(params.subUserId, params.locale);
    case "taskList":
      return validateSubUserId(params.subUserId, params.locale);
    case "deleteTask": {
      const taskError = validateTaskId(params.taskId, params.locale);
      if (taskError) return taskError;
      const subUserError = validateSubUserId(params.subUserId, params.locale);
      if (subUserError) return subUserError;
      if (params.confirmDeletion !== true) {
        return validationError(params.locale, "\u5220\u9664\u524D\u987B\u7531\u7528\u6237\u786E\u8BA4\u4EFB\u52A1 ID\u3001\u5A92\u4F53\u6E05\u7406\u53CA\u4E0D\u9000\u79EF\u5206\uFF0C\u5E76\u4F20\u5165 confirmDeletion=true", "Confirm the task ID, media cleanup, and no credit refund with the user before passing confirmDeletion=true");
      }
      return null;
    }
    case "queryCredits":
      return null;
    case "removeVideoWatermark": {
      const urlError = validateUrl(params.videoUrl, params.locale);
      return urlError || validateOperationId(params.operationId, params.locale);
    }
    case "removeImageWatermark": {
      const fileError = validateImageFile(params.file, params.locale);
      if (fileError) return fileError;
      if (params.sync != null && typeof params.sync !== "boolean") return validationError(params.locale, "sync \u5FC5\u987B\u4E3A boolean", "sync must be a boolean");
      if (params.idempotencyKey != null && (typeof params.idempotencyKey !== "string" || !/^[A-Za-z0-9._:-]{8,64}$/.test(params.idempotencyKey))) return validationError(params.locale, "idempotencyKey \u5FC5\u987B\u4E3A8\u201364\u4F4D\u7A33\u5B9A\u91CD\u8BD5\u952E", "idempotencyKey must be a stable 8\u201364 character retry key");
      return null;
    }
    case "imageWatermarkTaskDetail":
      return validateTaskId(params.taskId, params.locale);
    case "estimateCredits":
      return validateEstimateCredits(params);
    case "workflow": {
      if (params.file && params.videoUrl) return validationError(params.locale, "file \u548C videoUrl \u53EA\u80FD\u63D0\u4F9B\u4E00\u4E2A", "Provide either filePath or videoUrl, not both");
      if (params.file) return validateFile(params.file, params.locale) || validateEraseRegion(params);
      if (params.videoUrl) {
        const urlError = validateUrl(params.videoUrl, params.locale);
        if (urlError) return urlError;
        if (params.removeAudio != null && typeof params.removeAudio !== "boolean") {
          return validationError(params.locale, "removeAudio \u5FC5\u987B\u4E3A boolean", "removeAudio must be a boolean");
        }
        const suppliedMetadata = [params.width, params.height, params.duration].filter((value) => value != null).length;
        if (suppliedMetadata !== 0 && suppliedMetadata !== 3) {
          return validationError(params.locale, "width\u3001height\u3001duration \u5FC5\u987B\u5168\u90E8\u63D0\u4F9B\u6216\u5168\u90E8\u7701\u7565", "Provide width, height, and duration together, or omit all three");
        }
        if (suppliedMetadata === 3) {
          const metadataError = validateEstimateCredits(params);
          if (metadataError) return metadataError;
          const resolutionError = validateResolution(params.width, params.height, params.locale);
          if (resolutionError) return resolutionError;
        }
        return validateEraseRegion(params) || validateIdempotencyKey(params.idempotencyKey, params.locale) || validateSubUserId(params.subUserId, params.locale);
      }
      return validationError(params.locale, "\u9700\u8981\u63D0\u4F9B file \u6216 videoUrl \u53C2\u6570", "Provide either filePath or videoUrl");
    }
    default:
      return validationError(params.locale, `\u4E0D\u652F\u6301\u7684 action\uFF1A${action}`, `Unsupported action: ${action}`);
  }
}

// processing-approval.ts
var outboundActions = /* @__PURE__ */ new Set(["uploadVideo", "submitTask", "removeVideoWatermark", "removeImageWatermark", "workflow"]);
function requireProcessingApproval(action, params = {}) {
  if (!outboundActions.has(action) || params.confirmProcessing === true) return null;
  return { code: -200 /* INVALID_PARAMS */, message: localize(
    params.locale,
    "\u8BF7\u5148\u5411\u7528\u6237\u8BF4\u660E\u6240\u9009\u7D20\u6750\u6216\u94FE\u63A5\u5C06\u53D1\u9001\u81F3 550W\uFF0C\u5904\u7406\u53EF\u80FD\u6263\u9664\u79EF\u5206\uFF1B\u7528\u6237\u786E\u8BA4\u672C\u6B21\u64CD\u4F5C\u540E\u4F20\u5165 confirmProcessing=true\u3002",
    "Explain that selected media or links will be sent to 550W and processing may spend credits. Set confirmProcessing=true only after the user approves this operation."
  ) };
}

// error-handler.ts
function createErrorResponse(code, message) {
  return { code, message };
}
function mapApiError(apiResponse, locale, region, sideEffect = false) {
  const { code, message } = apiResponse;
  if (code === 200 /* SUCCESS */) {
    return { ...apiResponse };
  }
  const insufficientCredits = (code === -100 /* AUTH_FAILED */ || code === -300 /* BUSINESS_REJECTED */) && (/积分不足|点数不足|余额不足|insufficient\s+(?:subtitle-removal\s+)?credits/i.test(String(message || "")) || String(apiResponse.errorCode || "").toUpperCase() === "INSUFFICIENT_CREDITS");
  if (insufficientCredits) {
    const purchaseUrl = creditPurchaseUrl(locale, region);
    return {
      code,
      message: localize(locale, `\u79EF\u5206\u4E0D\u8DB3\u3002\u8BF7\u524D\u5F80 ${purchaseUrl} \u8D2D\u4E70\u79EF\u5206\uFF0C\u8BF7\u4F7F\u7528\u539F\u8FDE\u63A5\u7684\u540C\u4E00\u8D26\u53F7\u3002\u5145\u503C\u540E\u5148\u67E5\u4F59\u989D\u548C\u539F\u4EFB\u52A1\u72B6\u6001\uFF1B\u5DF2\u53D7\u7406\u7684\u4EFB\u52A1\u53EA\u67E5\u8BE2\uFF0C\u4E0D\u91CD\u590D\u63D0\u4EA4\u3002\u672A\u5230\u8D26\u65F6\u7A0D\u540E\u5237\u65B0\uFF0C\u4E0D\u91CD\u590D\u4ED8\u6B3E\u3002`, `Insufficient credits. Buy credits at ${purchaseUrl}, use the same account. After purchase, check the balance and original task first. Query accepted tasks without submitting again. If credits have not updated, refresh later; do not pay twice.`),
      purchaseUrl
    };
  }
  const errorCode = String(apiResponse.errorCode || "").toUpperCase();
  const reason = String(message || "");
  if (errorCode === "IMAGE_TOO_LARGE") {
    return createErrorResponse(code, localize(locale, "\u56FE\u7247\u8D85\u8FC7 50 MB\uFF0C\u8BF7\u7F29\u5C0F\u540E\u91CD\u65B0\u9009\u62E9\u3002", "The image exceeds 50 MB. Choose a smaller image."));
  }
  if (errorCode === "INVALID_OR_UNSUPPORTED_IMAGE") {
    return createErrorResponse(code, localize(locale, "\u56FE\u7247\u65E0\u6CD5\u89E3\u6790\u6216\u683C\u5F0F\u4E0D\u53D7\u652F\u6301\uFF0C\u8BF7\u6362\u7528\u6709\u6548\u7684 JPG\u3001PNG\u3001WebP \u7B49\u652F\u6301\u683C\u5F0F\u3002", "The image could not be read or its format is unsupported. Choose a valid JPG, PNG, WebP, or other supported image."));
  }
  if (code === -200 /* INVALID_PARAMS */ && /idempotencyKey.*(不同|different)/i.test(reason)) {
    return createErrorResponse(code, localize(locale, "\u8FD9\u4E2A\u5E42\u7B49\u952E\u5DF2\u7528\u4E8E\u5176\u4ED6\u63D0\u4EA4\u53C2\u6570\uFF1B\u8BF7\u6838\u5BF9\u539F\u4EFB\u52A1\uFF0C\u65B0\u7684\u8F93\u5165\u9700\u4F7F\u7528\u65B0\u952E\u3002", "This idempotency key was used with different inputs. Check the original task; use a new key for a new submission."));
  }
  if (code === -200 /* INVALID_PARAMS */ && /operationId.*(不一致|different|mismatch)/i.test(reason)) {
    return createErrorResponse(code, localize(locale, "\u8FD9\u4E2A\u64CD\u4F5C ID \u5DF2\u7528\u4E8E\u5176\u4ED6\u89C6\u9891\u94FE\u63A5\uFF1B\u76F8\u540C\u94FE\u63A5\u624D\u53EF\u590D\u7528\uFF0C\u65B0\u7684\u94FE\u63A5\u8BF7\u4F7F\u7528\u65B0 ID\u3002", "This operation ID belongs to another video link. Reuse it only for the same link, or use a new ID."));
  }
  if (code === -300 /* BUSINESS_REJECTED */ && (/task.*(not exist|not accessible)/i.test(reason) || /任务不存在|无权访问/.test(reason))) {
    return createErrorResponse(code, localize(locale, "\u4EFB\u52A1\u4E0D\u5B58\u5728\u6216\u65E0\u6743\u8BBF\u95EE\uFF1B\u8BF7\u6838\u5BF9\u4EFB\u52A1 ID\u3001\u8D26\u53F7\u53CA\u5B50\u7528\u6237\u8303\u56F4\u3002", "Task not found or inaccessible. Check the task ID, account, and sub-user scope."));
  }
  switch (code) {
    case -100 /* AUTH_FAILED */:
      return createErrorResponse(code, localize(
        locale,
        `\u9274\u6743\u5931\u8D25\u3002\u8BF7\u68C0\u67E5\u540C\u4E00\u8D26\u53F7\u7684\u7528\u6237 ID \u548C API Key\uFF0C\u5E76\u5230 ${credentialApplyUrl(locale, region)} \u7BA1\u7406\u51ED\u636E\u3002`,
        `Authentication failed. Check the user ID and API key from the same account at ${credentialApplyUrl(locale, region)}.`
      ));
    case -200 /* INVALID_PARAMS */:
      return createErrorResponse(code, localize(locale, `\u53C2\u6570\u9519\u8BEF\uFF1A${message}\u3002\u8BF7\u6838\u5BF9\u8F93\u5165\u540E\u518D\u8BD5\u3002`, `The service rejected the input. Check the URL, file, and required fields before trying again.`));
    case -300 /* BUSINESS_REJECTED */:
      return createErrorResponse(code, localize(locale, `\u8BF7\u6C42\u672A\u5B8C\u6210\uFF1A${message}\u3002\u8BF7\u6838\u5BF9\u94FE\u63A5\u6216\u4EFB\u52A1\u72B6\u6001\u540E\u518D\u51B3\u5B9A\u662F\u5426\u91CD\u8BD5\u3002`, `The service could not complete the request. Check the link or task status before deciding whether to retry.`));
    case -401 /* ACCOUNT_TEMPORARILY_BLOCKED */:
      return createErrorResponse(code, localize(locale, `\u8D26\u53F7\u6682\u65F6\u53D7\u9650\uFF1A${message}`, "The account is temporarily restricted. Stop submitting requests until the restriction expires."));
    case -402 /* ACCOUNT_PERMANENTLY_BLOCKED */:
      return createErrorResponse(code, localize(locale, `\u8D26\u53F7\u5DF2\u88AB\u6C38\u4E45\u9650\u5236\uFF1A${message}`, "The account is permanently restricted. Stop submitting requests and contact support if you believe this is an error."));
    case -500 /* SERVER_ERROR */:
      return createErrorResponse(code, sideEffect ? localize(locale, "\u670D\u52A1\u6216\u7F51\u7EDC\u5F02\u5E38\uFF0C\u63D0\u4EA4\u7ED3\u679C\u53EF\u80FD\u5C1A\u672A\u786E\u5B9A\u3002\u5148\u6838\u67E5\u5DF2\u6709\u4EFB\u52A1\u6216\u539F\u64CD\u4F5C\u7ED3\u679C\uFF0C\u4E0D\u8981\u76F4\u63A5\u91CD\u590D\u63D0\u4EA4\u8BA1\u8D39\u8BF7\u6C42\u3002", "A service or network error left the submission outcome uncertain. Check the existing task or operation result before another billed submission.") : localize(locale, "\u670D\u52A1\u6216\u7F51\u7EDC\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u65B0\u67E5\u8BE2\u3002", "The service or network is temporarily unavailable. Try the read-only request again later."));
    case -600 /* UNSUPPORTED_VIDEO */:
      return createErrorResponse(code, localize(
        locale,
        "\u89C6\u9891\u683C\u5F0F\u4E0D\u53D7\u652F\u6301\u3002\u8BF7\u91CD\u65B0\u5BFC\u51FA\u4E3A\u517C\u5BB9\u7684 MP4 \u6216 MOV\uFF08\u5EFA\u8BAE 8-bit SDR\uFF09\uFF0C\u7136\u540E\u91CD\u8BD5\u3002",
        "The video format is unsupported. Export a compatible MP4 or MOV file (8-bit SDR recommended) and try again."
      ));
    default:
      return createErrorResponse(code, localize(locale, `\u672A\u77E5\u9519\u8BEF\uFF08code=${code}\uFF09\uFF1A${message}\u3002\u8BF7\u8054\u7CFB\u670D\u52A1\u65B9\u3002`, `Unexpected service error (code=${code}). Contact support.`));
  }
}

// actions/query-credits.ts
async function queryCredits(params, client) {
  const apiResponse = await client.post("/open/queryCredits", {}, TIMEOUT_CONFIG.query);
  if (apiResponse.code !== 200 /* SUCCESS */) {
    return mapApiError(apiResponse, params.locale, params.region);
  }
  const result = {
    code: 200 /* SUCCESS */,
    message: localize(params.locale, "\u67E5\u8BE2\u6210\u529F", "Credits retrieved"),
    userNo: apiResponse.userNo,
    credits: apiResponse.credits
  };
  if (params.width !== void 0 || params.height !== void 0 || params.duration !== void 0) {
    const estimateError = validate("estimateCredits", params);
    if (estimateError) return estimateError;
    result.estimation = estimateCredits(params.width, params.height, params.duration);
  }
  return result;
}

// actions/remove-video-watermark.ts
async function removeVideoWatermark(params, client) {
  const rawInput = typeof params.videoUrl === "string" ? params.videoUrl.trim() : "";
  const extractedUrl = rawInput.match(/https?:\/\/[^\s]+/i)?.[0]?.replace(/[，。；;！!）)】\]]+$/, "") || rawInput;
  const normalizedParams = { ...params, videoUrl: extractedUrl };
  const validationError2 = validate("removeVideoWatermark", normalizedParams);
  if (validationError2) return validationError2;
  const response = await client.post(
    "/open/removeVideoWatermark",
    { videoUrl: extractedUrl, ...params.operationId ? { operationId: params.operationId.trim() } : {} },
    TIMEOUT_CONFIG.videoWatermark
  );
  return response.code === 200 /* SUCCESS */ ? { ...response, message: localize(params.locale, "\u89C6\u9891\u94FE\u63A5\u5DF2\u89E3\u6790\uFF1BSkill \u672A\u4E0B\u8F7D\u89C6\u9891\u6587\u4EF6", "Video link resolved; the Skill has not downloaded the file") } : mapApiError(response, params.locale, params.region, true);
}

// image-task-result.ts
function imageTaskResult(response, locale) {
  const task = response.task && typeof response.task === "object" ? { ...response.task } : null;
  const status = task?.status;
  if (task && status !== "success") delete task.resultUrl;
  if (task && resolveLocale(locale) === "en") delete task.failReason;
  const taskId = task?.taskNo || task?.taskId;
  const base = { ...response, task, ...taskId ? { taskId } : {} };
  if (status === "success" && task?.resultUrl) {
    return { ...base, code: 200 /* SUCCESS */, message: localize(locale, "\u56FE\u7247\u53BB\u6C34\u5370\u5B8C\u6210", "Image watermark removal completed") };
  }
  if (status === "success") {
    return {
      ...base,
      code: -500 /* SERVER_ERROR */,
      message: localize(locale, "\u56FE\u7247\u4EFB\u52A1\u663E\u793A\u6210\u529F\uFF0C\u4F46\u7ED3\u679C\u5C1A\u4E0D\u53EF\u7528\uFF1B\u8BF7\u7A0D\u540E\u6309\u4EFB\u52A1\u7F16\u53F7\u91CD\u65B0\u67E5\u8BE2\u3002", "The image task reports success, but its result is unavailable. Check this task ID again later.")
    };
  }
  if (status === "failed") {
    return {
      ...base,
      code: -300 /* BUSINESS_REJECTED */,
      message: localize(locale, `\u56FE\u7247\u5904\u7406\u5931\u8D25${task?.failReason ? `\uFF1A${task.failReason}` : ""}\uFF1B\u8BF7\u68C0\u67E5\u56FE\u7247\u540E\u518D\u51B3\u5B9A\u662F\u5426\u91CD\u65B0\u63D0\u4EA4\u3002`, "Image processing failed. Check the image and failure code before deciding whether to submit again.")
    };
  }
  if (status === "expired") {
    return {
      ...base,
      code: -300 /* BUSINESS_REJECTED */,
      message: localize(locale, "\u56FE\u7247\u4EFB\u52A1\u5DF2\u8FC7\u671F\uFF0C\u7ED3\u679C\u4E0D\u53EF\u518D\u83B7\u53D6\uFF1B\u5982\u9700\u5904\u7406\u8BF7\u91CD\u65B0\u63D0\u4EA4\u3002", "The image task has expired and its result is no longer available. Submit a new task if needed.")
    };
  }
  if (taskId) {
    return {
      ...base,
      code: 200 /* SUCCESS */,
      message: localize(locale, "\u56FE\u7247\u4EFB\u52A1\u4ECD\u5728\u5904\u7406\u4E2D\uFF0C\u8BF7\u4FDD\u5B58\u4EFB\u52A1\u7F16\u53F7\u5E76\u7A0D\u540E\u67E5\u8BE2\u3002", "Image processing is still in progress. Keep the task ID and check again later.")
    };
  }
  return {
    ...base,
    code: -500 /* SERVER_ERROR */,
    message: localize(locale, "\u56FE\u7247\u63A5\u53E3\u672A\u8FD4\u56DE\u53EF\u786E\u8BA4\u7684\u4EFB\u52A1\u72B6\u6001\uFF1B\u8BF7\u5148\u6838\u67E5\u5DF2\u6709\u4EFB\u52A1\uFF0C\u4E0D\u8981\u76F4\u63A5\u91CD\u590D\u63D0\u4EA4\u3002", "The image API returned no verifiable task status. Check for an existing task before submitting again.")
  };
}

// actions/remove-image-watermark.ts
async function removeImageWatermark(params, client) {
  const validationError2 = validate("removeImageWatermark", params);
  if (validationError2) return validationError2;
  const file = params.file;
  const requestParams = {
    sync: String(params.sync ?? true)
  };
  if (params.operationId != null && String(params.operationId).trim() !== "") {
    requestParams.operationId = String(params.operationId).trim();
  }
  if (params.idempotencyKey) requestParams.idempotencyKey = params.idempotencyKey;
  const response = await client.upload(
    "/open/removeImageWatermark",
    requestParams,
    { name: file.name, data: file.data ?? file },
    TIMEOUT_CONFIG.imageWatermark
  );
  return response.code === 200 /* SUCCESS */ ? imageTaskResult(response, params.locale) : mapApiError(response, params.locale, params.region, true);
}

// actions/image-watermark-task-detail.ts
async function imageWatermarkTaskDetail(params, client) {
  const validationError2 = validate("imageWatermarkTaskDetail", params);
  if (validationError2) return validationError2;
  const response = await client.post(
    "/open/imageWatermarkTaskDetail",
    { taskId: params.taskId },
    TIMEOUT_CONFIG.query
  );
  if (response.code !== 200 /* SUCCESS */) return mapApiError(response, params.locale, params.region);
  return imageTaskResult(response, params.locale);
}

// actions/submit-task.ts
async function submitTask(params, client) {
  const validationError2 = validate("submitTask", params);
  if (validationError2) return validationError2;
  const requestParams = {
    videoUrl: params.videoUrl,
    width: String(params.width),
    height: String(params.height),
    duration: String(params.duration),
    // Default to full-frame; a complete validated rectangle is an explicit override.
    x1: String(params.x1 ?? 0),
    y1: String(params.y1 ?? 0),
    x2: String(params.x2 ?? 0),
    y2: String(params.y2 ?? 0)
  };
  if (params.fileName != null && params.fileName !== "") requestParams.fileName = String(params.fileName);
  if (params.coverUrl != null && params.coverUrl !== "") requestParams.coverUrl = String(params.coverUrl);
  if (params.callbackUrl != null && params.callbackUrl !== "") requestParams.callbackUrl = String(params.callbackUrl);
  if (params.removeAudio != null) requestParams.removeAudio = String(params.removeAudio);
  if (params.idempotencyKey != null && String(params.idempotencyKey).trim() !== "") requestParams.idempotencyKey = String(params.idempotencyKey).trim();
  if (params.subUserId != null && String(params.subUserId).trim() !== "") requestParams.subUserId = String(params.subUserId).trim();
  const apiResponse = await client.post("/open/submitTask", requestParams, TIMEOUT_CONFIG.submit);
  if (apiResponse.code === 200 /* SUCCESS */) {
    return {
      code: 200 /* SUCCESS */,
      message: localize(params.locale, "\u4EFB\u52A1\u63D0\u4EA4\u6210\u529F", "Task submitted"),
      taskId: apiResponse.taskId,
      status: "waiting",
      notice: params.idempotencyKey ? localize(params.locale, "\u76F8\u540C\u5E42\u7B49\u952E\u548C\u63D0\u4EA4\u53C2\u6570\u53EF\u5B89\u5168\u91CD\u653E\u5E76\u8FD4\u56DE\u539F\u4EFB\u52A1", "The same idempotency key and submission parameters can be replayed safely to return the original task") : localize(params.locale, "\u6CE8\u610F\uFF1A\u672A\u63D0\u4F9B\u5E42\u7B49\u952E\u65F6\uFF0C\u76F8\u540C videoUrl \u91CD\u590D\u63D0\u4EA4\u4F1A\u88AB\u89C6\u4E3A\u72EC\u7ACB\u4EFB\u52A1\u5E76\u72EC\u7ACB\u8BA1\u8D39", "Without an idempotency key, submitting the same videoUrl again creates a separate task and may be billed separately")
    };
  }
  return mapApiError(apiResponse, params.locale, params.region, true);
}

// actions/task-detail.ts
async function taskDetail(params, client) {
  const validationError2 = validate("taskDetail", params);
  if (validationError2) return validationError2;
  const requestParams = { taskId: params.taskId };
  if (params.subUserId != null && String(params.subUserId).trim() !== "") requestParams.subUserId = String(params.subUserId).trim();
  const apiResponse = await client.post("/open/taskDetail", requestParams, TIMEOUT_CONFIG.query);
  if (apiResponse.code !== 200 /* SUCCESS */) {
    return mapApiError(apiResponse, params.locale, params.region);
  }
  const { taskId, status, width, height, duration, cost, createTime, updateTime, resultUrl, failReason, failCode, refundStatus } = apiResponse;
  const response = {
    code: 200 /* SUCCESS */,
    message: localize(params.locale, "\u67E5\u8BE2\u6210\u529F", "Task retrieved"),
    taskId,
    status,
    width,
    height,
    duration,
    cost,
    createTime,
    updateTime,
    ...failCode != null && { failCode },
    ...refundStatus != null && { refundStatus }
  };
  switch (status) {
    case "success":
      response.resultUrl = resultUrl;
      break;
    case "failed":
      response.message = localize(params.locale, `\u4EFB\u52A1\u5904\u7406\u5931\u8D25\uFF1A${failReason || "\u672A\u77E5\u539F\u56E0"}`, "Task processing failed");
      if (resolveLocale(params.locale) === "zh" && failReason) response.failReason = failReason;
      break;
    case "waiting":
    case "processing":
      response.message = localize(params.locale, `\u4EFB\u52A1${status === "waiting" ? "\u7B49\u5F85\u4E2D" : "\u5904\u7406\u4E2D"}\uFF0C\u5EFA\u8BAE 30 \u79D2\u540E\u518D\u6B21\u67E5\u8BE2`, `Task is ${status}; check again in about 30 seconds`);
      break;
  }
  return response;
}

// host-tools.ts
async function invokeWithCredentials(request, credential) {
  const approvalError = requireProcessingApproval(request.action, request.params);
  if (approvalError) return approvalError;
  const invalid = validateCredential(credential?.userNo, credential?.apiKey, request.params?.locale);
  if (invalid) return invalid;
  const client = new ApiClient({ userNo: credential.userNo.trim(), apiKey: credential.apiKey.trim() }, request.params?.locale);
  switch (request.action) {
    case "queryCredits":
      return queryCredits(request.params, client);
    case "removeVideoWatermark":
      return removeVideoWatermark(request.params, client);
    case "removeImageWatermark":
      return removeImageWatermark(request.params, client);
    case "imageWatermarkTaskDetail":
      return imageWatermarkTaskDetail(request.params, client);
    case "submitTask":
      return submitTask(request.params, client);
    case "taskDetail":
      return taskDetail(request.params, client);
    default:
      return { code: -200 /* INVALID_PARAMS */, message: "Unsupported host action" };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  invokeWithCredentials
});
