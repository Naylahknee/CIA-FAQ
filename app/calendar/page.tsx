"use client";
/* eslint-disable @next/next/no-img-element */

import { AlertTriangle, CalendarDays, ChevronDown, ListFilter, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { GuideShell } from "../components/guide-shell";
import { PageHeader } from "../components/page-header";
import { fullDates, academicEventAlt, academicEventDate, academicEventImage } from "../guide-sections";

const cutoff = new Date(2026, 8, 18);

export default function CalendarPage() {
  const [term, setTerm] = useState<"all" | "Fall 2026" | "Spring 2027">("all");
  const [sort, setSort] = useState<"soonest" | "latest">("soonest");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const events = useMemo(() => fullDates
    .map((event) => ({ id: `academic-${event.term}-${event.month}-${event.day}-${event.title}`, date: academicEventDate(event), title: event.title, description: event.note, term: event.term, day: event.day, image: academicEventImage(event.title), alt: academicEventAlt(event.title) }))
    .filter((event) => event.date >= cutoff)
    .filter((event) => term === "all" || event.term === term)
    .filter((event) => `${event.title} ${event.description ?? ""} ${event.term}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.date.getTime() - b.date.getTime()) * (sort === "soonest" ? 1 : -1)), [query, sort, term]);

  return <GuideShell><main className="calendar-page page-wrap">
    <PageHeader eyebrow="Family calendar" title="Upcoming dates" description="Events and deadlines from September 18, 2026 forward." action={<button type="button" className="calendar-filter-toggle" onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen}><SlidersHorizontal aria-hidden="true" />Filters</button>}>
      <label className="page-search"><Search aria-hidden="true" /><span className="sr-only">Search calendar</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events, dates, or locations…" /></label>
    </PageHeader>
    <section className="calendar-browser" aria-label="Upcoming calendar entries">
      <div className="calendar-toolbar">
        <div className="calendar-tabs" role="group" aria-label="Academic term">
          {(["all", "Fall 2026", "Spring 2027"] as const).map((value) => <button key={value} type="button" className={term === value ? "active" : ""} onClick={() => setTerm(value)}>{value === "all" ? "All upcoming" : value}</button>)}
        </div>
      </div>
      {filtersOpen && <div className="calendar-filter-panel">
        <label><span>Sort by</span><span className="calendar-select"><ListFilter aria-hidden="true" /><select value={sort} onChange={(event) => setSort(event.target.value as "soonest" | "latest")}><option value="soonest">Soonest date</option><option value="latest">Latest date</option></select><ChevronDown aria-hidden="true" /></span></label>
      </div>}
      <div className="calendar-results-meta"><strong>{events.length} upcoming dates</strong><span>Beginning September 18, 2026</span></div>
      {events.length ? <div className="calendar-event-grid">
        {events.map((event) => <article className="calendar-event" key={event.id}>
          <div className="calendar-event-image"><img src={event.image} alt={event.alt} width={1200} height={800} loading="lazy" /><div className="calendar-event-date"><strong>{event.date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</strong><span>{event.day}</span></div></div>
          <div className="calendar-event-body"><span className="calendar-event-term">{event.term}</span><h2>{event.title}</h2><p className="calendar-event-time">{event.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p><p>{event.description}</p></div>
        </article>)}
      </div> : <div className="calendar-empty"><CalendarDays aria-hidden="true" /><h2>No matching dates</h2><p>Try another term or search.</p></div>}
    </section>
    <aside className="calendar-caution"><AlertTriangle aria-hidden="true" /><div><strong>Confirm before booking travel.</strong><p>The student&rsquo;s current portal and assigned schedule control.</p></div></aside>
  </main></GuideShell>;
}
