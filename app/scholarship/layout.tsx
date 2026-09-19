import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CIA Hyde Park Scholarship Information",
  description: "Scholarship and financial aid information for Culinary Institute of America Hyde Park students and families.",
  alternates: { canonical: "/scholarship" },
  openGraph: { title: "CIA Hyde Park Scholarship Information", description: "Scholarship and financial aid information for Culinary Institute of America Hyde Park students and families.", url: "/scholarship", type: "website" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
