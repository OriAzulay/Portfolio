import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { config } from "../config";
import { AppError } from "../http/errors";

const COOKIE_NAME = "portfolio_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const secretKey = () => new TextEncoder().encode(config.sessionSecret);

/** Issues a signed, httpOnly admin session cookie. */
export async function createSession(): Promise<void> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

/** Guard for mutating / private API routes. Throws 401 when not logged in. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new AppError(401, "Unauthorized");
}
