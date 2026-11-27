import "server-only";
import type Database from "better-sqlite3";

/**
 * Ordered schema migrations. Each entry runs once; the applied version is
 * tracked in SQLite's `user_version` pragma. Never edit an applied entry -
 * append a new one instead.
 */
const migrations: string[] = [
  /* 1: initial schema */ `
  CREATE TABLE portfolio_sections (
    key        TEXT PRIMARY KEY,
    data       TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE images (
    id         TEXT PRIMARY KEY,
    kind       TEXT NOT NULL,
    mime_type  TEXT NOT NULL,
    size       INTEGER NOT NULL,
    data       BLOB NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE contact_messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    message    TEXT NOT NULL,
    ip_hash    TEXT NOT NULL,
    is_read    INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX idx_contact_messages_created_at ON contact_messages (created_at DESC);
  CREATE INDEX idx_contact_messages_ip_created ON contact_messages (ip_hash, created_at);

  CREATE TABLE visits (
    ip_hash    TEXT PRIMARY KEY,
    first_seen TEXT NOT NULL DEFAULT (datetime('now')),
    last_seen  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  `,

  /* 2: key/value settings (e.g. GitHub username + token, never sent to the client) */ `
  CREATE TABLE settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  `,
];

export function runMigrations(db: Database.Database): void {
  const current = db.pragma("user_version", { simple: true }) as number;

  for (let version = current; version < migrations.length; version++) {
    db.transaction(() => {
      db.exec(migrations[version]);
      db.pragma(`user_version = ${version + 1}`);
    })();
  }
}
