"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { ArticleTitle } from "@/components/ui/ArticleTitle";
import { Panel } from "@/components/ui/Panel";
import form from "@/components/ui/Form.module.css";
import styles from "./LoginForm.module.css";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.login(password);
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <Panel className={styles.panel}>
        <ArticleTitle>Admin Login</ArticleTitle>
        <p className={form.hint}>Enter your password to edit the portfolio.</p>

        {error && (
          <p className={cn(form.status, form.error)} role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            className={cn(form.input, styles.input)}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoComplete="current-password"
            autoFocus
            required
          />
          <button className={form.button} type="submit" disabled={loading || !password}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </Panel>
    </main>
  );
}
