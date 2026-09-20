"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { factsForTerm, termNotice, topics, type Audience, type Term, type TopicKey } from "../guide-data";
import { GuideIcon } from "./guide-icon";
import Link from "next/link";

export { HelpSearch } from "./help-search";

type Props = { initialTopic?: TopicKey; compact?: boolean; embedded?: boolean; showSearch?: boolean };

export function FaqExplorer({ initialTopic, compact = false, embedded = false, showSearch = true }: Props) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<TopicKey | "all">(initialTopic ?? "all");
  const [audience, setAudience] = useState<Audience>("parent");
  const [term, setTerm] = useState<Term>("fall");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedAnswer = params.get("answer");
    if (requestedAnswer) {
      setOpen(requestedAnswer);
      window.requestAnimationFrame(() => {
        document.getElementById(`faq-${requestedAnswer}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
    const storedAudience = window.localStorage.getItem("guide-audience");
    const storedTerm = window.localStorage.getItem("guide-term");
    if (storedAudience === "student" || storedAudience === "parent") setAudience(storedAudience);
    if (storedTerm === "fall" || storedTerm === "spring") setTerm(storedTerm);
    const update = (event: Event) => {
      const detail = (event as CustomEvent<{ kind: string; value: string }>).detail;
      if (detail?.kind === "audience") setAudience(detail.value as Audience);
      if (detail?.kind === "term") setTerm(detail.value as Term);
    };
    window.addEventListener("guide-preference", update);
    return () => window.removeEventListener("guide-preference", update);
  }, []);

  // factsForTerm drops facts that do not belong to the selected term and
  // applies any termOverrides, so the text searched below is the same text the
  // reader will actually be shown -- not the fall wording of a spring answer.
  const results = useMemo(() => factsForTerm(term).filter((fact) => {
    const text = `${fact.studentQ} ${fact.parentQ} ${fact.studentA} ${fact.parentA} ${fact.source}`.toLowerCase();
    return (topic === "all" || fact.category === topic) && text.includes(query.toLowerCase());
  }).slice(0, compact ? 5 : undefined), [query, topic, term, compact]);

  return <div className={`faq-explorer ${embedded ? "embedded" : ""}`}>
    {showSearch && <div className="search-control"><Search aria-hidden="true" /><label className="sr-only" htmlFor="faq-search">Search FAQs</label><input id="faq-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value) }} placeholder="Search housing, meal points, uniforms…" /></div>}
    <div className="explorer-controls">
      <div className="topic-filters" aria-label="Filter by topic">{(["all", ...(Object.keys(topics) as TopicKey[])] as Array<TopicKey | "all">).map((key) => <button type="button" key={key} className={topic === key ? "active" : ""} onClick={() => setTopic(key)}>{key === "all" ? "All" : topics[key].name}</button>)}</div>
    </div>
    {!compact && <p className="result-count" aria-live="polite">{results.length} {results.length === 1 ? "answer" : "answers"}</p>}
    <div className="faq-list">{results.map((fact) => {
      const expanded = open === fact.id;
      return <article className="faq-item" id={`faq-${fact.id}`} key={fact.id}>
        <button type="button" className="faq-question" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : fact.id)}><GuideIcon id={fact.id} /><strong>{audience === "parent" ? fact.parentQ : fact.studentQ}</strong><ChevronDown className={expanded ? "rotate-180" : ""} /></button>
        <div className="faq-answer" hidden={!expanded}><p dangerouslySetInnerHTML={{ __html: audience === "parent" ? fact.parentA : fact.studentA }} /><aside><strong>Next step</strong><p>{audience === "parent" ? fact.stepParent : fact.stepStudent}</p></aside>{termNotice(fact, term) && <p className="term-notice">{termNotice(fact, term)}</p>}<span className={`source-badge ${fact.sourceType}`}>{fact.source}</span><a href={fact.link} target="_blank" rel="noreferrer">{fact.linkLabel} ↗</a></div>
      </article>;
    })}</div>
    {!results.length && <div className="empty-state"><Search /><h2>No answers found</h2><p>Try a shorter search or choose another topic.</p></div>}
    {compact && <Link className="browse-all-faqs" href="/faq">Browse all FAQs</Link>}
  </div>;
}
