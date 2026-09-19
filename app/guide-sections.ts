// Guide section data ported from the Lovable redesign build (commit f65d5b2).
// Documents and provider logos are served from public/ rather than the
// Lovable-hosted copies the redesign referenced.

// Sourced from the official Hyde Park Academic Calendar 2026–2027 PDF
// (public/documents/academic-calendar.pdf, approved 9/8/2025), transcribing
// only the items printed as plain text footnotes on that calendar. The grid
// also color-codes semester start/end, kitchen/bakeshop block rotations,
// commencement, and Saturday-class dates, but those are distinguishable only
// by cell color/border in the source PDF and are deliberately left out here
// pending visual confirmation against the source, rather than risk a wrong
// date. Summer 2027 items (6/14 Career Fair, 8/9 grades due, Master's
// Commencement 8/5/27) are omitted because the site's term model only
// supports Fall/Spring.
export const fullDates = [
  { month: "SEP", day: "21", title: "Yom Kippur", note: "Noted on the official Hyde Park academic calendar. Confirm campus operating hours if this affects travel plans.", term: "Fall 2026" },
  { month: "OCT", day: "05", title: "Career Fair (Hyde Park)", note: "Published on the official Hyde Park academic calendar. Confirm exact hours and location with Career Services.", term: "Fall 2026" },
  { month: "OCT", day: "26", title: "Tri-Wizards", note: "Listed on the official Hyde Park academic calendar as printed; a fuller description isn't available yet, so confirm details with the college.", term: "Fall 2026" },
  { month: "DEC", day: "21", title: "Fall Semester Grades Due", note: "Grades post to the student portal on this date, per the official Hyde Park academic calendar.", term: "Fall 2026" },
  { month: "FEB", day: "08", title: "Career Fair (Hyde Park)", note: "Published on the official Hyde Park academic calendar. Confirm exact hours and location with Career Services.", term: "Spring 2027" },
  { month: "MAR", day: "10", title: "Eid al-Fitr", note: "Noted on the official Hyde Park academic calendar. Confirm campus operating hours if this affects travel plans.", term: "Spring 2027" },
  { month: "MAR", day: "26", title: "Good Friday", note: "Noted on the official Hyde Park academic calendar. Confirm campus operating hours if this affects travel plans.", term: "Spring 2027" },
  { month: "APR", day: "19", title: "Spring Semester Grades Due", note: "Grades post to the student portal on this date, per the official Hyde Park academic calendar.", term: "Spring 2027" },
] as const;

export const careDirectory = [
  { kind: "Pharmacies", items: [
    ["CVS Pharmacy", "4246 Albany Post Road, Suite 2 · Hyde Park", "845-229-2224"],
    ["CVS Pharmacy", "4170 Albany Post Road · Hyde Park", "845-229-8881"],
    ["Molloy Medical Arts Pharmacy", "19 Baker Avenue #207 · Poughkeepsie", "845-471-7455"],
    ["Walgreens", "2024 South Road · Poughkeepsie", "845-296-1804"],
  ]},
  { kind: "Urgent care", items: [
    ["Emergency One", "4250 Albany Post Road · Hyde Park", "845-229-2602"],
    ["Caremount Medical Group Urgent Care", "43 Pine Street · Poughkeepsie", "845-484-6564"],
    ["Ortho Express", "1910 South Road · Poughkeepsie", "845-790-4357"],
  ]},
  { kind: "Hospitals", items: [
    ["Vassar Brothers Medical Center", "45 Reade Place · Poughkeepsie", "845-454-8500"],
    ["Mid-Hudson Regional Hospital", "241 North Road · Poughkeepsie", "845-483-5000"],
  ]},
] as const;

export const shoppingStores = [
  {
    kind: "Storage and moving",
    name: "Home Depot — Poughkeepsie",
    address: "3470 North Road, Poughkeepsie, NY 12601",
    items: ["Stackable plastic totes with locking lids", "Folding hand truck, platform cart, or tote cart", "Bungee cords, tie-down straps, labels, and permanent markers", "Over-door hooks, shelf liner, and basic cleaning supplies"],
    website: "https://www.homedepot.com/l/Poughkeepsie/NY/Poughkeepsie/12601/1266",
  },
  {
    kind: "Dorm and personal basics",
    name: "Target — Poughkeepsie",
    address: "2001 South Road, Poughkeepsie, NY 12601",
    items: ["Mattress protector, bedding, towels, and hangers", "Laundry bag or hamper, detergent, and stain treatment", "Toiletries, shower supplies, medicine-cabinet basics, and snacks", "Small fan, power strip, and organizers only after checking residence-hall rules"],
    website: "https://www.target.com/sl/poughkeepsie/1856",
  },
  {
    kind: "Budget restock",
    name: "Walmart — Poughkeepsie",
    address: "Poughkeepsie, NY 12601",
    items: ["Cleaning products, paper goods, snacks, and bottled essentials", "Replacement toiletries and inexpensive storage", "Cold-weather basics for students arriving from warmer regions", "Pharmacy items after confirming insurance and prescription transfer rules"],
    website: "https://www.walmart.com/store-finder?location=12601",
  },
] as const;
export type ResourceKind = "Dining" | "Academic programs" | "Equipment" | "Health & safety" | "Local guides" | "Student tasks";
export type ResourceItem = { title: string; description: string; href: string; kind: ResourceKind; format: "PDF"; cover: string; pages: number };

export const resourceLibrary: ResourceItem[] = [
  { title: "Freshman Meal Plan", description: "Blue and Gold Point rules, dining locations, and daily use.", href: "/documents/meal-plan.pdf", kind: "Dining", format: "PDF", cover: "/documents/meal-plan.jpg", pages: 2 },
  { title: "2026\u201327 Hyde Park Academic Calendar", description: "Semester, class, commencement, career fair, and recess dates.", href: "/documents/academic-calendar.pdf", kind: "Student tasks", format: "PDF", cover: "/documents/academic-calendar.jpg", pages: 1 },
  { title: "Food Business Management: Culinary Fundamentals", description: "Nine-semester course sequence and program requirements.", href: "/documents/food-business.pdf", kind: "Academic programs", format: "PDF", cover: "/documents/food-business.jpg", pages: 1 },
  { title: "Culinary Arts AOS Degree", description: "Five-semester Culinary Arts course sequence.", href: "/documents/culinary-arts.pdf", kind: "Academic programs", format: "PDF", cover: "/documents/culinary-arts.jpg", pages: 1 },
  { title: "Baking & Pastry Kit", description: "Complete issued tool and equipment list.", href: "/documents/baking-kit.pdf", kind: "Equipment", format: "PDF", cover: "/documents/baking-kit.jpg", pages: 1 },
  { title: "Culinary Kit", description: "Complete issued culinary knife and tool list.", href: "/documents/culinary-kit.pdf", kind: "Equipment", format: "PDF", cover: "/documents/culinary-kit.jpg", pages: 1 },
  { title: "Food Allergies & Intolerances", description: "The Inform, Question, Protect protocol and campus contacts.", href: "/documents/allergies.pdf", kind: "Health & safety", format: "PDF", cover: "/documents/allergies.jpg", pages: 2 },
  { title: "CIA Alumni-Owned Restaurants Nearby", description: "A local guide to nearby CIA alumni-owned restaurants.", href: "/documents/restaurants.pdf", kind: "Local guides", format: "PDF", cover: "/documents/restaurants.jpg", pages: 1 },
  { title: "Ordering Your CIA Textbooks", description: "Step-by-step instructions for finding and ordering course materials.", href: "/documents/textbooks.pdf", kind: "Student tasks", format: "PDF", cover: "/documents/textbooks.jpg", pages: 6 },
  { title: "Pharmacy, Urgent Care & Hospital Information", description: "Nearby medical providers with addresses and phone numbers.", href: "/documents/medical-care.pdf", kind: "Health & safety", format: "PDF", cover: "/documents/medical-care.jpg", pages: 2 },
];

export const providerLogos: Record<string, { src: string; alt: string }> = {
  "CVS Pharmacy": { src: "/providers/cvs.svg", alt: "CVS Pharmacy" },
  "Emergency One": { src: "/providers/emergency-one.png", alt: "Emergency One Urgent Care" },
  "Vassar Brothers Medical Center": { src: "/providers/northwell.png", alt: "Northwell Health, Vassar Brothers Medical Center's health system" },
};

const monthNumbers: Record<string, number> = { SEP: 8, OCT: 9, NOV: 10, DEC: 11, JAN: 0, FEB: 1, MAR: 2, APR: 3 };

export function academicEventDate(event: (typeof fullDates)[number]) {
  const year = event.term === "Fall 2026" ? 2026 : 2027;
  return new Date(year, monthNumbers[event.month] ?? 0, Number.parseInt(event.day, 10));
}

export function academicEventImage(title: string) {
  const value = title.toLowerCase();
  if (value.includes("career fair")) return "/calendar/career-fair.jpg";
  if (value.includes("thanksgiving") || value.includes("winter break") || value.includes("recess") || value.includes("resume")) return "/calendar/recess-travel.jpg";
  if (value.includes("tuition") || value.includes("refund") || value.includes("add/drop")) return "/calendar/tuition-refund.jpg";
  if (value.includes("health insurance")) return "/calendar/health-insurance.jpg";
  if (value.includes("community day") || value === "no classes" || value.includes("intersession") || value.includes("yom kippur") || value.includes("eid") || value.includes("good friday") || value.includes("tri-wizard")) return "/calendar/community-day.jpg";
  if (value.includes("restaurant")) return "/calendar/restaurants.jpg";
  if (value.includes("commencement")) return "/calendar/commencement.jpg";
  if (value.includes("departure") || value.includes("semester ends")) return "/calendar/departure.jpg";
  if (value.includes("grade")) return "/calendar/grades.jpg";
  if (value.includes("orientation") || value.includes("welcome") || value.includes("return") || value.includes("semester begins")) return "/calendar/orientation.jpg";
  return "/calendar/classes.jpg";
}

export function academicEventAlt(title: string) {
  const value = title.toLowerCase();
  if (value.includes("career fair")) return "Career fair tables prepared for employers and students";
  if (value.includes("thanksgiving") || value.includes("winter break") || value.includes("recess") || value.includes("resume")) return "Travel bag and chef jacket ready for an academic break";
  if (value.includes("tuition") || value.includes("refund") || value.includes("add/drop")) return "Parent and student reviewing college account information together";
  if (value.includes("health insurance")) return "Culinary student reviewing health coverage information";
  if (value.includes("community day") || value === "no classes" || value.includes("intersession") || value.includes("yom kippur") || value.includes("eid") || value.includes("good friday") || value.includes("tri-wizard")) return "Culinary students gathering for a campus community day";
  if (value.includes("restaurant")) return "CIA teaching restaurant dining room and open kitchen";
  if (value.includes("commencement")) return "Graduating culinary students celebrating with their families";
  if (value.includes("departure") || value.includes("semester ends")) return "Residence hall room packed for campus departure";
  if (value.includes("grade")) return "Student desk prepared for reviewing semester grades";
  if (value.includes("orientation") || value.includes("welcome") || value.includes("return") || value.includes("semester begins")) return "Campus welcome table prepared for student arrival";
  return "Professional teaching kitchen prepared for classes";
}

export const EVENT_TYPES = ["Deadline", "Academic", "No classes", "Campus"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export function academicEventType(title: string): EventType {
  const value = title.toLowerCase();
  if (value.includes("no classes") || value.includes("break") || value.includes("holiday") || value.includes("intersession")) return "No classes";
  if (value.includes("career fair") || value.includes("commencement") || value.includes("restaurant") || value.includes("yom kippur") || value.includes("eid") || value.includes("good friday") || value.includes("tri-wizard")) return "Campus";
  if (value.includes("grades")) return "Academic";
  if (value.includes("deadline") || value.includes("refund") || value.includes("waiver") || value.includes("add/drop") || value.includes("opt-out")) return "Deadline";
  return "Academic";
}

export const contacts = [
  { title: "Student Financial & Registration Services", label: "Bills · aid · registration", email: "sfrs@culinary.edu", phone: "845-451-1500", description: "Financial records, account questions, registration systems, and parent proxy concerns." },
  { title: "ITS Student Help Desk", label: "Portal · password · access", email: "ITHelp@CIA.Culinary.Edu", phone: "845-451-1698", description: "Technical trouble with the portal, proxy accounts, passwords, and school systems." },
] as const;

export const costs = [
  ["Full-time tuition", "Per semester", "$19,755"], ["Undergraduate meal plan", "Per semester", "$2,595"],
  ["General fee", "Per semester", "$885"], ["Residence-hall housing", "Per semester", "$4,135–$5,560"],
  ["Supplies", "One time", "$1,194"], ["Student orientation", "One time", "$275"],
  ["Health insurance", "Annual", "$2,100"], ["Tuition refund plan", "Per semester", "$145"], ["Commuter parking", "Per semester", "$115"],
] as const;

export const travelRegions = [
  { title: "West Coast", summary: "Fly most of the trip; ship less.", options: ["Drive · 40–47 hrs", "Train · 3–4 days", "Fly · 5–6 hrs"] },
  { title: "Midwest", summary: "Compare a one-day drive with a short flight.", options: ["Drive · 6–13 hrs", "Train · 10–22 hrs", "Fly · 1½–3 hrs"] },
  { title: "East Coast and nearby", summary: "Car and rail are usually the cleanest comparison.", options: ["Drive · 1½–6½ hrs", "Train · about 2 hrs", "Fly · rarely worth it"] },
] as const;

export const arrivalLanes = [
  { title: "Student lane", subtitle: "You own the school tasks.", steps: ["Check your CIA email and assigned move-in time", "Keep essentials where you can reach them", "Inspect uniforms and kits before buying duplicates", "Follow every required orientation block", "Locate first-night dining, support, medication, and routes"] },
  { title: "Parent lane", subtitle: "You support the launch.", steps: ["Book around the assigned schedule", "Bring less than you think", "Handle setup—not school business", "Expect a real goodbye", "Leave a calm backup plan"] },
] as const;
