import "server-only";
import type { Row } from "@libsql/client";
import type { ContactMessage } from "@/types/contact";
import { getDb } from "../db/client";

const toMessage = (row: Row): ContactMessage => ({
  id: Number(row.id),
  name: String(row.name),
  email: String(row.email),
  message: String(row.message),
  isRead: Number(row.is_read) === 1,
  // SQLite datetime('now') is UTC without a zone marker.
  createdAt: `${String(row.created_at).replace(" ", "T")}Z`,
});

export const messagesRepository = {
  async create(input: { name: string; email: string; message: string; ipHash: string }): Promise<number> {
    const db = await getDb();
    const result = await db.execute({
      sql: "INSERT INTO contact_messages (name, email, message, ip_hash) VALUES (?, ?, ?, ?)",
      args: [input.name, input.email, input.message, input.ipHash],
    });
    return Number(result.lastInsertRowid);
  },

  async list(): Promise<ContactMessage[]> {
    const db = await getDb();
    const { rows } = await db.execute(
      `SELECT id, name, email, message, is_read, created_at
       FROM contact_messages ORDER BY created_at DESC, id DESC`
    );
    return rows.map(toMessage);
  },

  async countUnread(): Promise<number> {
    const db = await getDb();
    const { rows } = await db.execute("SELECT COUNT(*) AS count FROM contact_messages WHERE is_read = 0");
    return Number(rows[0]?.count ?? 0);
  },

  async countRecentByIp(ipHash: string, windowMinutes: number): Promise<number> {
    const db = await getDb();
    const { rows } = await db.execute({
      sql: `SELECT COUNT(*) AS count FROM contact_messages
            WHERE ip_hash = ? AND created_at > datetime('now', ?)`,
      args: [ipHash, `-${windowMinutes} minutes`],
    });
    return Number(rows[0]?.count ?? 0);
  },

  async setRead(id: number, isRead: boolean): Promise<boolean> {
    const db = await getDb();
    const result = await db.execute({
      sql: "UPDATE contact_messages SET is_read = ? WHERE id = ?",
      args: [isRead ? 1 : 0, id],
    });
    return result.rowsAffected > 0;
  },

  async delete(id: number): Promise<boolean> {
    const db = await getDb();
    const result = await db.execute({ sql: "DELETE FROM contact_messages WHERE id = ?", args: [id] });
    return result.rowsAffected > 0;
  },
};
