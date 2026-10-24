import type { z } from "zod";
import type {
  educationSchema,
  experienceSchema,
  galleryItemSchema,
  githubLinkSchema,
  keyProjectSchema,
  skillGroupSchema,
  personalInfoSchema,
  portfolioSchema,
  projectSchema,
  skillSchema,
} from "@/lib/validation/portfolio";

export type PersonalInfo = z.output<typeof personalInfoSchema>;
export type Skill = z.output<typeof skillSchema>;
export type Experience = z.output<typeof experienceSchema>;
export type Education = z.output<typeof educationSchema>;
export type TimelineEntry = Experience;
export type SkillGroup = z.output<typeof skillGroupSchema>;
export type KeyProject = z.output<typeof keyProjectSchema>;
export type GitHubLink = z.output<typeof githubLinkSchema>;
export type Project = z.output<typeof projectSchema>;
export type GalleryItem = z.output<typeof galleryItemSchema>;
export type PortfolioData = z.output<typeof portfolioSchema>;

export type ImageKind = "avatar" | "project" | "gallery";
