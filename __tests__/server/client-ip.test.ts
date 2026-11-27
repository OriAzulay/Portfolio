import { afterEach, describe, expect, it, vi } from "vitest";
import { getClientIp, hashIp } from "@/server/http/client-ip";

describe("client IP hashing", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("never returns the raw IP", () => {
    expect(hashIp("203.0.113.7")).not.toContain("203.0.113.7");
    expect(hashIp("203.0.113.7")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("keeps working in production without SESSION_SECRET (public pages must not crash)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SESSION_SECRET", "");
    expect(() => hashIp("203.0.113.7")).not.toThrow();
  });

  it("reads the first forwarded address", () => {
    const request = new Request("http://x", { headers: { "x-forwarded-for": "198.51.100.1, 10.0.0.1" } });
    expect(getClientIp(request)).toBe("198.51.100.1");
  });
});
