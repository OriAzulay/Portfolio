import type { Metadata } from "next";
import { PortfolioPage } from "@/components/portfolio/PortfolioPage";
import { getPortfolio } from "@/server/services/portfolio.service";

// Content lives in SQLite and changes from the dashboard, so render per request.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const { name, title, about, avatarUrl } = getPortfolio().personalInfo;
  const description = about.replace(/\s+/g, " ").trim().slice(0, 160);
  return {
    title: title ? `${name} - ${title}` : name,
    description,
    openGraph: {
      title: name,
      description,
      type: "profile",
      ...(avatarUrl ? { images: [avatarUrl] } : {}),
    },
  };
}

export default function HomePage() {
  return <PortfolioPage data={getPortfolio()} />;
}
