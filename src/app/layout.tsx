import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StadiumIQ — AI-Powered Smart Stadium | FIFA World Cup 2026",
  description:
    "GenAI-enabled smart stadium operations platform for the FIFA World Cup 2026. Real-time crowd intelligence, multilingual AI assistance, smart navigation, accessibility, transportation, and sustainability tracking.",
  keywords: [
    "StadiumIQ",
    "FIFA World Cup 2026",
    "smart stadium",
    "GenAI",
    "crowd management",
    "AI navigation",
    "accessibility",
    "sustainability",
    "tournament operations",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
