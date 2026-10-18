import type { Project } from "@/types/portfolio";
import { projectImageSrc } from "@/lib/placeholders";
import typo from "@/components/ui/Typography.module.css";
import { cn } from "@/lib/utils";
import styles from "./ProjectGrid.module.css";

function ProjectCard({ project, showTags }: { project: Project; showTags: boolean }) {
  const hasLink = project.link && project.link !== "#";
  const body = (
    <>
      <figure className={styles.banner}>
        {/* eslint-disable-next-line @next/next/no-img-element -- user-provided URL or DB image */}
        <img src={projectImageSrc(project.imageUrl, project.title)} alt={project.title} loading="lazy" />
      </figure>
      <div className={styles.content}>
        <div className={styles.meta}>
          <span>{project.tags[0] || "Project"}</span>
          {hasLink && (
            <>
              <span className={styles.dot} />
              <span>View</span>
            </>
          )}
        </div>
        <h3 className={cn(typo.h3, styles.title)}>{project.title}</h3>
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
      </div>
    </>
  );

  return hasLink ? (
    <a className={styles.card} href={project.link} target="_blank" rel="noopener noreferrer">
      {body}
    </a>
  ) : (
    <div className={styles.card}>{body}</div>
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
