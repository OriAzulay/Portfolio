"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ContentCard } from "@/components/ui/ContentCard";
import form from "@/components/ui/Form.module.css";
import typo from "@/components/ui/Typography.module.css";
import styles from "./editors.module.css";

/** A titled box in the dashboard, optionally with an "Add" button. */
export function EditorSection({
  title,
  addLabel,
  onAdd,
  children,
}: {
  title: string;
  addLabel?: string;
  onAdd?: () => void;
  children: ReactNode;
}) {
  return (
    <section className={form.box}>
      <div className={styles.sectionHeader}>
        <h3 className={typo.h3}>{title}</h3>
        {onAdd && (
          <button type="button" className={styles.addBtn} onClick={onAdd}>
            + {addLabel ?? "Add"}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

/** One editable list entry with move/remove controls. */
export function ItemCard({
  title,
  onRemove,
  onMoveUp,
  onMoveDown,
  children,
}: {
  title: string;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: ReactNode;
}) {
  return (
    <ContentCard compact className={styles.item}>
      <div className={styles.itemHeader}>
        <span className={styles.itemTitle}>{title || "Untitled"}</span>
        <div className={styles.itemActions}>
          <button type="button" className={styles.iconBtn} onClick={onMoveUp} disabled={!onMoveUp} aria-label="Move up">
            ↑
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onMoveDown}
            disabled={!onMoveDown}
            aria-label="Move down"
          >
            ↓
          </button>
          <button type="button" className={cn(styles.iconBtn, styles.danger)} onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
      {children}
    </ContentCard>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return <p className={styles.empty}>{children}</p>;
}
