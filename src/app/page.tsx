import type { Metadata } from "next";
import { PortfolioPage } from "@/components/portfolio/PortfolioPage";
import { summarize } from "@/lib/site";
import { getPortfolio } from "@/server/services/portfolio.service";

// Content lives in the database and changes from the dashboard, so render per request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { name, title, headline, about } = (await getPortfolio()).personalInfo;
  const description = summarize(headline ? `${headline}. ${about}` : about);
  const pageTitle = title ? `${name} - ${title}` : name;
  // The share image comes from app/opengraph-image.tsx (generated PNG).
  return {
    title: pageTitle,
    description,
    alternates: { canonical: "/" },
    openGraph: { title: pageTitle, description, type: "profile", url: "/" },
    twitter: { card: "summary_large_image", title: pageTitle, description },
  };
}

export default async function HomePage() {
  return <PortfolioPage data={await getPortfolio()} />;
}
