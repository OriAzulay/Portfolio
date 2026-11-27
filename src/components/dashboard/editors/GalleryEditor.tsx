"use client";

import type { GalleryItem } from "@/types/portfolio";
import { galleryImageSrc } from "@/lib/placeholders";
import form from "@/components/ui/Form.module.css";
import { Field } from "../fields/Field";
import { ImageField } from "../fields/ImageField";
import { EditorSection, EmptyHint, ItemCard } from "./EditorSection";
import { listActions } from "./listActions";

export function GalleryEditor({
  value,
  onChange,
}: {
  value: GalleryItem[];
  onChange: (value: GalleryItem[]) => void;
}) {
  const gallery = listActions(value, onChange);

  return (
    <EditorSection
      title="Gallery"
      addLabel="Add item"
      onAdd={() => gallery.add({ title: "New item", description: "", imageUrl: "" })}
    >
      {value.length === 0 && <EmptyHint>The Gallery tab is hidden on the site until you add an item.</EmptyHint>}
      {value.map((item, index) => (
        <ItemCard
          key={index}
          title={item.title}
          onRemove={() => gallery.remove(index)}
          onMoveUp={gallery.mover(index, -1)}
          onMoveDown={gallery.mover(index, 1)}
        >
          <ImageField
            label="Image"
            kind="gallery"
            value={item.imageUrl}
            previewSrc={galleryImageSrc(item.imageUrl, item.title)}
            onChange={(url) => gallery.update(index, { imageUrl: url })}
          />
          <div className={form.grid}>
            <Field label="Title" value={item.title} onChange={(v) => gallery.update(index, { title: v })} />
            <Field
              label="Description"
              value={item.description}
              onChange={(v) => gallery.update(index, { description: v })}
            />
          </div>
        </ItemCard>
      ))}
    </EditorSection>
  );
}
