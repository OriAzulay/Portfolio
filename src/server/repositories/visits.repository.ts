import "server-only";
import { getDb } from "../db/client";

export const visitsRepository = {
  async record(ipHash: string, firstSeen?: string): Promise<void> {
    const db = await getDb();
    await db.execute({
      sql: `INSERT INTO visits (ip_hash, first_seen, last_seen)
            VALUES (?, COALESCE(?, datetime('now')), datetime('now'))
            ON CONFLICT (ip_hash) DO UPDATE SET last_seen = datetime('now')`,
      args: [ipHash, firstSeen ?? null],
    });
  },

  async countUnique(): Promise<number> {
    const db = await getDb();
    const { rows } = await db.execute("SELECT COUNT(*) AS count FROM visits");
    return Number(rows[0]?.count ?? 0);
  },
};
