import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your Name - Portfolio",
  description: "Software Developer Portfolio - Showcasing my projects, skills, and experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
