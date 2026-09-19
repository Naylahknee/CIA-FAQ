import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support the Guide",
  description: "Help keep the CIA Hyde Park Family Guide free, independent and advertising-free for every family.",
  alternates: { canonical: "/donate" },
  openGraph: { title: "Support the Guide", description: "Help keep the CIA Hyde Park Family Guide free, independent and advertising-free for every family.", url: "/donate", type: "website" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
