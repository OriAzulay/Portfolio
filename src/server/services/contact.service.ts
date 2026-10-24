import "server-only";
import { z } from "zod";
import { contactMessageSchema } from "@/lib/validation/contact";
import type { ContactMessage } from "@/types/contact";
import { AppError } from "../http/errors";
import { messagesRepository } from "../repositories/messages.repository";
import { notifyNewContactMessage } from "./notify.service";

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MINUTES = 10;

/**
 * Stores a message from the public contact form.
 * Honeypot submissions are accepted silently (so bots see "success") but discarded.
 * If email notifications are configured, an email is sent after saving.
 */
export async function submitContactMessage(input: unknown, ipHash: string): Promise<void> {
  const data = contactMessageSchema.parse(input);
  if (data.website) return;

  if (messagesRepository.countRecentByIp(ipHash, RATE_LIMIT_WINDOW_MINUTES) >= RATE_LIMIT_MAX) {
    throw new AppError(429, "You've sent several messages already. Please try again later.");
  }

  messagesRepository.create({
    name: data.name,
    email: data.email,
    message: data.message,
    ipHash,
  });
  await notifyNewContactMessage(data);
}

export function listMessages(): ContactMessage[] {
  return messagesRepository.list();
}

export function countUnreadMessages(): number {
  return messagesRepository.countUnread();
}

const idSchema = z.coerce.number().int().positive();
const updateSchema = z.object({ isRead: z.boolean() });

export function updateMessage(id: unknown, input: unknown): void {
  const { isRead } = updateSchema.parse(input);
  if (!messagesRepository.setRead(idSchema.parse(id), isRead)) {
    throw new AppError(404, "Message not found");
  }
}

export function deleteMessage(id: unknown): void {
  if (!messagesRepository.delete(idSchema.parse(id))) {
    throw new AppError(404, "Message not found");
  }
}
