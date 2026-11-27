"use client";

import { useState, type ChangeEvent } from "react";
import type { PersonalInfo } from "@/types/portfolio";
import { api, ApiError } from "@/lib/api-client";
import { avatarSrc } from "@/lib/placeholders";
import form from "@/components/ui/Form.module.css";
import { Field } from "../fields/Field";
import { ImageField } from "../fields/ImageField";
import fields from "../fields/fields.module.css";
import { EditorSection, EmptyHint, ItemCard } from "./EditorSection";
import { listActions } from "./listActions";

type Props = {
  value: PersonalInfo;
  onChange: (value: PersonalInfo) => void;
};

/** Upload / replace / remove the CV PDF. */
function CvField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError("PDF is too large (max 4 MB)");
      return;
    }
    setUploading(true);
    setError("");
    try {
      onChange((await api.uploadDocument(file)).url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={fields.imageControls}>
      <span className={fields.label}>CV (PDF) - shown as a &quot;Download CV&quot; button on the site</span>
      <label className={fields.uploadBtn}>
        {uploading ? "Uploading..." : value ? "Replace CV" : "Upload CV"}
        <input type="file" accept="application/pdf" onChange={handleFile} disabled={uploading} hidden />
      </label>
      {value && (
        <>
          <a className={fields.linkBtn} href={value} target="_blank" rel="noopener noreferrer">
            View current CV
          </a>
          <button type="button" className={fields.linkBtn} onClick={() => onChange("")}>
            Remove CV
          </button>
        </>
      )}
      {error && <span className={fields.error}>{error}</span>}
    </div>
  );
}

export function ProfileEditor({ value, onChange }: Props) {
  const set = <K extends keyof PersonalInfo>(key: K, next: PersonalInfo[K]) => onChange({ ...value, [key]: next });
  const setSocial = (key: keyof PersonalInfo["social"], next: string) =>
    set("social", { ...value.social, [key]: next });
  const highlights = listActions(value.highlights, (next) => set("highlights", next));

  return (
    <>
      <EditorSection title="Profile">
        <ImageField
          label="Avatar"
          kind="avatar"
          value={value.avatarUrl}
          previewSrc={avatarSrc(value.avatarUrl, value.name)}
          onChange={(url) => set("avatarUrl", url)}
        />
        <div className={form.grid}>
          <Field label="Full name" value={value.name} onChange={(v) => set("name", v)} />
          <Field label="Title" value={value.title} onChange={(v) => set("title", v)} />
        </div>
        <Field
          label="Headline (the big title of the About section)"
          value={value.headline}
          placeholder="C++ backend developer building real-time distributed systems"
          onChange={(v) => set("headline", v)}
        />
        <div className={fields.spacerSmall} />
        <Field
          label="About (one paragraph per line)"
          multiline
          value={value.about}
          onChange={(v) => set("about", v)}
        />
        <CvField value={value.cvUrl} onChange={(url) => set("cvUrl", url)} />
      </EditorSection>

      <EditorSection title="Contact details">
        <div className={form.grid}>
          <Field label="Email" type="email" value={value.email} onChange={(v) => set("email", v)} />
          <Field label="Phone" type="tel" value={value.phone} onChange={(v) => set("phone", v)} />
          <Field label="Location" value={value.location} onChange={(v) => set("location", v)} />
        </div>
      </EditorSection>

      <EditorSection title="Social links">
        <div className={form.grid}>
          <Field label="GitHub" type="url" value={value.social.github} onChange={(v) => setSocial("github", v)} />
          <Field label="LinkedIn" type="url" value={value.social.linkedin} onChange={(v) => setSocial("linkedin", v)} />
          <Field label="X / Twitter" type="url" value={value.social.twitter} onChange={(v) => setSocial("twitter", v)} />
          <Field
            label="Instagram"
            type="url"
            value={value.social.instagram}
            onChange={(v) => setSocial("instagram", v)}
          />
        </div>
      </EditorSection>

      <EditorSection
        title="Highlights"
        addLabel="Add highlight"
        onAdd={value.highlights.length < 6 ? () => highlights.add({ value: "", label: "" }) : undefined}
      >
        {value.highlights.length === 0 && <EmptyHint>No highlights - this block is hidden on the site.</EmptyHint>}
        {value.highlights.map((item, index) => (
          <ItemCard
            key={index}
            title={item.label}
            onRemove={() => highlights.remove(index)}
            onMoveUp={highlights.mover(index, -1)}
            onMoveDown={highlights.mover(index, 1)}
          >
            <div className={form.grid}>
              <Field
                label="Big value"
                value={item.value}
                placeholder="4+"
                onChange={(v) => highlights.update(index, { value: v })}
              />
              <Field
                label="Label"
                value={item.label}
                placeholder="Years of Experience"
                onChange={(v) => highlights.update(index, { label: v })}
              />
            </div>
          </ItemCard>
        ))}
      </EditorSection>
    </>
  );
}
