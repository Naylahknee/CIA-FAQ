import type { Metadata } from "next";
import { GuideShell } from "../components/guide-shell";

export const metadata: Metadata = {
  title: "Family Community: CIA Hyde Park Parents & Students",
  description: "A private community for CIA Hyde Park parents and students. Ask questions, share what worked, and get answers from families who have been through it. No Facebook account required.",
  alternates: { canonical: "/community" },
  openGraph: { title: "Family Community: CIA Hyde Park Parents & Students", description: "A private community for CIA Hyde Park parents and students. Ask questions, share what worked, and get answers from families who have been through it. No Facebook account required.", url: "/community", type: "website" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <GuideShell>{children}</GuideShell>; }
