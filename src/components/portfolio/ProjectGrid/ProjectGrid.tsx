import type { Project } from "@/types/portfolio";
import { projectImageSrc } from "@/lib/placeholders";
import typo from "@/components/ui/Typography.module.css";
import { GitHubIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import styles from "./ProjectGrid.module.css";

const isGitHubUrl = (url: string) => /^https?:\/\/(www\.)?github\.com\//i.test(url);

type CardProps = { project: Project; showTags: boolean; compact: boolean };

function ProjectCard({ project, showTags, compact }: CardProps) {
  const hasLink = Boolean(project.link) && project.link !== "#";
  const codeLink = hasLink && isGitHubUrl(project.link);

  return (
    <article className={cn(styles.card, hasLink && styles.clickable)}>
      <figure className={styles.banner}>
        {/* eslint-disable-next-line @next/next/no-img-element -- user-provided URL or DB image */}
        <img src={projectImageSrc(project.imageUrl, project.title)} alt="" loading="lazy" />
      </figure>
      <div className={styles.content}>
        <div className={styles.meta}>
          <span>{project.tags[0] || "Project"}</span>
        </div>
        <h3 className={cn(typo.h3, styles.title)}>
          {hasLink ? (
            // The ::after of this link covers the whole card (one link per card, no nested anchors).
            <a className={styles.stretchedLink} href={project.link} target="_blank" rel="noopener noreferrer">
              {project.title}
            </a>
          ) : (
            project.title
          )}
        </h3>
        <p className={cn(styles.text, compact && styles.clamped)}>{project.description}</p>
        {showTags && project.tags.length > 0 && (
          <ul className={styles.tags}>
            {project.tags.map((tag) => (
              <li key={tag} className={styles.tag}>
                {tag}
              </li>
            ))}
          </ul>
        )}
        {(codeLink || project.liveUrl) && (
          <div className={styles.actions}>
            {codeLink && (
              <a className={styles.action} href={project.link} target="_blank" rel="noopener noreferrer">
                <GitHubIcon />
                Code
              </a>
            )}
            {project.liveUrl && (
              <a
                className={cn(styles.action, styles.actionPrimary)}
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Live demo ↗
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

type GridProps = {
  projects: Project[];
  /** Show every tag under the description. */
  showTags?: boolean;
  /** Shorter cards (description clamped to a few lines), e.g. on the About page. */
  compact?: boolean;
};

export function ProjectGrid({ projects, showTags = false, compact = false }: GridProps) {
  return (
    <ul className={styles.list}>
      {projects.map((project, index) => (
        <li key={`${project.title}-${index}`}>
          <ProjectCard project={project} showTags={showTags} compact={compact} />
        </li>
      ))}
    </ul>
  );
}
