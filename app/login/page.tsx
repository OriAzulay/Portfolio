"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setAuthToken, isAuthenticated } from "../lib/auth";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthToken();
        if (typeof window !== "undefined") {
          sessionStorage.setItem("admin_password", password);
        }
        router.push("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <article className="active">
        <header>
          <h2 className="h2 article-title">Admin Login</h2>
        </header>

        <section className="contact-form-box">
          <div className="contact-form-wrapper">
            <p>Enter your password to access the dashboard.</p>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="input-wrapper">
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin password"
                  required
                />
              </div>

              {error && <p>{error}</p>}

              <button className="form-btn" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </section>
      </article>
    </main>
  );
}
