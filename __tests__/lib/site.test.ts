import { describe, expect, it } from "vitest";
import { defaultPortfolioData } from "@/lib/defaults";
import { summarize } from "@/lib/site";
import { personalInfoSchema } from "@/lib/validation/portfolio";

describe("summarize (meta description)", () => {
  it("keeps short text as is", () => {
    expect(summarize("Short bio.")).toBe("Short bio.");
  });

  it("cuts at a sentence boundary, never mid-word", () => {
    const text =
      "Software Developer with 4+ years of experience building real-time simulation systems. " +
      "Experienced in working directly with international clients and cross-functional teams.";
    expect(summarize(text, 120)).toBe(
      "Software Developer with 4+ years of experience building real-time simulation systems."
    );
  });

  it("falls back to a word boundary with an ellipsis", () => {
    const result = summarize("word ".repeat(60), 50);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(50);
    expect(result).not.toMatch(/wor…$/);
  });
});

describe("personalInfo highlights", () => {
  it("turns legacy stats into editable highlights", () => {
    const legacy = structuredClone(defaultPortfolioData.personalInfo) as Record<string, unknown>;
    delete legacy.highlights;
    legacy.stats = { yearsExperience: "4+", projectsCompleted: "5+", certificationsAwards: "" };
    const parsed = personalInfoSchema.parse(legacy);
    expect(parsed.highlights).toEqual([
      { value: "4+", label: "Years of Experience" },
      { value: "5+", label: "Projects Completed" },
    ]);
  });

  it("keeps highlights that were already saved", () => {
    const parsed = personalInfoSchema.parse({
      ...defaultPortfolioData.personalInfo,
      highlights: [{ value: "B.Sc.", label: "CS & Physics" }],
    });
    expect(parsed.highlights).toEqual([{ value: "B.Sc.", label: "CS & Physics" }]);
  });
});
