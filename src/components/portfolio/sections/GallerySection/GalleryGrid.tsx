"use client";

import { useState } from "react";
import type { GalleryItem } from "@/types/portfolio";
import { galleryImageSrc } from "@/lib/placeholders";
import { Lightbox } from "@/components/ui/Lightbox/Lightbox";
import styles from "./GallerySection.module.css";

/** Gallery cards; clicking one opens the photo full size. */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const open = openIndex === null ? null : items[openIndex];

  return (
    <>
      <ul className={styles.grid}>
        {items.map((item, index) => (
          <li className={styles.cardWrap} key={`${item.title}-${index}`}>
            <button
              type="button"
              className={styles.cardButton}
              onClick={() => setOpenIndex(index)}
              disabled={!item.imageUrl}
              aria-label={`Open photo: ${item.title}`}
            >
              <figure className={styles.card}>
                <div className={styles.cardBg}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- user-provided URL or DB image */}
                  <img src={galleryImageSrc(item.imageUrl, item.title)} alt="" loading="lazy" />
                </div>
                <figcaption className={styles.cardInfo}>
                  <span className={styles.cardTitle}>{item.title}</span>
                  {item.description && <span className={styles.cardText}>{item.description}</span>}
                </figcaption>
              </figure>
            </button>
          </li>
        ))}
      </ul>

      {open?.imageUrl && (
        <Lightbox
          src={open.imageUrl}
          alt={open.description ? `${open.title} - ${open.description}` : open.title}
          open
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
