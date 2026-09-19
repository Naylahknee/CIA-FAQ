"use client";
/* eslint-disable @next/next/no-img-element */

import { ExternalLink, FileText, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { GuideShell } from "../components/guide-shell";
import { PageHeader } from "../components/page-header";
import { resourceLibrary, type ResourceKind } from "../guide-sections";

const categories = ["All", "Dining", "Academic programs", "Equipment", "Health & safety", "Local guides", "Student tasks"] as const;

export default function ResourcesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [showNav, setShowNav] = useState(false);

  const resources = useMemo(() => resourceLibrary.filter((resource) => (category === "All" || resource.kind === category) && `${resource.title} ${resource.description} ${resource.kind}`.toLowerCase().includes(query.toLowerCase())), [category, query]);

  function search(value: string) { setQuery(value); if (value.trim()) setShowNav(true); }
  function pickTopic(next: (typeof categories)[number]) { setCategory(next); setShowNav(true); }
  function reset() { setQuery(""); setCategory("All"); setShowNav(false); }

  return <GuideShell><main className="help-page">
    <div className="page-wrap"><PageHeader eyebrow="Resource Library" title="Find the guide you need." description="Search and open the documents families use most.">
      <label className="page-search"><Search aria-hidden="true" /><span className="sr-only">Search documents</span><input value={query} onChange={(event) => search(event.target.value)} placeholder="Search documents and guides…" />{query && <button type="button" className="page-search-clear" aria-label="Clear search" onClick={() => search("")}><X aria-hidden="true" /></button>}</label>
    </PageHeader></div>
    <div className={`page-wrap library-layout${showNav ? "" : " full"}`}>
      {showNav && <aside className="category-nav"><h2>Browse by category</h2>{categories.map((item) => <button key={item} type="button" className={category === item ? "active" : ""} onClick={() => pickTopic(item)}>{item}<span>{item === "All" ? resourceLibrary.length : resourceLibrary.filter((resource) => resource.kind === item).length}</span></button>)}</aside>}
      <section className="library-content">
        <div className="library-heading"><div><p className="breadcrumb">Home / Resource Library</p><h2>{category === "All" ? "All resources" : category}</h2></div><span>{resources.length} {resources.length === 1 ? "document" : "documents"}</span></div>
        {resources.length ? <div className="document-grid">{resourceCards(resources, pickTopic)}</div> : <div className="empty-state"><Search aria-hidden="true" /><h2>No documents found</h2><p>Try another search or category.</p><button type="button" className="text-link" onClick={reset}><X aria-hidden="true" />Clear filters</button></div>}
      </section>
    </div>
  </main></GuideShell>;
}

function resourceCards(resources: typeof resourceLibrary, pickTopic: (kind: ResourceKind) => void) {
  return resources.map((resource) => <article className="document-card" key={resource.title}>
    <a className="document-cover" href={resource.href} target="_blank" rel="noreferrer"><img src={resource.cover} alt={`Cover of ${resource.title}`} loading="lazy" /><span><FileText aria-hidden="true" />Guide</span></a>
    <div className="document-body">
      <button type="button" className="document-kind" onClick={() => pickTopic(resource.kind)}>{resource.kind}</button>
      <h3>{resource.title}</h3><p>{resource.description}</p>
      <div><span>{resource.source}</span><a className="document-open" href={resource.href} target="_blank" rel="noreferrer">Open <ExternalLink aria-hidden="true" /></a></div>
    </div>
  </article>);
}
