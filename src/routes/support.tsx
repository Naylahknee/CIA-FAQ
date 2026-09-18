import { Link, createFileRoute } from "@tanstack/react-router";
import { Coffee } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [
    { title: "Support the Guide — CIA Hyde Park Family Guide" },
    { name: "description", content: "Help support the time and costs required to keep the independent CIA Hyde Park Family Guide current." },
    { property: "og:title", content: "Support the Guide — CIA Hyde Park Family Guide" },
    { property: "og:description", content: "Optional support helps keep this independent family guide current and free to read." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: SupportPage,
});

function SupportPage() {
  return <AppShell><main id="top" className="page-wrap policy-page"><p className="eyebrow">An independent family guide &amp; FAQ</p><h1>Support the Guide</h1><p>If this guide saved you time—or a few frantic parent texts—you can help support the work and costs of keeping it current. Giving is optional, and the FAQs stay free.</p><section className="policy-callout support-callout-card"><Coffee/><div><h2>Help keep the guide going</h2><p>Your contribution is processed securely by Buy Me a Coffee.</p><a href="https://buymeacoffee.com/tq4yIJli7f" target="_blank" rel="noopener noreferrer">Buy me a coffee</a></div></section><Link className="policy-back" to="/privacy">Read the privacy policy</Link></main></AppShell>;
}