"use client";

import { useEffect, useRef } from "react";
import styles from "./fields.module.css";

type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

/** Minimal contentEditable editor (bold, italic, bullets, size, color). Output is sanitized on the server. */
export function RichTextEditor({ label, value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Sync external value changes without clobbering the caret while typing.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const emit = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const exec = (command: string, commandValue?: string) => {
    // execCommand is deprecated but still the simplest dependency-free option.
    document.execCommand(command, false, commandValue);
    emit();
  };

  const keepSelection = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className={styles.richText}>
      <span className={styles.label}>{label}</span>
      <div className={styles.toolbar} role="toolbar" aria-label={`${label} formatting`}>
        <button type="button" className={styles.toolBtn} onMouseDown={keepSelection} onClick={() => exec("bold")}>
          <b>B</b>
        </button>
        <button type="button" className={styles.toolBtn} onMouseDown={keepSelection} onClick={() => exec("italic")}>
          <i>I</i>
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          onMouseDown={keepSelection}
          onClick={() => exec("insertUnorderedList")}
        >
          • List
        </button>
        <select
          className={styles.toolBtn}
          aria-label="Font size"
          defaultValue="3"
          onChange={(e) => exec("fontSize", e.target.value)}
        >
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">XL</option>
        </select>
        <input
          className={styles.colorInput}
          type="color"
          aria-label="Text color"
          onChange={(e) => exec("foreColor", e.target.value)}
        />
      </div>
      <div
        ref={editorRef}
        className={styles.surface}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        onInput={emit}
      />
    </div>
  );
}
