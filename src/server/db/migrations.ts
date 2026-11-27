import "server-only";
import type { Client } from "@libsql/client";

/**
 * Ordered schema migrations. Each runs once; applied versions are recorded in
 * `schema_migrations`. Statements are idempotent (IF NOT EXISTS) so concurrent
 * cold starts on serverless can't break anything. Never edit an applied entry -
 * append a new one instead.
 */
const migrations: string[][] = [
  /* 1: initial schema */ [
    `CREATE TABLE IF NOT EXISTS portfolio_sections (
      key        TEXT PRIMARY KEY,
      data       TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS images (
      id         TEXT PRIMARY KEY,
      kind       TEXT NOT NULL,
      mime_type  TEXT NOT NULL,
      size       INTEGER NOT NULL,
      data       BLOB NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS contact_messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      message    TEXT NOT NULL,
      ip_hash    TEXT NOT NULL,
      is_read    INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages (created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_contact_messages_ip_created ON contact_messages (ip_hash, created_at)`,
    `CREATE TABLE IF NOT EXISTS visits (
      ip_hash    TEXT PRIMARY KEY,
      first_seen TEXT NOT NULL DEFAULT (datetime('now')),
      last_seen  TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  ],

  /* 2: key/value settings (e.g. GitHub username + token, never sent to the client) */ [
    `CREATE TABLE IF NOT EXISTS settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  ],

  /* 3: rate limits shared by all serverless instances (login attempts etc.) */ [
    `CREATE TABLE IF NOT EXISTS rate_limits (
      key      TEXT PRIMARY KEY,
      count    INTEGER NOT NULL,
      reset_at INTEGER NOT NULL
    )`,
  ],
];

export async function runMigrations(db: Client): Promise<void> {
  await db.execute(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version    INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  const result = await db.execute("SELECT MAX(version) AS v FROM schema_migrations");
  let current = Number(result.rows[0]?.v ?? 0);

  // Databases created before schema_migrations existed tracked the version in PRAGMA user_version.
  if (current === 0) {
    try {
      const legacy = await db.execute("PRAGMA user_version");
      current = Number(legacy.rows[0]?.user_version ?? 0);
    } catch {
      current = 0; // not available on every backend - statements are idempotent anyway
    }
  }

  for (let version = current; version < migrations.length; version++) {
    await db.batch(
      [
        ...migrations[version],
        { sql: "INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)", args: [version + 1] },
      ],
      "write"
    );
  }

  // Record legacy versions too, so future runs don't depend on user_version.
  if (current > 0) {
    const stmts = Array.from({ length: current }, (_, i) => ({
      sql: "INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)",
      args: [i + 1],
    }));
    await db.batch(stmts, "write");
  }
}
