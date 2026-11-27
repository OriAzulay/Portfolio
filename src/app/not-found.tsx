import type { Metadata } from "next";
import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import typo from "@/components/ui/Typography.module.css";
import styles from "./not-found.module.css";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className={styles.main}>
      <Panel className={styles.panel}>
        <p className={styles.code}>404</p>
        <h1 className={typo.h2}>This page doesn&apos;t exist</h1>
        <p className={styles.text}>The link may be broken, or the page may have moved.</p>
        <Link className={styles.button} href="/">
          ← Back to the portfolio
        </Link>
      </Panel>
    </main>
  );
}
