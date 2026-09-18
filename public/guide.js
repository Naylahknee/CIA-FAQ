const facts = [
  {
    id: "deposit", audience: ["student","parent"], category: "money", icon: "💳",
    studentQ: "How do I pay my tuition deposit?",
    parentQ: "How is the tuition deposit paid?",
    studentA: "Sign in to the CIA Accepted Student Portal, choose Online Payment, then Make a Payment. Continue to the Payment Center, select Deposits, choose your enrollment term and deposit, then complete payment.",
    parentA: "The deposit is initiated through the student’s CIA Accepted Student Portal. The student selects the enrollment term and deposit inside the Payment Center before entering the payment method.",
    stepStudent: "Have your enrollment date and payment method ready before you begin.",
    stepParent: "Coordinate payment with your student; do not rely on the student portal as your future parent login.",
    source: "Official · Tuition Deposit Instructions", sourceType: "official",
    link: "https://www.ciachef.edu/cia-login/",
    linkLabel: "Open the CIA login page"
  },
  {
    id: "costs", audience: ["student","parent"], category: "money", icon: "🧾",
    studentQ: "What will CIA cost beyond tuition?",
    parentQ: "What costs should our family expect beyond tuition?",
    studentA: "For Fall 2026 starts, the rate sheet lists a required undergraduate meal plan, general fee, housing if applicable, a one-time supplies fee, orientation fee, and annual health insurance unless waived. Some actions can trigger additional fees.",
    parentA: "Beyond $19,755 per-semester full-time tuition, the Fall 2026 rate sheet lists a $2,595 meal plan, $885 general fee, housing from $4,135 to $5,560 per semester, a $1,194 one-time supplies fee, $275 orientation fee, and $2,100 annual health insurance that may be waived.",
    stepStudent: "Review your individual bill; the rate sheet is a planning tool, not your account balance.",
    stepParent: "Budget separately for travel, personal expenses, books, laundry, and costs not shown on the school rate sheet.",
    source: "Official · NY Rates 2026–27 (corrected April 8, 2026)", sourceType: "official",
    link: "https://www.ciachef.edu/cia-tuition/",
    linkLabel: "View CIA tuition and fees"
  },
  {
    id: "proxy", audience: ["student","parent"], category: "money", icon: "🔐",
    studentQ: "How do I let a parent see grades or financial information?",
    parentQ: "Why can’t I see my student’s grades or account information?",
    studentA: "In Student Self-Service, open View My Financial Aid, then User Options and View/Add Proxy Access. Add the person and choose exactly which information they may see.",
    parentA: "Your student must create your Proxy User access and select what you may view. Proxy access can cover grades, finances, or course status. It is separate from TouchNet Authorized User access, which is used to make payments.",
    stepStudent: "Decide what access is actually useful before checking the authorization boxes.",
    stepParent: "Use the proxy or payment link sent for your account—not your student’s sign-in page.",
    source: "Official · Student Self-Service Proxy Guide, reviewed April 2025", sourceType: "official",
    link: "https://ciamainmenu.culinary.edu/",
    linkLabel: "Open CIA Main Menu"
  },
  {
    id: "textbooks", audience: ["student","parent"], category: "classes", icon: "📚",
    studentQ: "Where do I find and order my textbooks?",
    parentQ: "Do we have to buy textbooks from the campus bookstore?",
    studentA: "Use Purchase My Textbooks in the CIA portal, then search with the course information from your schedule. Some courses have no required books; others have several. Compare print, digital, rental, and purchase options.",
    parentA: "No. The school-associated bookstore is useful for identifying the correct title and edition, but the ordering guide says students may use another vendor. Confirm the exact edition before buying elsewhere.",
    stepStudent: "Check every course before ordering, and confirm whether a book is required or optional.",
    stepParent: "Avoid buying a mystery mountain of books before the student has checked the actual schedule.",
    source: "Official · Ordering Your CIA Textbooks", sourceType: "official",
    link: "https://ciamainmenu.culinary.edu/",
    linkLabel: "Open textbook access in CIA Main Menu"
  },
  {
    id: "kits", audience: ["student","parent"], category: "classes", icon: "🔪",
    studentQ: "What comes in my culinary or baking kit?",
    parentQ: "Should we purchase a separate knife set?",
    studentA: "The Culinary Kit includes multiple knives with guards, shears, scrapers, tongs, whisk, peelers, plating tools, sharpening steel, and a knife pack. The Baking & Pastry Kit has a different mix, including cutters, pastry tools, rulers, spatulas, and a tube set.",
    parentA: "CIA’s one-time supplies fee is tied to an included program kit. Culinary and Baking & Pastry students receive different tools. Review the appropriate list before purchasing duplicates.",
    stepStudent: "Inventory and label every item when you receive the kit. Keep knives in their guards and pack.",
    stepParent: "Wait for the program-specific kit inventory before buying extra tools.",
    source: "Official · 2026 Culinary and Baking & Pastry Kit lists", sourceType: "official",
    link: "https://ciamainmenu.culinary.edu/",
    linkLabel: "Open CIA Main Menu"
  },
  {
    id: "meal", audience: ["student","parent"], category: "living", icon: "🍽️",
    studentQ: "What is the difference between Blue and Gold Points?",
    parentQ: "How does the freshman meal plan actually work?",
    studentA: "Freshmen receive 20 Blue Points each class day. They load at 2 a.m. and expire at 11:59 p.m. Blue Points are not issued on weekends. Gold Points—325 per semester—work like cash at additional CIA dining locations and cover weekends and Down Days.",
    parentA: "Blue Points are for class days and expire daily; Gold Points are the flexible balance used on weekends and Down Days. The September parent discussion also clarified that stepping up the meal plan adds Gold Points—it does not increase the daily Blue Point amount.",
    stepStudent: "Use Blue Points before they expire; try to save Gold Points for days when Blue Points are unavailable.",
    stepParent: "Ask whether the problem is a lack of food or simply unused daily Blue Points before adding more Gold Points.",
    source: "Official · Freshman Meal-Plan Guide", sourceType: "official",
    link: "https://www.ciachef.edu/cia-tuition/",
    linkLabel: "View the current CIA meal-plan charge"
  },
  {
    id: "allergy", audience: ["student","parent"], category: "health", icon: "⚕️",
    studentQ: "What should I do if I have a food allergy?",
    parentQ: "How should my student prepare for food allergies at culinary school?",
    studentA: "The school’s published protocol is Inform, Question, Protect. Contact Health Services and Disability Services, provide medical documentation, coordinate dining accommodations when needed, and tell each chef or instructor at the beginning of relevant courses.",
    parentA: "Culinary students may encounter allergens in dining spaces, kitchens, and academic classes. The student must coordinate with Health Services and Disability Services and communicate directly with chefs and instructors.",
    stepStudent: "Never rely on another student to confirm ingredients. Ask the chef or instructor in charge and keep prescribed emergency medication accessible.",
    stepParent: "Help assemble current medical documentation, but make sure your student can explain the allergy and safety plan independently.",
    source: "Needs verification · Allergy brochure dated 2023", sourceType: "verify",
    link: "https://catalog.ciachef.edu/",
    linkLabel: "Open the current CIA handbook"
  },
  {
    id: "medical", audience: ["student","parent"], category: "health", icon: "🏥",
    studentQ: "Where can I go for medication or urgent medical care?",
    parentQ: "What medical care is available near Hyde Park?",
    studentA: "The uploaded campus resource lists pharmacies, urgent-care offices, Vassar Brothers Medical Center, and Mid-Hudson Regional Hospital. The September parent group also located campus Health Services below the dining hall, near the mailroom hallway; confirm the current entrance and hours before relying on that description.",
    parentA: "A campus resource lists nearby pharmacies, urgent-care offices, Vassar Brothers Medical Center, and Mid-Hudson Regional Hospital. Campus Health Services was described as below the dining hall near the mailroom hallway. Hours and availability should be confirmed before travel.",
    stepStudent: "Save campus safety and health contacts in your phone. For an emergency, call 911 rather than searching this guide.",
    stepParent: "Confirm the student’s insurance network and preferred pharmacy before move-in.",
    source: "May change · Local medical-resource sheet, August 2026", sourceType: "verify",
    link: "https://catalog.ciachef.edu/",
    linkLabel: "Open the current CIA handbook"
  },
  {
    id: "movein", audience: ["student","parent"], category: "arrival", icon: "📦",
    studentQ: "What should I bring on move-in day?",
    parentQ: "How do we avoid overpacking for move-in?",
    studentA: "Bring the essentials for sleeping, bathing, laundry, medications, documents, schoolwork, and the first week. Confirm your housing assignment and current residence-hall rules before buying appliances or bulky storage.",
    parentA: "Families repeatedly discuss move-in and storage because students eventually have to carry their belongings back out. Prioritize essentials and confirm what the room includes before purchasing furniture-sized optimism.",
    stepStudent: "Make three piles: must arrive with me, can ship later, and can stay home.",
    stepParent: "Label belongings and keep receipts. Let the student own the final packing list.",
    source: "Village insight · Recurring GroupMe discussion", sourceType: "village",
    link: "https://www.ciachef.edu/parents/",
    linkLabel: "Open CIA information for parents"
  },
  {
    id: "roommate", audience: ["student","parent"], category: "living", icon: "🛏️",
    studentQ: "What should I do about a roommate problem?",
    parentQ: "When should I step into a roommate conflict?",
    studentA: "Start with a calm, specific conversation about the behavior and the agreement you need. If the issue continues or feels unsafe, document what happened and contact the RA or housing staff.",
    parentA: "Coach your student to describe the issue, communicate directly, and use the RA or housing process. Step in immediately only when safety, discrimination, harassment, or an unresolved serious health concern is involved.",
    stepStudent: "Describe dates and specific behavior—not just ‘we don’t get along.’",
    stepParent: "Help your student prepare the message; do not automatically send it for them.",
    source: "Village guidance · Verify current housing procedures", sourceType: "village",
    link: "https://catalog.ciachef.edu/",
    linkLabel: "Check the current CIA handbook"
  },
  {
    id: "calendar", audience: ["student","parent"], category: "classes", icon: "🗓️",
    studentQ: "Are regular college holidays always days off?",
    parentQ: "When should we book travel home?",
    studentA: "Do not assume. The CIA calendar distinguishes semester dates, kitchen or bakeshop dates, restaurant closures, no-class days, Saturday classes, and special project days.",
    parentA: "Use the CIA academic calendar and the student’s actual course schedule before purchasing travel. Restaurant closures and no-class days are not interchangeable.",
    stepStudent: "Confirm class obligations with the instructor before making nonrefundable plans.",
    stepParent: "Wait for the student to verify the schedule before booking travel.",
    source: "Official · 2026–27 Hyde Park Academic Calendar; subject to change", sourceType: "official",
    link: "https://ciamainmenu.culinary.edu/",
    linkLabel: "Open the current calendar in CIA Main Menu"
  },
  {
    id: "uniform", audience: ["student","parent"], category: "classes", icon: "🥼",
    studentQ: "When and where will I need my full uniform?",
    parentQ: "What if the uniform or kitchen shoes do not fit or arrive on time?",
    studentA: "Kitchen and bakeshop clothing rules are different from ordinary academic-class clothing. Community members consistently recommend trying on every uniform piece and both shoes before the first required wear date. Do not assume a loose chef coat is automatically the wrong size; its fit also serves a safety purpose.",
    parentA: "Have the student try on the complete uniform and kitchen shoes before classes begin. If something is missing or clearly does not fit, the student should contact the campus uniform provider or appropriate school office immediately instead of waiting for the first lab.",
    stepStudent: "Confirm the current uniform policy and your first required uniform day in the student portal or with your instructor.",
    stepParent: "Keep packaging and receipts until fit is confirmed. Let the student handle the exchange conversation when possible.",
    source: "Village insight · Confirm against the current CIA uniform policy", sourceType: "village",
    link: "https://ciamainmenu.culinary.edu/",
    linkLabel: "Check the current policy in CIA Main Menu"
  },
  {
    id: "laundry", audience: ["student","parent"], category: "living", icon: "🧺",
    studentQ: "How should I handle laundry and stained chef whites?",
    parentQ: "What laundry supplies are actually useful?",
    studentA: "Parents repeatedly recommend a portable laundry bag or basket, stain treatment, and using the correct amount of detergent. Culinary clothing can collect grease and protein stains, so treat stains promptly and follow the garment-care directions rather than experimenting the night before class.",
    parentA: "A portable hamper, ordinary detergent, and a reliable stain treatment are more useful than an elaborate laundry laboratory. The GroupMe reports that residence-hall machines were included for this cohort, but students should confirm the current arrangement after arrival.",
    stepStudent: "Read each garment label, test stain products carefully, and schedule laundry before you run out of clean required clothing.",
    stepParent: "Send enough supplies for the first weeks—not a wholesale-club quantity the student must later carry home.",
    source: "Village insight · Based on recurring GroupMe laundry discussions", sourceType: "village",
    link: "https://catalog.ciachef.edu/",
    linkLabel: "Check current residence-life information"
  },
  {
    id: "printer", audience: ["student","parent"], category: "classes", icon: "🖨️",
    studentQ: "Do I need to bring a printer?",
    parentQ: "Should we buy a dorm-room printer?",
    studentA: "A personal printer appears to be optional, not essential. Campus printing is available, while personal wireless printers may not connect normally to the college network. Families reported success with a direct USB printer cable; unresolved Wi-Fi, printing, or portal problems should go to the Student ITS Help Desk.",
    parentA: "Do not buy a printer automatically. Consider campus printing, ink costs, network compatibility, and whether a low-cost USB printer cable solves the problem before adding another device to the dorm.",
    stepStudent: "Try campus printing first. For connection or account trouble, visit the Student ITS Help Desk in the library/computer-lab area or email ITHelp@cia.culinary.edu.",
    stepParent: "Wait until the student has used the campus option before purchasing another machine and its tiny, expensive juice boxes.",
    source: "Village insight · Campus printing availability should be reconfirmed", sourceType: "village",
    link: "https://www.ciachef.edu/hilton/",
    linkLabel: "Open the Conrad N. Hilton Library page"
  },
  {
    id: "orientation", audience: ["student","parent"], category: "arrival", icon: "🧭",
    studentQ: "How much of orientation do I really need to attend?",
    parentQ: "Should we plan errands or family activities during orientation?",
    studentA: "Treat the orientation schedule as required working time. It introduces offices, systems, academic expectations, campus resources, and other students. Check the schedule sent directly to your CIA account rather than relying on a screenshot from someone else.",
    parentA: "The GroupMe experience suggests the student schedule is tight and may continue while parents are handling final errands. Avoid planning optional family activities during the student’s assigned orientation blocks.",
    stepStudent: "Open the current orientation schedule, add every required item to your calendar, and note where you must report.",
    stepParent: "Plan your goodbye and shopping around the official student schedule—not around what another family received.",
    source: "Village insight · Orientation schedules vary by cohort", sourceType: "village",
    link: "https://www.ciachef.edu/parents/",
    linkLabel: "Open CIA information for parents"
  },
  {
    id: "travel", audience: ["student","parent"], category: "arrival", icon: "🚆",
    studentQ: "How do I get to the train station or airport for breaks?",
    parentQ: "Does CIA provide transportation for every school break?",
    studentA: "Do not assume a campus shuttle operates for your destination or travel date. GroupMe discussions indicate that prior shuttle service was limited and did not necessarily serve the Poughkeepsie train station or every holiday break.",
    parentA: "Build the travel plan around the student’s confirmed last obligation and a verified transportation option. Families reported using rideshare or Dutchess County Public Transit to reach Poughkeepsie station, Metro-North to Grand Central, and MTA TrainTime for tickets. Campus and airport-shuttle schedules can change.",
    stepStudent: "Check current CIA transportation notices before buying tickets, then identify a backup ride and allow weather time.",
    stepParent: "Do not purchase a tight, nonrefundable itinerary until the class schedule and transportation are confirmed.",
    source: "Needs verification · Transportation schedules and fees may change", sourceType: "verify",
    link: "https://www.ciachef.edu/new-york-campus-directions/",
    linkLabel: "View New York campus travel directions"
  },
  {
    id: "work", audience: ["student","parent"], category: "money", icon: "💼",
    studentQ: "Can I work while I am enrolled?",
    parentQ: "What should my student bring if they plan to work?",
    studentA: "Campus and nearby work options may have different eligibility and documentation requirements. GroupMe participants discussed Earn and Learn, Federal Work-Study, limited food-service positions, and off-campus employment as separate categories—not one interchangeable program.",
    parentA: "Do not assume every campus role is Federal Work-Study or requires the same documents. September applicants were asked for original I-9 identity and work-authorization documents, not photos or copies, and families reported that students may need to apply again each semester.",
    stepStudent: "Ask the hiring office which program the job belongs to, whether you are eligible, which original I-9 documents are acceptable, and whether you must reapply next semester.",
    stepParent: "If originals are required, help the student plan secure storage; otherwise use copies where the hiring office permits them.",
    source: "Village insight · Employment eligibility and documentation need official confirmation", sourceType: "verify",
    link: "https://ciamainmenu.culinary.edu/",
    linkLabel: "Open CIA Main Menu"
  },
  {
    id: "mail", audience: ["student","parent"], category: "living", icon: "✉️",
    studentQ: "How will I receive mail and packages?",
    parentQ: "Where should we send packages?",
    studentA: "Use your legal name exactly as it is recorded with the school on every package or letter. For the New York campus, use:<br><br><strong>The Culinary Institute of America</strong><br>C/O [Student’s Legal Name]<br>1946 Campus Drive<br>Hyde Park, NY 12538<br><br>Carrier delivery does not mean the package is ready. The mailroom emails the student after it is processed, which can take one or two days during busy periods.",
    parentA: "Send packages to the student’s campus using the legal name registered with the school:<br><br><strong>The Culinary Institute of America</strong><br>C/O [Student’s Legal Name]<br>1946 Campus Drive<br>Hyde Park, NY 12538<br><br>Tracking may show delivered before the mailroom has processed it. The student receives an email when pickup is ready; families also reported that notices sometimes land in spam.",
    stepStudent: "Wait for the CIA pickup email and check spam before going to the mailroom. Community-reported hours on September 17 were Monday–Friday 8 a.m.–5 p.m. and Saturday 9 a.m.–1 p.m.; verify before an urgent pickup.",
    stepParent: "For urgent original documents, do not assume next-day delivery equals next-day pickup. Ask the carrier about Hold for Pickup or a staffed pickup location and verify identification requirements.",
    source: "Official · CIA New York campus information and 2022–23 Student Handbook", sourceType: "official",
    link: "https://www.ciachef.edu/new-york-campus-directions/",
    linkLabel: "View the New York campus address"
  },
  {
    id: "fall-dates", terms: ["fall"], audience: ["student","parent"], category: "arrival", icon: "🗓️",
    studentQ: "What are the key Fall 2026 dates and deadlines?",
    parentQ: "What Fall 2026 dates and deadlines should our family plan around?",
    studentA: "New Student Move-In is September 3–4. Week of Welcome Fireworks Night is September 7, and classes begin September 8. Thanksgiving Recess runs November 25–30; classes resume December 1. Classes end December 18, and all students must be off campus by noon December 19.",
    parentA: "New Student Move-In is September 3–4. Week of Welcome Fireworks Night is September 7, and classes begin September 8. Thanksgiving Recess runs November 25–30; classes resume December 1. Classes end December 18, and all students must be off campus by noon December 19.",
    stepStudent: "Compare these dates with your assigned schedule before making travel plans.",
    stepParent: "Wait for your student to confirm class, kitchen, bakeshop, and residence-hall obligations before booking travel.",
    source: "Fall 2026 orientation dates · Confirm in CIA Main Menu", sourceType: "verify",
    link: "https://ciamainmenu.culinary.edu/",
    linkLabel: "Confirm current dates in CIA Main Menu"
  },
  {
    id: "spring-dates", terms: ["spring"], audience: ["student","parent"], category: "arrival", icon: "🗓️",
    studentQ: "When can I return for Spring 2027, and when do classes begin?",
    parentQ: "When can my student return for Spring 2027, and when do classes begin?",
    studentA: "Orientation Leaders and Welcome Team members return January 1. Returning students may come back to campus January 3, and classes begin January 5. Classes end April 16, and all students must be off campus by noon April 17.",
    parentA: "Orientation Leaders and Welcome Team members return January 1. Returning students may come back to campus January 3, and classes begin January 5. Classes end April 16, and all students must be off campus by noon April 17.",
    stepStudent: "Confirm your approved residence-hall return time and first class before traveling.",
    stepParent: "Confirm the student’s return instructions and final class obligations before booking transportation.",
    source: "Spring 2027 orientation dates · Confirm in CIA Main Menu", sourceType: "verify",
    link: "https://ciamainmenu.culinary.edu/",
    linkLabel: "Confirm current dates in CIA Main Menu"
  },
  {
    id: "celebration", audience: ["student","parent"], category: "living", icon: "🎉",
    studentQ: "Can my family send me a Celebration Gram?",
    parentQ: "How can I send my student a Celebration Gram?",
    studentA: "Yes. CIA provides an online Celebration Gram form families can use for a birthday, accomplishment, milestone, or supportive moment. Students are notified when the gram is ready for pickup.",
    parentA: "Use CIA’s online Celebration Gram form. September families reported birthday grams with cake supplies, a tote, and balloons, while other grams included assorted snacks and an Apple Pie Bakery Café treat. Contents, prices, timing, and delivery can change, so the current form and confirmation remain the authority.",
    stepStudent: "Give your family the legal name and campus information CIA uses for your student record.",
    stepParent: "Confirm the student’s legal name and campus, complete every required field, and save the submission confirmation.",
    source: "CIA · Celebration Gram form", sourceType: "official",
    link: "https://ciachef.formstack.com/forms/celebration_gram",
    linkLabel: "Open the Celebration Gram form"
  },
  {
    id: "groceries", audience: ["student","parent"], category: "living", icon: "🛒",
    studentQ: "How can I get groceries without a car?",
    parentQ: "How can my student get groceries without a car?",
    studentA: "September families identified ShopRite as the closest budget-conscious option and reported successful Walmart and DoorDash deliveries for groceries and supplies. A student shopping shuttle was also discussed, but routes, pickup points, and times can change.",
    parentA: "Families reported using ShopRite, Walmart delivery, DoorDash, rideshare, and a student shopping shuttle. For delivery, the student should confirm the residence hall’s meeting or drop-off procedure and include clear instructions rather than assuming a driver can enter the building.",
    stepStudent: "Check the current shuttle schedule with the Student Recreation Center before leaving campus, and keep a backup ride option.",
    stepParent: "Help compare delivery fees with the cost of a shared rideshare; do not treat a schedule screenshot from the chat as permanent.",
    source: "Village insight · September 2026 grocery and shuttle discussion", sourceType: "verify",
    link: "https://www.ciachef.edu/frequently-asked-questions/",
    linkLabel: "Check CIA’s current FAQs"
  },
  {
    id: "housing-help", audience: ["student","parent"], category: "living", icon: "🔧",
    studentQ: "Who handles a residence-hall problem or repair?",
    parentQ: "Who should my student contact about a dorm concern?",
    studentA: "Start with the RA for an immediate residence-hall concern. For a repair, use the maintenance-ticket option in the housing portal. Residence Life handles housing questions that the RA cannot resolve; Campus Safety is the right contact for an urgent safety issue.",
    parentA: "Ask your student to contact the RA, submit a housing-portal maintenance ticket when appropriate, and keep the ticket number. Safety, harassment, discrimination, or a serious unresolved health risk should be escalated promptly.",
    stepStudent: "Describe the specific problem, location, date, and urgency. Save the ticket or email confirmation.",
    stepParent: "Help the student organize the facts, but let the student make the first contact unless immediate safety is involved.",
    source: "Village guidance · Confirm current Residence Life procedures", sourceType: "verify",
    link: "https://catalog.ciachef.edu/",
    linkLabel: "Check the current CIA handbook"
  },
  {
    id: "it-help", audience: ["student","parent"], category: "classes", icon: "🖥️",
    studentQ: "Where do I get help with Wi-Fi, the portal, or digital course materials?",
    parentQ: "Who helps when my student cannot access a CIA system?",
    studentA: "Use the Student ITS Help Desk for CIA login, portal, Wi-Fi, printing, and digital-course access problems. Families identified the help desk in the library/computer-lab area and shared ITHelp@cia.culinary.edu as the support email.",
    parentA: "FERPA or proxy permission does not turn the student’s credentials into a parent login. The student should take access problems to the Student ITS Help Desk and use the separate proxy process for authorized family access.",
    stepStudent: "Bring the device, the exact error message, and the name of the affected course or system. Do not send your password by email.",
    stepParent: "Do not repeatedly attempt the student’s login. Use your own proxy access and have the student contact ITS for account trouble.",
    source: "Village resource · Student ITS Help Desk details shared September 2026", sourceType: "verify",
    link: "https://www.ciachef.edu/cia-login/",
    linkLabel: "Open CIA login and portal links"
  },
  {
    id: "activities", audience: ["student","parent"], category: "living", icon: "🎫",
    studentQ: "Where can I find campus events and activities?",
    parentQ: "Where are student activities announced?",
    studentA: "Check official campus notices and the CIA Activities Instagram account. The parent group repeatedly learned about bingo, ceremonies, and other events after the fact, so do not depend on family chat for the student calendar.",
    parentA: "Students should follow the official activity channels and campus notices directly. Parents can use the activity account for context, but students remain responsible for dates, locations, capacity, and registration.",
    stepStudent: "Follow the activities account and add anything you plan to attend to your own calendar.",
    stepParent: "Send the official link once; let the student decide which events fit the class schedule.",
    source: "Village resource · CIA Activities account shared by families", sourceType: "village",
    link: "https://www.instagram.com/ciaactivities/",
    linkLabel: "Open CIA Activities on Instagram"
  },
  {
    id: "family-weekend", audience: ["student","parent"], category: "living", icon: "🏨",
    studentQ: "What should I know about Family Weekend?",
    parentQ: "Where should we stay, and is there a guest dress code for Family Weekend?",
    studentA: "Confirm your own class, competition, work, or team obligations before making plans with visiting family. Being on campus for Family Weekend does not automatically clear your schedule.",
    parentA: "Hotels can sell out early because other Hudson Valley events may overlap. Use CIA’s lodging page and call hotels directly about current CIA rates. The September group was told that Family Weekend guests do not have to follow the student business-casual dress code and do not need jackets, but event-specific instructions still control.",
    stepStudent: "Tell family about required obligations before they buy tickets or plan the weekend around you.",
    stepParent: "Book refundable lodging when possible and check the current Family Weekend schedule before packing or purchasing activities.",
    source: "CIA lodging page and September 2026 family discussion", sourceType: "verify",
    link: "https://www.ciachef.edu/new-york-where-to-stay/",
    linkLabel: "View CIA’s Hyde Park lodging list"
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
let academicTerm = "fall";
document.body.dataset.phase = phase;
document.body.dataset.academicTerm = academicTerm;

function updateViewTitle() {
  const audienceLabel = audience === "student" ? "Student" : "Parent";
  const phaseLabel = phase === "before" ? "before move-in" : "on campus";
  const termLabel = academicTerm === "spring" ? "Spring 2027" : "Fall 2026";
  document.querySelector("#view-title").textContent = `${termLabel} ${audienceLabel.toLowerCase()} essentials ${phaseLabel}`;
}
updateViewTitle();
let category = "all";
const search = document.querySelector("#search");
const cards = document.querySelector("#cards");
const empty = document.querySelector("#empty");

function renderCards() {
  const term = search.value.trim().toLowerCase();
  const matches = facts.filter(item => {
    const matchesCategory = category === "all" || item.category === category;
    const matchesAcademicTerm = !item.terms || item.terms.includes(academicTerm);
    const blob = [item.studentQ,item.parentQ,item.studentA,item.parentA,item.stepStudent,item.stepParent,item.source].join(" ").toLowerCase();
    return item.audience.includes(audience) && matchesCategory && matchesAcademicTerm && (!term || blob.includes(term));
  });
  cards.innerHTML = matches.map(item => {
    const clean = value => item.community ? escapeFaqText(value) : value;
    const q = clean(audience === "student" ? item.studentQ : item.parentQ);
    const answer = clean(audience === "student" ? item.studentA : item.parentA);
    const step = clean(audience === "student" ? item.stepStudent : item.stepParent);
    const source = clean(item.source);
    return `<article class="faq-card">
      <button class="faq-question" aria-expanded="false">
        <span class="category-icon" aria-hidden="true">${item.icon}</span>
        <span>${q}</span><span class="chevron" aria-hidden="true">+</span>
      </button>
      <div class="faq-answer"><p>${answer}</p><div class="next-step"><strong>What to do:</strong> ${step}</div><span class="source ${item.sourceType}">${source}</span>${item.link ? `<a class="faq-link" href="${item.link}" target="_blank" rel="noopener">${clean(item.linkLabel)} ↗</a>` : ""}</div>
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

function checklistKey() { return `cia-guide-${phase}-${audience}-checklist`; }
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

document.querySelectorAll(".term-btn").forEach(button => button.addEventListener("click", () => {
  academicTerm = button.dataset.termChoice;
  document.body.dataset.academicTerm = academicTerm;
  document.querySelectorAll(".term-btn").forEach(btn => {
    const active = btn === button;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  const label = academicTerm === "spring" ? "Spring 2027" : "Fall 2026";
  document.querySelector("#term-label").textContent = label;
  document.querySelector("#dates-term-label").textContent = label;
  document.querySelectorAll("[data-term-content]").forEach(panel => {
    panel.hidden = panel.dataset.termContent !== academicTerm;
  });
  updateViewTitle();
  renderCards();
}));

document.querySelectorAll(".audience-btn").forEach(button => button.addEventListener("click", () => {
  audience = button.dataset.audience;
  document.querySelectorAll(".audience-btn").forEach(btn => { btn.classList.toggle("active", btn === button); btn.setAttribute("aria-selected", String(btn === button)); });
  updateViewTitle();
  search.placeholder = audience === "student" ? "Search housing, meal points, uniforms…" : "Search packages, proxy access, campus life…";
  renderCards(); renderChecklist();
}));
document.querySelectorAll(".phase-btn").forEach(button => button.addEventListener("click", () => {
  phase = button.dataset.phase;
  document.body.dataset.phase = phase;
  document.querySelectorAll(".phase-btn").forEach(btn => { btn.classList.toggle("active", btn === button); btn.setAttribute("aria-selected", String(btn === button)); });
  document.querySelector(".checklist-panel .eyebrow").textContent = phase === "before" ? "Before arrival" : "First weeks";
  document.querySelector(".checklist-panel h2").textContent = phase === "before" ? "Get ready" : "Do this now";
  updateViewTitle();
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

async function loadCommunityFaqs() {
  try {
    const response = await fetch("/api/faqs/community");
    if (!response.ok) return;
    const { faqs } = await response.json();
    if (!Array.isArray(faqs)) return;
    for (const item of faqs) {
      const link = safeFaqUrl(item.sourceUrl);
      facts.push({
        id: `community-${item.id}`,
        audience: ["student", "parent"],
        category: item.category,
        icon: "i",
        studentQ: item.question,
        parentQ: item.question,
        studentA: item.answer,
        parentA: item.answer,
        stepStudent: "Confirm time-sensitive details with the appropriate CIA office before acting.",
        stepParent: "Confirm time-sensitive details with the appropriate CIA office before acting.",
        source: link ? "Community-reviewed answer with linked source" : "Community-reviewed answer",
        sourceType: link ? "official" : "village",
        link,
        linkLabel: link ? "Open the source" : "",
        community: true
      });
    }
    renderCards();
  } catch { /* The built-in FAQ remains available if dynamic answers cannot load. */ }
}

function safeFaqUrl(value) {
  try {
    const url = new URL(String(value ?? ""));
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch { return ""; }
}

function escapeFaqText(value) {
  const node = document.createElement("span");
  node.textContent = String(value ?? "");
  return node.innerHTML;
}

loadCommunityFaqs();

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
