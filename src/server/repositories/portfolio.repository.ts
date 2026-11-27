import "server-only";
import { getDb } from "../db/client";

type SectionRow = { key: string; data: string };

export const portfolioRepository = {
  /** Returns the raw stored JSON for every section, keyed by section name. */
  getSections(): Record<string, unknown> {
    const rows = getDb().prepare("SELECT key, data FROM portfolio_sections").all() as SectionRow[];
    const sections: Record<string, unknown> = {};
    for (const row of rows) {
      try {
        sections[row.key] = JSON.parse(row.data);
      } catch {
        // A corrupt section falls back to defaults in the service layer.
      }
    }
    return sections;
  },

  hasContent(): boolean {
    return Boolean(getDb().prepare("SELECT 1 FROM portfolio_sections LIMIT 1").get());
  },

  saveSections(sections: Record<string, unknown>): void {
    const db = getDb();
    const upsert = db.prepare(`
      INSERT INTO portfolio_sections (key, data, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT (key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
    `);
    db.transaction(() => {
      for (const [key, value] of Object.entries(sections)) {
        upsert.run(key, JSON.stringify(value));
      }
    })();
  },
};
