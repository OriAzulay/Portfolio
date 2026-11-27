import "server-only";
import { getDb } from "../db/client";

export const portfolioRepository = {
  /** Returns the raw stored JSON for every section, keyed by section name. */
  async getSections(): Promise<Record<string, unknown>> {
    const db = await getDb();
    const { rows } = await db.execute("SELECT key, data FROM portfolio_sections");
    const sections: Record<string, unknown> = {};
    for (const row of rows) {
      try {
        sections[String(row.key)] = JSON.parse(String(row.data));
      } catch {
        // A corrupt section falls back to defaults in the service layer.
      }
    }
    return sections;
  },

  async hasContent(): Promise<boolean> {
    const db = await getDb();
    const { rows } = await db.execute("SELECT 1 FROM portfolio_sections LIMIT 1");
    return rows.length > 0;
  },

  async saveSections(sections: Record<string, unknown>): Promise<void> {
    const db = await getDb();
    await db.batch(
      Object.entries(sections).map(([key, value]) => ({
        sql: `INSERT INTO portfolio_sections (key, data, updated_at)
              VALUES (?, ?, datetime('now'))
              ON CONFLICT (key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
        args: [key, JSON.stringify(value)],
      })),
      "write"
    );
  },
};
