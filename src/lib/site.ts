/** Public base URL of the site (used for absolute links in metadata, sitemap, robots). */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL; // set automatically on Vercel
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/**
 * Shortens text for meta descriptions at a sentence boundary when possible,
 * otherwise at a word boundary - never in the middle of a word.
 */
export function summarize(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
  let result = "";
  for (const sentence of sentences) {
    if ((result + sentence).trim().length > max) break;
    result += sentence;
  }
  if (result.trim()) return result.trim();

  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}
