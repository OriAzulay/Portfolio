import type { ReactNode } from "react";
import type { PortfolioData } from "@/types/portfolio";
import { ArticleTitle } from "@/components/ui/ArticleTitle";
import { ContentCard } from "@/components/ui/ContentCard";
import { IconBox } from "@/components/ui/IconBox";
import { Panel } from "@/components/ui/Panel";
import { BookIcon, BriefcaseIcon } from "@/components/ui/icons";
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

export function ResumeSection({ data }: { data: PortfolioData }) {
  return (
    <Panel>
      <ArticleTitle>Resume</ArticleTitle>

      {data.experience.length > 0 && (
        <Timeline title="Experience" icon={<BriefcaseIcon />}>
          {data.experience.map((item, index) => (
            <li className={styles.timelineItem} key={index}>
              <h4 className={cn(typo.h4, styles.itemTitle)}>{item.title}</h4>
              {item.company && <p className={styles.company}>{item.company}</p>}
              <span className={styles.period}>{item.period}</span>
              {/* Sanitized on the server (see server/services/sanitize.ts) */}
              <div className={styles.text} dangerouslySetInnerHTML={{ __html: item.description }} />
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

      {data.skills.length > 0 && (
        <section>
          <h3 className={cn(typo.h3, styles.skillsTitle)}>My Skills</h3>
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
        </section>
      )}
    </Panel>
  );
}
