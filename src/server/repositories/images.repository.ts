import "server-only";
import { getDb } from "../db/client";

export type StoredImage = {
  id: string;
  mimeType: string;
  size: number;
  data: Buffer;
};

export const imagesRepository = {
  insert(image: { id: string; kind: string; mimeType: string; data: Buffer }): void {
    getDb()
      .prepare("INSERT INTO images (id, kind, mime_type, size, data) VALUES (?, ?, ?, ?, ?)")
      .run(image.id, image.kind, image.mimeType, image.data.length, image.data);
  },

  findById(id: string): StoredImage | null {
    const row = getDb()
      .prepare("SELECT id, mime_type AS mimeType, size, data FROM images WHERE id = ?")
      .get(id) as StoredImage | undefined;
    return row ?? null;
  },

  listMeta(): { id: string; kind: string; size: number }[] {
    return getDb().prepare("SELECT id, kind, size FROM images ORDER BY created_at").all() as {
      id: string;
      kind: string;
      size: number;
    }[];
  },

  /** Replaces the bytes behind an id (used when re-compressing). */
  updateData(id: string, mimeType: string, data: Buffer): void {
    getDb()
      .prepare("UPDATE images SET mime_type = ?, size = ?, data = ? WHERE id = ?")
      .run(mimeType, data.length, data, id);
  },

  /**
   * Deletes images that are not in `keepIds` and are older than `minAgeMinutes`
   * (fresh uploads may not be saved into the portfolio yet).
   */
  deleteUnreferenced(keepIds: Set<string>, minAgeMinutes: number): number {
    const db = getDb();
    const candidates = db
      .prepare("SELECT id FROM images WHERE created_at < datetime('now', ?)")
      .all(`-${minAgeMinutes} minutes`) as { id: string }[];

    const remove = db.prepare("DELETE FROM images WHERE id = ?");
    let removed = 0;
    db.transaction(() => {
      for (const { id } of candidates) {
        if (!keepIds.has(id)) removed += remove.run(id).changes;
      }
    })();
    return removed;
  },
};
