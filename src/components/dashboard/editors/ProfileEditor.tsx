"use client";

import type { PersonalInfo } from "@/types/portfolio";
import { avatarSrc } from "@/lib/placeholders";
import form from "@/components/ui/Form.module.css";
import { Field } from "../fields/Field";
import { ImageField } from "../fields/ImageField";
import { EditorSection } from "./EditorSection";

type Props = {
  value: PersonalInfo;
  onChange: (value: PersonalInfo) => void;
};

export function ProfileEditor({ value, onChange }: Props) {
  const set = <K extends keyof PersonalInfo>(key: K, next: PersonalInfo[K]) => onChange({ ...value, [key]: next });
  const setSocial = (key: keyof PersonalInfo["social"], next: string) =>
    set("social", { ...value.social, [key]: next });
  const setStat = (key: keyof PersonalInfo["stats"], next: string) => set("stats", { ...value.stats, [key]: next });

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
          label="About (one paragraph per line)"
          multiline
          value={value.about}
          onChange={(v) => set("about", v)}
        />
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

      <EditorSection title="Highlights">
        <div className={form.grid}>
          <Field
            label="Years of experience"
            value={value.stats.yearsExperience}
            onChange={(v) => setStat("yearsExperience", v)}
          />
          <Field
            label="Projects completed"
            value={value.stats.projectsCompleted}
            onChange={(v) => setStat("projectsCompleted", v)}
          />
          <Field
            label="Certifications & awards"
            value={value.stats.certificationsAwards}
            onChange={(v) => setStat("certificationsAwards", v)}
          />
        </div>
      </EditorSection>
    </>
  );
}
