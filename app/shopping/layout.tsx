import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Near CIA Hyde Park: Pickup & Delivery for Students",
  description: "Where to buy what a CIA Hyde Park student needs: storage and moving supplies, groceries and room essentials from stores near campus, with pickup and delivery guidance and how to send a Celebration Gram.",
  alternates: { canonical: "/shopping" },
  openGraph: { title: "Shopping Near CIA Hyde Park: Pickup & Delivery for Students", description: "Where to buy what a CIA Hyde Park student needs: storage and moving supplies, groceries and room essentials from stores near campus, with pickup and delivery guidance and how to send a Celebration Gram.", url: "/shopping", type: "website" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
