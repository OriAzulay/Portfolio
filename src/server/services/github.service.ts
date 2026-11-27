import "server-only";
import crypto from "node:crypto";
import { z } from "zod";
import type { GitHubRepo, GitHubSettings } from "@/lib/github";
import { config } from "../config";
import { AppError } from "../http/errors";
import { settingsRepository } from "../repositories/settings.repository";

const USERNAME_KEY = "github.username";
const TOKEN_KEY = "github.token";
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_PAGES = 3; // up to 300 repositories

/* ---------- token encryption (AES-256-GCM keyed from SESSION_SECRET) ---------- */

const encryptionKey = () => crypto.createHash("sha256").update(`github-token:${config.sessionSecret}`).digest();

function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64")).join(".");
}

function decrypt(stored: string): string | null {
  try {
    const [iv, tag, data] = stored.split(".").map((part) => Buffer.from(part, "base64"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null; // e.g. SESSION_SECRET changed - token must be re-entered
  }
}

/* ---------- settings ---------- */

const settingsSchema = z.object({
  username: z
    .string()
    .trim()
    .max(39)
    .regex(/^$|^[a-z\d](?:[a-z\d]|-(?=[a-z\d]))*$/i, "Not a valid GitHub username"),
  /** undefined = keep the saved token, "" = remove it, otherwise replace it. */
  token: z.string().trim().max(255).optional(),
});

export function getGitHubSettings(): GitHubSettings {
  return {
    username: settingsRepository.get(USERNAME_KEY) ?? "",
    hasToken: Boolean(settingsRepository.get(TOKEN_KEY)),
  };
}

export function updateGitHubSettings(input: unknown): GitHubSettings {
  const { username, token } = settingsSchema.parse(input);

  if (username) settingsRepository.set(USERNAME_KEY, username);
  else settingsRepository.delete(USERNAME_KEY);

  if (token === "") settingsRepository.delete(TOKEN_KEY);
  else if (token) settingsRepository.set(TOKEN_KEY, encrypt(token));

  repoCache.clear();
  return getGitHubSettings();
}

/* ---------- GitHub API ---------- */

type ApiRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  pushed_at: string | null;
  updated_at: string;
  fork: boolean;
  archived: boolean;
  private: boolean;
};

const repoCache = new Map<string, { fetchedAt: number; repos: GitHubRepo[] }>();

const toRepo = (r: ApiRepo): GitHubRepo => ({
  id: r.id,
  name: r.name,
  fullName: r.full_name,
  description: r.description ?? "",
  htmlUrl: r.html_url,
  // Only keep http(s) homepages - they end up as links on the site.
  homepage: r.homepage && /^https?:\/\//i.test(r.homepage) ? r.homepage : "",
  language: r.language ?? "",
  topics: r.topics ?? [],
  stars: r.stargazers_count,
  updatedAt: r.pushed_at ?? r.updated_at,
  fork: r.fork,
  archived: r.archived,
  private: r.private,
});

async function githubFetch(path: string, token: string | null): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "portfolio-dashboard",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new AppError(502, "Couldn't reach GitHub. Check your internet connection and try again.");
  }

  if (response.ok) return response;

  const remaining = response.headers.get("x-ratelimit-remaining");
  if (response.status === 429 || (response.status === 403 && remaining === "0")) {
    const reset = Number(response.headers.get("x-ratelimit-reset")) * 1000;
    const when = reset ? new Date(reset).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "soon";
    throw new AppError(
      429,
      `GitHub rate limit reached. Try again after ${when}${token ? "" : ", or add a personal access token"}.`
    );
  }
  if (response.status === 401) throw new AppError(400, "The GitHub token is invalid or expired.");
  if (response.status === 404) throw new AppError(404, "GitHub user not found.");
  throw new AppError(502, `GitHub returned an error (${response.status}).`);
}

async function fetchAllRepos(username: string, token: string | null): Promise<GitHubRepo[]> {
  // With a token that belongs to this user, /user/repos also includes private repos.
  let basePath = `/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed`;
  if (token) {
    const me = (await (await githubFetch("/user", token)).json()) as { login?: string };
    if (me.login?.toLowerCase() === username.toLowerCase()) {
      basePath = "/user/repos?affiliation=owner&sort=pushed";
    }
  }

  const repos: GitHubRepo[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await githubFetch(`${basePath}&per_page=100&page=${page}`, token);
    const batch = (await response.json()) as ApiRepo[];
    repos.push(...batch.map(toRepo));
    if (batch.length < 100) break;
  }
  return repos;
}

/** Lists the configured user's repositories (cached for 10 minutes). */
export async function listGitHubRepos(options: { refresh?: boolean } = {}) {
  const { username } = getGitHubSettings();
  if (!username) throw new AppError(400, "Set your GitHub username first.");

  const storedToken = settingsRepository.get(TOKEN_KEY);
  const token = storedToken ? decrypt(storedToken) : null;
  const cacheKey = `${username.toLowerCase()}:${token ? "auth" : "anon"}`;

  const cached = repoCache.get(cacheKey);
  if (cached && !options.refresh && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { username, repos: cached.repos, fetchedAt: new Date(cached.fetchedAt).toISOString() };
  }

  const repos = await fetchAllRepos(username, token);
  const fetchedAt = Date.now();
  repoCache.set(cacheKey, { fetchedAt, repos });
  return { username, repos, fetchedAt: new Date(fetchedAt).toISOString() };
}
