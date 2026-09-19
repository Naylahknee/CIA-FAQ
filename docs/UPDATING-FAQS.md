# Updating the FAQs

There are two ways to add an answer. Pick by how permanent it is.

| | Admin page | Code |
|---|---|---|
| Who can do it | you, in a browser | someone editing the repository |
| Takes effect | immediately, no deploy | after a merge and deploy |
| Appears | "Answers added since the last update" on `/faq` | everywhere, including topic pages and search |
| Has parent/student wording | no, one answer for both | yes |
| Use it for | a new answer, a correction that cannot wait | anything you want treated as core content |

**Most of the time, use the admin page.** Nothing below requires a developer.

---

## Adding an FAQ from the admin page

1. Sign in with the account whose address is set as `ADMIN_EMAIL`, or with a moderator account. Your email has to be verified — the page will say so if it is not.
2. Go to **ciaquestions.com/admin**.
3. Find **Add an FAQ** at the top of the FAQ section.
4. Fill in:
   - **Question** — write it the way a parent would ask it, not the way a policy names it. "When is the last day to add or drop a course?" beats "Add/drop deadline."
   - **Answer** — the whole answer, in plain sentences. Assume the reader is anxious and short of time.
   - **Category** — Money, Arrival and dates, Classes and supplies, Campus life, or Health and safety.
   - **Official source URL** — optional but worth it. Every answer that cites a CIA page is one a family can check for themselves.
5. Press **Publish this FAQ**. It is live on `/faq` straight away.

### Before you publish

- **Check the answer against an official source.** Families use this site for travel and money decisions. A wrong date costs somebody a flight.
- **Do not name students, staff or families**, and do not publish anyone's direct email or phone number. Point at a role or a department instead: "the manager of that dining location", not a person.
- **Say when something is unconfirmed.** "Confirm with the Registrar" is a better answer than a confident guess.
- **Dates go stale.** Anything term-specific is worth re-reading at the start of each semester.

### Editing or removing one

The same admin page lists everything published. Each entry has **Save draft**, **Approve**, **Publish**, **Unpublish** and **Reject**. Unpublish takes it off the site immediately and keeps the text, so it is the safe choice if you are unsure.

---

## Adding an FAQ in the code

Use this when an answer should behave like core content: separate parent and student wording, its own icon, a "next step" line, term overrides, and inclusion in topic pages and search.

Entries live in `app/guide-data.ts` in the `facts` array. Copy an existing entry and change the fields.

```jsonc
{
  "id": "add-drop",                    // unique, lowercase, hyphens
  "audience": ["student", "parent"],
  "category": "classes",               // money | arrival | classes | living | health
  "icon": "📅",
  "studentQ": "…",                     // the question, asked by a student
  "parentQ": "…",                      // the same subject, asked by a parent
  "studentA": "…",                     // the answer a student needs
  "parentA": "…",                      // the answer a parent needs
  "stepStudent": "…",                  // one concrete next action
  "stepParent": "…",
  "source": "Official · Hyde Park academic calendar",
  "sourceType": "official",            // official | verify | village
  "link": "https://catalog.ciachef.edu/",
  "linkLabel": "Open the CIA academic catalog"
}
```

`sourceType` controls the badge on the answer, so it should be honest:

- **official** — stated on a CIA page or in an official document
- **verify** — believed correct but not confirmed; tells the reader to check
- **village** — families' collective experience, not a CIA statement

Optional: `springNotice` adds a warning line for a term whose details are not published yet, and `termOverrides` supplies different text per term.

### Editing on GitHub without any tooling

1. Open `app/guide-data.ts` on github.com and press the pencil icon.
2. Make the edit.
3. Choose **Create a new branch for this commit**, then **Propose changes**.
4. Open the pull request and wait for the three checks: **File encoding**, **Build and test**, **Lint**. They take about a minute.
5. Green means merge it, and the site redeploys on its own. Red means something is wrong with the edit — most often a missing comma or an unclosed quote. The check output names the line.

Never commit straight to `main`. The checks only run on a pull request, and they are the thing that stops a typo taking the site down.

---

## Where the two kinds live

Admin entries are rows in the `faq_suggestions` table, served by `/api/faqs/community` and rendered by `PublishedFaqs` in `app/components/guide-faq-pages.tsx`. They survive deploys — they are data, not code.

Code entries are in `app/guide-data.ts` and ship with the build.

A note for whoever maintains this: the `faq_suggestions` table still has a `groupme_message_id` column, left over from an intake that no longer exists. It is `NOT NULL` with a unique index, so entries created from the admin page fill it with a synthetic `admin-<uuid>` value. Dropping the column needs a migration and would be a reasonable tidy-up.
