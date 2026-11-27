"use client";

import { useEffect, useRef } from "react";
import styles from "./Lightbox.module.css";

type LightboxProps = {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
};

/**
 * Full-size image viewer built on the native <dialog> element:
 * focus is trapped, Esc closes it, and clicking the backdrop closes it too.
 */
export function Lightbox({ src, alt, open, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) return;

    // Lock page scroll while the image is open.
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={alt}
      onClose={onClose}
      onClick={(event) => {
        // Clicks on the backdrop target the <dialog> itself.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element -- user-provided URL or DB image */}
      <img className={styles.image} src={src} alt={alt} />
    </dialog>
  );
}
