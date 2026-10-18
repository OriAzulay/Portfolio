import "server-only";
import crypto from "node:crypto";
import { z } from "zod";
import { config } from "../config";
import { AppError } from "../http/errors";
import { createRateLimiter } from "../http/rate-limit";

const loginSchema = z.object({ password: z.string().min(1).max(200) });

// 10 attempts per 15 minutes per IP.
const loginLimiter = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

function constantTimeEquals(a: string, b: string): boolean {
  // Hash first so both buffers have equal length regardless of input.
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/** Validates the admin password. Throws AppError on failure. */
export function verifyAdminLogin(input: unknown, ipHash: string): void {
  const expected = config.adminPassword;
  if (!expected) throw new AppError(500, "ADMIN_PASSWORD is not configured on the server");

  if (!loginLimiter.consume(ipHash)) {
    throw new AppError(429, "Too many login attempts. Try again in a few minutes.");
  }

  const { password } = loginSchema.parse(input);
  if (!constantTimeEquals(password, expected)) {
    throw new AppError(401, "Invalid password");
  }
  loginLimiter.reset(ipHash);
}
