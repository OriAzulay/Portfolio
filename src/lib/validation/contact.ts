import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100, "Name is too long"),
  email: z.email("Please enter a valid email").trim().max(200, "Email is too long"),
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters")
    .max(5000, "Message is too long"),
  /** Honeypot - real visitors never see or fill this field. */
  website: z.string().max(200).optional().default(""),
});

export type ContactMessageInput = z.input<typeof contactMessageSchema>;
export type ContactFieldErrors = Partial<Record<"name" | "email" | "message", string>>;
