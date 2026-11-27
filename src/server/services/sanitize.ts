import "server-only";
import sanitizeHtml from "sanitize-html";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Cleans the limited rich text produced by the dashboard editor
 * (bold / italic / lists / color / size). Plain text keeps its line breaks.
 */
export function sanitizeRichText(input: string): string {
  const html = /<[a-z!/]/i.test(input) ? input : escapeHtml(input).replace(/\r?\n/g, "<br />");

  return sanitizeHtml(html, {
    allowedTags: ["b", "strong", "i", "em", "u", "ul", "ol", "li", "p", "br", "div", "font", "span"],
    allowedAttributes: { font: ["color", "size"], span: ["style"] },
    allowedStyles: {
      span: {
        color: [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
        "font-size": [/^\d{1,3}(px|em|rem|%)$/, /^(small|medium|large|x-large|xx-large)$/],
      },
    },
  });
}
