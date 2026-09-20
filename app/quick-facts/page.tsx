"use client";

import {
  BedDouble,
  BookOpen,
  Boxes,
  BusFront,
  ChefHat,
  CircleDollarSign,
  CookingPot,
  ExternalLink,
  FileText,
  Footprints,
  GraduationCap,
  Hotel,
  Info,
  Landmark,
  Laptop,
  PackageCheck,
  Refrigerator,
  Search,
  ShieldCheck,
  Shirt,
  TrainFront,
  Truck,
  WashingMachine,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "../components/page-header";
import { familyResources, staffGuidance } from "../guide-sections";

type AdviceKey =
  | "packing"
  | "storage"
  | "kitchen"
  | "cookware"
  | "mattress"
  | "fridge"
  | "gear"
  | "shipping";

const topicIcon = {
  packing: PackageCheck,
  storage: Boxes,
  kitchen: CookingPot,
  cookware: ChefHat,
  mattress: BedDouble,
  fridge: Refrigerator,
  gear: Laptop,
  shipping: Truck,
} as const;

const resourceIcons: Record<string, typeof FileText> = {
  "Official CIA pages": GraduationCap,
  "Uniform, tools and books": Shirt,
  "Dorm room and storage": Boxes,
  "Cookware for the residence-hall kitchen": CookingPot,
  "Money and insurance": CircleDollarSign,
  "Getting around Hyde Park": BusFront,
};

const topicToResourceTitles: Record<AdviceKey, string[]> = {
  packing: ["What to Bring", "Housing 3D floor plans"],
  storage: ["Under-bed storage bin, 60qt", "3-drawer wide cart", "Housing 3D floor plans"],
  kitchen: ["Residence halls", "7pc stainless steel cookware set"],
  cookware: ["7pc stainless steel cookware set", "10pc stainless steel cookware set", "12pc stainless steel cookware set"],
  mattress: ["Waterproof mattress protector", "What to Bring"],
  fridge: ["Adjustable wire shelving unit", "Residence halls", "Housing 3D floor plans"],
  gear: ["Uniform and hygiene policy", "CIA student uniform portal", "Campus store"],
  shipping: ["USPS Hold for Pickup", "What to Bring"],
};

const adviceKeys: AdviceKey[] = [
  "packing",
  "storage",
  "kitchen",
  "cookware",
  "mattress",
  "fridge",
  "gear",
  "shipping",
];

const topicLabels: Record<AdviceKey, string> = {
  packing: "Packing & buying",
  storage: "Room & storage",
  kitchen: "Residence-hall kitchens",
  cookware: "Cookware",
  mattress: "Mattresses",
  fridge: "Refrigerators",
  gear: "Shoes & laptops",
  shipping: "Shipping ahead",
};

const factLabels: Record<AdviceKey, string> = {
  packing: "Buy less. Buy later.",
  storage: '≈ 33" under-bed clearance',
  kitchen: "Utensils come in the tool kit",
  cookware: "Stainless steel preferred",
  mattress: "Gel foam recommended",
  fridge: "Confirm measurements first",
  gear: "Black, non-skid, closed-toe shoes",
  shipping: "No earlier than 2 weeks ahead",
};

const filters = [
  ["all", "All resources"],
  ["Official CIA pages", "Official CIA"],
  ["Uniform, tools and books", "Uniforms & books"],
  ["Dorm room and storage", "Dorm & storage"],
  ["Cookware for the residence-hall kitchen", "Cookware"],
  ["Money and insurance", "Money & insurance"],
  ["Getting around Hyde Park", "Getting around"],
] as const;

export default function QuickFactsPage() {
  const [activeAdvice, setActiveAdvice] = useState<AdviceKey>("packing");
  const [filter, setFilter] = useState<(typeof filters)[number][0]>("all");
  const [query, setQuery] = useState("");
  const [quickView, setQuickView] = useState<"advice" | "resources">("advice");

  const grouped = useMemo(
    () =>
      familyResources.flatMap((group) =>
        group.links.map((link) => ({ ...link, category: group.category, note: group.note })),
      ),
    [],
  );

  const activeAdviceIndex = adviceKeys.indexOf(activeAdvice);
  const activeGuidance = staffGuidance[activeAdviceIndex];
  const related = topicToResourceTitles[activeAdvice]
    .map((title) => grouped.find((item) => item.title === title))
    .filter(Boolean) as (typeof grouped)[number][];

  const visible = grouped.filter((item) => {
    const matchesFilter = filter === "all" || item.category === filter;
    const haystack = `${item.title} ${item.description} ${item.category} ${item.note}`.toLowerCase();
    return matchesFilter && haystack.includes(query.toLowerCase());
  });

  return (
    <main className="help-page">
      <div className="page-wrap">
        <PageHeader
          eyebrow="Quick Facts"
          title="Move-In Guidance & Resources"
          description={<>A carefully structured coordination suite designed to simplify your residency transition. Synchronizing university administrative actions with verified veteran peer knowledge.</>}
        />
      </div>

      <section className="page-wrap quick-guidance-suite" aria-labelledby="quick-guidance-heading">
        <h2 id="quick-guidance-heading" className="sr-only">Move-In Guidance &amp; Resources</h2>
        <div className="quick-view-tabs" role="tablist" aria-label="Move-in guidance and resources">
          <button type="button" role="tab" aria-selected={quickView === "advice"} className={quickView === "advice" ? "active" : ""} onClick={() => setQuickView("advice")}>Official Staff Advice</button>
          <button type="button" role="tab" aria-selected={quickView === "resources"} className={quickView === "resources" ? "active" : ""} onClick={() => setQuickView("resources")}>Crowdsourced Family Links</button>
        </div>

        {quickView === "advice" ? (
          <div className="quick-view-panel" role="tabpanel">
        <div className="quick-advice-explorer">
          <div className="quick-topic-list" role="tablist" aria-label="Advice topics">
            {adviceKeys.map((key) => {
              const Icon = topicIcon[key];
              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeAdvice === key}
                  className={activeAdvice === key ? "active" : ""}
                  key={key}
                  onClick={() => setActiveAdvice(key)}
                  onMouseEnter={() => setActiveAdvice(key)}
                  onFocus={() => setActiveAdvice(key)}
                >
                  <span><Icon aria-hidden="true" />{topicLabels[key]}</span>
                </button>
              );
            })}
          </div>

        <article className="quick-advice-panel">
            <div className="quick-advice-panel-head">
              <div>
                <p className="quick-kicker">{topicLabels[activeAdvice]}</p>
                <h3>{activeGuidance.topic}</h3>
              </div>
              <span className="quick-fact">{factLabels[activeAdvice]}</span>
            </div>

            <div className="quick-advice-columns">
              <div>
                <h4>What staff said</h4>
                <p>{activeGuidance.guidance}</p>
              </div>
              <div>
                <h4>Related resources</h4>
                <div className="quick-related-list">
                  {related.map((item) => (
                    <a href={item.href} target="_blank" rel="noreferrer nofollow" key={item.href}>
                      <span className="quick-related-icon">{resourceIcon(item.category)}</span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.description}</small>
                      </span>
                      <ExternalLink aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
        </article>
        </div>
          </div>
        ) : (
          <div className="quick-view-panel" role="tabpanel">
            <div className="quick-resource-tab-head">
              <span>Family resource shelf</span>
              <strong>{visible.length} resources</strong>
            </div>
        <div className="quick-resource-browser">
          <aside className="quick-resource-filter-panel">
            <strong className="quick-filter-title">Filter resources</strong>
            <div className="quick-filter-list" aria-label="Resource categories">
              {filters.map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  className={filter === key ? "active" : ""}
                  onClick={() => setFilter(key)}
                >
                  <span>{label}</span>
                  <small>{key === "all" ? grouped.length : grouped.filter((item) => item.category === key).length}</small>
                </button>
              ))}
            </div>
          </aside>

          <div className="quick-resource-results">
          <label className="quick-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Search family resources</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search "mattress," "loan," "train"…' />
          </label>

        <div className="quick-resource-list">
          {visible.map((item) => {
            const Icon = resourceIcons[item.category] ?? FileText;
            return (
              <a href={item.href} target="_blank" rel="noreferrer nofollow" className="quick-resource-row" key={item.href}>
                <span className="quick-resource-icon"><Icon aria-hidden="true" /></span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                <ExternalLink aria-hidden="true" />
              </a>
            );
          })}
          {!visible.length && (
            <div className="quick-empty">
              <Search aria-hidden="true" />
              <strong>No matching resources</strong>
              <span>Try another search or category.</span>
            </div>
          )}
        </div>
        </div>
        </div>
          </div>
        )}
      </section>
    </main>
  );
}

function resourceIcon(category: string) {
  const Icon = resourceIcons[category] ?? FileText;
  return <Icon aria-hidden="true" />;
}
