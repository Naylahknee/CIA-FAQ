import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/share")({
  head: () => ({ meta: [
    { title: "Share — CIA Hyde Park Family Guide" },
    { name: "description", content: "Share a useful resource or family memory with the private CIA parent community." },
    { property: "og:title", content: "Share — CIA Hyde Park Family Guide" },
    { property: "og:description", content: "Submit a resource, question, event, or memory for moderator review." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: SharePage,
});

function SharePage() {
  return <AppShell><main id="top" className="page-wrap policy-page"><p className="eyebrow">Share with the village</p><h1>Submit a resource or memory</h1><p>Signed-in parents can share questions, resources, events, photos, and memories from the community composer. Every item is subject to moderation.</p><section className="policy-callout"><h2>Share in the private group</h2><p>Your post stays within the approved-member community. It will not appear in the public FAQ unless it is separately reviewed and approved.</p><Link to="/community">Go to the community</Link></section><Link className="policy-back" to="/privacy">Read the privacy policy</Link></main></AppShell>;
}