import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { FaqExplorer } from "@/components/faq-explorer";
import { GuideRail } from "@/components/dashboard-widgets";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { facts } from "@/data/guide";
import { HelpSearch } from "@/components/help-search";
import { PageHeader } from "@/components/page-header";
import { contacts } from "@/data/guide-sections";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/faq/")({
  head: () => ({ meta: [
    { title: "FAQs & Help — CIA Hyde Park Family Guide" }, { name: "description", content: "Search practical answers for CIA Hyde Park students and families." },
    { property: "og:title", content: "FAQs & Help — CIA Hyde Park Family Guide" }, { property: "og:description", content: "Search practical answers for CIA Hyde Park students and families." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), component: FaqPage,
});

function FaqPage() { const [audience,setAudience]=useState<"parent"|"student">("parent"); useEffect(()=>{const sync=()=>{const a=window.localStorage.getItem("guide-audience");if(a==="parent"||a==="student")setAudience(a);};sync();window.addEventListener("guide-preference",sync);return()=>window.removeEventListener("guide-preference",sync);},[]); return <AppShell><main className="faq-hub page-wrap"><PageHeader eyebrow="Family help center" title="FAQs & Help" description={audience==="student"?"Search approved answers written for students on campus.":"Search approved answers or choose the part of campus life you need help with."}><HelpSearch title="" compact/></PageHeader><div className="faq-hub-layout"><section><p className="eyebrow">Most asked</p><h2>Popular questions</h2><div className="faq-popular">{facts.slice(0,8).map((fact)=><Link key={fact.id} to="/faq/$topic" params={{topic:fact.category}}>{audience==="student"?fact.studentQ:fact.parentQ}<ArrowRight/></Link>)}</div><FaqExplorer embedded compact showSearch={false}/><section className="quick-contact-section"><p className="eyebrow">Quick action assistance</p><h2>Who do I contact?</h2><div className="contact-grid">{contacts.map((contact)=><article key={contact.title}><small>{contact.label}</small><h3>{contact.title}</h3><p>{contact.description}</p><a href={`mailto:${contact.email}`}>{contact.email}</a><a href={`tel:${contact.phone.replace(/-/g,"")}`}>{contact.phone}</a></article>)}</div></section></section><GuideRail/></div></main></AppShell>; }