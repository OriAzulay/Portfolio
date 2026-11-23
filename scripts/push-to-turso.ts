/**
 * Copies everything from the local SQLite file (data/portfolio.db) to the
 * remote Turso database used in production.
 *
 *   npm run db:push-remote
 *
 * Reads TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from the environment, from
 * .env.turso.local (recommended - keeps local dev on the local file), or from
 * .env.local. Idempotent: rows are upserted by primary key, so it's safe to run
 * again. Secrets are never printed.
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type InValue } from "@libsql/client";
import { runMigrations } from "@/server/db/migrations";

for (const file of [".env.turso.local", ".env.local"]) {
  try {
    process.loadEnvFile(file); // never overrides variables that are already set
  } catch {
    // file doesn't exist - fine
  }
}

/** Tables to copy, in order. rate_limits / schema_migrations are intentionally skipped. */
const TABLES = ["portfolio_sections", "settings", "visits", "contact_messages", "images"] as const;

const remoteUrl = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL;
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN;
const localFile = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "portfolio.db");

const toArg = (value: unknown): InValue =>
  value instanceof ArrayBuffer ? new Uint8Array(value) : (value as InValue);

async function count(db: Client, table: string): Promise<number> {
  const { rows } = await db.execute(`SELECT COUNT(*) AS n FROM ${table}`);
  return Number(rows[0]?.n ?? 0);
}

async function copyTable(from: Client, to: Client, table: string): Promise<number> {
  const result = await from.execute(`SELECT * FROM ${table}`);
  if (result.rows.length === 0) return 0;

  const columns = result.columns;
  const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
  const statements = result.rows.map((row) => ({ sql, args: columns.map((column) => toArg(row[column])) }));

  // Images are large - send them a few at a time; other tables in bigger chunks.
  const chunkSize = table === "images" ? 2 : 100;
  for (let i = 0; i < statements.length; i += chunkSize) {
    await to.batch(statements.slice(i, i + chunkSize), "write");
  }
  return statements.length;
}

async function main() {
  if (!remoteUrl || remoteUrl.startsWith("file:")) {
    console.error(
      "TURSO_DATABASE_URL is not set. Put TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.turso.local\n" +
        "(copy them from Vercel → your project → Settings → Environment Variables) and run again."
    );
    process.exitCode = 1;
    return;
  }

  const local = createClient({ url: pathToFileURL(path.resolve(localFile)).href });
  const remote = createClient({ url: remoteUrl, authToken });
  console.log(`Local:  ${path.relative(process.cwd(), localFile)}`);
  console.log(`Remote: ${new URL(remoteUrl).host}`);

  await runMigrations(local);
  await runMigrations(remote);

  for (const table of TABLES) {
    const copied = await copyTable(local, remote, table);
    const [localCount, remoteCount] = await Promise.all([count(local, table), count(remote, table)]);
    const status = remoteCount >= localCount ? "✓" : "!";
    console.log(`  ${status} ${table.padEnd(18)} copied ${String(copied).padStart(3)} · local ${localCount} · remote ${remoteCount}`);
  }

  local.close();
  remote.close();
  console.log("\nDone. Redeploy (or just reload) the Vercel site to see the data.");
}

main().catch((error) => {
  console.error("Push failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
