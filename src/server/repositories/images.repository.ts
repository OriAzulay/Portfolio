import "server-only";
import { getDb } from "../db/client";

export type StoredImage = {
  id: string;
  mimeType: string;
  size: number;
  data: Buffer;
};

/** libSQL returns BLOBs as ArrayBuffer (or Uint8Array for local files). */
const toBuffer = (value: unknown): Buffer =>
  value instanceof ArrayBuffer ? Buffer.from(value) : Buffer.from(value as Uint8Array);

export const imagesRepository = {
  async insert(image: { id: string; kind: string; mimeType: string; data: Buffer }): Promise<void> {
    const db = await getDb();
    await db.execute({
      sql: "INSERT INTO images (id, kind, mime_type, size, data) VALUES (?, ?, ?, ?, ?)",
      args: [image.id, image.kind, image.mimeType, image.data.length, new Uint8Array(image.data)],
    });
  },

  async findById(id: string): Promise<StoredImage | null> {
    const db = await getDb();
    const { rows } = await db.execute({
      sql: "SELECT id, mime_type, size, data FROM images WHERE id = ?",
      args: [id],
    });
    const row = rows[0];
    if (!row) return null;
    return { id: String(row.id), mimeType: String(row.mime_type), size: Number(row.size), data: toBuffer(row.data) };
  },

  async listMeta(): Promise<{ id: string; kind: string; size: number }[]> {
    const db = await getDb();
    const { rows } = await db.execute("SELECT id, kind, size FROM images ORDER BY created_at");
    return rows.map((row) => ({ id: String(row.id), kind: String(row.kind), size: Number(row.size) }));
  },

  /** Replaces the bytes behind an id (used when re-compressing). */
  async updateData(id: string, mimeType: string, data: Buffer): Promise<void> {
    const db = await getDb();
    await db.execute({
      sql: "UPDATE images SET mime_type = ?, size = ?, data = ? WHERE id = ?",
      args: [mimeType, data.length, new Uint8Array(data), id],
    });
  },

  /**
   * Deletes images that are not in `keepIds` and are older than `minAgeMinutes`
   * (fresh uploads may not be saved into the portfolio yet).
   */
  async deleteUnreferenced(keepIds: Set<string>, minAgeMinutes: number): Promise<number> {
    const db = await getDb();
    const { rows } = await db.execute({
      sql: "SELECT id FROM images WHERE created_at < datetime('now', ?)",
      args: [`-${minAgeMinutes} minutes`],
    });
    const stale = rows.map((row) => String(row.id)).filter((id) => !keepIds.has(id));
    if (stale.length === 0) return 0;
    await db.batch(
      stale.map((id) => ({ sql: "DELETE FROM images WHERE id = ?", args: [id] })),
      "write"
    );
    return stale.length;
  },
};
