import { z } from "zod";

/** Accepts "", "#", same-origin paths, http(s) and mailto URLs - never javascript: etc. */
export function isSafeUrl(value: string): boolean {
  if (value === "" || value === "#") return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return /^(https?:\/\/|mailto:)/i.test(value);
}

const text = (max: number) => z.string().trim().max(max).default("");
const safeUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(isSafeUrl, "Must be an http(s) URL or a site path")
  .default("");

export const personalInfoSchema = z.object({
  name: text(100),
  title: text(100),
  avatarUrl: safeUrl,
  email: text(200),
  phone: text(50),
  location: text(150),
  about: z.string().max(5000).default(""),
  social: z
    .object({
      github: safeUrl,
      linkedin: safeUrl,
      twitter: safeUrl,
      instagram: safeUrl,
    })
    .prefault({}),
  stats: z
    .object({
      yearsExperience: text(20),
      projectsCompleted: text(20),
      certificationsAwards: text(20),
    })
    .prefault({}),
});

export const skillSchema = z.object({
  name: text(60),
  level: z.coerce.number().int().min(0).max(100).default(50),
});

export const experienceSchema = z.object({
  title: text(120),
  company: text(120),
  period: text(60),
  /** Limited rich text (sanitized on the server). */
  description: z.string().max(10_000).default(""),
});

/** Military service / volunteering use the same shape as experience. */
export const timelineEntrySchema = experienceSchema;

export const skillGroupSchema = z.object({
  title: text(80),
  /** Free text, e.g. "Strong proficiency in C++. Experienced with C#/.NET..." */
  items: z.string().trim().max(1000).default(""),
});

export const keyProjectSchema = z.object({
  title: text(150),
  /** Where it was built, e.g. "Elbit Systems". */
  organization: text(120),
  description: z.string().trim().max(3000).default(""),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  link: safeUrl,
});

export const educationSchema = z.object({
  degree: text(150),
  school: text(150),
  period: text(60),
});

export const githubLinkSchema = z.object({
  repoId: z.number().int().positive(),
  fullName: z.string().trim().max(200),
  syncedAt: z.string().max(40),
});

export const projectSchema = z.object({
  title: text(120),
  description: z.string().trim().max(2000).default(""),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  /** Main link (repository or project page). */
  link: safeUrl,
  /** Optional live demo / homepage. */
  liveUrl: safeUrl,
  imageUrl: safeUrl,
  /** Also list this project under "Key Projects" in the Resume. */
  showInKeyProjects: z.boolean().default(false),
  /** Set when the project was imported from (and can sync with) GitHub. */
  github: githubLinkSchema.nullable().default(null),
});

export const galleryItemSchema = z.object({
  title: text(120),
  description: text(500),
  imageUrl: safeUrl,
});

export const portfolioSchema = z.object({
  personalInfo: personalInfoSchema,
  skills: z.array(skillSchema).max(100),
  skillGroups: z.array(skillGroupSchema).max(20),
  experience: z.array(experienceSchema).max(50),
  keyProjects: z.array(keyProjectSchema).max(50),
  education: z.array(educationSchema).max(50),
  militaryService: z.array(timelineEntrySchema).max(20),
  volunteering: z.array(timelineEntrySchema).max(20),
  projects: z.array(projectSchema).max(100),
  gallery: z.array(galleryItemSchema).max(200),
});

/** Section name -> schema, used to validate each stored section independently. */
export const portfolioSectionSchemas = portfolioSchema.shape;
export type PortfolioSectionKey = keyof typeof portfolioSectionSchemas;
