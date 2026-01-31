import type { Metadata } from "next";
import { Poppins, Courgette } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const courgette = Courgette({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-courgette",
  display: "swap",
});

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
    <html lang="en" className={`${poppins.variable} ${courgette.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
