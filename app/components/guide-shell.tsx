"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { Menu, Search, Users } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

type Audience = "student" | "parent";
type Term = "fall" | "spring";

const dispatchPreference = (kind: "audience" | "term", value: Audience | Term) => {
  window.localStorage.setItem(`guide-${kind}`, value);
  window.dispatchEvent(new CustomEvent("guide-preference", { detail: { kind, value } }));
};

export function useGuidePreferences() {
  const [audience, setAudience] = useState<Audience>("parent");
  const [term, setTerm] = useState<Term>("fall");

  useEffect(() => {
    const sync = () => {
      const savedAudience = window.localStorage.getItem("guide-audience");
      const savedTerm = window.localStorage.getItem("guide-term");
      if (savedAudience === "student" || savedAudience === "parent") setAudience(savedAudience);
      if (savedTerm === "fall" || savedTerm === "spring") setTerm(savedTerm);
    };
    sync();
    window.addEventListener("guide-preference", sync);
    return () => window.removeEventListener("guide-preference", sync);
  }, []);

  return {
    audience,
    term,
    setAudience: (value: Audience) => dispatchPreference("audience", value),
    setTerm: (value: Term) => dispatchPreference("term", value),
  };
}

function GuideControls() {
  const { audience, term, setAudience, setTerm } = useGuidePreferences();

  return (
    <details className="guide-controls">
      <summary>Guide settings</summary>
      <div>
        <fieldset>
          <legend>Show advice for</legend>
          <button className={audience === "parent" ? "active" : ""} type="button" onClick={() => setAudience("parent")}>I’m a parent</button>
          <button className={audience === "student" ? "active" : ""} type="button" onClick={() => setAudience("student")}>I’m a student</button>
        </fieldset>
        <fieldset>
          <legend>Term</legend>
          <button className={term === "fall" ? "active" : ""} type="button" onClick={() => setTerm("fall")}>Fall 2026</button>
          <button className={term === "spring" ? "active" : ""} type="button" onClick={() => setTerm("spring")}>Spring 2027</button>
        </fieldset>
      </div>
    </details>
  );
}

export function GuideShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="redesign-shell">
      <header className="redesign-header">
        <a className="redesign-brand" href="/" aria-label="CIA Hyde Park Family Guide and FAQ home">
          <span aria-hidden="true">CIA</span>
          <strong>CIA Hyde Park Family Guide <small>&amp; FAQ</small></strong>
        </a>
        <button className="redesign-menu" type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(!open)}><Menu /></button>
        <nav className={open ? "open" : ""} aria-label="Primary navigation">
          <a href="/faq"><Search aria-hidden="true" /> FAQs &amp; Help</a>
          <a href="/calendar">Dates</a>
          <a href="/faq/money">Costs</a>
          <a href="/safety">Safety &amp; support</a>
          <a href="/resources">Resources</a>
          <a href="/shopping">Shopping</a>
          <a className="community-link" href="/community"><Users aria-hidden="true" /> Family community</a>
          <GuideControls />
        </nav>
      </header>
      {children}
      <footer className="redesign-footer">
        <p>Not affiliated with CIA. Dates, contacts, costs, and policies can change—confirm time-sensitive information directly with the school.</p>
        <nav aria-label="Footer"><a href="/faq">FAQs &amp; Help</a><a href="/calendar">Dates</a><a href="/resources">Resources</a><a href="/shopping">Shopping</a><a href="/safety">Safety &amp; support</a><a href="/community">Family community</a><a href="/privacy">Privacy</a></nav>
      </footer>
    </div>
  );
}
