"use client";

import type { PortfolioData, TimelineEntry } from "@/types/portfolio";
import form from "@/components/ui/Form.module.css";
import { Field } from "../fields/Field";
import { RichTextEditor } from "../fields/RichTextEditor";
import { EditorSection, EmptyHint, ItemCard } from "./EditorSection";
import { listActions } from "./listActions";
import { TagsField } from "./ProjectsEditor";
import styles from "./editors.module.css";

type ResumeKey =
  | "experience"
  | "keyProjects"
  | "education"
  | "skillGroups"
  | "skills"
  | "militaryService"
  | "volunteering";

type Props = {
  data: Pick<PortfolioData, ResumeKey>;
  onChange: <K extends ResumeKey>(key: K, value: PortfolioData[K]) => void;
  /** Number of GitHub/portfolio projects also shown under Key Projects. */
  linkedKeyProjects: number;
};

const clampLevel = (value: string) => Math.min(100, Math.max(0, Math.round(Number(value) || 0)));

/** Experience-shaped list (role, organization, period, rich-text description). */
function TimelineEditor({
  title,
  addLabel,
  items,
  onChange,
  roleLabel,
  orgLabel,
}: {
  title: string;
  addLabel: string;
  items: TimelineEntry[];
  onChange: (items: TimelineEntry[]) => void;
  roleLabel: string;
  orgLabel: string;
}) {
  const list = listActions(items, onChange);
  return (
    <EditorSection
      title={title}
      addLabel={addLabel}
      onAdd={() => list.add({ title: `New ${roleLabel.toLowerCase()}`, company: "", period: "", description: "" })}
    >
      {items.length === 0 && <EmptyHint>Nothing here yet - this section is hidden on the site while empty.</EmptyHint>}
      {items.map((item, index) => (
        <ItemCard
          key={index}
          title={item.title}
          onRemove={() => list.remove(index)}
          onMoveUp={list.mover(index, -1)}
          onMoveDown={list.mover(index, 1)}
        >
          <div className={form.grid}>
            <Field label={roleLabel} value={item.title} onChange={(v) => list.update(index, { title: v })} />
            <Field label={orgLabel} value={item.company} onChange={(v) => list.update(index, { company: v })} />
            <Field
              label="Period"
              value={item.period}
              placeholder="2022 - Present"
              onChange={(v) => list.update(index, { period: v })}
            />
          </div>
          <RichTextEditor
            label="Description"
            value={item.description}
            onChange={(v) => list.update(index, { description: v })}
          />
        </ItemCard>
      ))}
    </EditorSection>
  );
}

export function ResumeEditor({ data, onChange, linkedKeyProjects }: Props) {
  const keyProjects = listActions(data.keyProjects, (v) => onChange("keyProjects", v));
  const education = listActions(data.education, (v) => onChange("education", v));
  const skillGroups = listActions(data.skillGroups, (v) => onChange("skillGroups", v));
  const skills = listActions(data.skills, (v) => onChange("skills", v));

  return (
    <>
      <TimelineEditor
        title="Experience"
        addLabel="Add experience"
        items={data.experience}
        onChange={(v) => onChange("experience", v)}
        roleLabel="Role"
        orgLabel="Company"
      />

      <EditorSection
        title="Key Projects"
        addLabel="Add key project"
        onAdd={() => keyProjects.add({ title: "New key project", organization: "", description: "", tags: [], link: "" })}
      >
        <p className={styles.sectionHint}>
          Highlighted work from your CV. {linkedKeyProjects > 0 ? `${linkedKeyProjects} project(s) from the Projects tab are also shown here` : "You can also show items from the Projects tab here"} (&quot;Show under Key Projects&quot; checkbox).
        </p>
        {data.keyProjects.length === 0 && <EmptyHint>No key projects yet.</EmptyHint>}
        {data.keyProjects.map((item, index) => (
          <ItemCard
            key={index}
            title={item.title}
            onRemove={() => keyProjects.remove(index)}
            onMoveUp={keyProjects.mover(index, -1)}
            onMoveDown={keyProjects.mover(index, 1)}
          >
            <div className={form.grid}>
              <Field label="Project" value={item.title} onChange={(v) => keyProjects.update(index, { title: v })} />
              <Field
                label="Organization (optional)"
                value={item.organization}
                placeholder="Elbit Systems"
                onChange={(v) => keyProjects.update(index, { organization: v })}
              />
              <Field
                label="Link (optional)"
                type="url"
                value={item.link}
                onChange={(v) => keyProjects.update(index, { link: v })}
              />
            </div>
            <Field
              label="Description"
              multiline
              value={item.description}
              onChange={(v) => keyProjects.update(index, { description: v })}
            />
            <TagsField value={item.tags} onChange={(tags) => keyProjects.update(index, { tags })} />
          </ItemCard>
        ))}
      </EditorSection>

      <EditorSection
        title="Education"
        addLabel="Add education"
        onAdd={() => education.add({ degree: "New degree", school: "", period: "" })}
      >
        {data.education.length === 0 && <EmptyHint>No education entries yet.</EmptyHint>}
        {data.education.map((item, index) => (
          <ItemCard
            key={index}
            title={item.degree}
            onRemove={() => education.remove(index)}
            onMoveUp={education.mover(index, -1)}
            onMoveDown={education.mover(index, 1)}
          >
            <div className={form.grid}>
              <Field label="Degree" value={item.degree} onChange={(v) => education.update(index, { degree: v })} />
              <Field label="School" value={item.school} onChange={(v) => education.update(index, { school: v })} />
              <Field label="Period" value={item.period} onChange={(v) => education.update(index, { period: v })} />
            </div>
          </ItemCard>
        ))}
      </EditorSection>

      <EditorSection
        title="Skill groups"
        addLabel="Add group"
        onAdd={() => skillGroups.add({ title: "New group", items: "" })}
      >
        <p className={styles.sectionHint}>Text summary of your skills, grouped like in your CV.</p>
        {data.skillGroups.length === 0 && <EmptyHint>No skill groups yet.</EmptyHint>}
        {data.skillGroups.map((item, index) => (
          <ItemCard
            key={index}
            title={item.title}
            onRemove={() => skillGroups.remove(index)}
            onMoveUp={skillGroups.mover(index, -1)}
            onMoveDown={skillGroups.mover(index, 1)}
          >
            <Field label="Group" value={item.title} onChange={(v) => skillGroups.update(index, { title: v })} />
            <div className={styles.spacer} />
            <Field
              label="Skills"
              multiline
              value={item.items}
              onChange={(v) => skillGroups.update(index, { items: v })}
            />
          </ItemCard>
        ))}
      </EditorSection>

      <EditorSection title="Skill bars" addLabel="Add skill" onAdd={() => skills.add({ name: "New skill", level: 50 })}>
        {data.skills.length === 0 && <EmptyHint>No skill bars - this block is hidden on the site.</EmptyHint>}
        {data.skills.map((item, index) => (
          <ItemCard
            key={index}
            title={item.name}
            onRemove={() => skills.remove(index)}
            onMoveUp={skills.mover(index, -1)}
            onMoveDown={skills.mover(index, 1)}
          >
            <div className={styles.skillRow}>
              <Field label="Skill" value={item.name} onChange={(v) => skills.update(index, { name: v })} />
              <Field
                label="Level (%)"
                type="number"
                min={0}
                max={100}
                value={item.level}
                onChange={(v) => skills.update(index, { level: clampLevel(v) })}
              />
              <input
                className={styles.range}
                type="range"
                min={0}
                max={100}
                value={item.level}
                aria-label={`${item.name} level`}
                onChange={(e) => skills.update(index, { level: clampLevel(e.target.value) })}
              />
            </div>
          </ItemCard>
        ))}
      </EditorSection>

      <TimelineEditor
        title="Military service"
        addLabel="Add service"
        items={data.militaryService}
        onChange={(v) => onChange("militaryService", v)}
        roleLabel="Role"
        orgLabel="Unit"
      />

      <TimelineEditor
        title="Volunteering & social projects"
        addLabel="Add entry"
        items={data.volunteering}
        onChange={(v) => onChange("volunteering", v)}
        roleLabel="Program"
        orgLabel="Organization"
      />
    </>
  );
}
