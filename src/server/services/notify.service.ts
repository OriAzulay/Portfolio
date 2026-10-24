import "server-only";
import { getPortfolio } from "./portfolio.service";

type NewMessage = { name: string; email: string; message: string };

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Optional email notification for new contact messages via Resend.
 * Enabled only when RESEND_API_KEY is set. Messages are always saved to the
 * dashboard inbox first, so a failed email never loses a message.
 *
 * Env: RESEND_API_KEY, CONTACT_NOTIFY_EMAIL (defaults to the email on your
 * profile), RESEND_FROM (defaults to Resend's onboarding sender).
 */
export async function notifyNewContactMessage(msg: NewMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const to = process.env.CONTACT_NOTIFY_EMAIL || getPortfolio().personalInfo.email;
  if (!to) return;

  const body = escapeHtml(msg.message).replace(/\r?\n/g, "<br>");
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#333;border-bottom:2px solid #5bc0be;padding-bottom:10px">New message from your portfolio</h2>
      <p><strong>From:</strong> ${escapeHtml(msg.name)} &lt;<a href="mailto:${escapeHtml(msg.email)}">${escapeHtml(msg.email)}</a>&gt;</p>
      <div style="background:#f9f9f9;padding:15px;border-left:4px solid #5bc0be;color:#444;line-height:1.6">${body}</div>
      <p style="color:#888;font-size:12px">Reply to this email to answer ${escapeHtml(msg.name)}. All messages are also in your dashboard inbox.</p>
    </div>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Portfolio Contact <onboarding@resend.dev>",
        to,
        reply_to: msg.email,
        subject: `New contact form message from ${msg.name}`,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error("[notify] Resend rejected the email:", response.status, await response.text());
    }
  } catch (error) {
    console.error("[notify] Couldn't send the contact email:", error);
  }
}
