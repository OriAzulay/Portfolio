"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { MoonIcon, SunIcon } from "../icons";
import styles from "./ThemeToggle.module.css";

export const THEME_STORAGE_KEY = "theme";
const THEME_EVENT = "themechange";

type Theme = "dark" | "light";

const subscribe = (onChange: () => void) => {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
};
const getTheme = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");
// The theme is only known in the browser (set before paint by the script in the root layout).
const getServerTheme = (): Theme | null => null;

/**
 * Sliding dark/light switch. The knob position and icon are driven by CSS
 * from <html data-theme>, so the first paint is already correct.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  const isDark = theme !== "light";

  const toggle = () => {
    const next: Theme = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode / storage disabled - the theme still applies for this visit.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(styles.toggle, className)}
      onClick={toggle}
    >
      <span className={styles.track} aria-hidden="true">
        <SunIcon />
        <MoonIcon />
      </span>
      <span className={styles.knob} aria-hidden="true">
        <span className={styles.knobSun}>
          <SunIcon />
        </span>
        <span className={styles.knobMoon}>
          <MoonIcon />
        </span>
      </span>
    </button>
  );
}

/** Inline script for <head>: applies the saved or system theme before first paint. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})();`;
