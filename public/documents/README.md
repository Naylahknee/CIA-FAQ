Resource-library documents for `/resources`.

The `.jpg` cover images in this folder are already committed. The matching
`.pdf` files are referenced by `resourceLibrary` in `app/guide-sections.ts`
and need to be added here with these exact names:

| File to add | Document | Pages |
| --- | --- | --- |
| `meal-plan.pdf` | Freshman Meal Plan | 2 |
| `academic-calendar.pdf` | 2026–27 Hyde Park Academic Calendar | 1 |
| `food-business.pdf` | Food Business Management: Culinary Fundamentals | 1 |
| `culinary-arts.pdf` | Culinary Arts AOS Degree | 1 |
| `baking-kit.pdf` | Baking & Pastry Kit | 1 |
| `culinary-kit.pdf` | Culinary Kit | 1 |
| `allergies.pdf` | Food Allergies & Intolerances | 2 |
| `restaurants.pdf` | CIA Alumni-Owned Restaurants Nearby | 1 |
| `textbooks.pdf` | Ordering Your CIA Textbooks | 6 |
| `medical-care.pdf` | Pharmacy, Urgent Care & Hospital Information | 2 |

Each cover is the first page of its PDF, so `meal-plan.jpg` pairs with
`meal-plan.pdf`. If a page count changes, update `pages` in
`app/guide-sections.ts` to match.
