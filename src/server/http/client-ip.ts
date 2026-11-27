import "server-only";
import crypto from "node:crypto";
import { config } from "../config";

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

/** We never store raw IPs - only a keyed hash. */
export function hashIp(ip: string): string {
  return crypto.createHmac("sha256", config.sessionSecret).update(ip).digest("hex");
}

export function getClientIpHash(request: Request): string {
  return hashIp(getClientIp(request));
}
