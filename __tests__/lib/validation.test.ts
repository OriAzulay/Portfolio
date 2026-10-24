import { describe, expect, it } from "vitest";
import { defaultPortfolioData } from "@/lib/defaults";
import { contactMessageSchema } from "@/lib/validation/contact";
import { isSafeUrl, portfolioSchema } from "@/lib/validation/portfolio";

describe("isSafeUrl", () => {
  it.each(["", "#", "/api/images/x", "https://github.com/OriAzulay", "mailto:a@b.co"])("accepts %s", (url) => {
    expect(isSafeUrl(url)).toBe(true);
  });

  it.each(["javascript:alert(1)", "//evil.com", "data:text/html,x", "ftp://x"])("rejects %s", (url) => {
    expect(isSafeUrl(url)).toBe(false);
  });
});

describe("portfolioSchema", () => {
  it("accepts the default data", () => {
    expect(portfolioSchema.safeParse(defaultPortfolioData).success).toBe(true);
  });

  it("rejects javascript: links in projects", () => {
    const data = structuredClone(defaultPortfolioData);
    data.projects[0].link = "javascript:alert(1)";
    expect(portfolioSchema.safeParse(data).success).toBe(false);
  });

  it("fills fields missing from older saved data", () => {
    const legacy = structuredClone(defaultPortfolioData) as unknown as { projects: Record<string, unknown>[] };
    delete legacy.projects[0].liveUrl;
    delete legacy.projects[0].github;
    const parsed = portfolioSchema.parse(legacy);
    expect(parsed.projects[0]).toMatchObject({ liveUrl: "", github: null, showInKeyProjects: false });
  });

  it("rejects skill levels outside 0-100", () => {
    const data = structuredClone(defaultPortfolioData);
    data.skills[0].level = 150;
    expect(portfolioSchema.safeParse(data).success).toBe(false);
  });
});

describe("contactMessageSchema", () => {
  const valid = { name: "Dana Tester", email: "dana@example.com", message: "Hello, nice portfolio!" };

  it("accepts a valid message", () => {
    expect(contactMessageSchema.safeParse(valid).success).toBe(true);
  });

  it("requires a real email and a minimum message length", () => {
    const result = contactMessageSchema.safeParse({ ...valid, email: "nope", message: "hi" });
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["email", "message"]));
  });

  it("trims whitespace", () => {
    expect(contactMessageSchema.parse({ ...valid, name: "  Dana  " }).name).toBe("Dana");
  });
});
