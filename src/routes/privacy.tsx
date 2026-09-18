import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [
    { title: "Privacy — CIA Hyde Park Family Guide" },
    { name: "description", content: "Plain-language privacy information for the CIA Hyde Park Family Guide and private community." },
    { property: "og:title", content: "Privacy — CIA Hyde Park Family Guide" },
    { property: "og:description", content: "What the guide collects, what it does not track, and how community information is protected." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: PrivacyPage,
});

function PrivacyPage() {
  return <AppShell><main id="top" className="page-wrap policy-page"><p className="eyebrow">Plain-language privacy</p><h1>What we collect—and what we do not.</h1><p>You do not need an account to read the FAQs. Sign up and verify your email to post, comment, and interact in the private community.</p><h2>Cookies belong in jars—hidden from the kids.</h2><p>We do not use advertising cookies, analytics cookies, tracking pixels, or cross-site trackers. Signing in creates the essential secure session information needed to recognize your account.</p><h2>What we do not share or track</h2><p>We do not sell personal information or share it for advertising. We keep the account and submission information needed to operate and protect the community. Posts and photos you choose to share are visible only to their intended audience.</p><div className="policy-grid"><article><strong>Private community</strong><span>Community posts, comments, and member details remain behind approved member access.</span></article><article><strong>Approved answers only</strong><span>Community questions never become public FAQs automatically. Every proposed answer requires review.</span></article><article><strong>Owner review</strong><span>Shared resources remain pending until a moderator approves them.</span></article><article><strong>Corrections and removal</strong><span>Families can report outdated information or request removal.</span></article></div><p>This independent guide is not operated by or affiliated with The Culinary Institute of America. Official CIA sources and the student portal remain the authority.</p><div className="policy-actions"><Link to="/corrections">Submit a correction</Link><Link to="/share">Share with the community</Link></div></main></AppShell>;
}