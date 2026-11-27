import "server-only";
import { defaultPortfolioData } from "@/lib/defaults";
import {
  portfolioSchema,
  portfolioSectionSchemas,
  type PortfolioSectionKey,
} from "@/lib/validation/portfolio";
import type { PortfolioData } from "@/types/portfolio";
import { portfolioRepository } from "../repositories/portfolio.repository";
import { removeUnusedImages } from "./image.service";
import { sanitizeRichText } from "./sanitize";

const SECTION_KEYS = Object.keys(portfolioSectionSchemas) as PortfolioSectionKey[];

const sanitizeEntries = <T extends { description: string }>(items: T[]): T[] =>
  items.map((item) => ({ ...item, description: sanitizeRichText(item.description) }));

function sanitize(data: PortfolioData): PortfolioData {
  return {
    ...data,
    experience: sanitizeEntries(data.experience),
    militaryService: sanitizeEntries(data.militaryService),
    volunteering: sanitizeEntries(data.volunteering),
  };
}

/**
 * Builds the portfolio from stored sections. Missing or invalid sections
 * fall back to the defaults, so the site always renders.
 */
export async function getPortfolio(): Promise<PortfolioData> {
  const stored = await portfolioRepository.getSections();
  const result = { ...defaultPortfolioData } as Record<PortfolioSectionKey, unknown>;

  for (const key of SECTION_KEYS) {
    if (stored[key] === undefined) continue;
    const parsed = portfolioSectionSchemas[key].safeParse(stored[key]);
    if (parsed.success) result[key] = parsed.data;
    else console.warn(`[portfolio] Stored section "${key}" is invalid - using defaults.`);
  }
  return sanitize(result as PortfolioData);
}

/** Validates, sanitizes and saves the whole portfolio. Throws ZodError on invalid input. */
export async function updatePortfolio(input: unknown): Promise<PortfolioData> {
  const data = sanitize(portfolioSchema.parse(input));
  await portfolioRepository.saveSections(data);
  await removeUnusedImages(data);
  return data;
}

export function hasStoredPortfolio(): Promise<boolean> {
  return portfolioRepository.hasContent();
}
