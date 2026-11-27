import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { getImage, storeImageBytes } from "@/server/services/image.service";

describe("image service", () => {
  it("stores, resizes and re-encodes large images", async () => {
    const big = await sharp({
      create: { width: 4000, height: 3000, channels: 3, background: { r: 30, g: 120, b: 200 } },
    })
      .png()
      .toBuffer();

    const { id, url } = await storeImageBytes(big, "gallery");
    expect(url).toBe(`/api/images/${id}`);

    const stored = await getImage(id);
    expect(stored.mimeType).toBe("image/webp");
    const { width = 0, height = 0 } = await sharp(stored.data).metadata();
    expect(Math.max(width, height)).toBeLessThanOrEqual(1920);
  });

  it("rejects files that are not real images (e.g. an SVG renamed to .png)", async () => {
    await expect(storeImageBytes(Buffer.from("<svg onload=alert(1)/>"), "project")).rejects.toMatchObject({
      status: 415,
    });
  });

  it("returns 404 for unknown ids", async () => {
    await expect(getImage("00000000-0000-0000-0000-000000000000")).rejects.toThrow(/not found/i);
  });
});

describe("document (CV) storage", () => {
  it("stores a PDF and returns its URL", async () => {
    const { storeDocumentBytes } = await import("@/server/services/image.service");
    const pdf = Buffer.from("%PDF-1.4\n% test\n");
    const { id, url } = await storeDocumentBytes(pdf);
    expect(url).toBe(`/api/images/${id}`);
    expect((await getImage(id)).mimeType).toBe("application/pdf");
  });

  it("rejects files that aren't PDFs", async () => {
    const { storeDocumentBytes } = await import("@/server/services/image.service");
    await expect(storeDocumentBytes(Buffer.from("<html>not a pdf</html>"))).rejects.toMatchObject({ status: 415 });
  });
});
