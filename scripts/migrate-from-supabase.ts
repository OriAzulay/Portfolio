/**
 * One-time import of the old Supabase data into the local SQLite database.
 *
 *   npm run db:migrate-supabase            # refuses if SQLite already has content
 *   npm run db:migrate-supabase -- --force # overwrite existing SQLite content
 *
 * Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * - Copies the portfolio JSON (table `portfolio_data`, id = 1).
 * - Downloads every referenced image (Supabase Storage or /uploads/...) into SQLite
 *   and rewrites the URLs to /api/images/<id>.
 * - Copies the unique-visitor rows (table `visits`).
 * After it succeeds you can delete the SUPABASE_* variables and public/uploads.
 */
import fs from "node:fs";
import path from "node:path";
import { storeImageBytes } from "@/server/services/image.service";
import { hasStoredPortfolio, updatePortfolio } from "@/server/services/portfolio.service";
import { visitsRepository } from "@/server/repositories/visits.repository";
import type { ImageKind } from "@/types/portfolio";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Fall back to variables already in the environment.
}

/** First non-empty value among the given env var names (supports common aliases). */
function readEnv(...names: string[]): { name: string; value: string } | null {
  for (const name of names) {
    const value = process.env[name]?.trim().replace(/^["']|["']$/g, "");
    if (value) return { name, value };
  }
  return null;
}

const URL_VARS = ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"];
const KEY_VARS = ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY", "SUPABASE_KEY"];
const urlEnv = readEnv(...URL_VARS);
const keyEnv = readEnv(...KEY_VARS);
// Accept both the project URL and the "Data API" URL (…/rest/v1/).
const SUPABASE_URL = urlEnv?.value.replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
const SUPABASE_KEY = keyEnv?.value;
const force = process.argv.includes("--force");

/** Exits with a clear message unless both Supabase settings look real. */
function assertSupabaseConfig(): void {
  const problems: string[] = [];
  const where = "your Supabase project (Connect button, or Project Settings > Data API / API Keys)";

  if (!urlEnv) {
    problems.push(`${URL_VARS[0]} is missing. Copy the "Project URL" from ${where}.`);
  } else if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(SUPABASE_URL ?? "")) {
    let valid = false;
    try {
      valid = new URL(SUPABASE_URL ?? "").protocol === "https:";
    } catch {}
    if (!valid) {
      problems.push(
        `${urlEnv.name} is not a valid URL (expected https://<project-ref>.supabase.co). Copy the "Project URL" from ${where}.`
      );
    }
  }

  if (!keyEnv) {
    problems.push(`${KEY_VARS[0]} is missing. Copy a secret key (sb_secret_... or legacy service_role) from ${where}.`);
  } else if ((SUPABASE_KEY ?? "").length < 30) {
    problems.push(
      `${keyEnv.name} looks like a placeholder. Copy a secret key (sb_secret_... or legacy service_role) from ${where}.`
    );
  }

  if (problems.length > 0) {
    console.error("Can't reach Supabase - fix .env.local first:\n");
    for (const problem of problems) console.error(`  - ${problem}`);
    console.error("\nIf you never stored content in Supabase, you don't need this script: edit the site in /dashboard instead.");
    process.exit(1);
  }
}

type Json = Record<string, unknown>;

class TableMissingError extends Error {}

async function supabaseSelect<T>(table: string, query: string): Promise<T[]> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    // Legacy service_role keys are JWTs and also go in Authorization;
    // the newer sb_secret_... keys must only be sent as `apikey`.
    headers: SUPABASE_KEY!.startsWith("eyJ")
      ? { apikey: SUPABASE_KEY!, Authorization: `Bearer ${SUPABASE_KEY}` }
      : { apikey: SUPABASE_KEY! },
  });
  if (response.status === 404) {
    throw new TableMissingError(`Table "${table}" does not exist`);
  }
  if (!response.ok) {
    throw new Error(`Supabase ${table}: HTTP ${response.status} ${await response.text()}`);
  }
  return (await response.json()) as T[];
}

async function loadImageBytes(url: string): Promise<Buffer | null> {
  if (url.startsWith("/uploads/")) {
    const file = path.join(process.cwd(), "public", url);
    return fs.existsSync(file) ? fs.readFileSync(file) : null;
  }
  if (/^https?:\/\//i.test(url)) {
    const response = await fetch(url);
    return response.ok ? Buffer.from(await response.arrayBuffer()) : null;
  }
  return null;
}

/** Copies an image into SQLite if it is hosted on Supabase or in public/uploads. */
async function rehostImage(url: unknown, kind: ImageKind): Promise<unknown> {
  if (typeof url !== "string" || !url) return url;
  const isSupabase = SUPABASE_URL !== undefined && url.startsWith(SUPABASE_URL);
  if (!isSupabase && !url.startsWith("/uploads/")) return url;

  try {
    const bytes = await loadImageBytes(url);
    if (!bytes) {
      console.warn(`  ! could not load ${url} - leaving it empty`);
      return "";
    }
    // Existing photos may exceed the 5 MB dashboard upload limit - keep them.
    const { url: newUrl } = await storeImageBytes(bytes, kind, 50 * 1024 * 1024);
    const size = bytes.length > 1024 * 1024 ? ` (${(bytes.length / 1024 / 1024).toFixed(1)} MB)` : "";
    console.log(`  ✓ ${kind} image -> ${newUrl}${size}`);
    return newUrl;
  } catch (error) {
    console.warn(`  ! skipped ${url}: ${(error as Error).message}`);
    return "";
  }
}

/** The old app used table `portfolio_data`; some setups named it `portfolio`. Prefers row id 1. */
async function fetchPortfolioJson(): Promise<Json | null> {
  for (const table of ["portfolio_data", "portfolio"]) {
    try {
      const rows = await supabaseSelect<{ id: number; data: Json | null }>(table, "select=id,data&order=id.asc");
      const row = rows.find((r) => r.id === 1) ?? rows[0];
      console.log(`  found table "${table}" (${rows.length} row(s))`);
      return row?.data ?? null;
    } catch (error) {
      if (!(error instanceof TableMissingError)) throw error;
    }
  }
  throw new Error('No "portfolio_data" or "portfolio" table found in Supabase.');
}

async function main() {
  assertSupabaseConfig();
  if (hasStoredPortfolio() && !force) {
    console.error("SQLite already contains portfolio data. Re-run with --force to overwrite it.");
    process.exit(1);
  }

  console.log("Fetching portfolio from Supabase...");
  const data = await fetchPortfolioJson();
  if (!data || Object.keys(data).length === 0) {
    console.log("No portfolio content in Supabase - nothing to import.");
  } else {
    console.log("Copying images...");
    const info = (data.personalInfo ?? {}) as Json;
    info.avatarUrl = await rehostImage(info.avatarUrl, "avatar");
    for (const project of (data.projects ?? []) as Json[]) {
      project.imageUrl = await rehostImage(project.imageUrl, "project");
    }
    for (const item of (data.gallery ?? []) as Json[]) {
      item.imageUrl = await rehostImage(item.imageUrl, "gallery");
    }

    // Validates + sanitizes exactly like a dashboard save. Old data may miss
    // newer fields - fill them with the merge the app used before.
    updatePortfolio({
      personalInfo: info,
      skills: data.skills ?? [],
      experience: data.experience ?? [],
      education: data.education ?? [],
      projects: data.projects ?? [],
      gallery: data.gallery ?? [],
    });
    console.log("✓ Portfolio content imported.");
  }

  console.log("Copying visitor counter...");
  const visits = await supabaseSelect<{ ip_hash: string; created_at: string | null }>(
    "visits",
    "select=ip_hash,created_at"
  ).catch((error) => {
    if (error instanceof TableMissingError) {
      console.log("  (no visits table in Supabase - skipping)");
      return [];
    }
    throw error;
  });
  for (const visit of visits) {
    const firstSeen = visit.created_at ? new Date(visit.created_at).toISOString().replace("T", " ").slice(0, 19) : undefined;
    visitsRepository.record(visit.ip_hash, firstSeen);
  }
  console.log(`✓ ${visits.length} visitor rows imported.`);
  console.log("\nDone. You can now remove the SUPABASE_* lines from .env.local.");
}

main().catch((error) => {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
