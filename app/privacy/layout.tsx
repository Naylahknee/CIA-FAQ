import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How the CIA Hyde Park Family Guide handles your information. No advertising, no analytics tracking, one essential cookie for signed-in accounts.",
  alternates: { canonical: "/privacy" },
  openGraph: { title: "Privacy", description: "How the CIA Hyde Park Family Guide handles your information. No advertising, no analytics tracking, one essential cookie for signed-in accounts.", url: "/privacy", type: "website" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
