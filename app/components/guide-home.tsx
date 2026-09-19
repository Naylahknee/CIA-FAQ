"use client";
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import { ArrowRight, CalendarDays, HeartPulse, MapPin, ShoppingBag, Utensils } from "lucide-react";
import { facts, dates, topics, type TopicKey } from "../guide-data";
import { GuideShell, useGuidePreferences } from "./guide-shell";
import { HelpSearch } from "./faq-explorer";

const topicOrder: TopicKey[] = ["money", "arrival", "classes", "living", "health"];
const iconFor: Record<TopicKey, typeof CalendarDays> = { money: ShoppingBag, arrival: MapPin, classes: Utensils, living: CalendarDays, health: HeartPulse };

function AudienceCopy({ factId }: { factId: string }) {
  const { audience } = useGuidePreferences();
  const fact = facts.find((item) => item.id === factId);
  return fact ? <>{audience === "parent" ? fact.parentA : fact.studentA}</> : null;
}

export function GuideHome() {
  const { audience, term } = useGuidePreferences();
  const mostAsked = ["meal", "medical", "calendar", "groceries"].map((id) => facts.find((fact) => fact.id === id)).filter(Boolean);
  const opening = ["meal", "deposit", "movein", "textbooks"].map((id) => facts.find((fact) => fact.id === id)).filter(Boolean);
  const termLabel = term === "fall" ? "Fall 2026" : "Spring 2027";
  return <GuideShell><main className="guide-home-redesign">
    <section className="home-hero-redesign"><div className="page-wrap hero-grid"><div><p className="eyebrow">CIA Hyde Park Family Guide &amp; FAQ</p><h1>{audience === "student" ? "Your CIA Hyde Park student guide." : "Your CIA Hyde Park survival guide."}</h1><p>{audience === "student" ? "Official information, real questions from students, and the next useful step for your term on campus." : "Official information, real family questions, and what to do after move-in—without digging through six thousand chat messages."}</p><small>CIA Hyde Park · {termLabel}</small><HelpSearch compact /><div className="hero-questions">{opening.map((fact) => fact && <a key={fact.id} href={`/faq/${fact.category}`}>{audience === "student" ? fact.studentQ : fact.parentQ}<ArrowRight aria-hidden="true" /></a>)}</div></div><img src="/community-campus-building.webp" alt="The Culinary Institute of America Hyde Park campus" /></div></section>
    <section className="landing-section page-wrap"><header><p className="eyebrow">Guide sections</p><h2>Browse by topic</h2></header><div className="landing-topic-grid">{topicOrder.map((key) => { const Icon = iconFor[key]; return <a key={key} href={`/faq/${key}`}><Icon aria-hidden="true" /><span><strong>{topics[key].name}</strong><small>{topics[key].description}</small></span><ArrowRight aria-hidden="true" /></a>; })}</div></section>
    <section className="landing-band"><div className="page-wrap most-asked-layout"><header><p className="eyebrow">Most asked</p><h2>Questions families are asking now</h2></header><div>{mostAsked.map((fact) => fact && <a key={fact.id} href={`/faq/${fact.category}?q=${fact.id}`}>{audience === "student" ? fact.studentQ : fact.parentQ}<ArrowRight aria-hidden="true" /></a>)}</div></div></section>
    <section className="landing-feature page-wrap"><Utensils aria-hidden="true" /><div><p className="eyebrow">Freshman meal plan</p><h2>Blue today. Gold for later.</h2><p><AudienceCopy factId="meal" /></p><a href="/faq/living?open=meal">Read meal-plan answers <ArrowRight aria-hidden="true" /></a></div></section>
    <section className="landing-safety"><div className="page-wrap"><HeartPulse aria-hidden="true" /><div><p className="eyebrow">Save this before it is needed</p><h2>Sick, injured, or out of medication?</h2><p><AudienceCopy factId="medical" /></p><a href="/faq/health?open=medical">Save contacts and local care <ArrowRight aria-hidden="true" /></a></div></div></section>
    <section className="landing-section page-wrap"><header className="calendar-heading"><div><p className="eyebrow">Put these on the family calendar</p><h2>Upcoming events</h2></div><a href="/faq/arrival">Full calendar <ArrowRight aria-hidden="true" /></a></header><div className="landing-events">{dates.slice(0, 3).map((event) => <a href="/faq/arrival" key={`${event.month}-${event.day}-${event.title}`}><time><strong>{event.month}</strong><span>{event.day}</span></time><span><strong>{event.title}</strong><small>{event.note}</small></span></a>)}</div></section>
    <section className="landing-shopping"><div className="page-wrap"><div><p className="eyebrow">Shop near campus</p><h2>{audience === "student" ? "Pick up what you still need for your room and kit." : "Send what they need—and something that says you care."}</h2><p>{audience === "student" ? "Local stores for supplies, groceries, and uniform care, with pickup and delivery options near campus." : "Find practical items for pickup or delivery after your student confirms what the room needs, or send a CIA Celebration Gram for a birthday, milestone, or encouraging moment."}</p><a href="/faq/living?open=groceries">Find shopping answers <ArrowRight aria-hidden="true" /></a></div><ShoppingBag aria-hidden="true" /></div></section>
  </main></GuideShell>;
}
