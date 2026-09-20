"use client";

import { ExternalLink, Gift, MapPin, PackageCheck, Search, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "../components/page-header";
import { shoppingStores } from "../guide-sections";
import Link from "next/link";

export default function SupportPage() {
  const [query, setQuery] = useState("");
  const stores = useMemo(() => shoppingStores.filter((store) => `${store.kind} ${store.name} ${store.address} ${store.items.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return <><main className="shopping-page page-wrap">
    <PageHeader eyebrow="Shop for your student" title="Send the useful things—and the thoughtful ones." description="Confirm what your student needs, then arrange pickup or delivery using their correct name and residence-hall instructions.">
      <label className="page-search"><Search aria-hidden="true" /><span className="sr-only">Search shopping options</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stores, supplies, or delivery options…" /></label>
    </PageHeader>
    <section className="audience-shopping" aria-label="Ways parents can support their student">
      <article><Truck aria-hidden="true" /><div><small>Pickup or delivery</small><h2>Order what your student needs.</h2><p>Confirm room needs, stock, the student&rsquo;s correct name, and approved delivery instructions before paying.</p></div></article>
      <article><Gift aria-hidden="true" /><div><small>Celebrate your student</small><h2>Send a Celebration Gram.</h2><p>Mark a birthday, accomplishment, milestone, or supportive moment through CIA&rsquo;s current online form.</p><a className="text-link" href="https://ciachef.formstack.com/forms/celebration_gram" target="_blank" rel="noreferrer">Open the Celebration Gram form <ExternalLink aria-hidden="true" /></a></div></article>
    </section>
    {stores.length ? <section className="shopping-grid">{stores.map((store) => <article key={store.name}>
      <p className="eyebrow">{store.kind}</p><h2>{store.name}</h2>
      <a className="store-address" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`} target="_blank" rel="noreferrer"><MapPin aria-hidden="true" />{store.address}</a>
      <ul>{store.items.map((item) => <li key={item}>{item}</li>)}</ul>
      <a className="text-link" href={store.website} target="_blank" rel="noreferrer">Check store and pickup options <ExternalLink aria-hidden="true" /></a>
    </article>)}</section> : <div className="empty-state"><Search aria-hidden="true" /><h2>No shopping options found</h2><p>Try a store name, item, or delivery need.</p></div>}
    <aside className="shopping-note"><PackageCheck aria-hidden="true" /><div><strong>Before you order</strong><p>Confirm current residence-hall rules, delivery access, availability, and return policies.</p><Link href="/quick-facts">See family-shared buying guidance and resources in Quick Facts →</Link></div></aside>
    <Link className="back-link" href="/faq/living">Read campus-life shopping guidance</Link>
  </main></>;
}
