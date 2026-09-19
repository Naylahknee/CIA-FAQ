import type { Metadata } from "next";
import { GuideShell } from "../components/guide-shell";

export const metadata: Metadata = {
  title: "Submit a Correction",
  description: "Spotted something out of date in the CIA Hyde Park Family Guide? Tell us and we will verify it against the official source.",
  alternates: { canonical: "/corrections" },
  openGraph: { title: "Submit a Correction", description: "Spotted something out of date in the CIA Hyde Park Family Guide? Tell us and we will verify it against the official source.", url: "/corrections", type: "website" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <GuideShell>{children}</GuideShell>; }
