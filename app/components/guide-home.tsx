"use client";
/* eslint-disable @next/next/no-img-element */

import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Gift, HeartPulse, MapPin, ShoppingBag, Utensils } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { facts, topics } from "../guide-data";
import { fullDates, resourceLibrary, academicEventAlt, academicEventDate, academicEventImage } from "../guide-sections";
import { useGuidePreferences } from "./guide-shell";
import { GuideIcon } from "./guide-icon";
import { HelpSearch } from "./help-search";
import Link from "next/link";

const cutoff = new Date(2026, 8, 18);

export function GuideHome() {
  const { audience, term } = useGuidePreferences();
  const [focusedEventIndex, setFocusedEventIndex] = useState(0);
  const selectedTerm = term === "fall" ? "Fall 2026" : "Spring 2027";

  const mostAsked = ["meal", "medical", "calendar", "groceries"].map((id) => facts.find((fact) => fact.id === id)).filter((fact): fact is (typeof facts)[number] => Boolean(fact));
  const openingQuestions = ["meal", "deposit", "movein", "textbooks"].map((id) => facts.find((fact) => fact.id === id)).filter((fact): fact is (typeof facts)[number] => Boolean(fact));
  const meal = facts.find((fact) => fact.id === "meal");
  const medical = facts.find((fact) => fact.id === "medical");
  const mealFile = resourceLibrary.find((resource) => resource.title === "Freshman Meal Plan");

  const upcomingEvents = useMemo(() => fullDates
    .filter((item) => item.term === selectedTerm)
    .map((item) => ({ id: `academic-${item.term}-${item.month}-${item.day}-${item.title}`, date: academicEventDate(item), title: item.title, description: item.note, image: academicEventImage(item.title), alt: academicEventAlt(item.title), kind: item.term }))
    .filter((event) => event.date >= cutoff)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 6), [selectedTerm]);

  useEffect(() => setFocusedEventIndex(0), [audience, selectedTerm, upcomingEvents.length]);
  const focusedEvent = upcomingEvents[focusedEventIndex];
  const moveEvent = (direction: number) => setFocusedEventIndex((current) => (current + direction + upcomingEvents.length) % upcomingEvents.length);

  // Advance on its own, but never fight the reader: hovering, focusing a
  // control, or leaving the tab pauses it, and any manual pick restarts the
  // clock rather than cutting the new slide short. Honours reduced-motion.
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || upcomingEvents.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const advance = () => setFocusedEventIndex((current) => (current + 1) % upcomingEvents.length);
    let timer = window.setInterval(advance, 6000);

    // A background tab should not silently burn through every slide.
    const onVisibility = () => {
      window.clearInterval(timer);
      if (!document.hidden) timer = window.setInterval(advance, 6000);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [paused, upcomingEvents.length, focusedEventIndex]);

  const pickEvent = (index: number) => setFocusedEventIndex(index);

  return <><main className="guide-home">
    <section className="home-opening page-wrap">
      <div className="home-opening-copy">
        <p className="eyebrow">CIA Hyde Park Family Guide &amp; FAQ</p>
        <h1>{audience === "student" ? "Your CIA Hyde Park student guide." : "Your CIA Hyde Park survival guide."}</h1>
        <p>{audience === "student" ? "Official information, real questions from students, and the next useful step for your term on campus." : "Official information, real family questions, and what to do after move-in—without digging through six thousand chat messages."}</p>
        <span>CIA Hyde Park · {selectedTerm}</span>
        <HelpSearch title="" compact />
        <div className="opening-question-grid">{openingQuestions.map((fact) => <Link key={fact.id} href={`/faq/${fact.category}`}>{audience === "student" ? fact.studentQ : fact.parentQ}</Link>)}</div>
      </div>
      <div className="home-opening-media"><img src="/community-campus-building.webp" alt="The Culinary Institute of America Hyde Park campus" width={720} height={980} /></div>
    </section>

    <section className="home-resource-wall"><div className="page-wrap">
      <div className="resource-wall-heading"><div><p className="eyebrow">On the family calendar</p><h2>Upcoming events</h2></div><Link href="/calendar">Full calendar <ArrowRight /></Link></div>
      {focusedEvent ? <div className="home-event-carousel">
        <article className="home-event-focus" aria-live="polite">
          <span className="calendar-event-term">{focusedEvent.kind}</span>
          <h3>{focusedEvent.title}</h3>
          <time dateTime={focusedEvent.date.toISOString()}>{focusedEvent.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</time>
          <p>{focusedEvent.description || "Add this date to your calendar and check the full calendar for the latest details."}</p>
          <div className="home-event-focus-links"><Link href="/calendar">See calendar details <ArrowRight /></Link></div>
        </article>
        <div className="home-event-slides"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}>
          <div className="home-event-slide"><img key={focusedEvent.id} src={focusedEvent.image} alt={focusedEvent.alt} loading="lazy" width={1200} height={800} /><div className="home-event-date-badge"><strong>{focusedEvent.date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</strong><span>{focusedEvent.date.getDate()}</span></div></div>
          <div className="home-event-carousel-controls"><span>{focusedEventIndex + 1} / {upcomingEvents.length}</span><div><button type="button" onClick={() => moveEvent(-1)} aria-label="Previous event"><ChevronLeft /></button><button type="button" onClick={() => moveEvent(1)} aria-label="Next event"><ChevronRight /></button></div></div>
          <div className="home-event-dots" aria-label="Choose an event">{upcomingEvents.map((event, index) => <button key={event.id} type="button" className={index === focusedEventIndex ? "active" : ""} onClick={() => pickEvent(index)} aria-label={`Show ${event.title}`} aria-current={index === focusedEventIndex ? "true" : undefined}><span>{index + 1}</span></button>)}</div>
        </div>
      </div> : <p className="resource-wall-note">No upcoming dates to show right now.</p>}
    </div></section>

    <section className="home-section page-wrap">
      <header><p className="eyebrow">Guide sections</p><h2>Browse by topic</h2></header>
      <div className="editorial-topic-grid">{Object.entries(topics).map(([key, value]) => <Link key={key} href={`/faq/${key}`}><GuideIcon id={key} /><span><strong>{value.name}</strong><small>{value.description}</small></span><ArrowRight /></Link>)}</div>
    </section>

    <section className="home-section home-tint"><div className="page-wrap">
      <header><p className="eyebrow">Most asked</p><h2>Questions families are asking now</h2></header>
      <div className="most-asked-list">{mostAsked.map((fact) => <Link key={fact.id} href={`/faq/${fact.category}`}><GuideIcon id={fact.id} /><strong>{audience === "student" ? fact.studentQ : fact.parentQ}</strong><ArrowRight /></Link>)}</div>
    </div></section>

    {term === "spring" && meal && <section className="feature-story page-wrap"><div>
      <p className="eyebrow">Freshman meal plan</p><h2>Blue today. Gold for later.</h2>
      <p>{audience === "student" ? meal.studentA : meal.parentA}</p>
      <strong>{audience === "student" ? meal.stepStudent : meal.stepParent}</strong>
      <div className="story-links"><Link href="/faq/living">Read meal-plan answers <ArrowRight /></Link>{mealFile && <a href={mealFile.href} target="_blank" rel="noreferrer">Open the meal-plan guide <ExternalLink /></a>}</div>
    </div><Utensils /></section>}

    {medical && <section className="feature-story safety-story"><div className="page-wrap"><HeartPulse /><div>
      <p className="eyebrow">Save this before it is needed</p><h2>Sick, injured, or out of medication?</h2>
      <p>{audience === "student" ? medical.studentA : medical.parentA}</p>
      <Link href="/safety">Save contacts and local care <ArrowRight /></Link>
    </div></div></section>}

    <section className="shopping-preview"><div className="page-wrap"><div>
      <p className="eyebrow">{audience === "student" ? "Shop near campus" : "Shop for your student"}</p>
      <h2>{audience === "student" ? "Pick up what you still need for your room and kit." : "Send what they need—and something that says you care."}</h2>
      <p>{audience === "student" ? "Local stores for supplies, groceries, and uniform care, with pickup and delivery options near campus." : "Find practical items for pickup or delivery after your student confirms what the room needs, or send a CIA Celebration Gram for a birthday, milestone, or encouraging moment."}</p>
      <div className="story-links"><Link href="/shopping">{audience === "student" ? "Browse stores near campus" : "Shop for your student"} <ShoppingBag /></Link><a href="https://ciachef.formstack.com/forms/celebration_gram" target="_blank" rel="noreferrer">Send a Celebration Gram <Gift /></a></div>
    </div><ShoppingBag /></div></section>
  </main></>;
}
