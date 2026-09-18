import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { revealSidebar } from "@/lib/sidebar";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { resourceLibrary } from "@/data/guide-sections";

export const Route = createFileRoute("/resources")({ head: () => ({ meta: [{ title: "Resource Library | CIA Family Help Center" }, { name: "description", content: "Search and download CIA family guides, academic documents, equipment lists, and health resources." }, { property: "og:title", content: "Resource Library | CIA Family Help Center" }, { property: "og:description", content: "Search and download CIA family guides and official documents." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: ResourcesPage });
const categories = ["All", "Dining", "Academic programs", "Equipment", "Health & safety", "Local guides", "Student tasks"] as const;

function ResourcesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [showNav, setShowNav] = useState(false);
  const resources = useMemo(() => resourceLibrary.filter((resource) => (category === "All" || resource.kind === category) && `${resource.title} ${resource.description} ${resource.kind}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  function search(value: string) { setQuery(value); if (value.trim()) { setShowNav(true); revealSidebar(); } }
  function pickTopic(next: (typeof categories)[number]) { setCategory(next); setShowNav(true); revealSidebar(); }
  function reset() { setQuery(""); setCategory("All"); setShowNav(false); }
  return <AppShell><main className="help-page"><div className="page-wrap"><PageHeader eyebrow="Resource Library" title="Find the guide you need." description="Search and open the documents families use most."><label className="page-search"><Search/><span className="sr-only">Search documents</span><input value={query} onChange={(event) => search(event.target.value)} placeholder="Search documents and guides…"/>{query && <Button type="button" variant="ghost" size="icon-sm" aria-label="Clear search" onClick={() => search("")}><X/></Button>}</label></PageHeader></div><div className={`page-wrap library-layout${showNav ? "" : " full"}`}>{showNav && <aside className="category-nav"><h2>Browse by category</h2>{categories.map((item) => <Button key={item} variant="ghost" className={category === item ? "active" : ""} onClick={() => pickTopic(item)}>{item}<span>{item === "All" ? resourceLibrary.length : resourceLibrary.filter((resource) => resource.kind === item).length}</span></Button>)}</aside>}<section className="library-content"><div className="library-heading"><div><p className="breadcrumb">Home / Resource Library</p><h2>{category === "All" ? "All resources" : category}</h2></div><span>{resources.length} {resources.length === 1 ? "document" : "documents"}</span></div>{resources.length ? <div className="document-grid">{resources.map((resource) => <article className="document-card" key={resource.title}><a className="document-cover" href={resource.href} target="_blank" rel="noreferrer"><img src={resource.cover} alt={`First page of ${resource.title}`} loading="lazy"/><span><FileText/>PDF</span></a><div className="document-body"><Button type="button" variant="ghost" size="sm" onClick={() => pickTopic(resource.kind)}>{resource.kind}</Button><h3>{resource.title}</h3><p>{resource.description}</p><div><span>{resource.pages} {resource.pages === 1 ? "page" : "pages"}</span><Button asChild variant="outline" size="sm"><a href={resource.href} target="_blank" rel="noreferrer">Open <Download/></a></Button></div></div></article>)}</div> : <div className="empty-state"><Search/><h2>No documents found</h2><p>Try another search or category.</p><Button variant="outline" onClick={reset}><X/>Clear filters</Button></div>}</section></div></main></AppShell>;
}
