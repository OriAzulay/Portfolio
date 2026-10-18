import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./ContentCard.module.css";

type ContentCardProps = {
  as?: ElementType;
  compact?: boolean;
  className?: string;
  children: ReactNode;
};

/** Card with the subtle gradient border. */
export function ContentCard({ as: Tag = "div", compact, className, children }: ContentCardProps) {
  return <Tag className={cn(styles.card, compact && styles.compact, className)}>{children}</Tag>;
}
