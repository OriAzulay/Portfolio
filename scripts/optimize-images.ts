/**
 * Re-compresses images already stored in SQLite (resize + WebP), in place.
 * Image ids don't change, so every existing link keeps working.
 *
 *   npm run db:optimize-images
 */
import { optimizeStoredImages } from "@/server/services/image.service";

const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

optimizeStoredImages()
  .then((changed) => {
    if (changed.length === 0) {
      console.log("All images are already optimized.");
      return;
    }
    for (const { id, before, after } of changed) {
      console.log(`  ✓ ${id}: ${kb(before)} -> ${kb(after)}`);
    }
    const saved = changed.reduce((sum, c) => sum + c.before - c.after, 0);
    console.log(`\nOptimized ${changed.length} image(s), saved ${kb(saved)}.`);
  })
  .catch((error) => {
    console.error("Optimization failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
