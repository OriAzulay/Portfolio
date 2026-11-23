import { describe, expect, it } from "vitest";
import { defaultPortfolioData } from "@/lib/defaults";
import { getPortfolio, updatePortfolio } from "@/server/services/portfolio.service";

describe("portfolio service", () => {
  it("returns the defaults before anything is saved", async () => {
    expect((await getPortfolio()).personalInfo.name).toBe(defaultPortfolioData.personalInfo.name);
  });

  it("saves and reads back the portfolio", async () => {
    const data = structuredClone(defaultPortfolioData);
    data.personalInfo.name = "Ori Azoulay";
    await updatePortfolio(data);
    expect((await getPortfolio()).personalInfo.name).toBe("Ori Azoulay");
  });

  it("sanitizes rich text descriptions", async () => {
    const data = structuredClone(defaultPortfolioData);
    data.experience[0].description =
      '<b>bold</b><img src=x onerror="alert(1)"><script>alert(1)</script>' +
      '<span style="color:#ff0000;position:fixed">red</span>';
    const saved = await updatePortfolio(data);
    expect(saved.experience[0].description).toBe('<b>bold</b><span style="color:#ff0000">red</span>');
  });

  it("keeps line breaks of plain-text descriptions and escapes them", async () => {
    const data = structuredClone(defaultPortfolioData);
    data.experience[0].description = "Line one\nLine 2 > 1";
    expect((await updatePortfolio(data)).experience[0].description).toBe("Line one<br />Line 2 &gt; 1");
  });

  it("rejects invalid data", async () => {
    await expect(updatePortfolio({ personalInfo: {} })).rejects.toThrow();
  });
});
