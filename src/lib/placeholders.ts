/** Inline SVG placeholders for items without an uploaded image. */
function svgPlaceholder(width: number, height: number, label: string, fontSize: number, fill: string) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>` +
    `<rect width='100%' height='100%' fill='${fill}'/>` +
    `<text x='50%' y='55%' text-anchor='middle' font-size='${fontSize}' fill='#ffffff' font-family='Poppins,Arial'>` +
    `${label.replace(/[<>&'"]/g, "")}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 3);

export const avatarSrc = (url: string, name: string) =>
  url || svgPlaceholder(220, 220, initialsOf(name), 64, "#222222");

export const projectImageSrc = (url: string, title: string) =>
  url || svgPlaceholder(600, 380, title, 24, "#151515");

export const galleryImageSrc = (url: string, title: string) =>
  url || svgPlaceholder(300, 420, title, 20, "#161616");
