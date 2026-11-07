import "server-only";

import dns from "node:dns";
import https from "node:https";
import net from "node:net";

/**
 * Fetch a public HTTPS page for metadata scraping without SSRF exposure:
 * - https only, default port only, no credentials in the URL
 * - every resolved address is checked against private/reserved ranges at
 *   connect time (inside `lookup`), so DNS rebinding can't swap in an
 *   internal IP after validation
 * - redirects are followed manually (max 3), each hop re-validated
 * - hard timeout and response-size cap
 */

const MAX_BYTES = 1_000_000; // 1 MB is plenty for <head> metadata
const TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 3;
const USER_AGENT = "TrackerXBot/1.0 (+link preview)";

const blocked = new net.BlockList();
for (const [prefix, bits] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  blocked.addSubnet(prefix, bits, "ipv4");
}
for (const [prefix, bits] of [
  ["::", 128],
  ["::1", 128],
  ["64:ff9b::", 96],
  ["100::", 64],
  ["2001:db8::", 32],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const) {
  blocked.addSubnet(prefix, bits, "ipv6");
}

export function isBlockedAddress(address: string): boolean {
  const family = net.isIP(address);
  if (family === 4) return blocked.check(address, "ipv4");
  if (family === 6) {
    // IPv4-mapped (::ffff:a.b.c.d) → check the embedded IPv4 address.
    const mapped = address.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return blocked.check(mapped[1], "ipv4");
    if (/^::ffff:/i.test(address)) return true; // hex-form mapped: just refuse
    return blocked.check(address, "ipv6");
  }
  return true; // not an IP at all
}

export class UnsafeUrlError extends Error {
  constructor(message = "URL not allowed") {
    super(message);
    this.name = "UnsafeUrlError";
  }
}

function assertSafeUrl(raw: string | URL): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError("Invalid URL");
  }
  if (url.protocol !== "https:") throw new UnsafeUrlError("Only https URLs are allowed");
  if (url.port && url.port !== "443") throw new UnsafeUrlError("Non-default ports are not allowed");
  if (url.username || url.password) throw new UnsafeUrlError("Credentials in URL are not allowed");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host) && isBlockedAddress(host)) throw new UnsafeUrlError();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) {
    throw new UnsafeUrlError();
  }
  return url;
}

type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  address: string | dns.LookupAddress[],
  family?: number
) => void;

// Validates every address the socket is about to connect to.
function safeLookup(hostname: string, options: dns.LookupOptions, callback: LookupCallback) {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, []);
    const list = addresses as dns.LookupAddress[];
    if (list.length === 0 || list.some((a) => isBlockedAddress(a.address))) {
      const e: NodeJS.ErrnoException = new UnsafeUrlError("Host resolves to a private address");
      e.code = "EBLOCKED";
      return callback(e, []);
    }
    if (options.all) return callback(null, list);
    callback(null, list[0].address, list[0].family);
  });
}

interface SafeResponse {
  url: URL;
  status: number;
  contentType: string;
  body: string;
}

function requestOnce(url: URL, signal: AbortSignal): Promise<SafeResponse & { location?: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "GET",
        lookup: safeLookup as unknown as typeof dns.lookup,
        headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
        signal,
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const contentType = String(res.headers["content-type"] ?? "");
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume();
          return resolve({ url, status, contentType, body: "", location: res.headers.location });
        }
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_BYTES) {
            // Enough for metadata; stop reading and keep what we have.
            res.destroy();
            return;
          }
          chunks.push(chunk);
        });
        const finish = () =>
          resolve({ url, status, contentType, body: Buffer.concat(chunks).toString("utf8") });
        res.on("end", finish);
        res.on("close", finish);
        res.on("error", reject);
      }
    );
    req.on("error", reject);
    req.end();
  });
}

export async function safeFetchHtml(rawUrl: string): Promise<SafeResponse> {
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  let url = assertSafeUrl(rawUrl);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await requestOnce(url, signal);
    if (!res.location) return res;
    url = assertSafeUrl(new URL(res.location, url));
  }
  throw new UnsafeUrlError("Too many redirects");
}
