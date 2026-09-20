"use client";

import { AlertTriangle, CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Download, ExternalLink, Search, SlidersHorizontal, Target } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { PageHeader } from "../components/page-header";
import { TravelMatrix } from "../components/travel-matrix";
import { useGuidePreferences } from "../components/guide-shell";
import { EVENT_TYPES, familyWeekend, fullDates, academicEventDate, academicEventType, type EventType } from "../guide-sections";

const cutoff = new Date(2026, 8, 18);
const TODAY = new Date(2026, 8, 18);
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const TYPE_COLORS: Record<EventType, { bg: string; fg: string }> = {
  Deadline: { bg: "var(--destructive)", fg: "var(--destructive-foreground)" },
  Academic: { bg: "var(--primary)", fg: "var(--primary-foreground)" },
  "No classes": { bg: "var(--accent)", fg: "var(--accent-foreground)" },
  Campus: { bg: "var(--chart-2)", fg: "var(--primary-foreground)" },
};

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function icsEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

function buildICS(events: { id: string; date: Date; title: string; note: string }[]) {
  const stamp = `${isoDate(new Date()).replace(/-/g, "")}T000000Z`;
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CIA Hyde Park Family Guide//Calendar//EN"];
  events.forEach((event) => {
    const start = isoDate(event.date).replace(/-/g, "");
    const end = new Date(event.date);
    end.setDate(end.getDate() + 1);
    lines.push("BEGIN:VEVENT", `UID:${event.id}@cia-family-guide`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${isoDate(end).replace(/-/g, "")}`, `SUMMARY:${icsEscape(event.title)}`, `DESCRIPTION:${icsEscape(event.note)}`, "END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadICS(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function dotStyle(color: string, size = 8): CSSProperties {
  return { width: size, height: size, borderRadius: "50%", background: color, flex: "none" };
}

function audienceDetails(title: string, note: string, audience: "parent" | "student") {
  const value = title.toLowerCase();
  if (audience === "student") {
    if (value.includes("family weekend")) return "Confirm classes, kitchen or bakeshop blocks, work shifts, competitions, and team obligations before making plans with visiting family.";
    if (value.includes("refund") || value.includes("add/drop") || value.includes("waiver") || value.includes("opt-out")) return "Check your CIA account and complete any required action before the deadline. Ask Student Financial & Registration Services if something does not match your record.";
    if (value.includes("break") || value.includes("holiday") || value.includes("no classes")) return "No classes does not always mean no obligations. Check your actual kitchen, bakeshop, restaurant, work, or residence-hall instructions before making travel plans.";
    if (value.includes("career fair")) return "Prepare your résumé and professional attire early, then confirm your participation details with CIA.";
    return note;
  }

  if (value.includes("family weekend")) return "Confirm the official Family Weekend schedule, registration, lodging, restaurant reservations, and your student’s class or work commitments before you travel.";
  if (value.includes("refund") || value.includes("add/drop") || value.includes("waiver") || value.includes("opt-out")) return "If you are an authorized proxy, review the student account together and make sure the student completes any required CIA action before the deadline.";
  if (value.includes("break") || value.includes("holiday") || value.includes("no classes")) return "Before booking travel, have your student confirm their actual kitchen, bakeshop, restaurant, work, and residence-hall instructions.";
  if (value.includes("career fair")) return "Encourage your student to prepare early and avoid scheduling travel that conflicts with this professional opportunity.";
  if (value.includes("commencement")) return "Wait for CIA’s guest, ticket, and ceremony instructions before purchasing nonrefundable travel.";
  return note;
}

export default function CalendarPage() {
  const { audience, term: guideTerm, setTerm: setGuideTerm } = useGuidePreferences();
  const allEvents = useMemo(
    () =>
      fullDates
        .map((event) => ({
          id: `academic-${event.term}-${event.month}-${event.day}-${event.title}`,
          date: academicEventDate(event),
          title: event.title,
          note: event.note,
          term: event.term,
          type: academicEventType(event.title),
        }))
        .filter((event) => event.date >= cutoff),
    [],
  );

  const [year, setYear] = useState(TODAY.getFullYear());
  const [month, setMonth] = useState(TODAY.getMonth());
  const [selected, setSelected] = useState(isoDate(allEvents[0]?.date ?? TODAY));
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTypes, setActiveTypes] = useState<EventType[]>([]);

  const selectedTerm = guideTerm === "fall" ? "Fall 2026" : "Spring 2027";

  useEffect(() => {
    const selectedYear = new Date(`${selected}T12:00:00`).getFullYear();
    const termYear = selectedTerm === "Fall 2026" ? 2026 : 2027;
    if (selectedYear === termYear) return;
    const firstEvent = allEvents.find((event) => event.term === selectedTerm);
    if (!firstEvent) return;
    setYear(firstEvent.date.getFullYear());
    setMonth(firstEvent.date.getMonth());
    setSelected(isoDate(firstEvent.date));
  }, [allEvents, selected, selectedTerm]);

  function selectTerm(nextGuideTerm: "fall" | "spring") {
    const nextTerm = nextGuideTerm === "fall" ? "Fall 2026" : "Spring 2027";
    const firstEvent = allEvents.find((event) => event.term === nextTerm);
    setGuideTerm(nextGuideTerm);
    if (firstEvent) {
      setYear(firstEvent.date.getFullYear());
      setMonth(firstEvent.date.getMonth());
      setSelected(isoDate(firstEvent.date));
    }
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allEvents.filter((event) => {
      if (event.term !== selectedTerm) return false;
      if (activeTypes.length && !activeTypes.includes(event.type)) return false;
      if (q && !`${event.title} ${event.note} ${event.term}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allEvents, selectedTerm, activeTypes, query]);

  const byDate = useMemo(() => {
    const map = new Map<string, typeof visible>();
    visible.forEach((event) => {
      const key = isoDate(event.date);
      map.set(key, [...(map.get(key) ?? []), event]);
    });
    return map;
  }, [visible]);

  const sorted = useMemo(() => visible.slice().sort((a, b) => a.date.getTime() - b.date.getTime()), [visible]);

  const first = new Date(year, month, 1);
  const lead = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthKey = monthPrefix;
  const todayKey = isoDate(TODAY);

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m);
    setYear(y);
  }

  const selectedEvents = byDate.get(selected) ?? [];
  const nextAfter = sorted.find((event) => isoDate(event.date) > selected) ?? sorted[0];
  const selectedDate = new Date(`${selected}T12:00:00`);
  const selectedEventDetails = selectedEvents.map((event) => ({ event, detail: audienceDetails(event.title, event.note, audience) }));
  const needsExpandedSelectedDetails = selectedEventDetails.length > 1 || selectedEventDetails.some(({ detail }) => detail.length > 165);

  const upNext = sorted.filter((event) => isoDate(event.date).startsWith(monthPrefix)).slice(0, 4);

  return (
    <>
      <main className="calendar-page page-wrap">
        <PageHeader
          eyebrow="Family calendar"
          title="Upcoming dates"
          description={`Pick a date to see ${audience === "parent" ? "family planning details" : "your next steps"}. Showing ${selectedTerm}.`}
          action={
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="calendar-filter-toggle" onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen}>
                <SlidersHorizontal aria-hidden="true" />Filters
              </button>
              <button
                type="button"
                className="calendar-filter-toggle"
                onClick={() => downloadICS("cia-hyde-park-calendar.ics", buildICS(visible))}
              >
                <Download aria-hidden="true" />Export
              </button>
            </div>
          }
        >
          <div className="calendar-browser">
            <div className="calendar-toolbar">
              <label className="calendar-search">
                <Search aria-hidden="true" />
                <span className="sr-only">Search calendar</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events, dates, or terms…" />
              </label>
              <div className="calendar-tabs" role="group" aria-label="Academic term">
                {(["fall", "spring"] as const).map((value) => (
                  <button key={value} type="button" className={guideTerm === value ? "active" : ""} onClick={() => selectTerm(value)}>
                    {value === "fall" ? "Fall 2026" : "Spring 2027"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="calendar-today"
                onClick={() => { setYear(TODAY.getFullYear()); setMonth(TODAY.getMonth()); setSelected(todayKey); }}
              >
                <Target aria-hidden="true" />Today
              </button>
            </div>
            {filtersOpen && (
              <div className="calendar-filter-panel">
                <p>Filter by type</p>
                <div className="calendar-type-filters">
                  {EVENT_TYPES.map((t) => {
                    const on = activeTypes.includes(t);
                    const colors = TYPE_COLORS[t];
                    return (
                      <button
                        key={t}
                        type="button"
                        className="calendar-type-chip"
                        style={on ? { background: colors.bg, color: colors.fg, borderColor: colors.bg } : undefined}
                        onClick={() => setActiveTypes((current) => (on ? current.filter((x) => x !== t) : [...current, t]))}
                      >
                        <span style={dotStyle(on ? colors.fg : colors.bg)} />{t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </PageHeader>

        <div className="calendar-layout">
          <section>
            <div className="calendar-month-nav">
              <h2>{MONTHS[month]} {year}</h2>
              <div>
                <button type="button" className="calendar-nav-btn" aria-label="Previous month" onClick={() => shiftMonth(-1)}><ChevronLeft aria-hidden="true" /></button>
                <button type="button" className="calendar-nav-btn" aria-label="Next month" onClick={() => shiftMonth(1)}><ChevronRight aria-hidden="true" /></button>
              </div>
            </div>

            <div className="calendar-weekdays">
              {WEEKDAYS.map((day) => <div key={day}>{day}</div>)}
            </div>

            <div className="calendar-grid" key={monthKey}>
              {Array.from({ length: lead }, (_, i) => <div key={`lead-${i}`} className="calendar-cell-empty" />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const key = isoDate(new Date(year, month, day));
                const dayEvents = byDate.get(key) ?? [];
                const isSelected = key === selected;
                const isToday = key === todayKey;
                const hasEvents = dayEvents.length > 0;
                const classes = ["calendar-cell", hasEvents && "has-events", isToday && "today", isSelected && "selected"].filter(Boolean).join(" ");
                return (
                  <button key={key} type="button" className={classes} onClick={() => setSelected(key)}>
                    <span className="calendar-cell-num">{day}</span>
                    <span className="calendar-cell-dots">
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <span key={idx} style={dotStyle(isSelected ? "var(--primary-foreground)" : TYPE_COLORS[event.type].bg, 5)} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="calendar-legend">
              {EVENT_TYPES.map((t) => (
                <div key={t}><span style={dotStyle(TYPE_COLORS[t].bg)} />{t}</div>
              ))}
            </div>
          </section>

          <aside className="calendar-rail">
            <div className="calendar-rail-card" key={selected}>
              <div className="calendar-rail-date">
                <div className="calendar-rail-daynum">{selectedDate.getDate()}</div>
                <div>
                  <strong>{selectedDate.toLocaleDateString("en-US", { weekday: "long" })}</strong>
                  <span>{selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                </div>
                <div className="calendar-rail-count">{selectedEvents.length === 0 ? "Open day" : `${selectedEvents.length} ${selectedEvents.length === 1 ? "item" : "items"}`}</div>
              </div>

              {selectedEvents.length > 0 ? (
                <div className="calendar-rail-events">
                  {selectedEventDetails.map(({ event, detail }) => {
                    const colors = TYPE_COLORS[event.type];
                    const showBelow = selectedEventDetails.length > 1 || detail.length > 165;
                    const railDetail = showBelow ? `${detail.slice(0, 158).trimEnd()}…` : detail;
                    return (
                      <article className="calendar-rail-event" key={event.id}>
                        <div>
                          <span className="calendar-type-tag" style={{ background: colors.bg, color: colors.fg }}>{event.type}</span>
                          <span className="calendar-event-term">{event.term}</span>
                        </div>
                        <h3>{event.title}</h3>
                        <p>{railDetail}</p>
                        {showBelow && <span className="calendar-rail-overflow">Full planning details are below the calendar.</span>}
                        <footer>
                          <button type="button" className="calendar-ics-btn" onClick={() => downloadICS(`${event.id}.ics`, buildICS([event]))}>
                            <CalendarPlus aria-hidden="true" />Add to calendar
                          </button>
                        </footer>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="calendar-empty">
                  <CalendarDays aria-hidden="true" />
                  <p style={{ margin: "12px 0 4px", fontWeight: 700 }}>Nothing scheduled</p>
                  <p style={{ margin: 0 }}>
                    {nextAfter ? `The next date with something on it is ${nextAfter.date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}.` : "No matching dates on the calendar."}
                  </p>
                  {nextAfter && (
                    <button type="button" className="calendar-ics-btn" style={{ marginTop: 14 }} onClick={() => { setYear(nextAfter.date.getFullYear()); setMonth(nextAfter.date.getMonth()); setSelected(isoDate(nextAfter.date)); }}>
                      Jump to it
                    </button>
                  )}
                </div>
              )}
            </div>

          </aside>
        </div>

        {upNext.length > 0 && (
          <section className="calendar-upnext calendar-upnext-below" aria-label="Next up this month">
            <p>Next up this month</p>
            {upNext.map((event) => (
              <button key={event.id} type="button" onClick={() => setSelected(isoDate(event.date))}>
                <span className="calendar-upnext-date">{event.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span className="calendar-upnext-title">{event.title}</span>
                <span style={dotStyle(TYPE_COLORS[event.type].bg)} />
              </button>
            ))}
          </section>
        )}

        {needsExpandedSelectedDetails && (
          <section className="calendar-selected-summary" aria-live="polite" aria-labelledby="selected-date-heading">
            <p className="eyebrow">Full planning details</p>
            <h2 id="selected-date-heading">{selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h2>
            <div className="calendar-selected-events">
              {selectedEventDetails.map(({ event, detail }) => {
                const hasArt = event.title.toLowerCase().includes("family weekend");
                return (
                  <article className={hasArt ? "calendar-selected-event has-art" : "calendar-selected-event"} key={`selected-${event.id}`}>
                    {hasArt && <img src="/calendar/family-weekend-2026.png" alt="CIA Family Weekend 2026" />}
                    <div>
                      <span className="calendar-event-term">{event.term}</span>
                      <h3>{event.title}</h3>
                      <p>{detail}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {selectedTerm === "Fall 2026" && <section className="family-weekend-panel" aria-labelledby="family-weekend-heading">
          <header>
            <img className="family-weekend-art" src="/calendar/family-weekend-2026.png" alt="CIA Family Weekend 2026" />
            <div>
              <p className="eyebrow">{familyWeekend.campus}</p>
              <h2 id="family-weekend-heading">{familyWeekend.title}</h2>
              <p className="family-weekend-dates"><time dateTime={familyWeekend.startsISO}>{familyWeekend.dateLabel}</time></p>
              <p className="family-weekend-summary">{familyWeekend.summary}</p>
            </div>
          </header>

          <aside className="family-weekend-deadline">
            <AlertTriangle aria-hidden="true" />
            <div>
              <strong>Book restaurant tables by {familyWeekend.deadline.label}</strong>
              <p>{familyWeekend.deadline.what}</p>
            </div>
          </aside>

          <div className="family-weekend-columns">
            <section>
              <h3>What it costs</h3>
              <p className="fw-note">{familyWeekend.registration.required}</p>
              <dl className="fw-tiers">
                {familyWeekend.registration.tiers.map(([who, cost]) => (
                  <div key={who}><dt>{who}</dt><dd>{cost}</dd></div>
                ))}
              </dl>
              <p className="fw-note"><strong>Included:</strong> {familyWeekend.registration.included}</p>
              <p className="fw-note"><strong>Not included:</strong> {familyWeekend.registration.notIncluded}</p>
              <p className="fw-warn">{familyWeekend.registration.warning}</p>
            </section>

            <section>
              <h3>Check in first</h3>
              <p className="fw-note">{familyWeekend.checkIn.note}</p>
              <ul className="fw-checkin">
                {familyWeekend.checkIn.times.map(([day, time, place]) => (
                  <li key={day}><strong>{day}</strong><span>{time}</span><small>{place}</small></li>
                ))}
              </ul>
            </section>
          </div>

          <h3 className="fw-section-heading">Schedule</h3>
          <div className="family-weekend-schedule">
            {familyWeekend.schedule.map((day) => (
              <section key={day.day}>
                <h4>{day.day}</h4>
                <ul>
                  {day.items.map(([time, what, where]) => (
                    <li key={`${day.day}-${time}-${what}`}><time>{time}</time><span><strong>{what}</strong><small>{where}</small></span></li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <h3 className="fw-section-heading">Planning your visit</h3>
          <div className="family-weekend-grid">
            {familyWeekend.planning.map((item) => (
              <article key={item.title}>
                <h4>{item.title}</h4>
                <p>{item.body}</p>
              </article>
            ))}
          </div>

          <div className="family-weekend-columns">
            <section>
              <h3>Partner hotels</h3>
              <ul className="fw-hotels">
                {familyWeekend.hotels.map(([name, phone, distance]) => (
                  <li key={name}><strong>{name}</strong><a href={`tel:${phone.replace(/-/g, "")}`}>{phone}</a><small>{distance} from campus</small></li>
                ))}
              </ul>
            </section>
            <section>
              <h3>Getting there and asking questions</h3>
              <p className="fw-note">{familyWeekend.address}</p>
              <p className="fw-note">Questions for CIA: <a href={`mailto:${familyWeekend.contactEmail}`}>{familyWeekend.contactEmail}</a></p>
            </section>
          </div>

          {/* Route comparisons used to be reachable only from the arrival FAQ.
              Families planning a visit are on this page, not that one. */}
          <div className="family-weekend-travel">
            <h3>Comparing routes to campus</h3>
            <p className="fw-note">Rough planning comparisons, not quotes. Check current fares and traffic before booking.</p>
            <TravelMatrix />
          </div>

          <div className="family-weekend-links">
            <a href={familyWeekend.officialUrl} target="_blank" rel="noreferrer">
              <span><strong>Register and read the full CIA page</strong><small>Registration, FAQs, printable schedule and campus map</small></span>
              <ExternalLink aria-hidden="true" />
            </a>
          </div>
          <p className="fw-source">Condensed from CIA&rsquo;s Family Weekend page. Times and details can change &mdash; confirm on the official page before you travel.</p>
        </section>}
        <aside className="calendar-caution">
          <AlertTriangle aria-hidden="true" />
          <div>
            <strong>Confirm before booking travel.</strong>
            <p>The student&rsquo;s current portal and assigned schedule control.</p>
          </div>
        </aside>
      </main>
    </>
  );
}
