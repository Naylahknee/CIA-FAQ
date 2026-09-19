import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share the CIA Hyde Park Family Guide",
  description: "Pass the CIA Hyde Park Family Guide along to another family who needs practical answers about campus life.",
  alternates: { canonical: "/share" },
  openGraph: { title: "Share the CIA Hyde Park Family Guide", description: "Pass the CIA Hyde Park Family Guide along to another family who needs practical answers about campus life.", url: "/share", type: "website" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
