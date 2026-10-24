import "server-only";
import { getDb } from "../db/client";
import type { ContactMessage } from "@/types/contact";

type MessageRow = {
  id: number;
  name: string;
  email: string;
  message: string;
  isRead: number;
  createdAt: string;
};

const toMessage = (row: MessageRow): ContactMessage => ({
  ...row,
  isRead: row.isRead === 1,
  // SQLite datetime('now') is UTC without a zone marker.
  createdAt: `${row.createdAt.replace(" ", "T")}Z`,
});

export const messagesRepository = {
  create(input: { name: string; email: string; message: string; ipHash: string }): number {
    const result = getDb()
      .prepare("INSERT INTO contact_messages (name, email, message, ip_hash) VALUES (?, ?, ?, ?)")
      .run(input.name, input.email, input.message, input.ipHash);
    return Number(result.lastInsertRowid);
  },

  list(): ContactMessage[] {
    const rows = getDb()
      .prepare(
        `SELECT id, name, email, message, is_read AS isRead, created_at AS createdAt
         FROM contact_messages ORDER BY created_at DESC, id DESC`
      )
      .all() as MessageRow[];
    return rows.map(toMessage);
  },

  countUnread(): number {
    const row = getDb()
      .prepare("SELECT COUNT(*) AS count FROM contact_messages WHERE is_read = 0")
      .get() as { count: number };
    return row.count;
  },

  countRecentByIp(ipHash: string, windowMinutes: number): number {
    const row = getDb()
      .prepare(
        `SELECT COUNT(*) AS count FROM contact_messages
         WHERE ip_hash = ? AND created_at > datetime('now', ?)`
      )
      .get(ipHash, `-${windowMinutes} minutes`) as { count: number };
    return row.count;
  },

  setRead(id: number, isRead: boolean): boolean {
    const result = getDb()
      .prepare("UPDATE contact_messages SET is_read = ? WHERE id = ?")
      .run(isRead ? 1 : 0, id);
    return result.changes > 0;
  },

  delete(id: number): boolean {
    return getDb().prepare("DELETE FROM contact_messages WHERE id = ?").run(id).changes > 0;
  },
};
