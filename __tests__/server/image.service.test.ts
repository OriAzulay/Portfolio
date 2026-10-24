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

    const stored = getImage(id);
    expect(stored.mimeType).toBe("image/webp");
    const { width = 0, height = 0 } = await sharp(stored.data).metadata();
    expect(Math.max(width, height)).toBeLessThanOrEqual(1920);
  });

  it("rejects files that are not real images (e.g. an SVG renamed to .png)", async () => {
    await expect(storeImageBytes(Buffer.from("<svg onload=alert(1)/>"), "project")).rejects.toMatchObject({
      status: 415,
    });
  });

  it("returns 404 for unknown ids", () => {
    expect(() => getImage("00000000-0000-0000-0000-000000000000")).toThrow(/not found/i);
  });
});
