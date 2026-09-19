# HANDOFF — CIA Hyde Park Family Guide & FAQ (ciaquestions.com)

_Created: 2026-09-19 · From: Claude Code (remote, Claude Code on the web) · To: any_
_Source: this chat_
_Status: live. Main site complete. Community rebuilt and merged; two of its five views are
deliberately unbuilt pending a backend. Pull requests are now checked by CI before merge._

## 1. What this project is

An independent guide for Culinary Institute of America (CIA) Hyde Park students and families:
searchable FAQs with an official source cited on every answer, an academic calendar, a resource
library, a safety directory, and a private community for parents. Not affiliated with the CIA.
"Done" for this phase means the guide and the community are live, accurate, and usable on a phone.

## 2. Stack and environment

- Framework: **Next.js 16.3.5** (App Router, RSC) on **React 19.2.6**
- Runtime: **Cloudflare Workers** via **vinext**, `@cloudflare/vite-plugin`, **wrangler 4.92**
- Build: **Vite 8** + `@vitejs/plugin-rsc`. Node ≥ 22.13
- Styling: **Tailwind 4.2** + shadcn/Radix/base-ui, oklch design tokens
- Data: **Drizzle 0.45** over **Cloudflare D1** and **Neon serverless**; **R2** for community media
- Auth: own implementation — **jose** JWTs, cookie sessions, TOTP 2FA. **No Supabase**
- Icons: **lucide-react** (ISC, lucide.dev)
- Repo: `github.com/Naylahknee/CIA-FAQ` · work branch `lovable/redesign` · deploy branch `main`
- Env var names only (values live in GitHub Actions secrets / Cloudflare):
  `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`,
  `CLOUDFLARE_D1_DATABASE_NAME`, `CLOUDFLARE_R2_BUCKET_NAME`, `APP_ORIGIN`, `AUTH_ENCRYPTION_KEY`,
  `RESEND_API_KEY`, `ADMIN_EMAIL`, `DATABASE_URL`, `GOOGLE_CLIENT_ID`, and
  **`NEXT_PUBLIC_COMMUNITY_URL`** (not yet set — see §8).
  `GROUPME_WEBHOOK_SECRET` / `GROUPME_GROUP_ID` were removed from the workflow. If they still
  exist as GitHub Actions secrets, delete them — otherwise nothing, but they are dead weight.
- How to run: `npm ci && npm run build`. `npm run dev` for Wrangler-backed dev.
  **`npm start` fails outside the Workers runtime** (`cloudflare:workers` import) — expected.

## 3. Files

| Path | Purpose | State |
|---|---|---|
| `app/layout.tsx` | root layout; mounts `GuideShell` once | done |
| `app/components/guide-shell.tsx` | sidebar shell; steps aside on `/community` | done |
| `app/guide-data.ts` | `facts`, `topics` — the FAQ corpus | done |
| `app/guide-sections.ts` | calendar rows, care directory, shopping, resources, Family Weekend | done |
| `app/community/layout.tsx` | community theme + provider + nav + gate | done |
| `app/community/page.tsx` | Feed — live data | done, render-verified |
| `app/community/topics/page.tsx` | Topics — live data | done, render-verified |
| `app/community/profile/page.tsx` | Profile — live data | done, render-verified |
| `app/community/messages/page.tsx` | Messages | **intentional empty state — no backend** |
| `app/community/alerts/page.tsx` | Alerts | **intentional empty state — no backend** |
| `app/community/_components/village-icons.js` | 32 icons, 6 seasonal sets (user-authored) | done |
| `app/community/legacy/` | previous community page | **delete after visual QA** |
| `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt` | SEO / AI crawlers | done |
| `scripts/generate-sitemap.mjs` | regenerates the two above | done |

Files live at `github.com/Naylahknee/CIA-FAQ`, branch `main` (currently `b70f756`).

## 4. Done

- **Lovable design system** ported wholesale — oklch tokens, DM Sans/Fraunces, sidebar shell.
  Verified: build, render, zero unstyled classes.
- **Mobile sizing** — topic chips and calendar tabs scroll on one row; heading clamp lowered.
  Not visually confirmed (see §7).
- **FAQ answers now in the server HTML** (previously mounted only when expanded, so nothing was
  indexable). Verified: 26 answers matched by real answer text across five topics.
- **SEO** — 13 distinct titles, canonical to ciaquestions.com, robots, 17-URL sitemap, JSON-LD
  (FAQPage/WebSite/Organization/BreadcrumbList/ItemList), llms.txt. Verified: all JSON-LD parses.
- **Family Weekend** Oct 9–11 2026 on the calendar with a parent panel. Verified: dates land on
  the correct weekdays; check-in times/venues corrected to the published values.
- **Sidebar no longer moves** — shell mounted once in the root layout, client-side nav, transition
  removed. Verified in source; **not** verified visually.
- **Community rebuilt** as *CIA Parents and Family*: five routes, scoped theme, rotating seasonal
  member icon. Verified: all routes render, 0 unscoped selectors, 0 blue/purple, all 32 icons
  render, every ink/badge pair clears 3:1 (lowest 4.63:1).
- Lint sits at **8 errors — main's pre-existing baseline**. None of this work added any.
  Tests 8/8.

## 5. Decisions and why

- **Messages, Alerts, topic follows, saved posts are not built** — no tables, no API routes exist.
  A populated-looking inbox that never updates is worse than an honest empty state on a page
  families rely on. Don't fake them; build the schema first.
- **Nothing is invented.** Where the design showed a field with no column behind it (topic
  descriptions, member bio, location, "Parent of N"), the element is omitted. Keep this rule.
- **Old palette names are aliases**, not literals — `--navy → var(--primary)` etc. in
  `globals.css`. `--muted` is deliberately **not** aliased: it means a background here and meant
  text in the old palette. Don't alias it.
- **Community theme is scoped** under `.cia-community`. Don't let it leak into global styles.
- **`GuideShell` mounts once** in the root layout. Don't re-add it to individual pages — that was
  the cause of the sidebar flicker.
- **Community opens in a new window** and honours `NEXT_PUBLIC_COMMUNITY_URL`.
- **Icons come from lucide**, not uploaded files. `village-icons.js` is kept byte-identical to the
  authored source; types live in a sibling `.d.ts` so the file stays untouched.

## 6. Tried and failed (don't repeat)

- **`app/robots.ts` / `app/sitemap.ts`** — Next's metadata-route convention. **vinext does not
  implement it**; they produced no route and nothing in `dist`. Use the static files in `public/`
  plus `scripts/generate-sitemap.mjs`.
- **Fetching icons from `public/icons/avatars/*.svg`** — files in `public/` aren't importable as
  modules and a missing file 404s silently. Import from source instead.
- **Converting links to `next/link` alone** — does not fix the sidebar, because the shell was
  mounted in 14 places and remounted on every route change. The root-layout mount is the fix.
- **Assuming CIA's check-in block contradicted itself** — it doesn't; those are three arrival-day
  windows. "Resolving" it put Sunday at the wrong plaza.

## 7. Open issues / known bugs

- **Nothing in this build has been seen rendered.** The sandbox proxy denies both
  `ciaquestions.com` and the workers.dev host, so everything is verified by build and SSR render,
  never by loading the page. Visual QA is outstanding for: mobile chip sizing, the sidebar not
  moving, and all five community views.
- `npm start` fails locally on `cloudflare:workers` — pre-existing, not a regression.
- Community search was never implemented (only the icon was imported in the old page). Net-new
  whenever wanted.
- **eslint's `json` formatter crashes on this tree**, inside `eslint-plugin-react`'s
  `Components.js`. `.github/scripts/lint-ratchet.sh` therefore parses the default formatter's
  summary line. Unfixed.
- `tsc` reports 21 errors, almost all missing `cloudflare:workers` ambient types. Running
  `wrangler types --config dist/server/wrangler.json` makes it **worse** (21 → 71), so typecheck
  is deliberately not a CI gate.
- The admin FAQ-suggestion review queue has **no input source** since GroupMe ingestion was
  removed. `faq_suggestions` and its `groupme_message_id` column remain because
  `app/api/faqs/community/route.ts` reads published rows; removing them needs a migration.

## 8. Remaining work (in order)

1. **Merge PR #13** (green: build, tests, lint). Sidebar/carousel/GroupMe work.
2. **Visual QA** at 1440 / 1024 / 390 on all five community views plus `/faq/living` and
   `/calendar`. Still the gate on everything below — nothing here has ever been seen rendered.
3. **Bind the subdomain.** In the Cloudflare dashboard: DNS → `CNAME` `parents` → the worker
   (proxied); Workers & Pages → `cia-guide` → Settings → Domains & Routes → add custom domain
   `parents.ciaquestions.com`; then set `NEXT_PUBLIC_COMMUNITY_URL=https://parents.ciaquestions.com`
   and redeploy. **Cannot be done from the repo** — the deploy workflow runs `delete config.routes`
   so deployments never rewrite zone routes.
4. **Build the Messages backend**: `communityThreads` + `communityMessages` tables, D1 migration,
   `app/api/community/messages/` routes, then replace the empty state.
5. **Build the Alerts backend**: `communityNotifications` with read state, plus generation on
   reply/mention, then replace the empty state.
6. **Persist topic follows** (`communityFollows`) — currently per-browser `localStorage` in
   `app/community/_components/community-data.tsx`.
7. **Saved posts** and **pinned announcements** — both need a column/table before the UI means
   anything.
8. Member-only gated content (e.g. the Everbridge 360 code). Use the existing auth-gated route
   `app/api/community/media/[id]/route.ts`, which calls `requireCommunityUser()`. **Anything in
   `public/` is world-readable regardless of login** — do not put gated documents there.
9. Optional: decide the fate of the orphaned FAQ-suggestion queue (see §7), and clear the 7
   remaining eslint errors so the ratchet baseline can go to 0 and lint can become a hard gate.

## 9. Exact next step

Merge PR #13 (`https://github.com/Naylahknee/CIA-FAQ/pull/13`) — build, tests and lint are all
green on head `1a97872`. Merging pushes to `main`, which triggers
`.github/workflows/deploy-cloudflare.yml` and deploys to Cloudflare Workers in about a minute.

Then open `https://ciaquestions.com` on a 1440px desktop and confirm the three things that PR
changes, because none of them have been seen rendered:

1. The left sidebar is visible on load and **does not move, fade or resize** when you click a nav
   item, search, or pick a topic chip. The only thing that may change it is the collapse button
   at the top-right of the sidebar, which folds it to a 64px icon rail; pressing it again restores
   it, and the choice survives a reload with no flash of the wrong state.
2. There is no longer a separate sticky header bar at the top of the content column — brand, nav
   and the profile/sign-in link all live in the sidebar now.
3. On the home page, the upcoming-events carousel advances by itself every 6 seconds, and stops
   while the pointer is over it.

Then on a phone (390px): the hamburger is in the top-right and opens the full menu. Report anything
wrong with the page **and the viewport width**.

## 10. Guardrails for the next model

- Stay in scope: §8 only. Don't add features not listed there.
- **Don't invent data.** If a field has no column behind it, omit the element and say so.
- Don't rewrite files marked done unless a bug requires it. Don't swap the stack.
- Keep community styles scoped under `.cia-community`; don't touch global styles.
- Don't re-add `GuideShell` to individual pages.
- Verify before claiming: this repo's convention is to build, render, and assert — not to eyeball.
- **CI must stay green.** `.github/workflows/pr-checks.yml` runs build + both test suites
  (blocking) and the lint ratchet on every PR. If lint errors drop below the baseline in
  `.github/scripts/lint-ratchet.sh`, lower `BASELINE` in the same commit — the number only
  ratchets down. Never raise it.
- Note `npm test`'s glob is `tests/*.test.mjs` and does **not** reach `tests/security/`. CI runs
  that suite explicitly; do the same locally.
- Never put gated content in `public/`.
- This is a live site families use for travel and money decisions. Accuracy beats completeness;
  cite the official CIA source rather than restating details that can go stale.

## 11. Checkpoint log

- 2026-09-19 15:21 — PR #11 merged as `b70f756`; deploy run #111 started. → next: visual QA (§9)
- 2026-09-19 15:47 — PR #12 merged as `ba8eced`; deploy #112 green. Fixed the mobile hamburger
  (a `max-width:760px` rule hid it with `display:none !important`, so it existed only between
  761–820px) and the plain-anchor sidebar. Added `pr-checks.yml` — first CI this repo has ever
  had. → next: user-reported sidebar still moving
- 2026-09-19 16:10 — PR #13 open and green. Found the **real** cause of the moving sidebar:
  `.app-frame` animated `grid-template-columns` over .35s and `.sidebar-hidden` set the column to
  `0`, with a document-level `pointerdown` listener revealing it on first click. Sidebar is now
  permanent with an explicit collapse toggle; sticky header removed; carousel auto-advances;
  GroupMe fully removed; legacy folder deleted; lint baseline 8 → 7.
  → next: merge #13, then visual QA (§9)
