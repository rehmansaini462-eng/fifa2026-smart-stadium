/**
 * @module app/stadium/page
 * Stadium dashboard page — UI view layer.
 * MODULAR ISOLATION: This is a pure UI view. All data comes from services/stadium.
 */

import type { Metadata } from "next";
import StadiumDashboard from "@/components/StadiumDashboard";

export const metadata: Metadata = {
  title: "StadiumIQ — Smart Stadium Dashboard | FIFA World Cup 2026",
  description:
    "AI-powered stadium operations dashboard for the FIFA World Cup 2026. Real-time crowd intelligence, smart navigation, accessibility, and sustainability tracking.",
  keywords: [
    "FIFA World Cup 2026",
    "smart stadium",
    "crowd management",
    "AI navigation",
    "accessibility",
    "sustainability",
  ],
};

export default function StadiumPage() {
  return <StadiumDashboard />;
}
