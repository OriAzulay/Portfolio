import "server-only";
import path from "node:path";

const isProduction = process.env.NODE_ENV === "production";
const DEV_SESSION_SECRET = "dev-only-insecure-session-secret-change-me";

let warnedAboutSecret = false;

export const config = {
  isProduction,

  /** SQLite file. On Railway point this at the mounted volume, e.g. /data/portfolio.db */
  get databasePath(): string {
    return process.env.DATABASE_PATH || path.join(process.cwd(), "data", "portfolio.db");
  },

  get adminPassword(): string {
    return process.env.ADMIN_PASSWORD ?? "";
  },

  /** Signs session cookies and salts IP hashes. Required in production. */
  get sessionSecret(): string {
    const secret = process.env.SESSION_SECRET;
    if (secret && secret.length >= 32) return secret;

    if (isProduction) {
      throw new Error("SESSION_SECRET must be set (at least 32 characters) in production");
    }
    if (!warnedAboutSecret) {
      warnedAboutSecret = true;
      console.warn("[config] SESSION_SECRET is missing or short - using an insecure dev secret.");
    }
    return DEV_SESSION_SECRET;
  },

  /** Max upload size before compression (uploads are resized + re-encoded). */
  maxImageBytes: 15 * 1024 * 1024,
};
