"use client";

import { useId } from "react";
import type { Project } from "@/types/portfolio";
import { projectImageSrc } from "@/lib/placeholders";
import form from "@/components/ui/Form.module.css";
import { Field } from "../fields/Field";
import { ImageField } from "../fields/ImageField";
import { EditorSection, EmptyHint, ItemCard } from "./EditorSection";
import { listActions } from "./listActions";

const parseTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export function ProjectsEditor({ value, onChange }: { value: Project[]; onChange: (value: Project[]) => void }) {
  const projects = listActions(value, onChange);

  return (
    <EditorSection
      title="Projects"
      addLabel="Add project"
      onAdd={() => projects.add({ title: "New project", description: "", tags: [], link: "", imageUrl: "" })}
    >
      {value.length === 0 && <EmptyHint>No projects yet.</EmptyHint>}
      {value.map((project, index) => (
        <ItemCard
          key={index}
          title={project.title}
          onRemove={() => projects.remove(index)}
          onMoveUp={projects.mover(index, -1)}
          onMoveDown={projects.mover(index, 1)}
        >
          <ImageField
            label="Image"
            kind="project"
            value={project.imageUrl}
            previewSrc={projectImageSrc(project.imageUrl, project.title)}
            onChange={(url) => projects.update(index, { imageUrl: url })}
          />
          <div className={form.grid}>
            <Field label="Title" value={project.title} onChange={(v) => projects.update(index, { title: v })} />
            <Field
              label="Link"
              type="url"
              value={project.link}
              placeholder="https://..."
              onChange={(v) => projects.update(index, { link: v })}
            />
          </div>
          <Field
            label="Description"
            multiline
            value={project.description}
            onChange={(v) => projects.update(index, { description: v })}
          />
          <TagsField value={project.tags} onChange={(tags) => projects.update(index, { tags })} />
        </ItemCard>
      ))}
    </EditorSection>
  );
}

/** Edits tags as comma-separated text; parsed when the field loses focus so typing commas feels natural. */
function TagsField({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const id = useId();
  return (
    <div className={form.field}>
      <label className={form.label} htmlFor={id}>
        Tags (comma separated - the first one is shown on the card)
      </label>
      <input
        id={id}
        key={value.join(",")}
        className={form.input}
        defaultValue={value.join(", ")}
        placeholder="React, Node.js"
        onBlur={(e) => onChange(parseTags(e.target.value))}
      />
    </div>
  );
}
