"use client";
/* eslint-disable @next/next/no-img-element */

import { BellRing, ExternalLink, HeartPulse, MapPin, Search, ShieldCheck, Smartphone, X } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "../components/page-header";
import { useGuidePreferences } from "../components/guide-shell";
import { facts } from "../guide-data";
import { careDirectory, providerLogos } from "../guide-sections";

export default function SafetyPage() {
  const [query, setQuery] = useState("");
  const { audience } = useGuidePreferences();
  const everbridge = facts.find((fact) => fact.id === "everbridge");

  const groups = useMemo(() => careDirectory
    .map((group) => ({ ...group, items: group.items.filter(([name, address, phone]) => `${group.kind} ${name} ${address} ${phone}`.toLowerCase().includes(query.toLowerCase())) }))
    .filter((group) => group.items.length), [query]);
  const resultCount = groups.reduce((total, group) => total + group.items.length, 0);
  const hasSearch = query.trim().length > 0;

  return <><main className="safety-page page-wrap page-main">
    <PageHeader eyebrow="Safety &amp; Support" title="How CIA protects student safety and well-being" description={<>For immediate danger or a life-threatening emergency, call <a href="tel:911">911</a> first, then CIA Campus Safety at <a href="tel:8454511268">845-451-1268</a>.</>}>
      <label className="page-search"><Search aria-hidden="true" /><span className="sr-only">Search local care providers</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pharmacies, urgent care, or hospitals…" />{hasSearch && <button type="button" className="page-search-clear" aria-label="Clear care search" onClick={() => setQuery("")}><X aria-hidden="true" /></button>}</label>
      <p className="care-search-status" aria-live="polite">{hasSearch ? `${resultCount} ${resultCount === 1 ? "local care provider" : "local care providers"} found below.` : "Search filters the local care directory below."}</p>
    </PageHeader>
    <section className="detail-panel">
      <p className="eyebrow">Campus safety</p>
      <h2>Safety is a campus-wide responsibility.</h2>
      <p>At CIA, personal safety is a priority. The CIA community is committed to an environment where students, faculty, and staff feel secure. The <a href="https://www.ciachef.edu/wp-content/uploads/2024/07/cia-safety-brochure.pdf" target="_blank" rel="noreferrer">Campus Safety Report</a> details steps CIA takes to protect the campus community.</p>
      <p>CIA safety officers maintain a 24-hour presence on campus. For assistance at any time, call <a href="tel:8454511268">845-451-1268</a>.</p>
      <aside className="warning-panel"><BellRing aria-hidden="true" /><div><strong>In an emergency, call 911 first.</strong><p>Then call CIA Campus Safety at <a href="tel:8454511268">845-451-1268</a>, or extension 1111 from a campus phone.</p></div></aside>
      <p>To view United States Department of Education campus crime statistics, <a href="https://ope.ed.gov/campussafety/#/institution/search" target="_blank" rel="noreferrer">open the Campus Safety and Security Data Analysis Cutting Tool</a> and search for “The Culinary Institute of America.” The 2024 calendar-year data lists six reported hate crimes.</p>
    </section>
    {audience === "student" && <section className="detail-panel">
      <p className="eyebrow">Student support</p>
      <h2>Support for your mental well-being</h2>
      <div className="care-grid">
        <article><h3>How to find us</h3><p>Student Commons, Room 218<br /><a href="tel:8459054241">845-905-4241</a><br />Monday–Friday, 9 a.m.–5 p.m.</p></article>
        <article><h3>24/7 resources</h3><ul>
          <li><strong>Dutchess County Helpline:</strong> Call or text <a href="tel:8454859700">845-485-9700</a></li>
          <li><strong>988 Suicide &amp; Crisis Lifeline:</strong> Call or text <a href="tel:988">988</a></li>
          <li><strong>MidHudson Regional Hospital Emergency Psychiatric Care:</strong> <a href="tel:8454335000">845-433-5000</a></li>
          <li><strong>Crisis Stabilization Center:</strong> <a href="tel:8454859700">845-485-9700</a></li>
          <li><strong>Trans Lifeline:</strong> <a href="tel:18775658860">1-877-565-8860</a></li>
          <li><strong>Veterans Crisis Line:</strong> Call <a href="tel:988">988</a>, then press 1, or text 838255</li>
          <li><strong>National Sexual Assault Hotline:</strong> <a href="tel:18006564673">1-800-656-HOPE (4673)</a></li>
        </ul></article>
        <article><h3>Crisis Text Line</h3><ul>
          <li>Text <strong>HOME</strong> to 741741</li>
          <li>Students of Color: text <strong>STEVE</strong> to 741741</li>
          <li>Black women crisis counselors: text <strong>TRIBE</strong> to 741741</li>
          <li>Eating concerns: text <strong>NEDA</strong> to 741741</li>
          <li>Addiction: text <strong>4HOPE</strong> to 741741</li>
        </ul></article>
      </div>
    </section>}
    <div className="support-grid">
      <article><ShieldCheck aria-hidden="true" /><span>1</span><h2>Prepare now</h2><p>Save insurance details, allergies, medications, an emergency contact, and the closest pharmacy.</p></article>
      <article><HeartPulse aria-hidden="true" /><span>2</span><h2>Choose the right care</h2><p>Use a pharmacy, urgent care, or emergency services according to the seriousness of the problem.</p></article>
      <article><BellRing aria-hidden="true" /><span>3</span><h2>Call before leaving</h2><p>Confirm current hours, services, insurance acceptance, and transportation.</p></article>
    </div>
    {everbridge && <section className="everbridge-panel"><Smartphone aria-hidden="true" /><div>
      <p className="eyebrow">Campus safety</p><h2>Everbridge 360</h2><p>{everbridge.parentA}</p>
      <div className="app-downloads">
        <a className="app-download ios" href="https://apps.apple.com/us/app/everbridge-360/id1632864063" target="_blank" rel="noreferrer"><Smartphone aria-hidden="true" /><span><small>For iPhone</small><strong>Everbridge 360</strong><em>Open in the Apple App Store</em></span></a>
        <a className="app-download android" href="https://play.google.com/store/apps/details?id=com.everbridge.enterprise" target="_blank" rel="noreferrer"><Smartphone aria-hidden="true" /><span><small>For Android</small><strong>Everbridge 360</strong><em>Open in Google Play</em></span></a>
      </div>
      <a className="everbridge-faq-link" href={everbridge.link} target="_blank" rel="noreferrer">Read the setup FAQ <ExternalLink aria-hidden="true" /></a>
    </div></section>}
    <section id="care-directory" className="detail-panel"><h2>Local care directory</h2>
      {groups.length ? <div className="care-grid">{groups.map((group) => <article key={group.kind}><h3>{group.kind}</h3>{group.items.map(([name, address, phone]) => <div className="care-row" key={name + address}>
        {providerLogos[name] && <img className="provider-logo" src={providerLogos[name].src} alt={providerLogos[name].alt} loading="lazy" />}
        <strong>{name}</strong>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}`)}`} target="_blank" rel="noreferrer"><MapPin aria-hidden="true" />{address}</a>
        <a href={`tel:${phone.replace(/-/g, "")}`}>{phone}</a>
      </div>)}</article>)}</div> : <div className="empty-state"><Search aria-hidden="true" /><h2>No care options found</h2><p>Try a provider type, name, or location.</p></div>}
    </section>
    <a className="official-safety-link" href="https://catalog.ciachef.edu/" target="_blank" rel="noreferrer">Open the current CIA handbook <ExternalLink aria-hidden="true" /></a>
    <aside className="warning-panel"><BellRing aria-hidden="true" /><div><strong>Community advice is not emergency guidance.</strong><p>Call each provider to verify current details. Use official campus contacts for health, safety, harassment, discrimination, or serious unresolved concerns.</p></div></aside>
  </main></>;
}
