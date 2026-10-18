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

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const force = process.argv.includes("--force");

type Json = Record<string, unknown>;

async function supabaseSelect<T>(table: string, query: string): Promise<T[]> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_KEY!, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
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
    const { url: newUrl } = storeImageBytes(bytes, kind);
    console.log(`  ✓ ${kind} image -> ${newUrl}`);
    return newUrl;
  } catch (error) {
    console.warn(`  ! skipped ${url}: ${(error as Error).message}`);
    return "";
  }
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (in .env.local).");
    process.exit(1);
  }
  if (hasStoredPortfolio() && !force) {
    console.error("SQLite already contains portfolio data. Re-run with --force to overwrite it.");
    process.exit(1);
  }

  console.log("Fetching portfolio from Supabase...");
  const rows = await supabaseSelect<{ data: Json | null }>("portfolio_data", "id=eq.1&select=data");
  const data = rows[0]?.data;
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
  );
  for (const visit of visits) {
    const firstSeen = visit.created_at ? new Date(visit.created_at).toISOString().replace("T", " ").slice(0, 19) : undefined;
    visitsRepository.record(visit.ip_hash, firstSeen);
  }
  console.log(`✓ ${visits.length} visitor rows imported.`);
  console.log("\nDone. You can now remove the SUPABASE_* lines from .env.local.");
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
