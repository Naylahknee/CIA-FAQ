export type Audience = "student" | "parent";
export type TopicKey = "money" | "arrival" | "classes" | "living" | "health";

export type Fact = { id:string; audience:Audience[]; category:TopicKey; icon:string; studentQ:string; parentQ:string; studentA:string; parentA:string; stepStudent:string; stepParent:string; source:string; sourceType:"official"|"village"|"verify"; link:string; linkLabel:string; springNotice?:string; terms?:string[]; termOverrides?: Record<string, Partial<Fact>> };

export const facts: Fact[] = [
  {
    "id": "deposit",
    "audience": [
      "student",
      "parent"
    ],
    "category": "money",
    "icon": "💳",
    "studentQ": "How do I pay my tuition deposit?",
    "parentQ": "How is the tuition deposit paid?",
    "studentA": "Sign in to the CIA Accepted Student Portal, choose Online Payment, then Make a Payment. Continue to the Payment Center, select Deposits, choose your enrollment term and deposit, then complete payment.",
    "parentA": "The deposit is initiated through the student’s CIA Accepted Student Portal. The student selects the enrollment term and deposit inside the Payment Center before entering the payment method.",
    "stepStudent": "Have your enrollment date and payment method ready before you begin.",
    "stepParent": "Coordinate payment with your student; do not rely on the student portal as your future parent login.",
    "source": "Official · Tuition Deposit Instructions",
    "sourceType": "official",
    "link": "https://www.ciachef.edu/cia-login/",
    "linkLabel": "Open the CIA login page"
  },
  {
    "id": "costs",
    "audience": [
      "student",
      "parent"
    ],
    "category": "money",
    "icon": "🧾",
    "studentQ": "What will CIA cost beyond tuition?",
    "parentQ": "What costs should our family expect beyond tuition?",
    "studentA": "For Fall 2026 starts, the rate sheet lists a required undergraduate meal plan, general fee, housing if applicable, a one-time supplies fee, orientation fee, and annual health insurance unless waived. Some actions can trigger additional fees.",
    "parentA": "Beyond $19,755 per-semester full-time tuition, the Fall 2026 rate sheet lists a $2,595 meal plan, $885 general fee, housing from $4,135 to $5,560 per semester, a $1,194 one-time supplies fee, $275 orientation fee, and $2,100 annual health insurance that may be waived.",
    "stepStudent": "Review your individual bill; the rate sheet is a planning tool, not your account balance.",
    "stepParent": "Budget separately for travel, personal expenses, books, laundry, and costs not shown on the school rate sheet.",
    "source": "Official · NY Rates 2026–27 (corrected April 8, 2026)",
    "sourceType": "official",
    "link": "https://www.ciachef.edu/cia-tuition/",
    "linkLabel": "View CIA tuition and fees",
    "springNotice": "Spring 2027 uses the 2026–27 academic-year rates shown here. The student’s Spring 2027 bill remains the final authority."
  },
  {
    "id": "proxy",
    "audience": [
      "student",
      "parent"
    ],
    "category": "money",
    "icon": "🔐",
    "studentQ": "How do I let a parent see grades or financial information?",
    "parentQ": "Why can’t I see my student’s grades or account information?",
    "studentA": "In Student Self-Service, open View My Financial Aid, then User Options and View/Add Proxy Access. Add the person and choose exactly which information they may see.",
    "parentA": "Your student must create your Proxy User access and select what you may view. Proxy access can cover grades, finances, or course status. It is separate from TouchNet Authorized User access, which is used to make payments.",
    "stepStudent": "Decide what access is actually useful before checking the authorization boxes.",
    "stepParent": "Use the proxy or payment link sent for your account—not your student’s sign-in page.",
    "source": "Official · Student Self-Service Proxy Guide, reviewed April 2025",
    "sourceType": "official",
    "link": "https://ciamainmenu.culinary.edu/",
    "linkLabel": "Open CIA Main Menu"
  },
  {
    "id": "textbooks",
    "audience": [
      "student",
      "parent"
    ],
    "category": "classes",
    "icon": "📚",
    "studentQ": "Where do I find and order my textbooks?",
    "parentQ": "Do we have to buy textbooks from the campus bookstore?",
    "studentA": "Use Purchase My Textbooks in the CIA portal, then search with the course information from your schedule. Some courses have no required books; others have several. Compare print, digital, rental, and purchase options.",
    "parentA": "No. The school-associated bookstore is useful for identifying the correct title and edition, but the ordering guide says students may use another vendor. Confirm the exact edition before buying elsewhere.",
    "stepStudent": "Check every course before ordering, and confirm whether a book is required or optional.",
    "stepParent": "Avoid buying a mystery mountain of books before the student has checked the actual schedule.",
    "source": "Official · Ordering Your CIA Textbooks",
    "sourceType": "official",
    "link": "https://ciamainmenu.culinary.edu/",
    "linkLabel": "Open textbook access in CIA Main Menu"
  },
  {
    "id": "kits",
    "audience": [
      "student",
      "parent"
    ],
    "category": "classes",
    "icon": "🔪",
    "studentQ": "What comes in my culinary or baking kit?",
    "parentQ": "Should we purchase a separate knife set?",
    "studentA": "The Culinary Kit includes multiple knives with guards, shears, scrapers, tongs, whisk, peelers, plating tools, sharpening steel, and a knife pack. The Baking & Pastry Kit has a different mix, including cutters, pastry tools, rulers, spatulas, and a tube set.",
    "parentA": "CIA’s one-time supplies fee is tied to an included program kit. Culinary and Baking & Pastry students receive different tools. Review the appropriate list before purchasing duplicates.",
    "stepStudent": "Inventory and label every item when you receive the kit. Keep knives in their guards and pack.",
    "stepParent": "Wait for the program-specific kit inventory before buying extra tools.",
    "source": "Official · 2026 Culinary and Baking & Pastry Kit lists",
    "sourceType": "official",
    "link": "https://ciamainmenu.culinary.edu/",
    "linkLabel": "Open CIA Main Menu"
  },
  {
    "id": "meal",
    "audience": [
      "student",
      "parent"
    ],
    "category": "living",
    "icon": "\ud83c\udf7d\ufe0f",
    "studentQ": "What is the difference between Blue, Green, and Gold Points?",
    "parentQ": "How do meal points work, and what changes each year?",
    "studentA": "Blue Points cover the production kitchens in Roth Hall \u2014 Grab-and-Go, The Line, the Pasta and Noodle Bar, the Salad Bar at The Egg, and selected items in the Marketplace. Green Points cover all of that plus the Caf\u00e9 and Innovation Kitchen at The Egg and the campus restaurants at approved times. Gold Points cover the production kitchens plus the \u201cYolk,\u201d the Innovation Kitchen, the Barista Station at The Egg, and all campus restaurants at approved times. Which you hold depends on your year: freshmen receive all Blue Points, sophomores and juniors a 50/50 split of Blue and Green, and seniors 100% Green.",
    "parentA": "The colour decides where your student can eat, and it changes as they progress. Freshmen receive all Blue Points, usable only in the production kitchens listed on the meal-plan page. Sophomores and juniors receive half Blue and half Green, and seniors receive all Green, which opens up The Egg\u2019s Caf\u00e9 and Innovation Kitchen and the campus restaurants at approved times. Gold Points sit alongside all of that as the flexible balance and can be topped up at any time. Blue Points have historically loaded daily and expired the same night, so a hungry week is often unused points rather than too few \u2014 but expiry varies by plan and class level, so confirm the current rule before adding money.",
    "stepStudent": "Check which colour you hold this year before planning where to eat, and use points that expire daily before they lapse.",
    "stepParent": "Before adding Gold Points, check whether the issue is unused points that expired rather than a shortage. Student Financial Services can confirm on 845-905-4518.",
    "source": "Official \u00b7 CIA Meal Plans in New York",
    "sourceType": "official",
    "link": "https://www.ciachef.edu/cia-tuition/",
    "linkLabel": "View the current CIA meal-plan charge",
    "springNotice": "Spring 2027 meal-plan point amounts and operating details are coming soon. Confirm the current plan in the student portal before relying on the Fall 2026 explanation."
  },
  {
    "id": "meal-plan-cost",
    "audience": [
      "student",
      "parent"
    ],
    "category": "money",
    "icon": "\ud83d\udcb3",
    "studentQ": "Which meal plan should I choose, and can I change it?",
    "parentQ": "What do the three meal plans cost, and is one required?",
    "studentA": "Every student is on a meal plan; the only choice is how many Gold Points sit on top. All three give you the same 1,400 Meal Points. The standard CIA Meal Plan adds 325 Gold Points for 1,725 total. Meal Plan PLUS adds 650 Gold Points for 2,050 total. Meal Plan ULTIMATE adds 1,000 Gold Points for 2,400 total. You can also add Gold Points to your account at any time, so starting on the standard plan does not lock you out of the flexible balance later.",
    "parentA": "A meal plan is required for all students, so the decision is only how many Gold Points to include. The standard CIA Meal Plan is $2,595 per semester and carries 1,400 Meal Points plus 325 Gold Points. Meal Plan PLUS adds another 325 Gold Points for $385 more per semester, and Meal Plan ULTIMATE adds 675 more Gold Points than the standard plan for $760 more. Because Gold Points can be added at any time, the standard plan is a reasonable starting point \u2014 you can top up once you see how your student actually eats rather than paying for flexibility up front.",
    "stepStudent": "Start on the standard plan unless you already know you will eat at the campus restaurants often; you can add Gold Points later.",
    "stepParent": "Enrol through the student portal, or call Student Financial Services on 845-905-4518 to confirm current pricing before choosing a tier.",
    "source": "Official \u00b7 CIA Meal Plans in New York",
    "sourceType": "official",
    "link": "https://www.ciachef.edu/cia-tuition/",
    "linkLabel": "View the current CIA meal-plan charge",
    "springNotice": "These are the published Fall 2026 figures. Confirm current pricing in the student portal before enrolling for Spring 2027."
  },
  {
    "id": "allergy",
    "audience": [
      "student",
      "parent"
    ],
    "category": "health",
    "icon": "⚕️",
    "studentQ": "What should I do if I have a food allergy?",
    "parentQ": "How should my student prepare for food allergies at culinary school?",
    "studentA": "The school’s published protocol is Inform, Question, Protect. Contact Health Services and Disability Services, provide medical documentation, coordinate dining accommodations when needed, and tell each chef or instructor at the beginning of relevant courses.",
    "parentA": "Culinary students may encounter allergens in dining spaces, kitchens, and academic classes. The student must coordinate with Health Services and Disability Services and communicate directly with chefs and instructors.",
    "stepStudent": "Never rely on another student to confirm ingredients. Ask the chef or instructor in charge and keep prescribed emergency medication accessible.",
    "stepParent": "Help assemble current medical documentation, but make sure your student can explain the allergy and safety plan independently.",
    "source": "Needs verification · Allergy brochure dated 2023",
    "sourceType": "verify",
    "link": "https://catalog.ciachef.edu/",
    "linkLabel": "Open the current CIA handbook",
    "springNotice": "Spring 2027 allergy-accommodation contacts and procedures are coming soon. Use the current handbook and confirm the plan with Health Services and Disability Services."
  },
  {
    "id": "medical",
    "audience": [
      "student",
      "parent"
    ],
    "category": "health",
    "icon": "🏥",
    "studentQ": "Where can I go for medication or urgent medical care?",
    "parentQ": "What medical care is available near Hyde Park?",
    "studentA": "The uploaded campus resource lists pharmacies, urgent-care offices, Vassar Brothers Medical Center, and Mid-Hudson Regional Hospital. The September parent group also located campus Health Services below the dining hall, near the mailroom hallway; confirm the current entrance and hours before relying on that description.",
    "parentA": "A campus resource lists nearby pharmacies, urgent-care offices, Vassar Brothers Medical Center, and Mid-Hudson Regional Hospital. Campus Health Services was described as below the dining hall near the mailroom hallway. Hours and availability should be confirmed before travel.",
    "stepStudent": "Save campus safety and health contacts in your phone. For an emergency, call 911 rather than searching this guide.",
    "stepParent": "Confirm the student’s insurance network and preferred pharmacy before move-in.",
    "source": "May change · Local medical-resource sheet, August 2026",
    "sourceType": "verify",
    "link": "https://catalog.ciachef.edu/",
    "linkLabel": "Open the current CIA handbook",
    "springNotice": "Spring 2027 Health Services hours, entrances, and local-provider details are coming soon. Call ahead and use 911 for an emergency."
  },
  {
    "id": "everbridge",
    "audience": [
      "student",
      "parent"
    ],
    "category": "health",
    "icon": "📱",
    "studentQ": "How do I set up Everbridge 360 for campus safety alerts?",
    "parentQ": "What is Everbridge 360, and how does my student sign in?",
    "studentA": "Everbridge 360 is the app CIA uses for mass notifications about weather, closures, emergencies, and other safety information. Download Everbridge 360 and choose the organization-code option. CIA’s admissions director pinned the code in the family chat on September 17, 2026. Because this guide is public and access details can change, retrieve the current code from an official CIA message or Campus Safety.",
    "parentA": "Everbridge 360 is an organization-provided critical-communications app. CIA’s admissions director pinned the organization code in the family chat on September 17, 2026. Students should retrieve the current code through an authorized CIA source and use their own access; families should not ask for or use a student’s CIA password.",
    "stepStudent": "Allow the notifications needed for safety alerts, then test that your contact information is current. The app supplements—not replaces—911, alarms, posted evacuation instructions, and directions from Campus Safety.",
    "stepParent": "Help your student install the app, but let the student complete sign-in. If the code or credentials fail, contact CIA Campus Safety or Student ITS rather than sharing login information.",
    "source": "Needs verification · CIA family chat and official Everbridge app listings, September 2026",
    "sourceType": "verify",
    "link": "https://download.everbridge.net/",
    "linkLabel": "Open the official Everbridge 360 download page",
    "springNotice": "Spring 2027 organization-code and sign-in instructions are coming soon. Use the current code from an official CIA message or Campus Safety."
  },
  {
    "id": "movein",
    "audience": [
      "student",
      "parent"
    ],
    "category": "arrival",
    "icon": "📦",
    "studentQ": "What should I bring on move-in day?",
    "parentQ": "How do we avoid overpacking for move-in?",
    "studentA": "Bring the essentials for sleeping, bathing, laundry, medications, documents, schoolwork, and the first week. Confirm your housing assignment and current residence-hall rules before buying appliances or bulky storage.",
    "parentA": "Families repeatedly discuss move-in and storage because students eventually have to carry their belongings back out. Prioritize essentials and confirm what the room includes before purchasing furniture-sized optimism.",
    "stepStudent": "Make three piles: must arrive with me, can ship later, and can stay home.",
    "stepParent": "Label belongings and keep receipts. Let the student own the final packing list.",
    "source": "Village insight · Recurring family discussion",
    "sourceType": "village",
    "link": "https://www.ciachef.edu/parents/",
    "linkLabel": "Open CIA information for parents",
    "springNotice": "Spring 2027 arrival and residence-hall instructions are coming soon. Returning and new students should use the instructions sent to their own CIA account."
  },
  {
    "id": "roommate",
    "audience": [
      "student",
      "parent"
    ],
    "category": "living",
    "icon": "🛏️",
    "studentQ": "What should I do about a roommate problem?",
    "parentQ": "When should I step into a roommate conflict?",
    "studentA": "Start with a calm, specific conversation about the behavior and the agreement you need. If the issue continues or feels unsafe, document what happened and contact the RA or housing staff.",
    "parentA": "Coach your student to describe the issue, communicate directly, and use the RA or housing process. Step in immediately only when safety, discrimination, harassment, or an unresolved serious health concern is involved.",
    "stepStudent": "Describe dates and specific behavior—not just ‘we don’t get along.’",
    "stepParent": "Help your student prepare the message; do not automatically send it for them.",
    "source": "Village guidance · Verify current housing procedures",
    "sourceType": "village",
    "link": "https://catalog.ciachef.edu/",
    "linkLabel": "Check the current CIA handbook"
  },
  {
    "id": "calendar",
    "audience": [
      "student",
      "parent"
    ],
    "category": "classes",
    "icon": "🗓️",
    "studentQ": "Are regular college holidays always days off?",
    "parentQ": "When should we book travel home?",
    "studentA": "Do not assume. The CIA calendar distinguishes semester dates, kitchen or bakeshop dates, restaurant closures, no-class days, Saturday classes, and special project days.",
    "parentA": "Use the CIA academic calendar and the student’s actual course schedule before purchasing travel. Restaurant closures and no-class days are not interchangeable.",
    "stepStudent": "Confirm class obligations with the instructor before making nonrefundable plans.",
    "stepParent": "Wait for the student to verify the schedule before booking travel.",
    "source": "Official · 2026–27 Hyde Park Academic Calendar; subject to change",
    "sourceType": "official",
    "link": "https://ciamainmenu.culinary.edu/",
    "linkLabel": "Open the current calendar in CIA Main Menu",
    "springNotice": "This FAQ uses the official 2026–27 calendar, which includes Spring 2027. The student’s current schedule still controls."
  },
  {
    "id": "uniform",
    "audience": [
      "student",
      "parent"
    ],
    "category": "classes",
    "icon": "🥼",
    "studentQ": "When and where will I need my full uniform?",
    "parentQ": "What if the uniform or kitchen shoes do not fit or arrive on time?",
    "studentA": "Kitchen and bakeshop clothing rules are different from ordinary academic-class clothing. Community members consistently recommend trying on every uniform piece and both shoes before the first required wear date. Do not assume a loose chef coat is automatically the wrong size; its fit also serves a safety purpose.",
    "parentA": "Have the student try on the complete uniform and kitchen shoes before classes begin. If something is missing or clearly does not fit, the student should contact the campus uniform provider or appropriate school office immediately instead of waiting for the first lab.",
    "stepStudent": "Confirm the current uniform policy and your first required uniform day in the student portal or with your instructor.",
    "stepParent": "Keep packaging and receipts until fit is confirmed. Let the student handle the exchange conversation when possible.",
    "source": "Village insight · Confirm against the current CIA uniform policy",
    "sourceType": "village",
    "link": "https://ciamainmenu.culinary.edu/",
    "linkLabel": "Check the current policy in CIA Main Menu"
  },
  {
    "id": "laundry",
    "audience": [
      "student",
      "parent"
    ],
    "category": "living",
    "icon": "🧺",
    "studentQ": "How should I handle laundry and stained chef whites?",
    "parentQ": "What laundry supplies are actually useful?",
    "studentA": "Parents repeatedly recommend a portable laundry bag or basket, stain treatment, and using the correct amount of detergent. Culinary clothing can collect grease and protein stains, so treat stains promptly and follow the garment-care directions rather than experimenting the night before class.",
    "parentA": "A portable hamper, ordinary detergent, and a reliable stain treatment are more useful than an elaborate laundry laboratory. Families report that residence-hall machines were included for this cohort, but students should confirm the current arrangement after arrival.",
    "stepStudent": "Read each garment label, test stain products carefully, and schedule laundry before you run out of clean required clothing.",
    "stepParent": "Send enough supplies for the first weeks—not a wholesale-club quantity the student must later carry home.",
    "source": "Village insight · Based on recurring family laundry discussions",
    "sourceType": "village",
    "link": "https://catalog.ciachef.edu/",
    "linkLabel": "Check current residence-life information",
    "springNotice": "Spring 2027 residence-hall laundry costs and machine arrangements are coming soon. Confirm them after arrival before buying supplies in bulk."
  },
  {
    "id": "printer",
    "audience": [
      "student",
      "parent"
    ],
    "category": "classes",
    "icon": "🖨️",
    "studentQ": "Do I need to bring a printer?",
    "parentQ": "Should we buy a dorm-room printer?",
    "studentA": "A personal printer appears to be optional, not essential. Campus printing is available, while personal wireless printers may not connect normally to the college network. Families reported success with a direct USB printer cable; unresolved Wi-Fi, printing, or portal problems should go to the Student ITS Help Desk.",
    "parentA": "Do not buy a printer automatically. Consider campus printing, ink costs, network compatibility, and whether a low-cost USB printer cable solves the problem before adding another device to the dorm.",
    "stepStudent": "Try campus printing first. For connection or account trouble, visit the Student ITS Help Desk in the library/computer-lab area or email ITHelp@cia.culinary.edu.",
    "stepParent": "Wait until the student has used the campus option before purchasing another machine and its tiny, expensive juice boxes.",
    "source": "Village insight · Campus printing availability should be reconfirmed",
    "sourceType": "village",
    "link": "https://www.ciachef.edu/hilton/",
    "linkLabel": "Open the Conrad N. Hilton Library page"
  },
  {
    "id": "orientation",
    "audience": [
      "student",
      "parent"
    ],
    "category": "arrival",
    "icon": "🧭",
    "studentQ": "How much of orientation do I really need to attend?",
    "parentQ": "Should we plan errands or family activities during orientation?",
    "studentA": "Treat the orientation schedule as required working time. It introduces offices, systems, academic expectations, campus resources, and other students. Check the schedule sent directly to your CIA account rather than relying on a screenshot from someone else.",
    "parentA": "Family experience suggests the student schedule is tight and may continue while parents are handling final errands. Avoid planning optional family activities during the student’s assigned orientation blocks.",
    "stepStudent": "Open the current orientation schedule, add every required item to your calendar, and note where you must report.",
    "stepParent": "Plan your goodbye and shopping around the official student schedule—not around what another family received.",
    "source": "Village insight · Orientation schedules vary by cohort",
    "sourceType": "village",
    "link": "https://www.ciachef.edu/parents/",
    "linkLabel": "Open CIA information for parents",
    "springNotice": "Spring 2027 orientation dates and required sessions are coming soon. The schedule sent to the student’s CIA account will control."
  },
  {
    "id": "travel",
    "audience": [
      "student",
      "parent"
    ],
    "category": "arrival",
    "icon": "🚆",
    "studentQ": "How do I get to the train station or airport for breaks?",
    "parentQ": "Does CIA provide transportation for every school break?",
    "studentA": "Do not assume a campus shuttle operates for your destination or travel date. Family discussions indicate that prior shuttle service was limited and did not necessarily serve the Poughkeepsie train station or every holiday break.",
    "parentA": "Build the travel plan around the student’s confirmed last obligation and a verified transportation option. Families reported using rideshare or Dutchess County Public Transit to reach Poughkeepsie station, Metro-North to Grand Central, and MTA TrainTime for tickets. Campus and airport-shuttle schedules can change.",
    "stepStudent": "Check current CIA transportation notices before buying tickets, then identify a backup ride and allow weather time.",
    "stepParent": "Do not purchase a tight, nonrefundable itinerary until the class schedule and transportation are confirmed.",
    "source": "Needs verification · Transportation schedules and fees may change",
    "sourceType": "verify",
    "link": "https://www.ciachef.edu/new-york-campus-directions/",
    "linkLabel": "View New York campus travel directions",
    "springNotice": "Spring 2027 campus and break-shuttle schedules, destinations, and fees are coming soon. Confirm transportation before buying tickets."
  },
  {
    "id": "work",
    "audience": [
      "student",
      "parent"
    ],
    "category": "money",
    "icon": "💼",
    "studentQ": "Can I work while I am enrolled?",
    "parentQ": "What should my student bring if they plan to work?",
    "studentA": "Campus and nearby work options may have different eligibility and documentation requirements. Families have discussed Earn and Learn, Federal Work-Study, limited food-service positions, and off-campus employment as separate categories—not one interchangeable program.",
    "parentA": "Do not assume every campus role is Federal Work-Study or requires the same documents. September applicants were asked for original I-9 identity and work-authorization documents, not photos or copies, and families reported that students may need to apply again each semester.",
    "stepStudent": "Ask the hiring office which program the job belongs to, whether you are eligible, which original I-9 documents are acceptable, and whether you must reapply next semester.",
    "stepParent": "If originals are required, help the student plan secure storage; otherwise use copies where the hiring office permits them.",
    "source": "Village insight · Employment eligibility and documentation need official confirmation",
    "sourceType": "verify",
    "link": "https://ciamainmenu.culinary.edu/",
    "linkLabel": "Open CIA Main Menu",
    "springNotice": "Spring 2027 job openings and application deadlines are coming soon. Confirm each role and required document with the hiring office."
  },
  {
    "id": "mail",
    "audience": [
      "student",
      "parent"
    ],
    "category": "living",
    "icon": "✉️",
    "studentQ": "How will I receive mail and packages?",
    "parentQ": "Where should we send packages?",
    "studentA": "Use your legal name exactly as it is recorded with the school on every package or letter. For the New York campus, use:<br><br><strong>The Culinary Institute of America</strong><br>C/O [Student’s Legal Name]<br>1946 Campus Drive<br>Hyde Park, NY 12538<br><br>Carrier delivery does not mean the package is ready. The mailroom emails the student after it is processed, which can take one or two days during busy periods.",
    "parentA": "Send packages to the student’s campus using the legal name registered with the school:<br><br><strong>The Culinary Institute of America</strong><br>C/O [Student’s Legal Name]<br>1946 Campus Drive<br>Hyde Park, NY 12538<br><br>Tracking may show delivered before the mailroom has processed it. The student receives an email when pickup is ready; families also reported that notices sometimes land in spam.",
    "stepStudent": "Wait for the CIA pickup email and check spam before going to the mailroom. Community-reported hours on September 17 were Monday–Friday 8 a.m.–5 p.m. and Saturday 9 a.m.–1 p.m.; verify before an urgent pickup.",
    "stepParent": "For urgent original documents, do not assume next-day delivery equals next-day pickup. Ask the carrier about Hold for Pickup or a staffed pickup location and verify identification requirements.",
    "source": "Official · CIA New York campus information and 2022–23 Student Handbook",
    "sourceType": "official",
    "link": "https://www.ciachef.edu/new-york-campus-directions/",
    "linkLabel": "View the New York campus address",
    "springNotice": "The Hyde Park mailing address remains the same. Spring 2027 mailroom hours are coming soon; wait for the student’s pickup email."
  },
  {
    "id": "fall-dates",
    "terms": [
      "fall"
    ],
    "audience": [
      "student",
      "parent"
    ],
    "category": "arrival",
    "icon": "🗓️",
    "studentQ": "What are the key Fall 2026 dates and deadlines?",
    "parentQ": "What Fall 2026 dates and deadlines should our family plan around?",
    "studentA": "New Student Move-In is September 3–4. Week of Welcome Fireworks Night is September 7, and classes begin September 8. Thanksgiving Recess runs November 25–30; classes resume December 1. Classes end December 18, and all students must be off campus by noon December 19.",
    "parentA": "New Student Move-In is September 3–4. Week of Welcome Fireworks Night is September 7, and classes begin September 8. Thanksgiving Recess runs November 25–30; classes resume December 1. Classes end December 18, and all students must be off campus by noon December 19.",
    "stepStudent": "Compare these dates with your assigned schedule before making travel plans.",
    "stepParent": "Wait for your student to confirm class, kitchen, bakeshop, and residence-hall obligations before booking travel.",
    "source": "Fall 2026 orientation dates · Confirm in CIA Main Menu",
    "sourceType": "verify",
    "link": "https://ciamainmenu.culinary.edu/",
    "linkLabel": "Confirm current dates in CIA Main Menu"
  },
  {
    "id": "spring-dates",
    "terms": [
      "spring"
    ],
    "audience": [
      "student",
      "parent"
    ],
    "category": "arrival",
    "icon": "🗓️",
    "studentQ": "When can I return for Spring 2027, and when do classes begin?",
    "parentQ": "When can my student return for Spring 2027, and when do classes begin?",
    "studentA": "Orientation Leaders and Welcome Team members return January 1. Returning students may come back to campus January 3, and classes begin January 5. Classes end April 16, and all students must be off campus by noon April 17.",
    "parentA": "Orientation Leaders and Welcome Team members return January 1. Returning students may come back to campus January 3, and classes begin January 5. Classes end April 16, and all students must be off campus by noon April 17.",
    "stepStudent": "Confirm your approved residence-hall return time and first class before traveling.",
    "stepParent": "Confirm the student’s return instructions and final class obligations before booking transportation.",
    "source": "Spring 2027 orientation dates · Confirm in CIA Main Menu",
    "sourceType": "verify",
    "link": "https://ciamainmenu.culinary.edu/",
    "linkLabel": "Confirm current dates in CIA Main Menu"
  },
  {
    "id": "celebration",
    "audience": [
      "student",
      "parent"
    ],
    "category": "living",
    "icon": "🎉",
    "studentQ": "Can my family send me a Celebration Gram?",
    "parentQ": "How can I send my student a Celebration Gram?",
    "studentA": "Yes. CIA provides an online Celebration Gram form families can use for a birthday, accomplishment, milestone, or supportive moment. Students are notified when the gram is ready for pickup.",
    "parentA": "Use CIA’s online Celebration Gram form. September families reported birthday grams with cake supplies, a tote, and balloons, while other grams included assorted snacks and an Apple Pie Bakery Café treat. Contents, prices, timing, and delivery can change, so the current form and confirmation remain the authority.",
    "stepStudent": "Give your family the legal name and campus information CIA uses for your student record.",
    "stepParent": "Confirm the student’s legal name and campus, complete every required field, and save the submission confirmation.",
    "source": "CIA · Celebration Gram form",
    "sourceType": "official",
    "link": "https://ciachef.formstack.com/forms/celebration_gram",
    "linkLabel": "Open the Celebration Gram form",
    "springNotice": "Spring 2027 Celebration Gram products, prices, and pickup timing are coming soon. Use the live form for the current choices."
  },
  {
    "id": "groceries",
    "audience": [
      "student",
      "parent"
    ],
    "category": "living",
    "icon": "🛒",
    "studentQ": "How can I get groceries without a car?",
    "parentQ": "How can my student get groceries without a car?",
    "studentA": "September families identified ShopRite as the closest budget-conscious option and reported successful Walmart and DoorDash deliveries for groceries and supplies. A student shopping shuttle was also discussed, but routes, pickup points, and times can change.",
    "parentA": "Families reported using ShopRite, Walmart delivery, DoorDash, rideshare, and a student shopping shuttle. For delivery, the student should confirm the residence hall’s meeting or drop-off procedure and include clear instructions rather than assuming a driver can enter the building.",
    "stepStudent": "Check the current shuttle schedule with the Student Recreation Center before leaving campus, and keep a backup ride option.",
    "stepParent": "Help compare delivery fees with the cost of a shared rideshare; do not treat a schedule screenshot from the chat as permanent.",
    "source": "Village insight · September 2026 grocery and shuttle discussion",
    "sourceType": "verify",
    "link": "https://www.ciachef.edu/frequently-asked-questions/",
    "linkLabel": "Check CIA’s current FAQs",
    "springNotice": "Spring 2027 shopping-shuttle routes and times are coming soon. Store and delivery options should be reconfirmed before use."
  },
  {
    "id": "housing-help",
    "audience": [
      "student",
      "parent"
    ],
    "category": "living",
    "icon": "🔧",
    "studentQ": "Who handles a residence-hall problem or repair?",
    "parentQ": "Who should my student contact about a dorm concern?",
    "studentA": "Start with the RA for an immediate residence-hall concern. For a repair, use the maintenance-ticket option in the housing portal. Residence Life handles housing questions that the RA cannot resolve; Campus Safety is the right contact for an urgent safety issue.",
    "parentA": "Ask your student to contact the RA, submit a housing-portal maintenance ticket when appropriate, and keep the ticket number. Safety, harassment, discrimination, or a serious unresolved health risk should be escalated promptly.",
    "stepStudent": "Describe the specific problem, location, date, and urgency. Save the ticket or email confirmation.",
    "stepParent": "Help the student organize the facts, but let the student make the first contact unless immediate safety is involved.",
    "source": "Village guidance · Confirm current Residence Life procedures",
    "sourceType": "verify",
    "link": "https://catalog.ciachef.edu/",
    "linkLabel": "Check the current CIA handbook"
  },
  {
    "id": "it-help",
    "audience": [
      "student",
      "parent"
    ],
    "category": "classes",
    "icon": "🖥️",
    "studentQ": "Where do I get help with Wi-Fi, the portal, or digital course materials?",
    "parentQ": "Who helps when my student cannot access a CIA system?",
    "studentA": "Use the Student ITS Help Desk for CIA login, portal, Wi-Fi, printing, and digital-course access problems. Families identified the help desk in the library/computer-lab area and shared ITHelp@cia.culinary.edu as the support email.",
    "parentA": "FERPA or proxy permission does not turn the student’s credentials into a parent login. The student should take access problems to the Student ITS Help Desk and use the separate proxy process for authorized family access.",
    "stepStudent": "Bring the device, the exact error message, and the name of the affected course or system. Do not send your password by email.",
    "stepParent": "Do not repeatedly attempt the student’s login. Use your own proxy access and have the student contact ITS for account trouble.",
    "source": "Village resource · Student ITS Help Desk details shared September 2026",
    "sourceType": "verify",
    "link": "https://www.ciachef.edu/cia-login/",
    "linkLabel": "Open CIA login and portal links",
    "springNotice": "Spring 2027 Student ITS location and service hours are coming soon. Use the official CIA login page and current campus directory for help."
  },
  {
    "id": "activities",
    "audience": [
      "student",
      "parent"
    ],
    "category": "living",
    "icon": "🎫",
    "studentQ": "Where can I find campus events and activities?",
    "parentQ": "Where are student activities announced?",
    "studentA": "Check official campus notices and the CIA Activities Instagram account. The parent group repeatedly learned about bingo, ceremonies, and other events after the fact, so do not depend on family chat for the student calendar.",
    "parentA": "Students should follow the official activity channels and campus notices directly. Parents can use the activity account for context, but students remain responsible for dates, locations, capacity, and registration.",
    "stepStudent": "Follow the activities account and add anything you plan to attend to your own calendar.",
    "stepParent": "Send the official link once; let the student decide which events fit the class schedule.",
    "source": "Village resource · CIA Activities account shared by families",
    "sourceType": "village",
    "link": "https://www.instagram.com/ciaactivities/",
    "linkLabel": "Open CIA Activities on Instagram",
    "springNotice": "Spring 2027 event dates and registration details are coming soon. Students should follow current official campus notices."
  },
  {
    "id": "family-weekend",
    "audience": [
      "student",
      "parent"
    ],
    "category": "living",
    "icon": "🏨",
    "studentQ": "What should I know about Family Weekend?",
    "parentQ": "Where should we stay, and is there a guest dress code for Family Weekend?",
    "studentA": "Confirm your own class, competition, work, or team obligations before making plans with visiting family. Being on campus for Family Weekend does not automatically clear your schedule.",
    "parentA": "Hotels can sell out early because other Hudson Valley events may overlap, and the weekend is expensive enough that some families choose to bring their student home instead and visit at an open house later. Families who booked report two things worth knowing. Looking further out often costs less than staying close: Mahwah, New Jersey sits right off the thruway and runs about 45 minutes to campus outside traffic, and an hour away is no hardship after a long drive. And some hotels near campus open only the Friday and Saturday at first, so if you need the Sunday, call and ask to extend rather than assuming it is full. Book refundable where you can. On dress, the September group was told that Family Weekend guests do not have to follow the student business-casual dress code and do not need jackets, but event-specific instructions still control.",
    "stepStudent": "Tell family about required obligations before they buy tickets or plan the weekend around you.",
    "stepParent": "Book refundable lodging early, widen the search beyond Hyde Park before paying a premium, and call about extending a Friday-Saturday booking rather than assuming Sunday is unavailable.",
    "source": "CIA lodging page and September 2026 family discussion",
    "sourceType": "verify",
    "link": "https://www.ciachef.edu/new-york-where-to-stay/",
    "linkLabel": "View CIA’s Hyde Park lodging list",
    "termOverrides": {
      "spring": {
        "studentA": "Spring 2027 Family Weekend dates, registration details, and event schedule have not been verified yet. Information will be added when CIA publishes it.",
        "parentA": "Spring 2027 Family Weekend dates, registration details, guest guidance, and event schedule are coming soon. If you reserve lodging early, choose a refundable option and verify the official weekend before booking transportation.",
        "stepStudent": "Watch official CIA notices and confirm your class, work, competition, or team obligations before making family plans.",
        "stepParent": "Use refundable reservations until CIA publishes the Spring 2027 schedule.",
        "source": "Spring 2027 details · Coming soon",
        "sourceType": "verify"
      }
    }
  },
  {
    "id": "add-drop",
    "audience": [
      "student",
      "parent"
    ],
    "category": "classes",
    "icon": "\ud83d\udcc5",
    "studentQ": "When is the last day to add or drop a course?",
    "parentQ": "When does add/drop close, and what happens after it does?",
    "studentA": "Add/Drop for Spring 2027 ends on January 11. Schedule changes after that date follow a different process rather than a simple swap, so raise anything you are unsure about with your advisor before the deadline rather than after it. The Fall 2026 add/drop date is not published in this guide \u2014 confirm it with the Registrar or in the academic catalog.",
    "parentA": "Add/Drop for Spring 2027 ends on January 11, and it appears on the calendar page alongside the other term dates. Changes made after the deadline follow a different process, which can carry academic or financial consequences depending on timing, so the deadline is worth putting in your own calendar. The Fall 2026 date is not published in this guide; the Registrar or the academic catalog will confirm it. This is your student\u2019s decision to make with their advisor \u2014 the college will not discuss it with a parent without the student\u2019s consent on file.",
    "stepStudent": "Put the add/drop date in your phone now, and talk to your advisor before it passes rather than after.",
    "stepParent": "Check the calendar page for the current term\u2019s date, and ask your student to confirm the Fall deadline with the Registrar.",
    "source": "Official \u00b7 Hyde Park academic calendar",
    "sourceType": "official",
    "link": "https://catalog.ciachef.edu/",
    "linkLabel": "Open the CIA academic catalog"
  },
  {
    "id": "dining-concern",
    "audience": [
      "student",
      "parent"
    ],
    "category": "health",
    "icon": "\u26a0\ufe0f",
    "studentQ": "What should I do if food I am served looks undercooked?",
    "parentQ": "How do we report a food safety concern in a campus dining outlet?",
    "studentA": "Do not eat it, and say something at the station straight away \u2014 the staff on shift can replace it and can stop the same plate going to the next person, which a complaint made later cannot. If you are not comfortable raising it there, or it happens more than once, take it to the manager of that dining location. A campus built around teaching food safety takes an undercooked-protein report seriously, and reporting it is the expected thing to do, not a nuisance.",
    "parentA": "Ask your student to raise it at the station at the time, because that is the only point where the food can be replaced and the rest of the batch checked. If that does not resolve it, or the problem repeats, the manager of the dining location is the next step, and Campus Safety or Student Affairs after that. It is worth encouraging your student to report it themselves: they were there, they can describe what they were served, and the college needs the detail rather than second-hand concern. If they become unwell, Student Health Services should hear about it too.",
    "stepStudent": "Raise it at the station while you still have the plate, and ask for a replacement.",
    "stepParent": "Encourage your student to report it in the moment, and escalate to the dining location\u2019s manager if it is not resolved.",
    "source": "Village insight \u00b7 Recurring family discussion",
    "sourceType": "village",
    "link": "https://www.ciachef.edu/cia-new-york-campus-health-services/",
    "linkLabel": "CIA New York campus health services"
  }
] as Fact[];

export const topics = {
  "money": {
    "name": "Money & costs",
    "description": "Tuition, deposits, fees, financial access, and work."
  },
  "arrival": {
    "name": "Arrival & move-in",
    "description": "Move-in, orientation, travel, and important arrival dates."
  },
  "classes": {
    "name": "Classes & kits",
    "description": "Books, program kits, uniforms, technology, and schedules."
  },
  "living": {
    "name": "Campus life",
    "description": "Dining, housing, mail, laundry, activities, and daily life."
  },
  "health": {
    "name": "Health & safety",
    "description": "Allergies, medical care, alerts, and urgent support."
  }
} as const;

export const dates = [
  { "month": "SEP", "day": "25", "title": "Kitchen/Bakeshop End Date", "note": "Block rotations end. Check the student’s schedule before planning travel." },
  { "month": "SEP", "day": "28", "title": "Kitchen/Bakeshop Start Date", "note": "A new block begins. Early-morning reporting times are common." },
  { "month": "OCT", "day": "02", "title": "Health Insurance Waiver Deadline", "note": "Students with other coverage must submit the waiver by this date." },
  { "month": "OCT", "day": "05", "title": "Career Fair (Hyde Park)", "note": "Review participation details and prepare early." },
  { "month": "NOV", "day": "25", "title": "Thanksgiving Holiday, Nov 25 – Nov 29", "note": "Verify travel against kitchen, bakeshop, and restaurant obligations." },
  { "month": "DEC", "day": "18", "title": "Fall Semester Ends", "note": "See the student’s class schedule to find their actual last day of class." }
] as const;

export const resources = [
  { title: "CIA Main Menu", description: "Student portal access for schedules, calendars, billing, and school systems.", href: "https://ciamainmenu.culinary.edu/", kind: "Official portal" },
  { title: "CIA Tuition and Fees", description: "Current published tuition, fee, meal-plan, housing, and insurance information.", href: "https://www.ciachef.edu/cia-tuition/", kind: "Official resource" },
  { title: "CIA Student Handbook", description: "Current academic, residence-life, safety, and student policy information.", href: "https://catalog.ciachef.edu/", kind: "Official resource" },
  { title: "Information for Parents", description: "CIA information and resources prepared for parents and families.", href: "https://www.ciachef.edu/parents/", kind: "Official resource" },
  { title: "Hyde Park Travel Directions", description: "Current campus address, driving directions, and travel planning information.", href: "https://www.ciachef.edu/new-york-campus-directions/", kind: "Official resource" },
  { title: "CIA Activities", description: "Campus events and student activities shared through the official activities account.", href: "https://www.instagram.com/ciaactivities/", kind: "Official channel" }
] as const;
