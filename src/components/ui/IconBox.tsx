import type { ReactNode } from "react";
import styles from "./IconBox.module.css";

export function IconBox({ children }: { children: ReactNode }) {
  return <div className={styles.iconBox}>{children}</div>;
}
