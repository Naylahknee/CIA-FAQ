"use client";
/* eslint-disable @next/next/no-img-element */

import { BellRing, ExternalLink, HeartPulse, MapPin, Search, ShieldCheck, Smartphone } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "../components/page-header";
import { facts } from "../guide-data";
import { careDirectory, providerLogos } from "../guide-sections";

export default function SafetyPage() {
  const [query, setQuery] = useState("");
  const everbridge = facts.find((fact) => fact.id === "everbridge");

  const groups = useMemo(() => careDirectory
    .map((group) => ({ ...group, items: group.items.filter(([name, address, phone]) => `${group.kind} ${name} ${address} ${phone}`.toLowerCase().includes(query.toLowerCase())) }))
    .filter((group) => group.items.length), [query]);

  return <><main className="page-wrap page-main">
    <PageHeader eyebrow="Safety &amp; Support" title="Sick, injured, or unsure where to start?" description={<>For immediate danger or a life-threatening emergency, call <a href="tel:911">911</a>.</>}>
      <label className="page-search"><Search aria-hidden="true" /><span className="sr-only">Search safety and support</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pharmacies, urgent care, or hospitals…" /></label>
    </PageHeader>
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
    <section className="detail-panel"><h2>Local care directory</h2>
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
