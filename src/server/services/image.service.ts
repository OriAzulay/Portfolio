import "server-only";
import crypto from "node:crypto";
import { config } from "../config";
import { AppError } from "../http/errors";
import { imagesRepository, type StoredImage } from "../repositories/images.repository";
import { optimizeImage } from "./image-processing";
import type { ImageKind, PortfolioData } from "@/types/portfolio";

const IMAGE_KINDS: readonly ImageKind[] = ["avatar", "project", "gallery"];
const IMAGE_URL_PATTERN = /\/api\/images\/([0-9a-f-]{36})/g;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Detects the real image type from magic bytes (the client's MIME type is not trusted). SVG is rejected on purpose. */
function detectImageType(bytes: Buffer): string | null {
  const ascii = (start: number, end: number) => bytes.subarray(start, end).toString("ascii");

  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 6 && ascii(0, 4) === "GIF8") return "image/gif";
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (bytes.length >= 12 && ascii(4, 8) === "ftyp" && /^avi[fs]$/.test(ascii(8, 12))) return "image/avif";
  return null;
}

export const imageUrl = (id: string) => `/api/images/${id}`;

export function parseImageKind(value: unknown): ImageKind {
  return IMAGE_KINDS.includes(value as ImageKind) ? (value as ImageKind) : "gallery";
}

/** Validates, resizes/compresses and stores image bytes. Returns the public URL. */
export async function storeImageBytes(
  bytes: Buffer,
  kind: ImageKind,
  maxBytes: number = config.maxImageBytes
): Promise<{ id: string; url: string; size: number }> {
  if (bytes.length === 0) throw new AppError(400, "Empty file");
  if (bytes.length > maxBytes) {
    throw new AppError(413, `Image is too large (max ${maxBytes / 1024 / 1024} MB)`);
  }
  const mimeType = detectImageType(bytes);
  if (!mimeType) throw new AppError(415, "Unsupported image type. Use PNG, JPEG, WebP, GIF or AVIF.");

  const optimized = await optimizeImage(bytes, mimeType, kind);
  const id = crypto.randomUUID();
  imagesRepository.insert({ id, kind, mimeType: optimized.mimeType, data: optimized.data });
  return { id, url: imageUrl(id), size: optimized.data.length };
}

export async function storeUploadedImage(file: unknown, kind: unknown) {
  if (!(file instanceof File)) throw new AppError(400, "Missing file");
  if (file.size > config.maxImageBytes) {
    throw new AppError(413, `Image is too large (max ${config.maxImageBytes / 1024 / 1024} MB)`);
  }
  return storeImageBytes(Buffer.from(await file.arrayBuffer()), parseImageKind(kind));
}

export function getImage(id: string): StoredImage {
  const image = UUID_PATTERN.test(id) ? imagesRepository.findById(id) : null;
  if (!image) throw new AppError(404, "Image not found");
  return image;
}

/** Re-compresses already stored images in place (same id, so existing links keep working). */
export async function optimizeStoredImages(): Promise<{ id: string; before: number; after: number }[]> {
  const changed: { id: string; before: number; after: number }[] = [];
  for (const meta of imagesRepository.listMeta()) {
    const image = imagesRepository.findById(meta.id);
    if (!image) continue;
    const optimized = await optimizeImage(image.data, image.mimeType, parseImageKind(meta.kind));
    if (optimized.data.length < image.size) {
      imagesRepository.updateData(meta.id, optimized.mimeType, optimized.data);
      changed.push({ id: meta.id, before: image.size, after: optimized.data.length });
    }
  }
  return changed;
}

/** Removes stored images no longer referenced by the portfolio (keeps uploads from the last hour). */
export function removeUnusedImages(data: PortfolioData): number {
  const referenced = new Set(
    Array.from(JSON.stringify(data).matchAll(IMAGE_URL_PATTERN), (match) => match[1])
  );
  return imagesRepository.deleteUnreferenced(referenced, 60);
}
