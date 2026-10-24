"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Project } from "@/types/portfolio";
import { api, ApiError } from "@/lib/api-client";
import { projectFromRepo, syncProjectWithRepo, type GitHubRepo, type GitHubSettings } from "@/lib/github";
import { cn } from "@/lib/utils";
import form from "@/components/ui/Form.module.css";
import { Field } from "../fields/Field";
import { EditorSection, EmptyHint } from "../editors/EditorSection";
import styles from "./GitHubPanel.module.css";

type Props = {
  initialSettings: GitHubSettings;
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
};

const errorText = (error: unknown) => (error instanceof ApiError ? error.message : "Something went wrong");

const relativeDate = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

export function GitHubPanel({ initialSettings, projects, onProjectsChange }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [username, setUsername] = useState(initialSettings.username);
  const [token, setToken] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [fetchedAt, setFetchedAt] = useState("");
  const [loading, setLoading] = useState(Boolean(initialSettings.username));
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [hideForks, setHideForks] = useState(true);

  const load = async (refresh = false) => {
    setLoading(true);
    setError("");
    try {
      const result = await api.listGitHubRepos(refresh);
      setRepos(result.repos);
      setFetchedAt(result.fetchedAt);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  // Load the repository list once when the tab opens (if a username is set).
  useEffect(() => {
    if (!initialSettings.username) return;
    let active = true;
    api
      .listGitHubRepos()
      .then((result) => {
        if (!active) return;
        setRepos(result.repos);
        setFetchedAt(result.fetchedAt);
      })
      .catch((err) => active && setError(errorText(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [initialSettings.username]);

  const saveSettings = async (removeToken = false) => {
    setSavingSettings(true);
    setSettingsNotice(null);
    try {
      const saved = await api.saveGitHubSettings({
        username: username.trim(),
        token: removeToken ? "" : token.trim() || undefined,
      });
      setSettings(saved);
      setToken("");
      setSettingsNotice({ ok: true, text: "GitHub settings saved." });
      if (saved.username) await load(true);
      else setRepos([]);
    } catch (err) {
      setSettingsNotice({ ok: false, text: errorText(err) });
    } finally {
      setSavingSettings(false);
    }
  };

  const linkedIndexByRepo = useMemo(() => {
    const map = new Map<number, number>();
    projects.forEach((project, index) => project.github && map.set(project.github.repoId, index));
    return map;
  }, [projects]);

  const visibleRepos = useMemo(() => {
    const q = query.trim().toLowerCase();
    return repos.filter((repo) => {
      if (hideForks && repo.fork) return false;
      if (!q) return true;
      return [repo.name, repo.description, repo.language, ...repo.topics].join(" ").toLowerCase().includes(q);
    });
  }, [repos, query, hideForks]);

  const importRepo = (repo: GitHubRepo) => onProjectsChange([...projects, projectFromRepo(repo)]);

  const syncRepo = (repo: GitHubRepo, index: number) =>
    onProjectsChange(projects.map((p, i) => (i === index ? syncProjectWithRepo(p, repo) : p)));

  return (
    <>
      <EditorSection title="GitHub account">
        <form
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            void saveSettings();
          }}
        >
          <div className={form.grid}>
            <Field label="GitHub username" value={username} onChange={setUsername} placeholder="OriAzulay" />
            <div className={form.field}>
              <label className={form.label} htmlFor="github-token">
                Personal access token (optional)
              </label>
              <input
                id="github-token"
                className={form.input}
                type="password"
                autoComplete="off"
                value={token}
                placeholder={settings.hasToken ? "•••••••• saved - leave empty to keep" : "ghp_... / github_pat_..."}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
          </div>
          <p className={styles.help}>
            Public repositories work without a token. A token raises GitHub&apos;s rate limit and, if it belongs to
            this account, also lists private repositories. It&apos;s stored encrypted on the server and never sent
            back to the browser.
          </p>
          {settingsNotice && (
            <p className={cn(form.status, settingsNotice.ok ? form.success : form.error)} role="status">
              {settingsNotice.text}
            </p>
          )}
          <div className={styles.actions}>
            <button className={styles.primaryBtn} type="submit" disabled={savingSettings}>
              {savingSettings ? "Saving..." : "Save"}
            </button>
            {settings.hasToken && (
              <button
                type="button"
                className={styles.secondaryBtn}
                disabled={savingSettings}
                onClick={() => saveSettings(true)}
              >
                Remove token
              </button>
            )}
          </div>
        </form>
      </EditorSection>

      <EditorSection
        title="Repositories"
        addLabel={loading ? "Loading..." : "Refresh"}
        onAdd={settings.username ? () => load(true) : undefined}
      >
        {!settings.username && <EmptyHint>Save your GitHub username above to see your repositories.</EmptyHint>}
        {error && (
          <p className={cn(form.status, form.error)} role="alert">
            {error}
          </p>
        )}

        {settings.username && !error && (
          <>
            <div className={styles.toolbar}>
              <input
                className={cn(form.input, styles.search)}
                type="search"
                placeholder="Search by name, language or topic..."
                aria-label="Search repositories"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <label className={styles.toggle}>
                <input type="checkbox" checked={hideForks} onChange={(e) => setHideForks(e.target.checked)} />
                Hide forks
              </label>
            </div>
            {fetchedAt && (
              <p className={styles.help}>
                {visibleRepos.length} of {repos.length} repositories · updated{" "}
                {new Date(fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
            {loading && repos.length === 0 && <EmptyHint>Loading repositories...</EmptyHint>}
            {!loading && repos.length > 0 && visibleRepos.length === 0 && <EmptyHint>No matching repositories.</EmptyHint>}

            <ul className={styles.list}>
              {visibleRepos.map((repo) => {
                const linkedIndex = linkedIndexByRepo.get(repo.id);
                return (
                  <li key={repo.id} className={styles.repo}>
                    <div className={styles.repoMain}>
                      <a className={styles.repoName} href={repo.htmlUrl} target="_blank" rel="noopener noreferrer">
                        {repo.name}
                      </a>
                      {repo.private && <span className={styles.pill}>Private</span>}
                      {repo.fork && <span className={styles.pill}>Fork</span>}
                      {repo.archived && <span className={styles.pill}>Archived</span>}
                      {repo.description && <p className={styles.repoDesc}>{repo.description}</p>}
                      <div className={styles.repoMeta}>
                        {repo.language && <span>{repo.language}</span>}
                        <span>★ {repo.stars}</span>
                        <span>Updated {relativeDate(repo.updatedAt)}</span>
                      </div>
                      {repo.topics.length > 0 && (
                        <ul className={styles.topics}>
                          {repo.topics.map((topic) => (
                            <li key={topic}>{topic}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className={styles.repoActions}>
                      {linkedIndex === undefined ? (
                        <button type="button" className={styles.primaryBtn} onClick={() => importRepo(repo)}>
                          Import
                        </button>
                      ) : (
                        <>
                          <span className={styles.imported}>✓ In Projects</span>
                          <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={() => syncRepo(repo, linkedIndex)}
                          >
                            Sync
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </EditorSection>
    </>
  );
}
