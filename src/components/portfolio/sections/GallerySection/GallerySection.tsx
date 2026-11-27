import type { GalleryItem } from "@/types/portfolio";
import { ArticleTitle } from "@/components/ui/ArticleTitle";
import { Panel } from "@/components/ui/Panel";
import { galleryImageSrc } from "@/lib/placeholders";
import styles from "./GallerySection.module.css";

export function GallerySection({ items }: { items: GalleryItem[] }) {
  return (
    <Panel>
      <ArticleTitle>Gallery</ArticleTitle>

      {items.length === 0 ? (
        <p className={styles.empty}>Nothing here yet.</p>
      ) : (
        <ul className={styles.grid}>
          {items.map((item, index) => (
            <li className={styles.cardWrap} key={`${item.title}-${index}`} tabIndex={0}>
              <figure className={styles.card}>
                <div className={styles.cardBg}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- user-provided URL or DB image */}
                  <img src={galleryImageSrc(item.imageUrl, item.title)} alt={item.title} loading="lazy" />
                </div>
                <figcaption className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  {item.description && <p className={styles.cardText}>{item.description}</p>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
