import { describe, expect, it } from "vitest";
import {
  countUnreadMessages,
  deleteMessage,
  listMessages,
  submitContactMessage,
  updateMessage,
} from "@/server/services/contact.service";

const message = (n: number) => ({
  name: "Dana Tester",
  email: "dana@example.com",
  message: `Hello, this is test message number ${n}.`,
});

describe("contact service", () => {
  it("stores valid messages as unread", async () => {
    await submitContactMessage(message(1), "ip-a");
    const [stored] = listMessages();
    expect(stored).toMatchObject({ name: "Dana Tester", email: "dana@example.com", isRead: false });
    expect(countUnreadMessages()).toBe(1);
  });

  it("silently drops honeypot submissions", async () => {
    const before = listMessages().length;
    await submitContactMessage({ ...message(2), website: "http://spam.example" }, "ip-bot");
    expect(listMessages()).toHaveLength(before);
  });

  it("rejects invalid input", async () => {
    await expect(submitContactMessage({ name: "A", email: "bad", message: "hi" }, "ip-x")).rejects.toThrow();
  });

  it("rate-limits repeated messages from the same visitor", async () => {
    await submitContactMessage(message(3), "ip-b");
    await submitContactMessage(message(4), "ip-b");
    await submitContactMessage(message(5), "ip-b");
    await expect(submitContactMessage(message(6), "ip-b")).rejects.toMatchObject({ status: 429 });
  });

  it("marks messages read and deletes them", () => {
    const [first] = listMessages();
    updateMessage(first.id, { isRead: true });
    expect(listMessages().find((m) => m.id === first.id)?.isRead).toBe(true);

    deleteMessage(first.id);
    expect(listMessages().find((m) => m.id === first.id)).toBeUndefined();
    expect(() => deleteMessage(first.id)).toThrow(/not found/i);
  });
});
