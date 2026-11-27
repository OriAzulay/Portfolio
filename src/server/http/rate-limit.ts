import "server-only";

/**
 * Tiny fixed-window, in-memory rate limiter. Good enough for a single
 * instance (which SQLite requires anyway).
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    /** Returns true if the action is allowed and counts it. */
    consume(key: string): boolean {
      const now = Date.now();
      const entry = hits.get(key);

      if (!entry || entry.resetAt <= now) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        if (hits.size > 10_000) {
          for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
        }
        return true;
      }
      if (entry.count >= limit) return false;
      entry.count++;
      return true;
    },

    reset(key: string): void {
      hits.delete(key);
    },
  };
}
