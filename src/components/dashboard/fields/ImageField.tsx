"use client";

import { useState, type ChangeEvent } from "react";
import { api, ApiError } from "@/lib/api-client";
import type { ImageKind } from "@/types/portfolio";
import { Field } from "./Field";
import styles from "./fields.module.css";

type ImageFieldProps = {
  label: string;
  kind: ImageKind;
  value: string;
  previewSrc: string;
  onChange: (url: string) => void;
};

/** Image preview + upload button (stored in SQLite) + manual URL input. */
export function ImageField({ label, kind, value, previewSrc, onChange }: ImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const { url } = await api.uploadImage(file, kind);
      onChange(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.imageField}>
      {/* eslint-disable-next-line @next/next/no-img-element -- preview of user-provided URL */}
      <img className={styles.preview} src={previewSrc} alt="" />
      <div className={styles.imageControls}>
        <label className={styles.uploadBtn}>
          {uploading ? "Uploading..." : `Upload ${label.toLowerCase()}`}
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" onChange={handleFile} disabled={uploading} hidden />
        </label>
        {value && (
          <button type="button" className={styles.linkBtn} onClick={() => onChange("")}>
            Remove image
          </button>
        )}
        {error && <span className={styles.error}>{error}</span>}
        <Field label={`${label} URL`} type="url" value={value} onChange={onChange} placeholder="https://... or upload" />
      </div>
    </div>
  );
}
