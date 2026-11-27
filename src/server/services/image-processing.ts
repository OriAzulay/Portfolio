import "server-only";
import sharp from "sharp";
import type { ImageKind } from "@/types/portfolio";

/** Longest edge allowed per image kind. */
const MAX_DIMENSION: Record<ImageKind, number> = {
  avatar: 800,
  project: 1600,
  gallery: 1920,
};

/** Images at or below this size are stored as-is. */
const TARGET_BYTES = 500 * 1024;
/** Tried in order until the result fits TARGET_BYTES: [edge scale, WebP quality]. */
const ATTEMPTS: [number, number][] = [
  [1, 80],
  [1, 72],
  [1, 64],
  [0.85, 70],
  [0.75, 66],
  [0.66, 62],
];

export type ProcessedImage = { data: Buffer; mimeType: string };

/**
 * Resizes and re-encodes an image to WebP so large photos never end up in
 * the database. GIFs are kept as-is (they may be animated). If optimizing
 * doesn't make the file smaller, the original is kept.
 */
export async function optimizeImage(
  bytes: Buffer,
  mimeType: string,
  kind: ImageKind
): Promise<ProcessedImage> {
  if (mimeType === "image/gif") return { data: bytes, mimeType };

  const max = MAX_DIMENSION[kind];
  const metadata = await sharp(bytes).metadata();
  const needsResize = (metadata.width ?? 0) > max || (metadata.height ?? 0) > max;
  if (!needsResize && bytes.length <= TARGET_BYTES) return { data: bytes, mimeType };

  let best: Buffer | null = null;
  for (const [scale, quality] of ATTEMPTS) {
    const edge = Math.round(max * scale);
    best = await sharp(bytes)
      .rotate() // apply EXIF orientation before metadata is stripped
      .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    if (best.length <= TARGET_BYTES) break;
  }

  return best && best.length < bytes.length ? { data: best, mimeType: "image/webp" } : { data: bytes, mimeType };
}
