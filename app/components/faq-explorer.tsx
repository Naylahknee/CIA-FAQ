"use client";

import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { facts, topics, type TopicKey } from "../guide-data";
import { useGuidePreferences } from "./guide-shell";

type Props = { initialTopic?: TopicKey; initialQuery?: string; compact?: boolean };

export function HelpSearch({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => query.trim().length < 2 ? [] : facts.filter((fact) => `${fact.parentQ} ${fact.studentQ} ${fact.parentA} ${fact.studentA}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6), [query]);
  return <div className={`redesign-search ${compact ? "compact" : ""}`}>
    <Search aria-hidden="true" />
    <label className="sr-only" htmlFor={compact ? "guide-search-compact" : "guide-search"}>Search the guide</label>
    <input id={compact ? "guide-search-compact" : "guide-search"} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search meals, move-in, classes, health…" autoComplete="off" />
    {matches.length > 0 && <div className="search-results">{matches.map((fact) => <a key={fact.id} href={`/faq/${fact.category}?q=${encodeURIComponent(fact.id)}`} onClick={() => setQuery("")}><strong>{fact.parentQ}</strong><small>{topics[fact.category].name}</small></a>)}</div>}
  </div>;
}

export function FaqExplorer({ initialTopic, initialQuery = "", compact = false }: Props) {
  const { audience, term } = useGuidePreferences();
  const [query, setQuery] = useState(initialQuery);
  const [topic, setTopic] = useState<TopicKey | "all">(initialTopic ?? "all");
  const [open, setOpen] = useState<string | null>(initialQuery || compact ? null : facts[0]?.id ?? null);
  const results = useMemo(() => facts.filter((fact) => {
    const copy = `${fact.parentQ} ${fact.studentQ} ${fact.parentA} ${fact.studentA} ${fact.source}`.toLowerCase();
    return (topic === "all" || fact.category === topic) && (!fact.terms || fact.terms.includes(term)) && copy.includes(query.toLowerCase());
  }).slice(0, compact ? 6 : undefined), [compact, query, term, topic]);

  return <section className="redesign-faq-explorer" aria-label="Frequently asked questions">
    {!compact && <div className="faq-search-row"><Search aria-hidden="true" /><label className="sr-only" htmlFor="faq-search">Search all help content</label><input id="faq-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search all help content" /></div>}
    <div className="faq-topic-filters" aria-label="Filter FAQs by topic">
      <button className={topic === "all" ? "active" : ""} type="button" onClick={() => setTopic("all")}>All</button>
      {(Object.keys(topics) as TopicKey[]).map((key) => <button key={key} className={topic === key ? "active" : ""} type="button" onClick={() => setTopic(key)}>{topics[key].name}</button>)}
    </div>
    <p className="faq-count" aria-live="polite">{results.length} {results.length === 1 ? "answer" : "answers"}</p>
    <div className="redesign-accordion">
      {results.map((fact) => {
        const expanded = open === fact.id;
        const answer = audience === "parent" ? fact.parentA : fact.studentA;
        const nextStep = audience === "parent" ? fact.stepParent : fact.stepStudent;
        const override = term === "spring" ? fact.termOverrides?.spring : undefined;
        return <article key={fact.id} className={expanded ? "open" : ""}>
          <h3><button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : fact.id)}><span>{audience === "parent" ? fact.parentQ : fact.studentQ}</span><ChevronDown aria-hidden="true" /></button></h3>
          {expanded && <div className="faq-answer"><p dangerouslySetInnerHTML={{ __html: override?.[audience === "parent" ? "parentA" : "studentA"] ?? answer }} /><aside><strong>Next step</strong><p>{override?.[audience === "parent" ? "stepParent" : "stepStudent"] ?? nextStep}</p></aside>{fact.springNotice && term === "spring" && <p className="faq-term-notice">{fact.springNotice}</p>}<p className={`faq-source ${override?.sourceType ?? fact.sourceType}`}>{override?.source ?? fact.source}</p><a href={fact.link} target="_blank" rel="noreferrer">{fact.linkLabel} ↗</a></div>}
        </article>;
      })}
    </div>
    {!results.length && <div className="faq-empty"><Search aria-hidden="true" /><h3>No answers found</h3><p>Try a shorter search or another topic.</p></div>}
  </section>;
}
