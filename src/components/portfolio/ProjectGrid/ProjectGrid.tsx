import type { Project } from "@/types/portfolio";
import { projectImageSrc } from "@/lib/placeholders";
import typo from "@/components/ui/Typography.module.css";
import { GitHubIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import styles from "./ProjectGrid.module.css";

function ProjectCard({ project, showTags }: { project: Project; showTags: boolean }) {
  const hasLink = Boolean(project.link) && project.link !== "#";

  return (
    <article className={cn(styles.card, hasLink && styles.clickable)}>
      <figure className={styles.banner}>
        {/* eslint-disable-next-line @next/next/no-img-element -- user-provided URL or DB image */}
        <img src={projectImageSrc(project.imageUrl, project.title)} alt="" loading="lazy" />
      </figure>
      <div className={styles.content}>
        <div className={styles.meta}>
          <span>{project.tags[0] || "Project"}</span>
          {project.github && (
            <>
              <span className={styles.dot} />
              <span className={styles.github}>
                <GitHubIcon />
                GitHub
              </span>
            </>
          )}
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
        <p className={styles.text}>{project.description}</p>
        {showTags && project.tags.length > 1 && (
          <ul className={styles.tags}>
            {project.tags.map((tag) => (
              <li key={tag} className={styles.tag}>
                {tag}
              </li>
            ))}
          </ul>
        )}
        {project.liveUrl && (
          <a className={styles.liveLink} href={project.liveUrl} target="_blank" rel="noopener noreferrer">
            Live demo ↗
          </a>
        )}
      </div>
    </article>
  );
}

export function ProjectGrid({ projects, showTags = false }: { projects: Project[]; showTags?: boolean }) {
  return (
    <ul className={styles.list}>
      {projects.map((project, index) => (
        <li key={`${project.title}-${index}`}>
          <ProjectCard project={project} showTags={showTags} />
        </li>
      ))}
    </ul>
  );
}
