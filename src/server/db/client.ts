import "server-only";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { Client } from "@libsql/client";
import { config } from "../config";
import { runMigrations } from "./migrations";

// One client (and one migration run) per server instance; survives dev hot reloads.
const globalForDb = globalThis as unknown as { __portfolioDb?: Promise<Client> };

async function connect(): Promise<Client> {
  const url = config.databaseUrl;

  let client: Client;
  if (url.startsWith("file:")) {
    // Local development: a SQLite file on disk (needs the native driver).
    fs.mkdirSync(path.dirname(fileURLToPath(url)), { recursive: true });
    const { createClient } = await import("@libsql/client");
    client = createClient({ url });
  } else {
    // Turso over HTTP - no filesystem needed, works on Vercel's serverless functions.
    const { createClient } = await import("@libsql/client/web");
    client = createClient({ url, authToken: config.databaseAuthToken });
  }

  await runMigrations(client);
  return client;
}

/** Returns the ready-to-use database client (migrations applied). */
export function getDb(): Promise<Client> {
  if (!globalForDb.__portfolioDb) {
    globalForDb.__portfolioDb = connect().catch((error) => {
      globalForDb.__portfolioDb = undefined; // retry on the next request
      throw error;
    });
  }
  return globalForDb.__portfolioDb;
}
