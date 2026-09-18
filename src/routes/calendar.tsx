import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CalendarDays, ChevronDown, ExternalLink, ListFilter, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { revealSidebar } from "@/lib/sidebar";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { fullDates } from "@/data/guide-sections";
import { listPublishedCalendarEvents } from "@/lib/calendar.functions";
import { academicEventAlt, academicEventDate, academicEventImage } from "@/lib/calendar-display";

export const Route = createFileRoute("/calendar")({ head: () => ({ meta: [{ title: "Calendar — CIA Hyde Park Family Guide" }, { name: "description", content: "Important CIA Hyde Park family planning dates and verification notes." }, { property: "og:title", content: "Calendar — CIA Hyde Park Family Guide" }, { property: "og:description", content: "Important CIA Hyde Park family planning dates and verification notes." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: CalendarPage });

function CalendarPage() {
  const [term, setTerm] = useState<"all" | "Fall 2026" | "Spring 2027">("all");
  const [sort, setSort] = useState<"soonest" | "latest">("soonest");
  const [query, setQuery] = useState("");
  const [experience, setExperience] = useState<"all" | "in_person" | "virtual" | "hybrid">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const publishedEvents = useQuery({ queryKey: ["published-calendar-events"], queryFn: () => listPublishedCalendarEvents() });
  const cutoff = new Date(2026, 8, 18);
  const events = useMemo(() => {
    const academic = fullDates.map((event) => ({ id: `academic-${event.term}-${event.month}-${event.day}-${event.title}`, date: academicEventDate(event), title: event.title, description: event.note, location: null, experience: "in_person", term: event.term, image: academicEventImage(event.title), alt: academicEventAlt(event.title), sourceUrl: null, academic: event }));
    const campus = (publishedEvents.data ?? []).map((event) => ({ id: event.id, date: new Date(event.event_at), title: event.title, description: event.description, location: event.location, experience: event.experience_type, term: new Date(event.event_at).getFullYear() === 2026 ? "Fall 2026" : "Spring 2027", image: event.image_url ?? academicEventImage(event.title), alt: event.image_alt ?? academicEventAlt(event.title), sourceUrl: event.source_url, academic: null }));
    return [...academic, ...campus]
      .filter((event) => event.date >= cutoff)
      .filter((event) => term === "all" || event.term === term)
      .filter((event) => experience === "all" || event.experience === experience)
      .filter((event) => `${event.title} ${event.description ?? ""} ${event.location ?? ""} ${event.term}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (a.date.getTime() - b.date.getTime()) * (sort === "soonest" ? 1 : -1));
  }, [experience, publishedEvents.data, query, sort, term]);

  return <AppShell><main className="calendar-page page-wrap">
    <PageHeader eyebrow="Family calendar" title="Upcoming dates" description="Events and deadlines from September 18, 2026 forward." action={<Button variant="outline" onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen}><SlidersHorizontal/>Filters</Button>}>
      <label className="page-search"><Search/><span className="sr-only">Search calendar</span><input value={query} onChange={(event) => { setQuery(event.target.value); if (event.target.value.trim()) revealSidebar(); }} placeholder="Search events, dates, or locations…"/></label>
    </PageHeader>
    <section className="calendar-browser" aria-label="Upcoming calendar entries">
      <div className="calendar-toolbar">
        <div className="calendar-tabs" role="group" aria-label="Academic term">
          <Button variant={term === "all" ? "default" : "ghost"} size="sm" onClick={() => setTerm("all")}>All upcoming</Button>
          <Button variant={term === "Fall 2026" ? "default" : "ghost"} size="sm" onClick={() => setTerm("Fall 2026")}>Fall 2026</Button>
          <Button variant={term === "Spring 2027" ? "default" : "ghost"} size="sm" onClick={() => setTerm("Spring 2027")}>Spring 2027</Button>
        </div>
      </div>
      {filtersOpen && <div className="calendar-filter-panel">
        <label><span>Sort by</span><span className="calendar-select"><ListFilter/><select value={sort} onChange={(event) => setSort(event.target.value as "soonest" | "latest")}><option value="soonest">Soonest date</option><option value="latest">Latest date</option></select><ChevronDown/></span></label>
        <label><span>Experience</span><span className="calendar-select"><CalendarDays/><select value={experience} onChange={(event) => setExperience(event.target.value as typeof experience)}><option value="all">All experiences</option><option value="in_person">In-person</option><option value="virtual">Virtual</option><option value="hybrid">Hybrid</option></select><ChevronDown/></span></label>
      </div>}
      <div className="calendar-results-meta"><strong>{events.length} upcoming dates</strong><span>Beginning September 18, 2026</span></div>
      {events.length ? <div className="calendar-event-grid">
        {events.map((event) => <article className="calendar-event" key={event.id}><div className="calendar-event-image"><img src={event.image} alt={event.alt} width={1200} height={800} loading="lazy" onError={(image) => { image.currentTarget.src = academicEventImage(event.title); }}/><div className="calendar-event-date"><strong>{event.date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</strong><span>{event.academic?.day ?? event.date.getDate()}</span></div></div><div className="calendar-event-body"><span className="calendar-event-term">{event.academic ? event.term : `Campus event · ${event.experience.replace("_", "-")}`}</span><h2>{event.title}</h2><p className="calendar-event-time">{event.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}{!event.academic && ` · ${event.date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}</p>{event.location && <p className="calendar-event-location"><MapPin/>{event.location}</p>}<p>{event.description}</p>{event.sourceUrl && <a href={event.sourceUrl} target="_blank" rel="noreferrer">View original post <ExternalLink/></a>}</div></article>)}
      </div> : <div className="calendar-empty"><CalendarDays/><h2>No matching dates</h2><p>Try another term or search.</p></div>}
    </section>
    <aside className="calendar-caution"><AlertTriangle/><div><strong>Confirm before booking travel.</strong><p>The student’s current portal and assigned schedule control.</p></div></aside>
  </main></AppShell>;
}