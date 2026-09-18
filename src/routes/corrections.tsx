import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/corrections")({
  head: () => ({ meta: [
    { title: "Corrections — CIA Hyde Park Family Guide" },
    { name: "description", content: "Report outdated information or a broken link in the CIA Hyde Park Family Guide." },
    { property: "og:title", content: "Corrections — CIA Hyde Park Family Guide" },
    { property: "og:description", content: "Help keep dates, prices, contacts, links, and policies accurate." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: CorrectionsPage,
});

function CorrectionsPage() {
  return <AppShell><main id="top" className="page-wrap policy-page"><p className="eyebrow">Keep the guide accurate</p><h1>Submit a correction</h1><p>Report an outdated date, price, phone number, link, policy, or missing answer. Include an official source whenever possible.</p><section className="policy-callout"><h2>Send it for review</h2><p>Post the correction in the private parent community so a moderator can verify it. Community suggestions remain private and never publish to the public FAQ automatically.</p><Link to="/community">Open the parent community</Link></section><Link className="policy-back" to="/faq">Return to FAQs &amp; Help</Link></main></AppShell>;
}