"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import form from "@/components/ui/Form.module.css";

type FieldProps = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "email" | "url" | "number" | "tel";
  placeholder?: string;
  multiline?: boolean;
  min?: number;
  max?: number;
};

/** Labelled input / textarea used by every dashboard editor. */
export function Field({ label, value, onChange, type = "text", placeholder, multiline, min, max }: FieldProps) {
  const id = useId();
  return (
    <div className={form.field}>
      <label className={form.label} htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className={cn(form.input, form.textarea)}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className={form.input}
          type={type}
          value={value}
          placeholder={placeholder}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
