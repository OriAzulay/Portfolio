import type { ReactNode } from "react";
import type { KeyProject, PortfolioData, TimelineEntry } from "@/types/portfolio";
import { ArticleTitle } from "@/components/ui/ArticleTitle";
import { ContentCard } from "@/components/ui/ContentCard";
import { IconBox } from "@/components/ui/IconBox";
import { Panel } from "@/components/ui/Panel";
import { BookIcon, BriefcaseIcon, CodeIcon, HeartIcon, ShieldIcon } from "@/components/ui/icons";
import typo from "@/components/ui/Typography.module.css";
import { cn } from "@/lib/utils";
import styles from "./ResumeSection.module.css";

function Timeline({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.timeline}>
      <div className={styles.titleWrapper}>
        <IconBox>{icon}</IconBox>
        <h3 className={typo.h3}>{title}</h3>
      </div>
      <ol className={styles.timelineList}>{children}</ol>
    </section>
  );
}

function TimelineEntries({ items }: { items: TimelineEntry[] }) {
  return items.map((item, index) => (
    <li className={styles.timelineItem} key={index}>
      <h4 className={cn(typo.h4, styles.itemTitle)}>{item.title}</h4>
      {item.company && <p className={styles.company}>{item.company}</p>}
      <span className={styles.period}>{item.period}</span>
      {/* Sanitized on the server (see server/services/sanitize.ts) */}
      <div className={styles.text} dangerouslySetInnerHTML={{ __html: item.description }} />
    </li>
  ));
}

/** CV key projects plus portfolio projects marked "Show under Key Projects". */
function keyProjectsOf(data: PortfolioData): KeyProject[] {
  const fromProjects = data.projects
    .filter((project) => project.showInKeyProjects)
    .map((project) => ({
      title: project.title,
      organization: project.github ? "GitHub" : "",
      description: project.description,
      tags: project.tags,
      link: project.link !== "#" ? project.link : "",
    }));
  return [...data.keyProjects, ...fromProjects];
}

export function ResumeSection({ data }: { data: PortfolioData }) {
  const keyProjects = keyProjectsOf(data);
  const hasSkills = data.skillGroups.length > 0 || data.skills.length > 0;

  return (
    <Panel>
      <ArticleTitle>Resume</ArticleTitle>

      {data.experience.length > 0 && (
        <Timeline title="Experience" icon={<BriefcaseIcon />}>
          <TimelineEntries items={data.experience} />
        </Timeline>
      )}

      {keyProjects.length > 0 && (
        <Timeline title="Key Projects" icon={<CodeIcon />}>
          {keyProjects.map((project, index) => (
            <li className={styles.timelineItem} key={`${project.title}-${index}`}>
              <h4 className={cn(typo.h4, styles.itemTitle)}>
                {project.link ? (
                  <a className={styles.itemLink} href={project.link} target="_blank" rel="noopener noreferrer">
                    {project.title} ↗
                  </a>
                ) : (
                  project.title
                )}
              </h4>
              {project.organization && <span className={styles.period}>{project.organization}</span>}
              {project.description && <p className={styles.text}>{project.description}</p>}
              {project.tags.length > 0 && (
                <ul className={styles.tags}>
                  {project.tags.map((tag) => (
                    <li key={tag} className={styles.tag}>
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </Timeline>
      )}

      {data.education.length > 0 && (
        <Timeline title="Education" icon={<BookIcon />}>
          {data.education.map((item, index) => (
            <li className={styles.timelineItem} key={index}>
              <h4 className={cn(typo.h4, styles.itemTitle)}>{item.degree}</h4>
              <span className={styles.period}>{item.period}</span>
              <p className={styles.text}>{item.school}</p>
            </li>
          ))}
        </Timeline>
      )}

      {data.militaryService.length > 0 && (
        <Timeline title="Military Service" icon={<ShieldIcon />}>
          <TimelineEntries items={data.militaryService} />
        </Timeline>
      )}

      {data.volunteering.length > 0 && (
        <Timeline title="Social Projects" icon={<HeartIcon />}>
          <TimelineEntries items={data.volunteering} />
        </Timeline>
      )}

      {hasSkills && (
        <section>
          <h3 className={cn(typo.h3, styles.skillsTitle)}>My Skills</h3>

          {data.skillGroups.length > 0 && (
            <ul className={styles.skillGroups}>
              {data.skillGroups.map((group, index) => (
                <ContentCard as="li" compact key={`${group.title}-${index}`}>
                  <h4 className={cn(typo.h5, styles.groupTitle)}>{group.title}</h4>
                  <p className={styles.groupText}>{group.items}</p>
                </ContentCard>
              ))}
            </ul>
          )}

          {data.skills.length > 0 && (
            <ContentCard as="ul" compact>
              {data.skills.map((skill, index) => (
                <li className={styles.skillItem} key={`${skill.name}-${index}`}>
                  <div className={styles.skillHeader}>
                    <h5 className={typo.h5}>{skill.name}</h5>
                    <data className={styles.skillValue} value={skill.level}>
                      {skill.level}%
                    </data>
                  </div>
                  <div
                    className={styles.progressBg}
                    role="progressbar"
                    aria-label={skill.name}
                    aria-valuenow={skill.level}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className={styles.progressFill} style={{ width: `${skill.level}%` }} />
                  </div>
                </li>
              ))}
            </ContentCard>
          )}
        </section>
      )}
    </Panel>
  );
}
