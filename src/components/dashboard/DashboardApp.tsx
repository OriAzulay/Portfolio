"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContactMessage } from "@/types/contact";
import type { PortfolioData } from "@/types/portfolio";
import { api, ApiError } from "@/lib/api-client";
import { defaultPortfolioData } from "@/lib/defaults";
import { cn } from "@/lib/utils";
import form from "@/components/ui/Form.module.css";
import { GalleryEditor } from "./editors/GalleryEditor";
import { ProfileEditor } from "./editors/ProfileEditor";
import { ProjectsEditor } from "./editors/ProjectsEditor";
import { ResumeEditor } from "./editors/ResumeEditor";
import { MessagesInbox } from "./MessagesInbox/MessagesInbox";
import styles from "./DashboardApp.module.css";

type TabId = "profile" | "resume" | "projects" | "gallery" | "messages";
type Notice = { type: "success" | "error"; text: string } | null;

type Props = {
  initialData: PortfolioData;
  initialMessages: ContactMessage[];
  visitorCount: number;
};

function describeSaveError(error: unknown): string {
  if (!(error instanceof ApiError)) return "Save failed. Check your connection and try again.";
  if (error.status === 401) return "Your session expired. Please log in again.";
  if (error.details) {
    const fields = Object.keys(error.details).join(", ");
    return `Some fields are invalid (${fields}). Links must start with http(s):// or /.`;
  }
  return error.message;
}

export function DashboardApp({ initialData, initialMessages, visitorCount }: Props) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initialData));
  const [messages, setMessages] = useState(initialMessages);
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const dirty = useMemo(() => JSON.stringify(data) !== savedJson, [data, savedJson]);
  const unread = messages.filter((m) => !m.isRead).length;

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const update = <K extends keyof PortfolioData>(key: K) => (value: PortfolioData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const save = async (next: PortfolioData = data) => {
    setSaving(true);
    setNotice(null);
    try {
      const { data: saved } = await api.savePortfolio(next);
      setData(saved);
      setSavedJson(JSON.stringify(saved));
      setNotice({ type: "success", text: "Saved! Your site is updated." });
    } catch (error) {
      setNotice({ type: "error", text: describeSaveError(error) });
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (!confirm("Reset all content to the starter template? This cannot be undone.")) return;
    void save(defaultPortfolioData);
  };

  const logout = async () => {
    if (dirty && !confirm("You have unsaved changes. Log out anyway?")) return;
    await api.logout().catch(() => {});
    router.replace("/login");
    router.refresh();
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "resume", label: "Resume" },
    { id: "projects", label: "Projects" },
    { id: "gallery", label: "Gallery" },
    { id: "messages", label: unread ? `Messages (${unread})` : "Messages" },
  ];

  return (
    <main className={styles.main}>
      <header className={styles.topbar}>
        <div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.stats}>
            {visitorCount} unique visitors · {unread} unread messages
          </p>
        </div>
        <div className={styles.actions}>
          <button
            className={cn(styles.btn, styles.primary)}
            type="button"
            onClick={() => save()}
            disabled={saving || !dirty}
          >
            {saving ? "Saving..." : dirty ? "Save changes" : "Saved"}
          </button>
          <a className={styles.btn} href="/" target="_blank" rel="noopener noreferrer">
            View site
          </a>
          <button className={styles.btn} type="button" onClick={reset} disabled={saving}>
            Reset
          </button>
          <button className={cn(styles.btn, styles.danger)} type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {notice && (
        <p className={cn(form.status, notice.type === "success" ? form.success : form.error)} role="status">
          {notice.text}
        </p>
      )}

      <nav className={styles.tabs} aria-label="Dashboard sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={cn(styles.tab, activeTab === tab.id && styles.activeTab)}
            aria-current={activeTab === tab.id ? "page" : undefined}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        {activeTab === "profile" && <ProfileEditor value={data.personalInfo} onChange={update("personalInfo")} />}
        {activeTab === "resume" && (
          <ResumeEditor
            experience={data.experience}
            education={data.education}
            skills={data.skills}
            onExperienceChange={update("experience")}
            onEducationChange={update("education")}
            onSkillsChange={update("skills")}
          />
        )}
        {activeTab === "projects" && <ProjectsEditor value={data.projects} onChange={update("projects")} />}
        {activeTab === "gallery" && <GalleryEditor value={data.gallery} onChange={update("gallery")} />}
        {activeTab === "messages" && <MessagesInbox messages={messages} onMessagesChange={setMessages} />}
      </div>
    </main>
  );
}
