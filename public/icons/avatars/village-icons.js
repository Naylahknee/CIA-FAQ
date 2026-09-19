// Family Village logo marks — rotating food icons.
// Glyphs are the real Lucide icons (lucide-icons/lucide, ISC license), copied from source
// at 24x24 / stroke 2 / round caps. `lucide` is the exact icon name, so any of these can be
// swapped for the packaged component (<Apple />, lucide-react) with no visual change.
// Each entry carries its own ink + badge tint, all derived from CIA Sage Green #13654A
// and Fire Orange #FF8200. Every pair clears 3:1 against its badge.

export const VILLAGE_ICONS = [
  // ── Everyday ───────────────────────────────────────────────
  { id: "utensils", label: "Fork & knife", lucide: "utensils", set: "Everyday", ink: "#13654A", bg: "#E4F0EB",
    svg: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>' },
  { id: "cooking-pot", label: "Cooking pot", lucide: "cooking-pot", set: "Everyday", ink: "#13654A", bg: "#E4F0EB",
    svg: '<path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/>' },
  { id: "croissant", label: "Croissant", lucide: "croissant", set: "Everyday", ink: "#A34F00", bg: "#FFE3C2",
    svg: '<path d="M10.2 18H4.774a1.5 1.5 0 0 1-1.352-.97 11 11 0 0 1 .132-6.487"/><path d="M18 10.2V4.774a1.5 1.5 0 0 0-.97-1.352 11 11 0 0 0-6.486.132"/><path d="M18 5a4 3 0 0 1 4 3 2 2 0 0 1-2 2 10 10 0 0 0-5.139 1.42"/><path d="M5 18a3 4 0 0 0 3 4 2 2 0 0 0 2-2 10 10 0 0 1 1.42-5.14"/><path d="M8.709 2.554a10 10 0 0 0-6.155 6.155 1.5 1.5 0 0 0 .676 1.626l9.807 5.42a2 2 0 0 0 2.718-2.718l-5.42-9.807a1.5 1.5 0 0 0-1.626-.676"/>' },
  { id: "coffee", label: "Coffee", lucide: "coffee", set: "Everyday", ink: "#7A4B1E", bg: "#F3E7DA",
    svg: '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>' },
  { id: "sandwich", label: "Sandwich", lucide: "sandwich", set: "Everyday", ink: "#A34F00", bg: "#FFE3C2",
    svg: '<path d="m2.37 11.223 8.372-6.777a2 2 0 0 1 2.516 0l8.371 6.777"/><path d="M21 15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5.25"/><path d="M3 15a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h9"/><path d="m6.67 15 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2"/><rect width="20" height="4" x="2" y="11" rx="1"/>' },

  // ── Spring ─────────────────────────────────────────────────
  { id: "carrot", label: "Carrot", lucide: "carrot", set: "Spring", ink: "#A34F00", bg: "#FFE3C2",
    svg: '<path d="M15 16a1 1 0 0 0-7-7q-4 4-5.987 12.385a.5.5 0 0 0 .602.602Q11 20 15 16l-3-3"/><path d="M15 9q4 4 7 0-3-4-7 0 4-4 0-7-4 3 0 7"/><path d="m8 15-2.58-2.58"/>' },
  { id: "salad", label: "Salad", lucide: "salad", set: "Spring", ink: "#35702F", bg: "#E9F2E4",
    svg: '<path d="M7 21h10"/><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1"/><path d="m13 12 4-4"/><path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2"/>' },
  { id: "egg", label: "Egg", lucide: "egg", set: "Spring", ink: "#13654A", bg: "#E4F0EB",
    svg: '<path d="M12 2C8 2 4 8 4 14a8 8 0 0 0 16 0c0-6-4-12-8-12"/>' },
  { id: "cherry", label: "Cherries", lucide: "cherry", set: "Spring", ink: "#9E2B3F", bg: "#FBE4E7",
    svg: '<path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z"/><path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z"/><path d="M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12"/><path d="M22 9c-4.29 0-7.14-2.33-10-7 5.71 0 10 4.67 10 7Z"/>' },
  { id: "egg-fried", label: "Fried egg", lucide: "egg-fried", set: "Spring", ink: "#A34F00", bg: "#FFE3C2",
    svg: '<circle cx="11.5" cy="12.5" r="3.5"/><path d="M3 8c0-3.5 2.5-6 6.5-6 5 0 4.83 3 7.5 5s5 2 5 6c0 4.5-2.5 6.5-7 6.5-2.5 0-2.5 2.5-6 2.5s-7-2-7-5.5c0-3 1.5-3 1.5-5C3.5 10 3 9 3 8Z"/>' },

  // ── Summer ─────────────────────────────────────────────────
  { id: "ice-cream-cone", label: "Ice cream cone", lucide: "ice-cream-cone", set: "Summer", ink: "#A34F00", bg: "#FFE3C2",
    svg: '<path d="m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11"/><path d="M17 7A5 5 0 0 0 7 7"/><path d="M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4"/>' },
  { id: "citrus", label: "Citrus", lucide: "citrus", set: "Summer", ink: "#A34F00", bg: "#FFE3C2",
    svg: '<path d="M21.66 17.67a1.08 1.08 0 0 1-.04 1.6A12 12 0 0 1 4.73 2.38a1.1 1.1 0 0 1 1.61-.04z"/><path d="M19.65 15.66A8 8 0 0 1 8.35 4.34"/><path d="m14 10-5.5 5.5"/><path d="M14 17.85V10H6.15"/>' },
  { id: "banana", label: "Banana", lucide: "banana", set: "Summer", ink: "#A34F00", bg: "#FFE3C2",
    svg: '<path d="M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5"/><path d="M5.15 17.89c5.52-1.52 8.65-6.89 7-12C11.55 4 11.5 2 13 2c3.22 0 5 5.5 5 8 0 6.5-4.2 12-10.49 12C5.11 22 2 22 2 20c0-1.5 1.14-1.55 3.15-2.11Z"/>' },
  { id: "grape", label: "Grapes", lucide: "grape", set: "Summer", ink: "#35702F", bg: "#E9F2E4",
    svg: '<path d="M22 5V2l-5.89 5.89"/><circle cx="16.6" cy="15.89" r="3"/><circle cx="8.11" cy="7.4" r="3"/><circle cx="12.35" cy="11.65" r="3"/><circle cx="13.91" cy="5.85" r="3"/><circle cx="18.15" cy="10.09" r="3"/><circle cx="6.56" cy="13.2" r="3"/><circle cx="10.8" cy="17.44" r="3"/><circle cx="5" cy="19" r="3"/>' },
  { id: "lollipop", label: "Lollipop", lucide: "lollipop", set: "Summer", ink: "#9E2B3F", bg: "#FBE4E7",
    svg: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 11a2 2 0 0 0 4 0 4 4 0 0 0-8 0 6 6 0 0 0 12 0"/>' },
  { id: "popcorn", label: "Popcorn", lucide: "popcorn", set: "Summer", ink: "#13654A", bg: "#E4F0EB",
    svg: '<path d="M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4"/><path d="M10 22 9 8"/><path d="m14 22 1-14"/><path d="M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z"/>' },

  // ── Fall ───────────────────────────────────────────────────
  { id: "apple", label: "Apple", lucide: "apple", set: "Fall", ink: "#9E2B3F", bg: "#FBE4E7",
    svg: '<path d="M12 6.528V3a1 1 0 0 1 1-1h0"/><path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21"/>' },
  { id: "soup", label: "Soup", lucide: "soup", set: "Fall", ink: "#13654A", bg: "#E4F0EB",
    svg: '<path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M7 21h10"/><path d="M19.5 12 22 6"/><path d="M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62"/><path d="M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62"/><path d="M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62"/>' },
  { id: "wheat", label: "Wheat", lucide: "wheat", set: "Fall", ink: "#A34F00", bg: "#FFE3C2",
    svg: '<path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/>' },
  { id: "drumstick", label: "Drumstick", lucide: "drumstick", set: "Fall", ink: "#7A4B1E", bg: "#F3E7DA",
    svg: '<path d="M15.4 15.63a7.875 6 135 1 1 6.23-6.23 4.5 3.43 135 0 0-6.23 6.23"/><path d="m8.29 12.71-2.6 2.6a2.5 2.5 0 1 0-1.65 4.65A2.5 2.5 0 1 0 8.7 18.3l2.59-2.59"/>' },
  { id: "ham", label: "Ham", lucide: "ham", set: "Fall", ink: "#9E2B3F", bg: "#FBE4E7",
    svg: '<path d="M13.144 21.144A7.274 10.445 45 1 0 2.856 10.856"/><path d="M13.144 21.144A7.274 4.365 45 0 0 2.856 10.856a7.274 4.365 45 0 0 10.288 10.288"/><path d="M16.565 10.435 18.6 8.4a2.501 2.501 0 1 0 1.65-4.65 2.5 2.5 0 1 0-4.66 1.66l-2.024 2.025"/><path d="m8.5 16.5-1-1"/>' },
  { id: "pizza", label: "Pizza", lucide: "pizza", set: "Fall", ink: "#A34F00", bg: "#FFE3C2",
    svg: '<path d="m12 14-1 1"/><path d="m13.75 18.25-1.25 1.42"/><path d="M17.775 5.654a15.68 15.68 0 0 0-12.121 12.12"/><path d="M18.8 9.3a1 1 0 0 0 2.1 7.7"/><path d="M21.964 20.732a1 1 0 0 1-1.232 1.232l-18-5a1 1 0 0 1-.695-1.232A19.68 19.68 0 0 1 15.732 2.037a1 1 0 0 1 1.232.695z"/>' },

  // ── Winter ─────────────────────────────────────────────────
  { id: "candy-cane", label: "Candy cane", lucide: "candy-cane", set: "Winter", ink: "#9E2B3F", bg: "#FBE4E7",
    svg: '<path d="m10.8 5 2.111 4.223"/><path d="M17.75 7 15 2.1"/><path d="m4.874 14.647 2.12 4.24"/><path d="M5.7 21a2 2 0 0 1-3.5-2l8.6-14a6 6 0 0 1 10.4 6 2 2 0 1 1-3.464-2 2 2 0 1 0-3.464-2z"/><path d="m7.906 9.712 2.005 4.411"/>' },
  { id: "candy", label: "Candy", lucide: "candy", set: "Winter", ink: "#13654A", bg: "#E4F0EB",
    svg: '<path d="M10 7v10.9"/><path d="M14 6.1V17"/><path d="M16 7V3a1 1 0 0 1 1.707-.707 2.5 2.5 0 0 0 2.152.717 1 1 0 0 1 1.131 1.131 2.5 2.5 0 0 0 .717 2.152A1 1 0 0 1 21 8h-4"/><path d="M16.536 7.465a5 5 0 0 0-7.072 0l-2 2a5 5 0 0 0 0 7.07 5 5 0 0 0 7.072 0l2-2a5 5 0 0 0 0-7.07"/><path d="M8 17v4a1 1 0 0 1-1.707.707 2.5 2.5 0 0 0-2.152-.717 1 1 0 0 1-1.131-1.131 2.5 2.5 0 0 0-.717-2.152A1 1 0 0 1 3 16h4"/>' },
  { id: "cookie", label: "Cookie", lucide: "cookie", set: "Winter", ink: "#7A4B1E", bg: "#F3E7DA",
    svg: '<path d="M11 17h.01"/><path d="M11.496 2c.324-.016.558.292.529.615a4 4 0 0 0 4.235 4.368.713.713 0 0 1 .758.757 4 4 0 0 0 4.366 4.237c.323-.03.63.204.614.527a10 10 0 0 1-2.915 6.566A1 1 0 0 1 4.93 4.918 10 10 0 0 1 11.496 2"/><path d="M12 12h.01"/><path d="M16 16h.01"/><path d="M16 3h.01"/><path d="M21 4h.01"/><path d="M21 8h.01"/><path d="M7 14h.01"/><path d="M9 8h.01"/>' },
  { id: "donut", label: "Donut", lucide: "donut", set: "Winter", ink: "#A34F00", bg: "#FFE3C2",
    svg: '<path d="M20.5 10a2.5 2.5 0 0 1-2.4-3H18a2.95 2.95 0 0 1-2.6-4.4 10 10 0 1 0 6.3 7.1c-.3.2-.8.3-1.2.3"/><circle cx="12" cy="12" r="3"/>' },
  { id: "milk", label: "Milk", lucide: "milk", set: "Winter", ink: "#13654A", bg: "#E4F0EB",
    svg: '<path d="M8 2h8"/><path d="M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2"/><path d="M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/>' },

  // ── Celebration (commencement, New Year, Valentine's) ──────
  { id: "cake", label: "Birthday cake", lucide: "cake", set: "Celebration", ink: "#A34F00", bg: "#FFE3C2",
    svg: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/>' },
  { id: "cupcake", label: "Cupcake", lucide: "cupcake", set: "Celebration", ink: "#9E2B3F", bg: "#FBE4E7",
    svg: '<path d="M12 22v-9"/><path d="M14 4h1a3 3 0 0 1 3 3l-.004.125A4 4 0 0 1 21 11v2"/><path d="m15.5 22 1.5-9"/><path d="M21 13a1 1 0 0 1 .919 1.394l-2.74 6.394A2 2 0 0 1 17.34 22H6.659a2 2 0 0 1-1.838-1.212l-2.74-6.394A1 1 0 0 1 3 13z"/><path d="M3 13v-2a4 4 0 0 1 3.003-3.875L6 7a3 3 0 0 1 3-3h1"/><path d="M8.5 22 7 13"/><circle cx="12" cy="4" r="2"/>' },
  { id: "cake-slice", label: "Cake slice", lucide: "cake-slice", set: "Celebration", ink: "#A34F00", bg: "#FFE3C2",
    svg: '<path d="M16 13H3"/><path d="M16 17H3"/><path d="m7.2 7.9-3.388 2.5A2 2 0 0 0 3 12.01V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8.654c0-2-2.44-6.026-6.44-8.026a1 1 0 0 0-1.082.057L10.4 5.6"/><circle cx="9" cy="7" r="2"/>' },
  { id: "dessert", label: "Pudding", lucide: "dessert", set: "Celebration", ink: "#7A4B1E", bg: "#F3E7DA",
    svg: '<path d="M10.162 3.167A10 10 0 0 0 2 13a2 2 0 0 0 4 0v-1a2 2 0 0 1 4 0v4a2 2 0 0 0 4 0v-4a2 2 0 0 1 4 0v1a2 2 0 0 0 4-.006 10 10 0 0 0-8.161-9.826"/><path d="M20.804 14.869a9 9 0 0 1-17.608 0"/><circle cx="12" cy="4" r="2"/>' },
  { id: "wine", label: "Toast", lucide: "wine", set: "Celebration", ink: "#13654A", bg: "#E4F0EB",
    svg: '<path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/>' }
];

export const VILLAGE_ICON_SETS = ["Everyday", "Spring", "Summer", "Fall", "Winter", "Celebration"];

// Which sets are in play on a given date. Celebration windows take over first,
// then the season, with Everyday always mixed in so the mark is never off-theme.
export function activeSets(date) {
  const d = date || new Date();
  const m = d.getMonth() + 1, day = d.getDate();
  if (m === 12 && day >= 10) return ["Celebration", "Winter", "Everyday"];       // holidays
  if (m === 1 && day <= 5) return ["Celebration", "Winter", "Everyday"];         // New Year
  if (m === 2 && day >= 10 && day <= 16) return ["Celebration", "Winter", "Everyday"]; // Valentine's
  if (m === 5 && day >= 10) return ["Celebration", "Spring", "Everyday"];        // commencement
  if (m >= 3 && m <= 5) return ["Spring", "Everyday"];
  if (m >= 6 && m <= 8) return ["Summer", "Everyday"];
  if (m >= 9 && m <= 11) return ["Fall", "Everyday"];
  return ["Winter", "Everyday"];
}

// Call once per session (on login), cache the id on the session, and pass the previous
// session's id so the mark never repeats twice in a row.
export function pickIcon(date, lastId) {
  const sets = activeSets(date);
  let pool = VILLAGE_ICONS.filter(function (i) { return sets.indexOf(i.set) !== -1; });
  if (lastId && pool.length > 1) pool = pool.filter(function (i) { return i.id !== lastId; });
  return pool[Math.floor(Math.random() * pool.length)];
}

export default VILLAGE_ICONS;
