import "server-only";
import crypto from "node:crypto";

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Salt for IP hashes. Uses SESSION_SECRET when set, but deliberately does NOT
 * throw without it: public features (visitor counter, contact form rate limit)
 * must keep working even if the secret is missing in some environment.
 * Only admin sessions strictly require SESSION_SECRET (see config.sessionSecret).
 */
function ipHashSalt(): string {
  return process.env.SESSION_SECRET || process.env.TURSO_DATABASE_URL || "portfolio-ip-hash-salt";
}

/** We never store raw IPs - only a keyed hash. */
export function hashIp(ip: string): string {
  return crypto.createHmac("sha256", ipHashSalt()).update(ip).digest("hex");
}

export function getClientIpHash(request: Request): string {
  return hashIp(getClientIp(request));
}
