"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./CopyButton.module.css";

/** Copies text to the clipboard and briefly confirms it. */
export function CopyButton({ text, label = "Copy", className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (e.g. insecure context) - nothing else to do.
    }
  };

  return (
    <button type="button" className={cn(styles.button, className)} onClick={copy} aria-live="polite">
      {copied ? "Copied ✓" : label}
    </button>
  );
}
