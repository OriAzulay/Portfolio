import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/server/http/rate-limit";

describe("database rate limiter", () => {
  it("allows up to the limit, then blocks", async () => {
    const limiter = createRateLimiter({ name: "test", limit: 3, windowMs: 60_000 });
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await limiter.consume("visitor"));
    expect(results).toEqual([true, true, true, false]);
  });

  it("starts a fresh window after it expires", async () => {
    const limiter = createRateLimiter({ name: "short", limit: 1, windowMs: 1 });
    expect(await limiter.consume("visitor")).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(await limiter.consume("visitor")).toBe(true);
  });

  it("can be reset (e.g. after a successful login)", async () => {
    const limiter = createRateLimiter({ name: "reset", limit: 1, windowMs: 60_000 });
    await limiter.consume("visitor");
    expect(await limiter.consume("visitor")).toBe(false);
    await limiter.reset("visitor");
    expect(await limiter.consume("visitor")).toBe(true);
  });
});
