"use client";

import { useId, useState } from "react";
import type { Project } from "@/types/portfolio";
import { projectImageSrc } from "@/lib/placeholders";
import { cn } from "@/lib/utils";
import form from "@/components/ui/Form.module.css";
import { GitHubIcon } from "@/components/ui/icons";
import { Field } from "../fields/Field";
import { ImageField } from "../fields/ImageField";
import { EditorSection, EmptyHint, ItemCard } from "./EditorSection";
import { listActions } from "./listActions";
import styles from "./editors.module.css";

const parseTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

type Props = {
  value: Project[];
  onChange: (value: Project[]) => void;
  /** Returns the project refreshed from its GitHub repository. */
  onSync: (project: Project) => Promise<Project>;
  onOpenGitHub: () => void;
};

export function ProjectsEditor({ value, onChange, onSync, onOpenGitHub }: Props) {
  const projects = listActions(value, onChange);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<{ index: number; message: string } | null>(null);

  const sync = async (index: number) => {
    setSyncing(index);
    setSyncError(null);
    try {
      projects.update(index, await onSync(value[index]));
    } catch (error) {
      setSyncError({ index, message: error instanceof Error ? error.message : "Sync failed" });
    } finally {
      setSyncing(null);
    }
  };

  return (
    <EditorSection
      title="Projects"
      addLabel="Add project"
      onAdd={() =>
        projects.add({
          title: "New project",
          description: "",
          tags: [],
          link: "",
          liveUrl: "",
          imageUrl: "",
          showInKeyProjects: false,
          github: null,
        })
      }
    >
      <p className={styles.sectionHint}>
        Tip: import projects straight from your repositories in the{" "}
        <button type="button" className={styles.inlineLink} onClick={onOpenGitHub}>
          GitHub tab
        </button>
        .
      </p>
      {value.length === 0 && <EmptyHint>No projects yet.</EmptyHint>}
      {value.map((project, index) => (
        <ItemCard
          key={index}
          title={project.title}
          onRemove={() => projects.remove(index)}
          onMoveUp={projects.mover(index, -1)}
          onMoveDown={projects.mover(index, 1)}
        >
          {project.github && (
            <div className={styles.githubBar}>
              <span className={styles.githubBadge}>
                <GitHubIcon />
                {project.github.fullName}
              </span>
              <span className={styles.githubMeta}>
                Synced {new Date(project.github.syncedAt).toLocaleDateString()}
              </span>
              <div className={styles.itemActions}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => sync(index)}
                  disabled={syncing !== null}
                >
                  {syncing === index ? "Syncing..." : "Sync from GitHub"}
                </button>
                <button
                  type="button"
                  className={cn(styles.iconBtn, styles.danger)}
                  onClick={() => projects.update(index, { github: null })}
                >
                  Unlink
                </button>
              </div>
              {syncError?.index === index && <span className={styles.errorText}>{syncError.message}</span>}
            </div>
          )}

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
              label="Link (repository / page)"
              type="url"
              value={project.link}
              placeholder="https://github.com/..."
              onChange={(v) => projects.update(index, { link: v })}
            />
            <Field
              label="Live demo (optional)"
              type="url"
              value={project.liveUrl}
              placeholder="https://..."
              onChange={(v) => projects.update(index, { liveUrl: v })}
            />
          </div>
          <Field
            label="Description"
            multiline
            value={project.description}
            onChange={(v) => projects.update(index, { description: v })}
          />
          <TagsField value={project.tags} onChange={(tags) => projects.update(index, { tags })} />
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={project.showInKeyProjects}
              onChange={(e) => projects.update(index, { showInKeyProjects: e.target.checked })}
            />
            Show under &quot;Key Projects&quot; in the Resume
          </label>
        </ItemCard>
      ))}
    </EditorSection>
  );
}

/** Edits tags as comma-separated text; parsed when the field loses focus so typing commas feels natural. */
export function TagsField({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const id = useId();
  return (
    <div className={cn(form.field, styles.tagsField)}>
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
