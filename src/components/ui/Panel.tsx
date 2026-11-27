import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./Panel.module.css";

type PanelProps = {
  as?: "article" | "aside" | "section";
  className?: string;
  children: ReactNode;
};

/** The rounded dark card used for the sidebar and every page section. */
export function Panel({ as: Tag = "article", className, children }: PanelProps) {
  return (
    <Tag className={cn(styles.panel, Tag === "article" && styles.article, className)}>{children}</Tag>
  );
}
