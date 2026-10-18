"use client";

import type { Education, Experience, Skill } from "@/types/portfolio";
import form from "@/components/ui/Form.module.css";
import { Field } from "../fields/Field";
import { RichTextEditor } from "../fields/RichTextEditor";
import { EditorSection, EmptyHint, ItemCard } from "./EditorSection";
import { listActions } from "./listActions";
import styles from "./editors.module.css";

type Props = {
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  onExperienceChange: (value: Experience[]) => void;
  onEducationChange: (value: Education[]) => void;
  onSkillsChange: (value: Skill[]) => void;
};

const clampLevel = (value: string) => Math.min(100, Math.max(0, Math.round(Number(value) || 0)));

export function ResumeEditor(props: Props) {
  const experience = listActions(props.experience, props.onExperienceChange);
  const education = listActions(props.education, props.onEducationChange);
  const skills = listActions(props.skills, props.onSkillsChange);

  return (
    <>
      <EditorSection
        title="Experience"
        addLabel="Add experience"
        onAdd={() => experience.add({ title: "New position", company: "", period: "", description: "" })}
      >
        {props.experience.length === 0 && <EmptyHint>No experience entries yet.</EmptyHint>}
        {props.experience.map((item, index) => (
          <ItemCard
            key={index}
            title={item.title}
            onRemove={() => experience.remove(index)}
            onMoveUp={experience.mover(index, -1)}
            onMoveDown={experience.mover(index, 1)}
          >
            <div className={form.grid}>
              <Field label="Role" value={item.title} onChange={(v) => experience.update(index, { title: v })} />
              <Field label="Company" value={item.company} onChange={(v) => experience.update(index, { company: v })} />
              <Field
                label="Period"
                value={item.period}
                placeholder="2023 - Present"
                onChange={(v) => experience.update(index, { period: v })}
              />
            </div>
            <RichTextEditor
              label="Description"
              value={item.description}
              onChange={(v) => experience.update(index, { description: v })}
            />
          </ItemCard>
        ))}
      </EditorSection>

      <EditorSection
        title="Education"
        addLabel="Add education"
        onAdd={() => education.add({ degree: "New degree", school: "", period: "" })}
      >
        {props.education.length === 0 && <EmptyHint>No education entries yet.</EmptyHint>}
        {props.education.map((item, index) => (
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

      <EditorSection title="Skills" addLabel="Add skill" onAdd={() => skills.add({ name: "New skill", level: 50 })}>
        {props.skills.length === 0 && <EmptyHint>No skills yet.</EmptyHint>}
        {props.skills.map((item, index) => (
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
    </>
  );
}
