"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { facts, factsForTerm, topics, type Term } from "../guide-data";
import { useGuidePreferences } from "./guide-shell";
import { GuideIcon } from "./guide-icon";
import Link from "next/link";

type Hit = { id: string; source: "guide" | "community"; refId: string; category: string; href: string; title: string; altTitle: string };
type Row = { key: string; href: string; label: string; topic: string; iconId: string };

const MIN_QUERY = 2;
const DEBOUNCE_MS = 300;

const topicName = (category: string) => topics[category as keyof typeof topics]?.name ?? "Answers";

/** Local substring match over the answers that ship with the build. Used for
 *  the first keystrokes and whenever the index is unreachable, so the search
 *  box is never dead -- families use this site to make travel and money
 *  decisions and "no results" because D1 blinked is worse than a rough match. */
function localRows(query: string, term: Term, audience: "student" | "parent"): Row[] {
  const needle = query.toLowerCase();
  return factsForTerm(term)
    .filter((fact) => `${fact.parentQ} ${fact.studentQ} ${fact.parentA} ${fact.studentA}`.toLowerCase().includes(needle))
    .slice(0, 6)
    .map((fact) => ({ key: fact.id, href: `/faq/${fact.category}?answer=${encodeURIComponent(fact.id)}#faq-${encodeURIComponent(fact.id)}`, label: audience === "parent" ? fact.parentQ : fact.studentQ, topic: topicName(fact.category), iconId: fact.id }));
}

/** Map ranked index hits back onto the records that hold the display data.
 *  The order of `hits` is the relevance order bm25 produced and is preserved
 *  exactly -- nothing here re-sorts. */
function rowsFromHits(hits: Hit[], term: Term, audience: "student" | "parent"): Row[] {
  return hits.map((hit) => {
    const fact = hit.source === "guide" ? facts.find((entry) => entry.id === hit.refId) : undefined;
    if (fact) {
      // The index stores the parent phrasing; show whichever the reader chose.
      const resolved = factsForTerm(term).find((entry) => entry.id === fact.id) ?? fact;
      return { key: hit.id, href: `/faq/${resolved.category}?answer=${encodeURIComponent(resolved.id)}#faq-${encodeURIComponent(resolved.id)}`, label: audience === "parent" ? resolved.parentQ : resolved.studentQ, topic: topicName(resolved.category), iconId: resolved.id };
    }
    return { key: hit.id, href: hit.href, label: hit.title, topic: hit.source === "community" ? "Added by the guide team" : topicName(hit.category), iconId: hit.refId };
  });
}

export function HelpSearch({ title = "How can we help?", compact = false }: { title?: string; compact?: boolean }) {
  const { audience, term } = useGuidePreferences();
  const [query, setQuery] = useState("");
  /** The last answer the index gave, tagged with the request it answers. Held
   *  as one value rather than a list plus a flag so a stale reply can never be
   *  shown against a newer query: the tag is compared during render, which
   *  also means the effect never has to reset state on the way in. */
  const [answer, setAnswer] = useState<{ key: string; hits: Hit[] } | null>(null);
  const [, startTransition] = useTransition();
  const inFlight = useRef<AbortController | null>(null);

  const trimmed = query.trim();
  const requestKey = `${term}\u0000${trimmed}`;
  const local = useMemo(() => (trimmed.length < MIN_QUERY ? [] : localRows(trimmed, term, audience)), [trimmed, term, audience]);

  useEffect(() => {
    if (trimmed.length < MIN_QUERY) return;
    // One request per 300ms pause, not one per keystroke: the cleanup clears
    // the pending timer, so typing continuously issues nothing at all.
    const timer = window.setTimeout(() => {
      inFlight.current?.abort();
      const controller = new AbortController();
      inFlight.current = controller;
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}&term=${term}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`search ${response.status}`))))
        .then((data: { results?: Hit[]; unavailable?: boolean }) => {
          if (controller.signal.aborted || data?.unavailable) return;
          // Non-urgent, so painting a long result list never delays the next
          // keystroke.
          startTransition(() => setAnswer({ key: requestKey, hits: data.results ?? [] }));
        })
        .catch(() => { /* aborted, offline, or the index is down: the local rows stand in */ });
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [trimmed, term, requestKey]);

  // A component unmounting mid-request should not leave the request running.
  useEffect(() => () => inFlight.current?.abort(), []);

  // Anything not tagged with the current query is stale by definition.
  const indexed = answer?.key === requestKey ? answer.hits : null;
  const rows = indexed ? rowsFromHits(indexed, term, audience) : local;
  // Only claim "nothing found" once the index has actually answered for this
  // query; while falling back locally an empty list stays silent.
  const showEmpty = trimmed.length >= MIN_QUERY && indexed !== null && rows.length === 0;
  const id = `help-search-${compact ? "compact" : "main"}`;

  return <section className={`help-search-hero ${compact ? "compact" : ""}`}><div className="help-search-inner">
    {title && <h1>{title}</h1>}
    <div className="help-search-box">
      <Search aria-hidden="true" />
      <label className="sr-only" htmlFor={id}>Search the family guide</label>
      <input id={id} type="search" value={query} onChange={(event) => { setQuery(event.target.value) }} placeholder="Search meals, move-in, classes, health…" autoComplete="off" role="combobox" aria-expanded={rows.length > 0} aria-controls={`${id}-results`} />
      {rows.length > 0 && <div className="help-search-results" id={`${id}-results`} role="listbox">
        {rows.map((row) => <Link key={row.key} href={row.href} role="option" aria-selected="false" onClick={() => setQuery("")}><GuideIcon id={row.iconId} /><span><strong>{row.label}</strong><small>{row.topic}</small></span></Link>)}
      </div>}
      {showEmpty && <div className="help-search-results help-search-empty" id={`${id}-results`}>
        <p>No answer matches “{trimmed}”.</p>
        <small>Try a single word — “meals”, “move-in”, “laundry” — or <Link href="/faq" onClick={() => setQuery("")}>browse every topic</Link>.</small>
      </div>}
    </div>
  </div></section>;
}
