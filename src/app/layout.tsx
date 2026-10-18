import type { Metadata, Viewport } from "next";
import { Courgette, Poppins } from "next/font/google";
import "@/styles/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const courgette = Courgette({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-courgette",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Portfolio", template: "%s" },
  description: "Personal portfolio",
};

export const viewport: Viewport = {
  themeColor: "#121212",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} ${courgette.variable}`}>
      <body>{children}</body>
    </html>
  );
}
