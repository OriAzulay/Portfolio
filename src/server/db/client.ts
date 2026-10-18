import "server-only";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { config } from "../config";
import { runMigrations } from "./migrations";

// Reuse one connection across hot reloads in development.
const globalForDb = globalThis as unknown as { __portfolioDb?: Database.Database };

export function getDb(): Database.Database {
  if (!globalForDb.__portfolioDb) {
    const file = config.databasePath;
    fs.mkdirSync(path.dirname(file), { recursive: true });

    const db = new Database(file);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.pragma("busy_timeout = 5000");
    runMigrations(db);

    globalForDb.__portfolioDb = db;
  }
  return globalForDb.__portfolioDb;
}
