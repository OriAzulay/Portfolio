import "server-only";
import { getDb } from "../db/client";

export const settingsRepository = {
  get(key: string): string | null {
    const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as
      | { value: string }
      | undefined;
    return row?.value ?? null;
  },

  set(key: string, value: string): void {
    getDb()
      .prepare(
        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      )
      .run(key, value);
  },

  delete(key: string): void {
    getDb().prepare("DELETE FROM settings WHERE key = ?").run(key);
  },
};
