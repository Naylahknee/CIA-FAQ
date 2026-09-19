import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Family Calendar: CIA Hyde Park Dates & Deadlines",
  description: "Every CIA Hyde Park date families need for Fall 2026 and Spring 2027: kitchen and bakeshop blocks, tuition refund deadlines, community days, career fair, recess travel and commencement.",
  alternates: { canonical: "/calendar" },
  openGraph: { title: "Family Calendar: CIA Hyde Park Dates & Deadlines", description: "Every CIA Hyde Park date families need for Fall 2026 and Spring 2027: kitchen and bakeshop blocks, tuition refund deadlines, community days, career fair, recess travel and commencement.", url: "/calendar", type: "website" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
