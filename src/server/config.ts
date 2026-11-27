import "server-only";
import path from "node:path";
import { pathToFileURL } from "node:url";

const isProduction = process.env.NODE_ENV === "production";
const DEV_SESSION_SECRET = "dev-only-insecure-session-secret-change-me";

let warnedAboutSecret = false;

export const config = {
  isProduction,

  /**
   * libSQL / SQLite connection URL. In production this is a Turso database
   * (TURSO_DATABASE_URL is set automatically by the Vercel ↔ Turso integration).
   * Without it, a local SQLite file is used: DATABASE_PATH or ./data/portfolio.db.
   */
  get databaseUrl(): string {
    const remote = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL;
    if (remote) return remote;
    const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "portfolio.db");
    return pathToFileURL(path.resolve(file)).href;
  },

  get databaseAuthToken(): string | undefined {
    return process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN || undefined;
  },

  get adminPassword(): string {
    return process.env.ADMIN_PASSWORD ?? "";
  },

  /** Signs session cookies and salts IP hashes. Required in production. */
  get sessionSecret(): string {
    // Tolerate stray whitespace/quotes from copy-pasting into a dashboard.
    const secret = process.env.SESSION_SECRET?.trim().replace(/^["']|["']$/g, "");
    if (secret && secret.length >= 32) return secret;

    if (isProduction) {
      throw new Error(
        `SESSION_SECRET must be set (at least 32 characters) in production - currently ${secret ? `${secret.length} characters` : "missing"}`
      );
    }
    if (!warnedAboutSecret) {
      warnedAboutSecret = true;
      console.warn("[config] SESSION_SECRET is missing or short - using an insecure dev secret.");
    }
    return DEV_SESSION_SECRET;
  },

  /**
   * Max upload size before compression (uploads are resized + re-encoded).
   * Vercel rejects request bodies over ~4.5 MB, so the dashboard also shrinks
   * very large photos in the browser before uploading.
   */
  maxImageBytes: 15 * 1024 * 1024,
};
