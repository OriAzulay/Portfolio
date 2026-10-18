import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { isAdmin } from "@/server/auth/session";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/dashboard");
  return <LoginForm />;
}
