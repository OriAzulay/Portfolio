import type { Project } from "@/types/portfolio";
import { ArticleTitle } from "@/components/ui/ArticleTitle";
import { Panel } from "@/components/ui/Panel";
import { ProjectGrid } from "../../ProjectGrid/ProjectGrid";

export function ProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <Panel>
      <ArticleTitle>Projects</ArticleTitle>
      <ProjectGrid projects={projects} showTags />
    </Panel>
  );
}
