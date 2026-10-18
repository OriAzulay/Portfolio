import type { z } from "zod";
import type {
  educationSchema,
  experienceSchema,
  galleryItemSchema,
  personalInfoSchema,
  portfolioSchema,
  projectSchema,
  skillSchema,
} from "@/lib/validation/portfolio";

export type PersonalInfo = z.output<typeof personalInfoSchema>;
export type Skill = z.output<typeof skillSchema>;
export type Experience = z.output<typeof experienceSchema>;
export type Education = z.output<typeof educationSchema>;
export type Project = z.output<typeof projectSchema>;
export type GalleryItem = z.output<typeof galleryItemSchema>;
export type PortfolioData = z.output<typeof portfolioSchema>;

export type ImageKind = "avatar" | "project" | "gallery";
