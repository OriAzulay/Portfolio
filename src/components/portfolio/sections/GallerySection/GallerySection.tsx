import type { GalleryItem } from "@/types/portfolio";
import { ArticleTitle } from "@/components/ui/ArticleTitle";
import { Panel } from "@/components/ui/Panel";
import { GalleryGrid } from "./GalleryGrid";
import styles from "./GallerySection.module.css";

export function GallerySection({ items }: { items: GalleryItem[] }) {
  return (
    <Panel>
      <ArticleTitle>Gallery</ArticleTitle>
      {items.length === 0 ? <p className={styles.empty}>Nothing here yet.</p> : <GalleryGrid items={items} />}
    </Panel>
  );
}
