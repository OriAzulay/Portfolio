import type { PortfolioData } from "@/types/portfolio";
import { PortfolioTabs, type PortfolioTab } from "./PortfolioTabs/PortfolioTabs";
import { Sidebar } from "./Sidebar/Sidebar";
import { VisitTracker } from "./VisitTracker";
import { AboutSection } from "./sections/AboutSection/AboutSection";
import { ContactSection } from "./sections/ContactSection/ContactSection";
import { GallerySection } from "./sections/GallerySection/GallerySection";
import { ProjectsSection } from "./sections/ProjectsSection/ProjectsSection";
import { ResumeSection } from "./sections/ResumeSection/ResumeSection";
import styles from "./PortfolioPage.module.css";

export function PortfolioPage({ data }: { data: PortfolioData }) {
  const tabs: PortfolioTab[] = [
    { id: "about", label: "About", content: <AboutSection data={data} /> },
    { id: "resume", label: "Resume", content: <ResumeSection data={data} /> },
    { id: "projects", label: "Projects", content: <ProjectsSection projects={data.projects} /> },
    { id: "contact", label: "Contact", content: <ContactSection info={data.personalInfo} /> },
  ];
  if (data.gallery.length > 0) {
    tabs.push({ id: "gallery", label: "Gallery", content: <GallerySection items={data.gallery} /> });
  }

  return (
    <main className={styles.main}>
      <Sidebar info={data.personalInfo} />
      <PortfolioTabs tabs={tabs} />
      <VisitTracker />
    </main>
  );
}
