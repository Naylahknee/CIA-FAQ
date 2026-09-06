const facts = [
  {
    id: "deposit", audience: ["student","parent"], category: "money", icon: "💳",
    studentQ: "How do I pay my tuition deposit?",
    parentQ: "How is the tuition deposit paid?",
    studentA: "Sign in to the CIA Accepted Student Portal, choose Online Payment, then Make a Payment. Continue to the Payment Center, select Deposits, choose your enrollment term and deposit, then complete payment.",
    parentA: "The deposit is initiated through the student’s CIA Accepted Student Portal. The student selects the enrollment term and deposit inside the Payment Center before entering the payment method.",
    stepStudent: "Have your enrollment date and payment method ready before you begin.",
    stepParent: "Coordinate payment with your student; do not rely on the student portal as your future parent login.",
    source: "Official · Tuition Deposit Instructions", sourceType: "official"
  },
  {
    id: "costs", audience: ["student","parent"], category: "money", icon: "🧾",
    studentQ: "What will CIA cost beyond tuition?",
    parentQ: "What costs should our family expect beyond tuition?",
    studentA: "For Fall 2026 starts, the rate sheet lists a required undergraduate meal plan, general fee, housing if applicable, a one-time supplies fee, orientation fee, and annual health insurance unless waived. Some actions can trigger additional fees.",
    parentA: "Beyond $19,755 per-semester full-time tuition, the Fall 2026 rate sheet lists a $2,595 meal plan, $885 general fee, housing from $4,135 to $5,560 per semester, a $1,194 one-time supplies fee, $275 orientation fee, and $2,100 annual health insurance that may be waived.",
    stepStudent: "Review your individual bill; the rate sheet is a planning tool, not your account balance.",
    stepParent: "Budget separately for travel, personal expenses, books, laundry, and costs not shown on the school rate sheet.",
    source: "Official · NY Rates 2026–27 (corrected April 8, 2026)", sourceType: "official"
  },
  {
    id: "proxy", audience: ["student","parent"], category: "money", icon: "🔐",
    studentQ: "How do I let a parent see grades or financial information?",
    parentQ: "Why can’t I see my student’s grades or account information?",
    studentA: "In Student Self-Service, open View My Financial Aid, then User Options and View/Add Proxy Access. Add the person and choose exactly which information they may see.",
    parentA: "Your student must create your Proxy User access and select what you may view. Proxy access can cover grades, finances, or course status. It is separate from TouchNet Authorized User access, which is used to make payments.",
    stepStudent: "Decide what access is actually useful before checking the authorization boxes.",
    stepParent: "Use the proxy or payment link sent for your account—not your student’s sign-in page.",
    source: "Official · Student Self-Service Proxy Guide, reviewed April 2025", sourceType: "official"
  },
  {
    id: "textbooks", audience: ["student","parent"], category: "classes", icon: "📚",
    studentQ: "Where do I find and order my textbooks?",
    parentQ: "Do we have to buy textbooks from the campus bookstore?",
    studentA: "Use Purchase My Textbooks in the CIA portal, then search with the course information from your schedule. Some courses have no required books; others have several. Compare print, digital, rental, and purchase options.",
    parentA: "No. The school-associated bookstore is useful for identifying the correct title and edition, but the ordering guide says students may use another vendor. Confirm the exact edition before buying elsewhere.",
    stepStudent: "Check every course before ordering, and confirm whether a book is required or optional.",
    stepParent: "Avoid buying a mystery mountain of books before the student has checked the actual schedule.",
    source: "Official · Ordering Your CIA Textbooks", sourceType: "official"
  },
  {
    id: "kits", audience: ["student","parent"], category: "classes", icon: "🔪",
    studentQ: "What comes in my culinary or baking kit?",
    parentQ: "Should we purchase a separate knife set?",
    studentA: "The Culinary Kit includes multiple knives with guards, shears, scrapers, tongs, whisk, peelers, plating tools, sharpening steel, and a knife pack. The Baking & Pastry Kit has a different mix, including cutters, pastry tools, rulers, spatulas, and a tube set.",
    parentA: "CIA’s one-time supplies fee is tied to an included program kit. Culinary and Baking & Pastry students receive different tools. Review the appropriate list before purchasing duplicates.",
    stepStudent: "Inventory and label every item when you receive the kit. Keep knives in their guards and pack.",
    stepParent: "Wait for the program-specific kit inventory before buying extra tools.",
    source: "Official · 2026 Culinary and Baking & Pastry Kit lists", sourceType: "official"
  },
  {
    id: "meal", audience: ["student","parent"], category: "living", icon: "🍽️",
    studentQ: "What is the difference between Blue and Gold Points?",
    parentQ: "How does the freshman meal plan actually work?",
    studentA: "Freshmen receive 20 Blue Points each class day. They load at 2 a.m. and expire at 11:59 p.m. Gold Points—325 per semester—work like cash at additional CIA dining locations and do not follow that daily expiration.",
    parentA: "The plan is part of CIA’s educational dining model. Blue Points encourage students to eat food produced in instructional kitchens during class days. Gold Points provide more flexible spending, especially for weekends and Down Days.",
    stepStudent: "Use Blue Points before they expire; try to save Gold Points for days when Blue Points are unavailable.",
    stepParent: "Ask whether the problem is a lack of food or simply unused daily Blue Points before adding more Gold Points.",
    source: "Official · Freshman Meal-Plan Guide", sourceType: "official"
  },
  {
    id: "allergy", audience: ["student","parent"], category: "health", icon: "⚕️",
    studentQ: "What should I do if I have a food allergy?",
    parentQ: "How should my student prepare for food allergies at culinary school?",
    studentA: "The school’s published protocol is Inform, Question, Protect. Contact Health Services and Disability Services, provide medical documentation, coordinate dining accommodations when needed, and tell each chef or instructor at the beginning of relevant courses.",
    parentA: "Culinary students may encounter allergens in dining spaces, kitchens, and academic classes. The student must coordinate with Health Services and Disability Services and communicate directly with chefs and instructors.",
    stepStudent: "Never rely on another student to confirm ingredients. Ask the chef or instructor in charge and keep prescribed emergency medication accessible.",
    stepParent: "Help assemble current medical documentation, but make sure your student can explain the allergy and safety plan independently.",
    source: "Needs verification · Allergy brochure dated 2023", sourceType: "verify"
  },
  {
    id: "medical", audience: ["student","parent"], category: "health", icon: "🏥",
    studentQ: "Where can I go for medication or urgent medical care?",
    parentQ: "What medical care is available near Hyde Park?",
    studentA: "The uploaded campus resource lists pharmacies in Hyde Park and Poughkeepsie, urgent-care offices, and two local hospitals: Vassar Brothers Medical Center and Mid-Hudson Regional Hospital.",
    parentA: "A campus resource lists nearby pharmacies, urgent-care offices, Vassar Brothers Medical Center, and Mid-Hudson Regional Hospital. Hours and availability should be confirmed before travel.",
    stepStudent: "Save campus safety and health contacts in your phone. For an emergency, call 911 rather than searching this guide.",
    stepParent: "Confirm the student’s insurance network and preferred pharmacy before move-in.",
    source: "May change · Local medical-resource sheet, August 2026", sourceType: "verify"
  },
  {
    id: "movein", audience: ["student","parent"], category: "arrival", icon: "📦",
    studentQ: "What should I bring on move-in day?",
    parentQ: "How do we avoid overpacking for move-in?",
    studentA: "Bring the essentials for sleeping, bathing, laundry, medications, documents, schoolwork, and the first week. Confirm your housing assignment and current residence-hall rules before buying appliances or bulky storage.",
    parentA: "Families repeatedly discuss move-in and storage because students eventually have to carry their belongings back out. Prioritize essentials and confirm what the room includes before purchasing furniture-sized optimism.",
    stepStudent: "Make three piles: must arrive with me, can ship later, and can stay home.",
    stepParent: "Label belongings and keep receipts. Let the student own the final packing list.",
    source: "Village insight · Recurring GroupMe discussion", sourceType: "village"
  },
  {
    id: "roommate", audience: ["student","parent"], category: "living", icon: "🛏️",
    studentQ: "What should I do about a roommate problem?",
    parentQ: "When should I step into a roommate conflict?",
    studentA: "Start with a calm, specific conversation about the behavior and the agreement you need. If the issue continues or feels unsafe, document what happened and contact the RA or housing staff.",
    parentA: "Coach your student to describe the issue, communicate directly, and use the RA or housing process. Step in immediately only when safety, discrimination, harassment, or an unresolved serious health concern is involved.",
    stepStudent: "Describe dates and specific behavior—not just ‘we don’t get along.’",
    stepParent: "Help your student prepare the message; do not automatically send it for them.",
    source: "Village guidance · Verify current housing procedures", sourceType: "village"
  },
  {
    id: "calendar", audience: ["student","parent"], category: "classes", icon: "🗓️",
    studentQ: "Are regular college holidays always days off?",
    parentQ: "When should we book travel home?",
    studentA: "Do not assume. The CIA calendar distinguishes semester dates, kitchen or bakeshop dates, restaurant closures, no-class days, Saturday classes, and special project days.",
    parentA: "Use the CIA academic calendar and the student’s actual course schedule before purchasing travel. Restaurant closures and no-class days are not interchangeable.",
    stepStudent: "Confirm class obligations with the instructor before making nonrefundable plans.",
    stepParent: "Wait for the student to verify the schedule before booking travel.",
    source: "Official · 2026–27 Hyde Park Academic Calendar; subject to change", sourceType: "official"
  },
  {
    id: "uniform", audience: ["student","parent"], category: "classes", icon: "🥼",
    studentQ: "When and where will I need my full uniform?",
    parentQ: "What if the uniform or kitchen shoes do not fit or arrive on time?",
    studentA: "Kitchen and bakeshop clothing rules are different from ordinary academic-class clothing. Community members consistently recommend trying on every uniform piece and both shoes before the first required wear date. Do not assume a loose chef coat is automatically the wrong size; its fit also serves a safety purpose.",
    parentA: "Have the student try on the complete uniform and kitchen shoes before classes begin. If something is missing or clearly does not fit, the student should contact the campus uniform provider or appropriate school office immediately instead of waiting for the first lab.",
    stepStudent: "Confirm the current uniform policy and your first required uniform day in the student portal or with your instructor.",
    stepParent: "Keep packaging and receipts until fit is confirmed. Let the student handle the exchange conversation when possible.",
    source: "Village insight · Confirm against the current CIA uniform policy", sourceType: "village"
  },
  {
    id: "laundry", audience: ["student","parent"], category: "living", icon: "🧺",
    studentQ: "How should I handle laundry and stained chef whites?",
    parentQ: "What laundry supplies are actually useful?",
    studentA: "Parents repeatedly recommend a portable laundry bag or basket, stain treatment, and using the correct amount of detergent. Culinary clothing can collect grease and protein stains, so treat stains promptly and follow the garment-care directions rather than experimenting the night before class.",
    parentA: "A portable hamper, ordinary detergent, and a reliable stain treatment are more useful than an elaborate laundry laboratory. The GroupMe reports that residence-hall machines were included for this cohort, but students should confirm the current arrangement after arrival.",
    stepStudent: "Read each garment label, test stain products carefully, and schedule laundry before you run out of clean required clothing.",
    stepParent: "Send enough supplies for the first weeks—not a wholesale-club quantity the student must later carry home.",
    source: "Village insight · Based on recurring GroupMe laundry discussions", sourceType: "village"
  },
  {
    id: "printer", audience: ["student","parent"], category: "classes", icon: "🖨️",
    studentQ: "Do I need to bring a printer?",
    parentQ: "Should we buy a dorm-room printer?",
    studentA: "A personal printer appears to be optional, not essential. The parent group reports that campus printing is available, while personal wireless-printer setup can create its own problems. Start with campus resources unless you already know frequent private printing is important to you.",
    parentA: "Do not buy a printer automatically. Consider the student’s program, printing habits, roommate plans, ink costs, Wi-Fi compatibility, and the fact that every extra device eventually has to leave the dorm again.",
    stepStudent: "Locate campus printing during your first week, then decide whether a personal printer would genuinely save time.",
    stepParent: "Wait until the student has used the campus option before purchasing another machine and its tiny, expensive juice boxes.",
    source: "Village insight · Campus printing availability should be reconfirmed", sourceType: "village"
  },
  {
    id: "orientation", audience: ["student","parent"], category: "arrival", icon: "🧭",
    studentQ: "How much of orientation do I really need to attend?",
    parentQ: "Should we plan errands or family activities during orientation?",
    studentA: "Treat the orientation schedule as required working time. It introduces offices, systems, academic expectations, campus resources, and other students. Check the schedule sent directly to your CIA account rather than relying on a screenshot from someone else.",
    parentA: "The GroupMe experience suggests the student schedule is tight and may continue while parents are handling final errands. Avoid planning optional family activities during the student’s assigned orientation blocks.",
    stepStudent: "Open the current orientation schedule, add every required item to your calendar, and note where you must report.",
    stepParent: "Plan your goodbye and shopping around the official student schedule—not around what another family received.",
    source: "Village insight · Orientation schedules vary by cohort", sourceType: "village"
  },
  {
    id: "travel", audience: ["student","parent"], category: "arrival", icon: "🚆",
    studentQ: "How do I get to the train station or airport for breaks?",
    parentQ: "Does CIA provide transportation for every school break?",
    studentA: "Do not assume a campus shuttle operates for your destination or travel date. GroupMe discussions indicate that prior shuttle service was limited and did not necessarily serve the Poughkeepsie train station or every holiday break.",
    parentA: "Build the travel plan around the student’s confirmed last obligation and a verified transportation option. Community members commonly discussed rideshare to the Poughkeepsie station and limited end-of-semester airport shuttles, but schedules and fees can change.",
    stepStudent: "Check current CIA transportation notices before buying tickets, then identify a backup ride and allow weather time.",
    stepParent: "Do not purchase a tight, nonrefundable itinerary until the class schedule and transportation are confirmed.",
    source: "Needs verification · Transportation schedules and fees may change", sourceType: "verify"
  },
  {
    id: "work", audience: ["student","parent"], category: "money", icon: "💼",
    studentQ: "Can I work while I am enrolled?",
    parentQ: "What should my student bring if they plan to work?",
    studentA: "Campus and nearby work options may have different eligibility and documentation requirements. GroupMe participants discussed Earn and Learn, Federal Work-Study, limited food-service positions, and off-campus employment as separate categories—not one interchangeable program.",
    parentA: "Do not assume every campus role is Federal Work-Study or requires the same employment documents. The student should confirm the position type and required original identification before bringing sensitive documents to campus.",
    stepStudent: "Ask the hiring office which program the job belongs to, whether you are eligible, and exactly which documents are required.",
    stepParent: "If originals are required, help the student plan secure storage; otherwise use copies where the hiring office permits them.",
    source: "Village insight · Employment eligibility and documentation need official confirmation", sourceType: "verify"
  },
  {
    id: "mail", audience: ["student","parent"], category: "living", icon: "✉️",
    studentQ: "How will I receive mail and packages?",
    parentQ: "Where should we send packages?",
    studentA: "Use your legal name exactly as it is recorded with the school on every package or letter. For the New York campus, use:<br><br><strong>The Culinary Institute of America</strong><br>C/O [Student’s Legal Name]<br>1946 Campus Drive<br>Hyde Park, NY 12538",
    parentA: "Send packages to the specific campus where your student is enrolled and use the student’s legal name registered with the school. For Hyde Park, address packages as:<br><br><strong>The Culinary Institute of America</strong><br>C/O [Student’s Legal Name]<br>1946 Campus Drive<br>Hyde Park, NY 12538",
    stepStudent: "Give family members and online retailers this exact format. Your package name must match your school record and student ID.",
    stepParent: "Double-check the student’s legal name and campus before shipping. Do not use a nickname, preferred name, or another CIA campus address.",
    source: "Official · CIA New York campus information and 2022–23 Student Handbook", sourceType: "official"
  },
  {
    id: "celebration", audience: ["student","parent"], category: "living", icon: "🎉",
    studentQ: "Can my family send me a Celebration Gram?",
    parentQ: "How can I send my student a Celebration Gram?",
    studentA: "Yes. CIA provides an online Celebration Gram form families can use to recognize a birthday, accomplishment, milestone, or supportive moment.",
    parentA: "Use CIA’s online Celebration Gram form and follow the current instructions shown there. Available choices, prices, timing, and delivery details may change, so rely on the form rather than an older screenshot.",
    stepStudent: "Give your family the legal name and campus information CIA uses for your student record.",
    stepParent: "Confirm the student’s legal name and campus, complete every required field, and save the submission confirmation.",
    source: "CIA · Celebration Gram form", sourceType: "official",
    link: "https://ciachef.formstack.com/forms/celebration_gram",
    linkLabel: "Open the Celebration Gram form"
  }
];

const lists = {
  before: {
    student: ["Pay the tuition deposit","Review your individual bill","Confirm housing and move-in instructions","Complete assigned online orientation","Submit your student ID photo","Try on your uniform and shoes","Check required textbooks","Save health and emergency contacts"],
    parent: ["Review the family budget","Set up proxy access if invited","Set up payment access if needed","Confirm travel using the latest Arrival Guide","Verify insurance and pharmacy plans","Save the package address format","Let your student own one school task"]
  },
  after: {
    student: ["Check CIA email and portal","Review your class schedule","Confirm required textbooks","Inventory and label your program kit","Set a uniform-laundry routine","Save health and emergency contacts","Check your bill for holds or errors","Contact the right office about one open issue"],
    parent: ["Agree on a weekly check-in time","Finish proxy access if invited","Use separate payment access if needed","Review the family budget","Verify insurance and pharmacy plans","Save the package address format","Let your student handle one school issue"]
  }
};

let audience = "student";
let phase = "after";
document.body.dataset.phase = phase;
document.querySelector("#view-title").textContent = "Student essentials on campus";
let category = "all";
const search = document.querySelector("#search");
const cards = document.querySelector("#cards");
const empty = document.querySelector("#empty");

function renderCards() {
  const term = search.value.trim().toLowerCase();
  const matches = facts.filter(item => {
    const matchesCategory = category === "all" || item.category === category;
    const blob = [item.studentQ,item.parentQ,item.studentA,item.parentA,item.stepStudent,item.stepParent,item.source].join(" ").toLowerCase();
    return item.audience.includes(audience) && matchesCategory && (!term || blob.includes(term));
  });
  cards.innerHTML = matches.map(item => {
    const q = audience === "student" ? item.studentQ : item.parentQ;
    const answer = audience === "student" ? item.studentA : item.parentA;
    const step = audience === "student" ? item.stepStudent : item.stepParent;
    return `<article class="faq-card">
      <button class="faq-question" aria-expanded="false">
        <span class="category-icon" aria-hidden="true">${item.icon}</span>
        <span>${q}</span><span class="chevron" aria-hidden="true">+</span>
      </button>
      <div class="faq-answer"><p>${answer}</p><div class="next-step"><strong>What to do:</strong> ${step}</div><span class="source ${item.sourceType}">${item.source}</span>${item.link ? `<a class="faq-link" href="${item.link}" target="_blank" rel="noopener">${item.linkLabel} ↗</a>` : ""}</div>
    </article>`;
  }).join("");
  document.querySelector("#result-count").textContent = `${matches.length} ${matches.length === 1 ? "answer" : "answers"}`;
  empty.hidden = matches.length !== 0;
  cards.querySelectorAll(".faq-question").forEach(button => button.addEventListener("click", () => {
    const card = button.closest(".faq-card");
    const isOpen = card.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
  }));
}

function checklistKey() { return `mva-cia-${phase}-${audience}-checklist`; }
function getChecks() { try { return JSON.parse(localStorage.getItem(checklistKey())) || []; } catch { return []; } }
function renderChecklist() {
  const checked = getChecks();
  document.querySelector("#checklist").innerHTML = lists[phase][audience].map((text,index) => `<label class="check-item"><input type="checkbox" data-index="${index}" ${checked.includes(index) ? "checked" : ""}><span>${text}</span></label>`).join("");
  document.querySelectorAll("#checklist input").forEach(input => input.addEventListener("change", saveChecklist));
  updateProgress();
}
function saveChecklist() {
  const checked = [...document.querySelectorAll("#checklist input:checked")].map(input => Number(input.dataset.index));
  localStorage.setItem(checklistKey(), JSON.stringify(checked));
  updateProgress();
}
function updateProgress() {
  const total = lists[phase][audience].length;
  const done = document.querySelectorAll("#checklist input:checked").length;
  document.querySelector("#progress-label").textContent = `${done}/${total}`;
  document.querySelector("#progress-bar").style.width = `${(done/total)*100}%`;
}

document.querySelectorAll(".audience-btn").forEach(button => button.addEventListener("click", () => {
  audience = button.dataset.audience;
  document.querySelectorAll(".audience-btn").forEach(btn => { btn.classList.toggle("active", btn === button); btn.setAttribute("aria-selected", String(btn === button)); });
  document.querySelector("#view-title").textContent = `${audience === "student" ? "Student" : "Parent"} essentials ${phase === "before" ? "before move-in" : "on campus"}`;
  search.placeholder = audience === "student" ? "Search housing, meal points, uniforms…" : "Search costs, proxy access, move-in…";
  renderCards(); renderChecklist();
}));
document.querySelectorAll(".phase-btn").forEach(button => button.addEventListener("click", () => {
  phase = button.dataset.phase;
  document.body.dataset.phase = phase;
  document.querySelectorAll(".phase-btn").forEach(btn => { btn.classList.toggle("active", btn === button); btn.setAttribute("aria-selected", String(btn === button)); });
  document.querySelector(".checklist-panel .eyebrow").textContent = phase === "before" ? "Before arrival" : "First weeks";
  document.querySelector(".checklist-panel h2").textContent = phase === "before" ? "Get ready" : "Do this now";
  document.querySelector("#view-title").textContent = `${audience === "student" ? "Student" : "Parent"} essentials ${phase === "before" ? "before move-in" : "on campus"}`;
  renderCards(); renderChecklist();
}));
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  category = button.dataset.category;
  document.querySelectorAll(".filter").forEach(btn => btn.classList.toggle("active", btn === button));
  renderCards();
}));
search.addEventListener("input", renderCards);
document.querySelector("#reset-checklist").addEventListener("click", () => { localStorage.removeItem(checklistKey()); renderChecklist(); });
document.querySelectorAll(".wall-tab").forEach(button => button.addEventListener("click", () => {
  const selected = button.dataset.wall;
  document.querySelectorAll(".wall-tab").forEach(tab => {
    const active = tab === button;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  document.querySelector("#resources-wall").hidden = selected !== "resources";
  document.querySelector("#memories-wall").hidden = selected !== "memories";
}));
document.querySelectorAll("[data-search]").forEach(link => link.addEventListener("click", () => {
  category = "all";
  document.querySelectorAll(".filter").forEach(btn => btn.classList.toggle("active", btn.dataset.category === "all"));
  search.value = link.dataset.search;
  renderCards();
  setTimeout(() => search.focus(), 0);
}));

renderCards();
renderChecklist();

async function loadCommunityWalls() {
  try {
    const response = await fetch("/api/submissions");
    if (!response.ok) return;
    const { submissions } = await response.json();
    const memoryItems = submissions.filter(item => item.kind === "memory");
    const resourceItems = submissions.filter(item => item.kind === "resource");
    const card = item => `<article class="approved-wall-card"><img src="${item.imageUrl}" alt=""><div><small>${item.kind === "memory" ? "Community memory" : "Shared resource"}</small><h3>${escapeWallText(item.title)}</h3><p>${escapeWallText(item.caption)}</p>${item.studentName ? `<span>${escapeWallText(item.studentName)}</span>` : ""}</div></article>`;
    document.querySelector("#approved-memories").innerHTML = memoryItems.map(card).join("");
    document.querySelector("#approved-resources").innerHTML = resourceItems.map(card).join("");
    if (memoryItems.length) document.querySelector(".memory-empty").hidden = true;
  } catch { /* The static guide remains usable if community content is unavailable. */ }
}
function escapeWallText(value) {
  const node = document.createElement("span");
  node.textContent = String(value ?? "");
  return node.innerHTML;
}
loadCommunityWalls();
