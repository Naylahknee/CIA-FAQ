"use client";

// Quick Facts family-link panel styles live in guide.css; keep page and styles deployed together.

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
  HandCoins,
  HeartPulse,
  Hotel,
  Info,
  Luggage,
  Landmark,
  Laptop,
  PackageCheck,
  ClipboardPlus,
  Refrigerator,
  ShieldCheck,
  Shirt,
  TrainFront,
  Truck,
  WashingMachine,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "../components/page-header";
import { familyResources, staffGuidance } from "../guide-sections";

type FamilyCategoryKey = "essentials" | "uniforms" | "health" | "money" | "travel";

const familyCategories = [
  ["essentials", "Dorm Essentials", Boxes],
  ["uniforms", "Uniforms & Gear", Shirt],
  ["health", "Health & Forms", HeartPulse],
  ["money", "Money & Aid", HandCoins],
  ["travel", "Travel & Move-In", Luggage],
] as const;

const familyCategorySources: Record<FamilyCategoryKey, string[]> = {
  essentials: ["Dorm room and storage", "Cookware for the residence-hall kitchen", "Official CIA pages"],
  uniforms: ["Uniform, tools and books", "Official CIA pages"],
  health: ["Official CIA pages", "Money and insurance"],
  money: ["Official CIA pages", "Money and insurance"],
  travel: ["Official CIA pages", "Getting around Hyde Park"],
};

const familyCategoryTitles: Partial<Record<FamilyCategoryKey, string[]>> = {
  essentials: ["Residence halls", "Housing 3D floor plans", "Under-bed storage bin, 60qt", "3-drawer wide cart", "3-drawer wide tower", "Adjustable wire shelving unit", "Laundry hamper with liner and lid", "Waterproof mattress protector", "UL-approved power strips", "10pc stainless steel cookware set", "7pc stainless steel cookware set", "12pc stainless steel cookware set", "10pc stainless steel cookware set — lower-cost option"],
  uniforms: ["Uniform and hygiene policy", "CIA student uniform portal", "Uniform vendor contact", "Chef coat sizing guide", "Course material finder", "Campus store"],
  health: ["Campus health services", "New York medical form (PDF)", "CIA student health insurance"],
  money: ["Tuition", "Scholarship opportunities", "Additional financial aid options", "Parent PLUS loan", "Federal vs. private loans", "FAFSA", "Master promissory note", "Private loan comparison (ElmSelect)"],
  travel: ["What to Bring", "Where to Stay near the New York campus", "Family Weekend", "Dutchess County public transit routes", "MTA TrainTime", "Transit app", "CIA area guide", "USPS Hold for Pickup", "Campus card account"],
};

const familyCategoryNotes: Record<FamilyCategoryKey, string> = {
  essentials: "Everything tied to the residence hall itself: room setup and storage, residence-hall kitchens, cookware, mattresses, refrigerators, and the supplies families found useful.",
  uniforms: "Shoes and laptops are grouped here with uniform ordering, sizing, books, course materials, and the campus store.",
  health: "The official health-services page, required medical form, and student health-insurance information.",
  money: "Tuition, scholarships, federal aid, borrowing, and the comparison tools families were directed to.",
  travel: "Packing and buying, shipping ahead, lodging, Family Weekend, transit, and practical move-in links are grouped here.",
};

const adviceByCategory: Record<FamilyCategoryKey, number[]> = {
  essentials: [1, 2, 3, 4, 5],
  uniforms: [6],
  health: [],
  money: [],
  travel: [0, 7],
};

export default function QuickFactsPage() {
  const [familyCategory, setFamilyCategory] = useState<FamilyCategoryKey>("essentials");

  const grouped = useMemo(
    () =>
      familyResources.flatMap((group) =>
        group.links.map((link) => ({ ...link, category: group.category, note: group.note })),
      ),
    [],
  );

  const deduped = grouped.filter(
    (item, index, items) =>
      items.findIndex((candidate) => candidate.href === item.href || candidate.title === item.title) === index,
  );

  const familyItems = (key: FamilyCategoryKey) => {
    const sources = familyCategorySources[key];
    const titles = familyCategoryTitles[key];
    return deduped.filter((item) => {
      if (!sources.includes(item.category)) return false;
      return titles ? titles.includes(item.title) : true;
    });
  };

  const visible = familyItems(familyCategory);
  const activeFamilyLabel = familyCategories.find(([key]) => key === familyCategory)?.[1] ?? "Dorm Essentials";
  const activeFamilyNote = familyCategoryNotes[familyCategory];
  const activeStaffAdvice = adviceByCategory[familyCategory].map((index) => staffGuidance[index]);

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
        <div className="quick-family-explorer quick-unified-explorer">
          <div className="quick-family-topics quick-family-topics-consolidated" role="tablist" aria-label="Move-in guidance categories">
            {familyCategories.map(([key, label, Icon]) => {
              const count = familyItems(key).length;
              return (
                <button type="button" role="tab" aria-selected={familyCategory === key} className={familyCategory === key ? "active" : ""} key={key}
                  onClick={() => setFamilyCategory(key)} onMouseEnter={() => setFamilyCategory(key)} onFocus={() => setFamilyCategory(key)}>
                  <span className="quick-family-topic-icon"><Icon aria-hidden="true" /></span>
                  <span className="quick-family-topic-copy"><strong>{label}</strong><small>{count} {count === 1 ? "resource" : "resources"}</small></span>
                </button>
              );
            })}
          </div>

          <article className="quick-family-panel quick-unified-panel">
            <div className="quick-family-panel-head">
              <div><p className="quick-kicker">Guidance &amp; resources</p><h3>{activeFamilyLabel}</h3></div>
              <span className="quick-fact">{visible.length} {visible.length === 1 ? "resource" : "resources"}</span>
            </div>

            <div className="quick-unified-body">
              <div className="quick-unified-guidance">
                {activeStaffAdvice.length > 0 ? (
                  <>
                    <h4>What staff said</h4>
                    <div className="quick-staff-guidance-list">
                      {activeStaffAdvice.map((advice) => (
                        <section key={advice.topic}>
                          <strong>{advice.topic}</strong>
                          <p>{advice.guidance}</p>
                        </section>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h4>What to know</h4>
                    <p className="quick-category-note">{activeFamilyNote}</p>
                  </>
                )}
                <div className="quick-family-good-to-know">
                  <span className="quick-family-tip-icon">i</span>
                  <div><strong>Good to know</strong><small>{activeFamilyNote} Retail links can change, so confirm current prices, dimensions, policies, and deadlines.</small></div>
                </div>
              </div>

              <div className="quick-family-related">
                <h4>Related resources</h4>
                <div className="quick-family-related-list">
                  {visible.map((item) => (
                    <a href={item.href} target="_blank" rel="noreferrer nofollow" key={item.href}>
                      {familyCategory === "essentials" ? (
                        <span className="quick-family-thumb" aria-hidden="true"><span>Image</span></span>
                      ) : (
                        <span className="quick-family-resource-icon" aria-hidden="true">{familyResourceIcon(item.title, familyCategory)}</span>
                      )}
                      <span className="quick-family-resource-copy"><strong>{item.title}</strong><small>{item.description}</small></span>
                      <ExternalLink aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

function familyResourceIcon(title: string, category: FamilyCategoryKey) {
  if (category === "uniforms") return <Shirt aria-hidden="true" />;
  if (category === "health") return title.includes("medical form") ? <ClipboardPlus aria-hidden="true" /> : <HeartPulse aria-hidden="true" />;
  if (category === "money") return title.includes("Scholarship") ? <GraduationCap aria-hidden="true" /> : <HandCoins aria-hidden="true" />;
  if (category === "travel") {
    if (title.includes("Stay")) return <Hotel aria-hidden="true" />;
    if (title.includes("Train")) return <TrainFront aria-hidden="true" />;
    if (title.includes("transit") || title.includes("Transit")) return <BusFront aria-hidden="true" />;
    if (title.includes("USPS")) return <PackageCheck aria-hidden="true" />;
    return <Luggage aria-hidden="true" />;
  }
  return <FileText aria-hidden="true" />;
}

