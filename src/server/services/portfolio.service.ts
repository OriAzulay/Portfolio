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

function sanitize(data: PortfolioData): PortfolioData {
  return {
    ...data,
    experience: data.experience.map((item) => ({
      ...item,
      description: sanitizeRichText(item.description),
    })),
  };
}

/**
 * Builds the portfolio from stored sections. Missing or invalid sections
 * fall back to the defaults, so the site always renders.
 */
export function getPortfolio(): PortfolioData {
  const stored = portfolioRepository.getSections();
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
export function updatePortfolio(input: unknown): PortfolioData {
  const data = sanitize(portfolioSchema.parse(input));
  portfolioRepository.saveSections(data);
  removeUnusedImages(data);
  return data;
}

export function hasStoredPortfolio(): boolean {
  return portfolioRepository.hasContent();
}
