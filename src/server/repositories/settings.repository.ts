import "server-only";
import { getDb } from "../db/client";

export const settingsRepository = {
  async get(key: string): Promise<string | null> {
    const db = await getDb();
    const { rows } = await db.execute({ sql: "SELECT value FROM settings WHERE key = ?", args: [key] });
    return rows[0] ? String(rows[0].value) : null;
  },

  async set(key: string, value: string): Promise<void> {
    const db = await getDb();
    await db.execute({
      sql: `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
            ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      args: [key, value],
    });
  },

  async delete(key: string): Promise<void> {
    const db = await getDb();
    await db.execute({ sql: "DELETE FROM settings WHERE key = ?", args: [key] });
  },
};
