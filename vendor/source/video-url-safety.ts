import { promises as dns } from "dns";
import { isIP } from "net";

export function isBlockedAddress(address: string): boolean {
  const value = address.toLowerCase();
  // Only global unicast IPv6; reject mapped/translation forms and documentation ranges.
  if (isIP(value) === 6 && (!/^[23]/.test(value) || value.startsWith("2001:db8:"))) return true;
  if (value === "::1" || value === "::" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("ff") || /^fe[89ab]/.test(value)) return true;
  const mapped = value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  const ipv4 = mapped || (isIP(value) === 4 ? value : null);
  if (!ipv4) return false;
  const [a, b] = ipv4.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && (b === 0 || b === 168))
    || (a === 198 && (b === 18 || b === 19 || b === 51))
    || (a === 203 && b === 0);
}

export function assertSafeVideoUrlSyntax(videoUrl: string): URL {
  const parsed = new URL(videoUrl);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.hash || videoUrl.includes('\\')) {
    throw new Error("Only unauthenticated public HTTP(S) video URLs are allowed");
  }
  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new Error("Local and private video URLs are not allowed");
  }
  if (isIP(hostname) && isBlockedAddress(hostname)) {
    throw new Error("The video URL must resolve only to public network addresses");
  }
  return parsed;
}

export async function assertPublicVideoUrl(videoUrl: string): Promise<void> {
  const parsed = assertSafeVideoUrlSyntax(videoUrl);
  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const addresses = isIP(hostname) ? [{ address: hostname }] : await dns.lookup(hostname, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isBlockedAddress(address))) {
    throw new Error("The video URL must resolve only to public network addresses");
  }
}

