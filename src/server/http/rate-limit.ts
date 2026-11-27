import "server-only";
import { getDb } from "../db/client";

/**
 * Fixed-window rate limiter stored in the database, so the limit holds across
 * all serverless instances (in-memory counters would reset on every cold start).
 */
export function createRateLimiter({ name, limit, windowMs }: { name: string; limit: number; windowMs: number }) {
  const keyFor = (key: string) => `${name}:${key}`;

  return {
    /** Returns true if the action is allowed and counts it. */
    async consume(key: string): Promise<boolean> {
      const db = await getDb();
      const now = Date.now();
      // Start a new window if the old one expired, otherwise increment - in one atomic statement.
      const { rows } = await db.execute({
        sql: `INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)
              ON CONFLICT (key) DO UPDATE SET
                count    = CASE WHEN rate_limits.reset_at <= ? THEN 1 ELSE rate_limits.count + 1 END,
                reset_at = CASE WHEN rate_limits.reset_at <= ? THEN excluded.reset_at ELSE rate_limits.reset_at END
              RETURNING count`,
        args: [keyFor(key), now + windowMs, now, now],
      });
      return Number(rows[0]?.count ?? 1) <= limit;
    },

    async reset(key: string): Promise<void> {
      const db = await getDb();
      await db.execute({ sql: "DELETE FROM rate_limits WHERE key = ?", args: [keyFor(key)] });
    },
  };
}
