import { describe, expect, it } from "vitest";
import { prettifyRepoName, projectFromRepo, syncProjectWithRepo, type GitHubRepo } from "@/lib/github";

const repo: GitHubRepo = {
  id: 42,
  name: "smart-budget_planner",
  fullName: "OriAzulay/smart-budget_planner",
  description: "Budget planning app",
  htmlUrl: "https://github.com/OriAzulay/smart-budget_planner",
  homepage: "https://budget.example.com",
  language: "TypeScript",
  topics: ["react", "finance", "TypeScript"],
  stars: 3,
  updatedAt: "2026-01-01T00:00:00Z",
  fork: false,
  archived: false,
  private: false,
};

describe("prettifyRepoName", () => {
  it("turns repository slugs into titles", () => {
    expect(prettifyRepoName("smart-budget_planner")).toBe("Smart Budget Planner");
  });
});

describe("projectFromRepo", () => {
  it("maps repository fields to a linked project", () => {
    expect(projectFromRepo(repo)).toMatchObject({
      title: "Smart Budget Planner",
      description: "Budget planning app",
      link: repo.htmlUrl,
      liveUrl: repo.homepage,
      tags: ["TypeScript", "react", "finance"], // language first, duplicates removed
      github: { repoId: 42, fullName: repo.fullName },
    });
  });
});

describe("syncProjectWithRepo", () => {
  it("refreshes GitHub fields but keeps a customized title and image", () => {
    const project = { ...projectFromRepo(repo), title: "My Budget App", imageUrl: "/api/images/abc" };
    const synced = syncProjectWithRepo(project, { ...repo, description: "Updated description" });
    expect(synced.title).toBe("My Budget App");
    expect(synced.imageUrl).toBe("/api/images/abc");
    expect(synced.description).toBe("Updated description");
  });
});
