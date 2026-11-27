import type { PortfolioData } from "@/types/portfolio";
import { ArticleTitle } from "@/components/ui/ArticleTitle";
import { ContentCard } from "@/components/ui/ContentCard";
import { Panel } from "@/components/ui/Panel";
import typo from "@/components/ui/Typography.module.css";
import { cn } from "@/lib/utils";
import { ProjectGrid } from "../../ProjectGrid/ProjectGrid";
import styles from "./AboutSection.module.css";

export function AboutSection({ data }: { data: PortfolioData }) {
  const { about, stats } = data.personalInfo;
  const highlights = [
    { value: stats.yearsExperience, label: "Years of Experience" },
    { value: stats.projectsCompleted, label: "Projects Completed" },
    { value: stats.certificationsAwards, label: "Certifications & Awards" },
  ].filter((item) => item.value);
  const featured = data.projects.slice(0, 2);

  return (
    <Panel>
      <ArticleTitle compact>Digital Identity</ArticleTitle>

      <section className={styles.aboutText}>
        {about
          .split("\n")
          .filter((line) => line.trim())
          .map((line, index) => (
            <p key={index}>{line}</p>
          ))}
      </section>

      {highlights.length > 0 && (
        <section className={styles.highlights}>
          <h3 className={cn(typo.h3, styles.sectionTitle)}>★ Highlights &amp; Successes</h3>
          <ul className={styles.highlightsList}>
            {highlights.map((item) => (
              <ContentCard as="li" key={item.label} className={styles.highlightItem}>
                <h4 className={typo.h4}>{item.value}</h4>
                <p className={styles.highlightLabel}>{item.label}</p>
              </ContentCard>
            ))}
          </ul>
        </section>
      )}

      {featured.length > 0 && (
        <section>
          <div className={styles.featuredHeader}>
            <h3 className={cn(typo.h3, styles.sectionTitle)}>Featured Projects</h3>
          </div>
          <ProjectGrid projects={featured} />
        </section>
      )}
    </Panel>
  );
}
