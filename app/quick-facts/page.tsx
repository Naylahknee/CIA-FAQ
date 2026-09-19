"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
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

const topicImages: Record<AdviceKey, string> = {
  packing: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=82",
  storage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=82",
  kitchen: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=82",
  cookware: "https://images.unsplash.com/photo-1556910110-a5a63dfd3935?auto=format&fit=crop&w=900&q=82",
  mattress: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=82",
  fridge: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=900&q=82",
  gear: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=82",
  shipping: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=82",
};

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
    <main className="quick-facts-page">
      <section className="quick-facts-hero">
        <div className="quick-facts-hero-copy">
          <p className="quick-kicker">Move-in & preparation</p>
          <h1>What other CIA families used.</h1>
          <p className="quick-lede">
            Links families passed around in a CIA parent group, with the guidance CIA staff gave alongside them.
            Nothing here is endorsed by the CIA or by this guide, retail links go out of date, and residence-hall
            rules change—confirm before you buy.
          </p>
        </div>
        <aside className="quick-facts-hero-note">
          <Info aria-hidden="true" />
          <div>
            <strong>Before you buy</strong>
            <span>Confirm room measurements, residence-hall rules, prices, return policies, and deadlines.</span>
          </div>
        </aside>
      </section>

      <section className="quick-feature-band" aria-labelledby="quick-principle-title">
        <div>
          <p className="quick-kicker quick-kicker-light">The recurring staff advice</p>
          <h2 id="quick-principle-title">Buy less. Buy later.</h2>
          <p>
            Pack the basics first. Wait until your student sees the actual room before buying furniture-sized
            storage, shelving, or extras.
          </p>
          <div className="quick-chips" aria-label="Good items to start with">
            {["Clothes", "Hygiene", "Laundry", "Computer", "Study supplies", "Comfort items"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="quick-feature-visual" aria-hidden="true">
          <div className="quick-message-card one">
            <small>Parent group</small>
            <strong>Wait until they see the room.</strong>
          </div>
          <div className="quick-message-card two">
            <small>CIA staff</small>
            <strong>Practice economy when packing.</strong>
          </div>
          <div className="quick-message-card three">
            <small>Room setup</small>
            <strong>Measure first. Then buy.</strong>
          </div>
        </div>
      </section>

      <section className="quick-section" aria-labelledby="quick-advice-heading">
        <div className="quick-section-head">
          <div>
            <p className="quick-kicker">Start here</p>
            <h2 id="quick-advice-heading">What CIA staff advised</h2>
            <p>Pick a topic. The guidance and the useful resources stay together.</p>
          </div>
        </div>

        <div className="quick-topic-carousel-wrap">
          <button
            type="button"
            className="quick-carousel-arrow quick-carousel-prev"
            aria-label="Show previous advice topics"
            onClick={() => document.getElementById("quick-topic-carousel")?.scrollBy({ left: -640, behavior: "smooth" })}
          >
            <ChevronLeft aria-hidden="true" />
          </button>

          <div className="quick-topic-carousel" id="quick-topic-carousel" role="tablist" aria-label="Advice topics">
            {adviceKeys.map((key) => {
              const Icon = topicIcon[key];
              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeAdvice === key}
                  className={activeAdvice === key ? "quick-topic-card active" : "quick-topic-card"}
                  key={key}
                  onClick={() => setActiveAdvice(key)}
                  style={{ backgroundImage: `linear-gradient(180deg, rgba(5,25,35,.02) 22%, rgba(5,25,35,.86) 100%), url("${topicImages[key]}")` }}
                >
                  <span className="quick-topic-card-icon"><Icon aria-hidden="true" /></span>
                  <span className="quick-topic-card-copy">
                    <strong>{topicLabels[key]}</strong>
                    <small>{factLabels[key]}</small>
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="quick-carousel-arrow quick-carousel-next"
            aria-label="Show more advice topics"
            onClick={() => document.getElementById("quick-topic-carousel")?.scrollBy({ left: 640, behavior: "smooth" })}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>

        <div className="quick-carousel-hint" aria-hidden="true">
          <span>Swipe or use the arrows to see more topics</span>
          <ArrowRight />
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
      </section>

      <section className="quick-section" aria-labelledby="quick-resource-heading">
        <div className="quick-section-head quick-resource-heading">
          <div>
            <p className="quick-kicker">Family resource shelf</p>
            <h2 id="quick-resource-heading">Already know what you need?</h2>
            <p>Search everything families shared without wading through one giant accordion.</p>
          </div>
          <strong>{visible.length} resources</strong>
        </div>

        <div className="quick-resource-tools">
          <label className="quick-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Search family resources</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search "mattress," "loan," "train"…' />
          </label>
          <div className="quick-filter-row" aria-label="Resource categories">
            {filters.map(([key, label]) => (
              <button
                type="button"
                key={key}
                className={filter === key ? "active" : ""}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

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
      </section>
    </main>
  );
}

function resourceIcon(category: string) {
  const Icon = resourceIcons[category] ?? FileText;
  return <Icon aria-hidden="true" />;
}
