import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { revealSidebar } from "@/lib/sidebar";
import { facts, topics, type Audience } from "@/data/guide";
import { GuideIcon } from "@/components/guide-icon";

export function HelpSearch({ title = "How can we help?", compact = false }: { title?: string; compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState<Audience>("parent");
  useEffect(() => { const sync = () => { const value = window.localStorage.getItem("guide-audience"); if (value === "student" || value === "parent") setAudience(value); }; sync(); window.addEventListener("guide-preference", sync); return () => window.removeEventListener("guide-preference", sync); }, []);
  const matches = useMemo(() => query.trim().length < 2 ? [] : facts.filter((fact) => `${fact.parentQ} ${fact.studentQ} ${fact.parentA} ${fact.studentA}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6), [query]);
  return <section className={`help-search-hero ${compact ? "compact" : ""}`}><div className="help-search-inner">{title && <h1>{title}</h1>}<div className="help-search-box"><Search aria-hidden="true"/><label className="sr-only" htmlFor={`help-search-${compact ? "compact" : "main"}`}>Search the family guide</label><input id={`help-search-${compact ? "compact" : "main"}`} type="search" value={query} onChange={(event) => { setQuery(event.target.value); if (event.target.value.trim()) revealSidebar(); }} placeholder="Search meals, move-in, classes, health…" autoComplete="off"/>{matches.length > 0 && <div className="help-search-results">{matches.map((fact) => <Link key={fact.id} to="/faq/$topic" params={{ topic: fact.category }} onClick={() => setQuery("")}><GuideIcon id={fact.id}/><span><strong>{audience === "parent" ? fact.parentQ : fact.studentQ}</strong><small>{topics[fact.category].name}</small></span></Link>)}</div>}</div></div></section>;
}