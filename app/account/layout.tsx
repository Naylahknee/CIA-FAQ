import type { Metadata } from "next";
import { GuideShell } from "../components/guide-shell";

export const metadata: Metadata = {
  title: "Account & Privacy",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <GuideShell>{children}</GuideShell>; }
