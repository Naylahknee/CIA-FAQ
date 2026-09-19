import type { Metadata } from "next";
import "./community-theme.css";
import { CommunityProvider } from "./_components/community-data";
import { CommunityNav } from "./_components/community-nav";
import { CommunityGate } from "./_components/community-gate";

export const metadata: Metadata = {
  title: "CIA Parents and Family",
  description: "A private community for CIA Hyde Park parents and students. Ask questions, share what worked, and get answers from families who have been through it. No Facebook account required.",
  alternates: { canonical: "/community" },
  openGraph: { title: "CIA Parents and Family", description: "A private community for CIA Hyde Park parents and students.", url: "/community", type: "website" },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cia-community">
      <CommunityProvider>
        <CommunityNav />
        <CommunityGate>{children}</CommunityGate>
      </CommunityProvider>
    </div>
  );
}
