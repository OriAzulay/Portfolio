import "server-only";
import { getDb } from "../db/client";

export const visitsRepository = {
  record(ipHash: string, firstSeen?: string): void {
    getDb()
      .prepare(
        `INSERT INTO visits (ip_hash, first_seen, last_seen)
         VALUES (?, COALESCE(?, datetime('now')), datetime('now'))
         ON CONFLICT (ip_hash) DO UPDATE SET last_seen = datetime('now')`
      )
      .run(ipHash, firstSeen ?? null);
  },

  countUnique(): number {
    const row = getDb().prepare("SELECT COUNT(*) AS count FROM visits").get() as { count: number };
    return row.count;
  },
};
