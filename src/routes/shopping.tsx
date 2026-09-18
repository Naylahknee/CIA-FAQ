import { Link, createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Gift, MapPin, Maximize2, PackageCheck, Search, Truck, X } from "lucide-react";
import { useMemo, useState } from "react";
import { revealSidebar } from "@/lib/sidebar";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { shoppingStores } from "@/data/shopping";

export const Route = createFileRoute("/shopping")({
  head: () => ({ meta: [
    { title: "Shopping Near CIA Hyde Park | Family Help Center" },
    { name: "description", content: "Practical local shopping, pickup, and delivery guidance for CIA Hyde Park students and families." },
    { property: "og:title", content: "Shopping Near CIA Hyde Park | Family Help Center" },
    { property: "og:description", content: "Local stores and practical ordering guidance for CIA Hyde Park students and families." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
  component: ShoppingPage,
});

function ShoppingPage() {
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<(typeof shoppingStores)[number] | null>(null);
  const stores = useMemo(() => shoppingStores.filter((store) => `${store.kind} ${store.name} ${store.address} ${store.items.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <AppShell><main className="shopping-page page-wrap">
    <PageHeader eyebrow="Shop for your student" title="Send the useful things—and the thoughtful ones." description="Confirm what your student needs, then arrange pickup or delivery using their correct name and residence-hall instructions."><label className="page-search"><Search/><span className="sr-only">Search shopping options</span><input value={query} onChange={(event) => { setQuery(event.target.value); if (event.target.value.trim()) revealSidebar(); }} placeholder="Search stores, supplies, or delivery options…"/></label></PageHeader>
    <section className="audience-shopping" aria-label="Ways parents can support their student"><article><Truck/><div><small>Pickup or delivery</small><h2>Order what your student needs.</h2><p>Confirm room needs, stock, the student’s correct name, and approved delivery instructions before paying.</p></div></article><article><Gift/><div><small>Celebrate your student</small><h2>Send a Celebration Gram.</h2><p>Mark a birthday, accomplishment, milestone, or supportive moment through CIA’s current online form.</p><a className="text-link" href="https://ciachef.formstack.com/forms/celebration_gram" target="_blank" rel="noreferrer">Open the Celebration Gram form <ExternalLink/></a></div></article></section>
    {stores.length ? <section className="shopping-grid">{stores.map((store)=><article key={store.name}><p className="eyebrow">{store.kind}</p><h2>{store.name}</h2><a className="store-address" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`} target="_blank" rel="noreferrer"><MapPin/>{store.address}</a><ul>{store.items.map((item)=><li key={item}>{item}</li>)}</ul><button type="button" className="text-link" onClick={()=>setPreview(store)}>Check store and pickup options <ExternalLink/></button></article>)}</section> : <div className="empty-state"><Search/><h2>No shopping options found</h2><p>Try a store name, item, or delivery need.</p></div>}
    {preview && <section className="store-viewer" aria-label={`${preview.name} website`}><header><div><small>{preview.kind}</small><strong>{preview.name}</strong></div><div className="store-viewer-actions"><a href={preview.website} target="_blank" rel="noreferrer"><Maximize2/>Open in a new window</a><button type="button" onClick={()=>setPreview(null)}><X/>Close</button></div></header><iframe title={`${preview.name} website`} src={preview.website} loading="lazy" referrerPolicy="no-referrer"/><p>Some retailers block in-page viewing. If the store does not load, open it in a new window.</p></section>}
    <aside className="shopping-note"><PackageCheck/><div><strong>Before you order</strong><p>Confirm current residence-hall rules, delivery access, availability, and return policies.</p></div></aside>
    <Link className="back-link" to="/faq/$topic" params={{topic:"living"}}>Read campus-life shopping guidance</Link>
  </main></AppShell>;
}