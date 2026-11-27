import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardApp } from "@/components/dashboard/DashboardApp";
import { isAdmin } from "@/server/auth/session";
import { listMessages } from "@/server/services/contact.service";
import { getGitHubSettings } from "@/server/services/github.service";
import { getPortfolio } from "@/server/services/portfolio.service";
import { countUniqueVisitors } from "@/server/services/visit.service";

export const metadata: Metadata = { title: "Admin Dashboard", robots: { index: false } };

export default async function DashboardPage() {
  if (!(await isAdmin())) redirect("/login");

  return (
    <DashboardApp
      initialData={getPortfolio()}
      initialMessages={listMessages()}
      visitorCount={countUniqueVisitors()}
      githubSettings={getGitHubSettings()}
    />
  );
}
