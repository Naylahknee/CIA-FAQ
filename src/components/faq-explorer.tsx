import { Link } from "@tanstack/react-router";
import { ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { revealSidebar } from "@/lib/sidebar";
import { facts, topics, type Audience, type TopicKey } from "@/data/guide";
import { Button } from "@/components/ui/button";
import { GuideIcon } from "@/components/guide-icon";

type Props = { initialTopic?: TopicKey; compact?: boolean; embedded?: boolean; showSearch?: boolean };

export function FaqExplorer({ initialTopic, compact = false, embedded = false, showSearch = true }: Props) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<TopicKey | "all">(initialTopic ?? "all");
  const [audience, setAudience] = useState<Audience>("parent");
  const [term, setTerm] = useState<"fall"|"spring">("fall");
  const [open, setOpen] = useState<string | null>(null);
  useEffect(()=>{const storedAudience=window.localStorage.getItem("guide-audience");const storedTerm=window.localStorage.getItem("guide-term");if(storedAudience==="student"||storedAudience==="parent")setAudience(storedAudience);if(storedTerm==="fall"||storedTerm==="spring")setTerm(storedTerm);const update=(event:Event)=>{const detail=(event as CustomEvent<{kind:string;value:string}>).detail;if(detail.kind==="audience")setAudience(detail.value as Audience);if(detail.kind==="term")setTerm(detail.value as "fall"|"spring");};window.addEventListener("guide-preference",update);return()=>window.removeEventListener("guide-preference",update);},[]);
  const results = useMemo(() => facts.filter((fact) => {
    const text = `${fact.studentQ} ${fact.parentQ} ${fact.studentA} ${fact.parentA} ${fact.source}`.toLowerCase();
    return (topic === "all" || fact.category === topic) && (!fact.terms || fact.terms.includes(term)) && text.includes(query.toLowerCase());
  }).slice(0, compact ? 5 : undefined), [query, topic, term, compact]);

  return <div className={`faq-explorer ${embedded ? "embedded" : ""}`}>
    {showSearch && <div className="search-control"><Search aria-hidden="true"/><label className="sr-only" htmlFor="faq-search">Search FAQs</label><input id="faq-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); if (event.target.value.trim()) revealSidebar(); }} placeholder="Search housing, meal points, uniforms…" /></div>}
    <div className="explorer-controls">
      <div className="topic-filters" aria-label="Filter by topic">{(["all", ...(Object.keys(topics) as TopicKey[])] as Array<TopicKey | "all">).map((key) => <Button key={key} size="sm" variant={topic === key ? "accent" : "outline"} onClick={() => { setTopic(key); revealSidebar(); }}>{key === "all" ? "All" : topics[key].name}</Button>)}</div>
    </div>
    {!compact && <p className="result-count" aria-live="polite">{results.length} {results.length === 1 ? "answer" : "answers"}</p>}
    <div className="faq-list">{results.map((fact) => {
      const expanded = open === fact.id;
      return <article className="faq-item" key={fact.id}>
        <Button className="faq-question" variant="ghost" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : fact.id)}><GuideIcon id={fact.id}/><strong>{audience === "parent" ? fact.parentQ : fact.studentQ}</strong><ChevronDown className={expanded ? "rotate-180" : ""}/></Button>
        {expanded && <div className="faq-answer"><p dangerouslySetInnerHTML={{ __html: audience === "parent" ? fact.parentA : fact.studentA }} /><aside><strong>Next step</strong><p>{audience === "parent" ? fact.stepParent : fact.stepStudent}</p></aside>{fact.springNotice && <p className="term-notice">{fact.springNotice}</p>}<span className={`source-badge ${fact.sourceType}`}>{fact.source}</span><a href={fact.link} target="_blank" rel="noreferrer">{fact.linkLabel} ↗</a></div>}
      </article>;
    })}</div>
    {!results.length && <div className="empty-state"><Search/><h2>No answers found</h2><p>Try a shorter search or choose another topic.</p></div>}
    {compact && <Button asChild variant="outline"><Link to="/faq">Browse all FAQs</Link></Button>}
  </div>;
}