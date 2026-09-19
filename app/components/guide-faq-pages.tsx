"use client";

import { ArrowLeft, ArrowRight, ExternalLink, HeartHandshake } from "lucide-react";
import { useEffect, useState } from "react";
import { facts, topics, type TopicKey } from "../guide-data";
import { arrivalLanes, contacts, costs, resourceLibrary } from "../guide-sections";
import { PageHeader } from "./page-header";
import { TravelMatrix } from "./travel-matrix";
import { HelpSearch } from "./help-search";
import { FaqExplorer } from "./faq-explorer";
import { GuideRail } from "./guide-rail";
import Link from "next/link";


type PublishedFaq = { id: string; question: string; answer: string; category: string; sourceUrl: string | null };

/** Entries published from /admin. These live in the database rather than in
 *  guide-data.ts, so the site owner can add an answer without a code change or
 *  a deployment. The section hides itself entirely when there are none. */
function PublishedFaqs() {
  const [faqs, setFaqs] = useState<PublishedFaq[]>([]);
  useEffect(() => {
    let active = true;
    fetch("/api/faqs/community")
      .then((response) => response.json())
      .then((data: { faqs?: PublishedFaq[] }) => { if (active) setFaqs(data.faqs ?? []); })
      .catch(() => { /* the hand-written FAQs above still stand on their own */ });
    return () => { active = false; };
  }, []);

  if (!faqs.length) return null;

  return <section className="published-faqs">
    <p className="eyebrow">Recently added</p><h2>Answers added since the last update</h2>
    <div className="published-faq-list">{faqs.map((faq) => <article key={faq.id}>
      <h3>{faq.question}</h3>
      <p>{faq.answer}</p>
      {faq.sourceUrl && <a href={faq.sourceUrl} target="_blank" rel="noreferrer">Official source <ExternalLink aria-hidden="true" /></a>}
    </article>)}</div>
  </section>;
}

export function FaqHub() {
  const [audience, setAudience] = useState<"parent" | "student">("parent");
  useEffect(() => {
    const sync = () => { const value = window.localStorage.getItem("guide-audience"); if (value === "parent" || value === "student") setAudience(value); };
    sync();
    window.addEventListener("guide-preference", sync);
    return () => window.removeEventListener("guide-preference", sync);
  }, []);

  return <><main className="faq-hub page-wrap">
    <PageHeader eyebrow="Family help center" title="FAQs & Help" description={audience === "student" ? "Search approved answers written for students on campus." : "Search approved answers or choose the part of campus life you need help with."}><HelpSearch title="" compact /></PageHeader>
    <div className="faq-hub-layout">
      <section>
        <p className="eyebrow">Most asked</p><h2>Popular questions</h2>
        <div className="faq-popular">{facts.slice(0, 8).map((fact) => <Link key={fact.id} href={`/faq/${fact.category}`}>{audience === "student" ? fact.studentQ : fact.parentQ}<ArrowRight /></Link>)}</div>
        <FaqExplorer embedded compact showSearch={false} />
        <PublishedFaqs />
        <section className="quick-contact-section">
          <p className="eyebrow">Quick action assistance</p><h2>Who do I contact?</h2>
          <div className="contact-grid">{contacts.map((contact) => <article key={contact.title}><small>{contact.label}</small><h3>{contact.title}</h3><p>{contact.description}</p><a href={`mailto:${contact.email}`}>{contact.email}</a><a href={`tel:${contact.phone.replace(/-/g, "")}`}>{contact.phone}</a></article>)}</div>
        </section>
      </section>
      <GuideRail />
    </div>
  </main></>;
}

export function TopicPage({ topic }: { topic: string }) {
  const key = topic as TopicKey;
  const item = topics[key];
  if (!item) return <><main className="page-wrap topic-page"><PageHeader eyebrow="Topic guide" title="This FAQ topic is unavailable." description="Choose another section of the help center." /><Link className="header-back-link" href="/faq"><ArrowLeft size={16} /> Help Center</Link></main></>;

  const related = resourceLibrary.filter((resource) => key === "health" ? resource.kind === "Health & safety"
    : key === "classes" ? resource.kind === "Academic programs" || resource.kind === "Equipment"
    : key === "money" ? resource.kind === "Student tasks"
    : key === "arrival" ? resource.kind === "Student tasks" || resource.kind === "Local guides"
    : resource.kind === "Dining").slice(0, 3);

  return <><main className="page-wrap topic-page">
    <PageHeader eyebrow="Topic guide" title={`${item.name}, explained.`} description={item.description} action={<Link className="header-back-link" href="/faq"><ArrowLeft size={16} /> Help Center</Link>}><HelpSearch title="" compact /></PageHeader>
    <div className="topic-workspace">
      <div className="topic-content">
        <FaqExplorer initialTopic={key} embedded showSearch={false} />
        {key === "money" && <section className="detail-panel"><h2>Fall 2026 planning rates</h2><p>Use the student&rsquo;s actual bill as the final authority.</p><div className="cost-table">{costs.map(([charge, timing, amount]) => <div key={charge}><strong>{charge}</strong><span>{timing}</span><b>{amount}</b></div>)}</div></section>}
        {key === "arrival" && <>
          <section className="detail-panel"><h2>Your arrival-day game plan</h2><div className="lane-grid">{arrivalLanes.map((lane) => <article key={lane.title}><h3>{lane.title}</h3><p>{lane.subtitle}</p><ol>{lane.steps.map((step) => <li key={step}>{step}</li>)}</ol></article>)}</div></section>
          <section className="detail-panel"><h2>Getting to campus</h2><TravelMatrix /></section>
        </>}
        {key === "living" && <section className="detail-panel"><h2>The first-month reset</h2><div className="lane-grid">
          <article><h3>For students</h3><p>Build your operating system.</p><ul><li>Check CIA email every day.</li><li>Protect one clean uniform.</li><li>Learn the point system.</li><li>Save the right contacts.</li><li>Ask early.</li></ul></article>
          <article><h3>For parents</h3><p>Support without becoming the portal.</p><ul><li>Agree on a check-in rhythm.</li><li>Use your own access.</li><li>Ask what they tried first.</li><li>Watch the budget, not every meal.</li><li>Know the escalation line.</li></ul></article>
        </div></section>}
        <section className="detail-panel"><h2>Related resources</h2><div className="related-files">{related.map((resource) => <a key={resource.title} href={resource.href} target="_blank" rel="noreferrer"><b>{resource.format}</b><span><strong>{resource.title}</strong><small>{resource.kind}</small></span></a>)}</div></section>
      </div>
      <aside className="topic-aside">
        <section><h2>In this section</h2><nav>{["Overview", "Questions & answers", "Related resources", "Official sources"].map((label) => <a key={label} href={label === "Overview" ? "#top" : "#"}>{label}</a>)}</nav></section>
        <section><h2>Common questions</h2>{Object.entries(topics).filter(([topicKey]) => topicKey !== key).slice(0, 3).map(([topicKey, value]) => <Link key={topicKey} href={`/faq/${topicKey}`}>{value.name} <span>→</span></Link>)}</section>
        <section className="support-callout"><HeartHandshake /><h2>Need immediate support?</h2><p>For immediate danger or a life-threatening emergency, call 911.</p><Link href="/safety">Safety resources</Link></section>
        <section><ExternalLink /><h2>Confirm current details</h2><p>Schedules, charges, contacts, and policies can change. Follow each answer&rsquo;s official source.</p></section>
      </aside>
    </div>
  </main></>;
}
