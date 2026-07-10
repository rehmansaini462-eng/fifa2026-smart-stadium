import { redirect } from "next/navigation";

/**
 * Root page — redirects to the stadium dashboard.
 * Keeps the root route clean; all UI lives under /stadium.
 */
export default function Home() {
  redirect("/stadium");
}
