/**
 * Shrinks very large photos in the browser before upload.
 *
 * Vercel functions reject request bodies over ~4.5 MB, so a 10 MB phone photo
 * would never reach the server. The server still does the real optimization
 * (resize + WebP); this only gets the file under the limit.
 */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_EDGE = 2560;

export async function shrinkForUpload(file: File): Promise<File> {
  // Small enough already, or a GIF (may be animated - canvas would flatten it).
  if (file.size <= MAX_UPLOAD_BYTES || file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.9, 0.8, 0.7]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= MAX_UPLOAD_BYTES) {
      return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
    }
  }
  throw new Error("This image is too large to upload. Please use a smaller photo.");
}
