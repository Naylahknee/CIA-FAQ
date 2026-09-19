import type { Metadata } from "next";
import { GuideShell } from "../components/guide-shell";

export const metadata: Metadata = {
  title: "Support the Guide",
  description: "Help keep the CIA Hyde Park Family Guide free, independent and advertising-free for every family.",
  alternates: { canonical: "/support" },
  openGraph: { title: "Support the Guide", description: "Help keep the CIA Hyde Park Family Guide free, independent and advertising-free for every family.", url: "/support", type: "website" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <GuideShell>{children}</GuideShell>; }
