"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./PortfolioTabs.module.css";

export type PortfolioTab = {
  id: string;
  label: string;
  content: ReactNode;
};

/**
 * Navbar + the currently selected section. Section content is rendered on
 * the server and passed in, so only the tab switching runs on the client.
 */
export function PortfolioTabs({ tabs }: { tabs: PortfolioTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  const select = (id: string) => {
    setActiveId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.mainContent}>
      <nav className={styles.navbar} aria-label="Sections">
        <ul className={styles.navList}>
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                className={cn(styles.navLink, tab.id === active?.id && styles.active)}
                aria-current={tab.id === active?.id ? "page" : undefined}
                onClick={() => select(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* key restarts the fade-in animation on every tab change */}
      <div key={active?.id}>{active?.content}</div>
    </div>
  );
}
