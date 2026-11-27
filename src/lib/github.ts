import type { Project } from "@/types/portfolio";

/** Repository summary returned by our API (never contains secrets). */
export type GitHubRepo = {
  id: number;
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  homepage: string;
  language: string;
  topics: string[];
  stars: number;
  updatedAt: string;
  fork: boolean;
  archived: boolean;
  private: boolean;
};

export type GitHubSettings = { username: string; hasToken: boolean };

/** "my-cool_repo" -> "My Cool Repo" */
export function prettifyRepoName(name: string): string {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function repoTags(repo: GitHubRepo): string[] {
  const tags = [repo.language, ...repo.topics].filter(Boolean);
  return Array.from(new Set(tags.map((t) => t.trim()))).slice(0, 8);
}

/** Builds a new project from a repo. */
export function projectFromRepo(repo: GitHubRepo): Project {
  return {
    title: prettifyRepoName(repo.name),
    description: repo.description,
    tags: repoTags(repo),
    link: repo.htmlUrl,
    liveUrl: repo.homepage,
    imageUrl: "",
    showInKeyProjects: false,
    github: { repoId: repo.id, fullName: repo.fullName, syncedAt: new Date().toISOString() },
  };
}

/**
 * Refreshes the GitHub-owned fields of a linked project. Title and image are
 * kept (you may have customized them); empty description/tags are filled.
 */
export function syncProjectWithRepo(project: Project, repo: GitHubRepo): Project {
  return {
    ...project,
    description: repo.description || project.description,
    tags: repoTags(repo).length > 0 ? repoTags(repo) : project.tags,
    link: repo.htmlUrl,
    liveUrl: repo.homepage || project.liveUrl,
    github: { repoId: repo.id, fullName: repo.fullName, syncedAt: new Date().toISOString() },
  };
}
