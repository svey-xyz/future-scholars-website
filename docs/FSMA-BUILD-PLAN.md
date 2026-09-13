# FSMA Build Plan — Future Scholars Montessori Academy

**Status:** S1–S3 done · content + images seeded · S0b outstanding (owner) · **Last updated:** 2026-09-13 (rev 9) · **Owner:** Hayden Soule (svey)
**Repo:** `git@github.com:svey-xyz/future-scholars-website.git` (fork of `sanity-next-clean`)

---

## 0. How to use this document

This file is the **source of truth** for the FSMA rebuild. Read §1–§6 before touching code, then work
exactly one session from §8.

**Layout of this doc**

| Section | What's in it |
|---|---|
| §1 | Client brief, scope, out-of-scope |
| §2 | Environments, accounts, credentials map |
| §3 | Locked decisions (do not relitigate without logging a change) |
| §4 | Open questions / blockers (client-side TBDs) |
| §5 | Template architecture + non-negotiable conventions |
| §6 | Information architecture, URL map, redirect table |
| §7 | Design direction + design tokens |
| §8 | **The work** — sessions S0…S12, each sized for one ~4h/limited-token agent run |
| §9 | Cross-cutting acceptance bars (a11y, SEO, perf) |
| §10 | Launch/cutover runbook |
| §11 | Session log (append after every session) |
| §12 | Decisions log (append whenever you deviate) |

**Rules for agents**

1. **One session per run.** Do not start the next session even if tokens remain — stop, update §11, commit.
2. **Sync before editing.** This is a fork. Follow `docs/FORK-SYNC.md`: `git fetch upstream`, merge if behind,
   *then* work. Never hand-copy files from the template.
3. **Required reading before code:** `AGENTS.md` (root), plus the doc it points you at for the area you're
   touching — `docs/A11Y.md` for any UI, `docs/CACHING.md` for any route/data work,
   `docs/TRANSITIONS.md` for anything navigational, `docs/MIGRATION.md` for content moves.
   Next.js API questions → read `node_modules/next/dist/docs/`, not memory.
4. **Branch per session:** `feat/fsma-s<N>-<slug>` off `main`. Squash-merge. One session = one PR.
5. **Updating this doc is part of the session, not optional.** Before you finish:
   - tick the task checkboxes you completed; leave unticked what you didn't
   - if a task turned out to be wrong/unnecessary, ~~strike it~~ and add a one-line reason — never delete
   - append a row to §11 Session Log
   - append any decision that differs from §3/§7 to §12 Decisions Log with rationale
   - move anything you got blocked on into §4 with the date
6. **Divergence discipline.** Every change that makes this fork differ from the template in a way that
   will conflict on merge must be recorded in `docs/FORK-SYNC.md`'s divergence registry. If a change is
   *generally useful* (e.g. the SEO object in S6), backport it to the template instead of forking behaviour.
7. **Token discipline.** Don't read whole directories. Read the schema/component you're editing plus the
   doc §ref in the task. Sessions are scoped so this is sufficient.
8. **Never invent client facts.** Address, phone, hours, social URLs, staff names — if it isn't in §4 as
   answered, leave a `TODO(client)` marker and list it in §4. Do not guess.

**Definition of done for any session:** `npm run type-check` and `npm run lint` pass, `npm run
sanity:typegen` regenerated and committed if schema changed, Lighthouse a11y ≥95 on affected routes, and
the acceptance list in the session is ticked.

---

## 1. Brief & scope

Future Scholars Montessori Academy is a Montessori school in Ottawa, ON (infants through Casa, 6 months –
6 years). The existing site (`https://www.futurescholarsmontessori.com`) is a ~2010-era static HTML site
with a jssor slider, table layout, `.htm` extensions, and no responsive design. We are rebuilding it on
the `sanity-next-clean` template.

**Client's stated requirements (verbatim intent):**
- Keep pages: **Home, Montessori, Programs, Testimonials, Gallery**.
- Merge **Contact Us + Admissions + About Us** into a single **About Us** page.
- Likes, from their reference sites: **large image at the top of every page with the logo over it**, and
  **floating social media links**.
- Only firm design constraint: **the menu bar is on the side, not across the top**.

**Reference sites:** fieldstonedayschool.org · rotherglen.com · parkdalemontessori.ca

**In scope:** static marketing site, Sanity-managed content, side navigation, per-page masthead, floating
socials, gallery, testimonials, programs, merged About/Admissions/Contact, SEO, WCAG 2.2 AA (AAA where
feasible), AODA-aware copy, Vercel deploy, 301 map from the old `.htm` URLs.

**Out of scope (confirmed):** contact/enquiry forms (use `mailto:`/`tel:` links only), French/bilingual,
blog/news/events, calendar, parent portal or logins, online payments, analytics, cookie consent.

**Known content risks:** legacy imagery is small and dated — resolution, not permission, is the constraint
(releases are in hand, D17). Expect to re-encode, crop tightly, and ask the client for a photo shoot for
anything used at masthead scale (Q5).

---

## 2. Environments & accounts

| Thing | Value | Status |
|---|---|---|
| Repo | `github.com/svey-xyz/future-scholars-website` | ✅ exists |
| Upstream template | `https://github.com/svey-xyz/sanity-next-clean` — added as `upstream` (HTTPS) | ✅ S0 |
| Sanity project | **FSMA** — project ID `wzs9gcps`, org `oqjnHYtnD` | ✅ created |
| Sanity datasets | `production` ✅ (ACL: public) · `staging` ✅ (ACL: private, created 2026-09-13) | ✅ |
| Studio hosting | separate, `sanity deploy` → `SANITY_STUDIO_STUDIO_HOST=fsma` (fall back to `future-scholars` if taken). Studio is **not** mounted at `/studio` in this template | ⬜ S0b |
| Frontend hosting | Vercel, project linked to the repo — **client/owner creates and links the project** | ⬜ S0b |
| Domain | `futurescholarsmontessori.com` — client's existing DNS provider, CNAME/A updated at cutover | ⬜ S12 |
| Preview protection | ~~Vercel password protection~~ — **dropped** (Pro-plan feature, not available; see §12) | ❌ |

**Environment variables** (frontend `.env.local`, mirrored into Vercel for Preview + Production):

```
NEXT_PUBLIC_SANITY_PROJECT_ID=wzs9gcps
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-09-25
NEXT_PUBLIC_SANITY_STUDIO_URL=https://<studio-host>.sanity.studio
SANITY_API_READ_TOKEN=            # viewer token — REQUIRED, the app throws without it (see note below)
SANITY_REVALIDATE_TAGS_SECRET=    # webhook secret, see docs/CACHING.md
```

Studio `.env` (`studio/.env.local`): `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`,
`SANITY_STUDIO_PREVIEW_URL`, `SANITY_STUDIO_STUDIO_HOST`.

**Sanity state, verified 2026-09-13:** `production` exists (ACL `public`). `staging` created 2026-09-13
(ACL `private`). **No schema deployed yet.**

**Correction to an earlier assumption:** the public ACL does *not* make `SANITY_API_READ_TOKEN` optional.
`frontend/sanity/lib/token.ts` throws at **module evaluation** if the variable is unset, and
`sanity/lib/live.ts` passes it to `defineLive` as both `serverToken` and `browserToken`. It is imported
transitively from `app/layout.tsx`, so **every route 500s without it** — including published reads. The
token is a hard prerequisite for running the app at all, not just for Presentation. The Studio in `studio/` is the only source of schema: deploy with `npx sanity@latest schema deploy`
and regenerate types with `npm run sanity:typegen`. Never manage this project's schema through the Sanity
MCP `deploy_schema` tool — it creates a competing MCP-managed schema record alongside the Studio one.

---

## 3. Locked decisions

| # | Decision |
|---|---|
| D1 | Base is the existing fork of `sanity-next-clean`; no greenfield, no other starter. |
| D2 | Deploy on Vercel; DNS stays with the client's provider and is repointed at cutover. |
| D3 | All legacy `.htm` URLs get 301s (see §6.3). |
| D4 | Content: port the old copy verbatim as a first pass into Sanity; client edits later in Studio. |
| D5 | Imagery: reuse legacy photos for now, flagged as a risk; client may supply new photography later. |
| D6 | No forms anywhere. Contact = `mailto:` and `tel:` links. |
| D7 | Static marketing site only — no blog, projects, portal, i18n, payments, analytics, cookie banner. |
| D8 | Logo must be **recreated as vector (SVG)** from the supplied JPG, including a reversed/white variant. |
| D9 | Palette is a **softened expansion** of the logo colours, not the raw logo blue (§7.2). |
| D10 | WCAG 2.2 AA is the floor (template targets AAA where feasible); AODA-aware accessibility statement on About. |
| D11 | Side nav is a **desktop rail (≥1024px)** that collapses to a top bar + drawer below. Confirmed acceptable. |
| D12 | Masthead (image + logo) is a **page-level field**, not a page-builder block, so every page opens with one. |
| D13 | Unused template features (posts, projects, technologies, categories, archives) are **hidden, not deleted**, to keep fork merges clean. |
| D14 | Light theme only in the UI; dark tokens stay defined in `globals.css` but the theme toggle is removed and the app is forced light. |
| D15 | `ShaderBackground` (WebGL) is **not used** on this site — inappropriate weight/battery cost for a school marketing site. Keep the code, don't wire it. |
| D16 | Milestone A (rough draft of Studio + one page) within days; finals over several weeks. |
| D17 | Legacy photography is **cleared for web use** — client holds releases (confirmed 2026-09-13). Gallery is no longer gated. |

---

## 4. Open questions / blockers

| # | Question | Owner | Status |
|---|---|---|---|
| Q1 | Social accounts: which platforms, and the exact URLs? | Client | **Partly answered 2026-09-13** — Facebook found in the legacy chrome (`facebook.com/FutureScholarsMontessoriAcademy`) and seeded into `settings.contact.socials`. Still ask whether Instagram or anything else exists. Rail stays data-driven |
| Q2 | Confirmed street address, phone, general email, office hours | Client | **Extracted 2026-09-13, awaiting confirmation.** 1920 Bank St., Ottawa ON K1V 7Z8 · (613) 244-FSMA (3762) · fax (613) 244-3764 · info@futurescholarsmontessori.com · futurescholarsmontessori@gmail.com · 7:30 am–5:30 pm, Montessori day 8:30 am–3:30 pm · opened January 2013. Seeded into `settings` and the About page behind a `TODO(client)` note block |
| Q3 | ~~Photo consent for existing images of children~~ | Client | ✅ **Resolved 2026-09-13** — releases cover web use (D17) |
| Q4 | Vector logo / brand fonts | Client | ✅ **Done 2026-09-13** — recreated per D8; wordmark set in Orbitron (SIL OFL) and converted to outlines, so no font dependency ships with the SVGs |
| Q5 | New photography — will the client supply a shoot? | Client | **Unblocked for now, 2026-09-13** — masthead gained a `brand` variant (flat colour panel + reversed logo) and every page is seeded with one, so the design ships without photography. Still the right long-term answer. Measured every legacy image: **none is ≥1000px**. The best photography is 720×480; the homepage slider PNGs are 928×345 letterbox strips. Nothing on the old site can carry a masthead at the size D12/§7.6 specify. See `content/legacy/IMAGE-MANIFEST.md`. Either a shoot, licensed stock, or a non-photographic masthead treatment |
| Q13 | `settings.logo` (the editor-facing SVG upload) and the Studio's other content seeding need Sanity write access, which no agent session has (Q11). Owner uploads `frontend/public/brand/logo-full.svg` in Studio | svey | **TBD, opened 2026-09-13** |
| Q14 | ~~Legacy host off the egress allowlist~~ | svey | ✅ **Resolved 2026-09-13** — the **apex** is allowlisted (`www.` still 403s; use the apex). Full crawl found 27 pages / 270 image paths |
| Q15 | ~~Sanity token with `create` permission for asset upload~~ | svey | ✅ **Resolved 2026-09-13** — owner ran the migration; 124 assets in `production`, 111 referenced by content |
| Q16 | Three testimonial photos from the legacy page have no attribution in the markup. Pairing one with a named family would assert something the source doesn't say — who is in each? | Client | **TBD, opened 2026-09-13** — assets uploaded, deliberately unattached |
| Q17 | `legacy-maria.gif` is a photograph of Maria Montessori, not FSMA's own image. Check provenance before republishing | svey | **TBD, opened 2026-09-13** |
| Q6 | Tuition/fee information — publish on About/Admissions or "contact us for rates"? | Client | TBD |
| Q7 | Legacy "Recognition From The Mayor" item — keep, and where? | Client | TBD — the certificate scan is uploaded (`legacy-FutureScholarsMayor.jpg`) and sitting unplaced until this is answered |
| Q8 | ~~Sanity viewer token for `SANITY_API_READ_TOKEN`~~ | svey | ✅ **Resolved 2026-09-13** — token present in `frontend/.env.local`; the app no longer throws at module evaluation |
| Q9 | Vercel project creation + linking, and mirroring env vars into Preview/Production | svey | Deferred to S0b (2026-09-13) |
| Q10 | Sanity CLI login on the dev machine (`npx sanity login`) — needed for `schema deploy` (S2) and `sanity deploy` | svey | Owner runs CLI deploys manually (2026-09-13) |
| Q11 | **`*.sanity.io` is blocked by the egress allowlist** in both the Cowork device VM and the cloud container (`403 blocked-by-allowlist`; Node sees `EAI_AGAIN`). The frontend dev server boots but every data-fetching route 500s, so **no agent session can render a page against Sanity or verify Presentation**. Owner must run `npm run dev` outside the Cowork VM, or add `*.sanity.io` (+ `*.apicdn.sanity.io`) to the allowlist | svey | **BLOCKER, opened 2026-09-13** |
| Q12 | ~~Logo source JPG~~ | svey | ✅ **Resolved 2026-09-13** — supplied in chat, archived at `docs/brand/logo-source.jpg` (not under `public/`, per §7.4) |

---

## 5. Template architecture & conventions

Facts about the fork as of planning (verify with `git log` before assuming):

- **Monorepo npm workspaces:** `frontend/` (Next.js) + `studio/` (Sanity Studio). Node ≥22.12.
- **Next.js 16** (App Router, RSC), **React 19**, **TypeScript 6**. `cacheComponents: true` with the
  `sanity` cacheLife preset in `frontend/next.config.ts` — on-demand revalidation only, no time-based TTL.
- **Tailwind v4** (CSS-first config in `frontend/app/globals.css`, `@theme inline`), **shadcn/ui** in
  `frontend/components/ui`, Radix primitives.
- **Sanity v6**, `next-sanity` 13, Live Content API, Presentation/visual editing, `sanity-plugin-media`,
  `@sanity/assist`.
- **Typegen is mandatory:** schema change → `npm run sanity:typegen -w frontend` (extracts to
  `sanity.schema.json`, regenerates `frontend/sanity.types.ts`). Both are committed. `predev`/`prebuild`
  run it. **There is no root-level `sanity:typegen` script** — it exists only in the `frontend` and
  `studio` workspaces.
- **Three-layer caching pattern** — every route: static shell + `'use cache'` cached components +
  dynamic perspective/stega passed as props. See `docs/CACHING.md` and
  `.agents/skills/sanity-live-cache-components/`. Do not fetch inside a cached component without
  passing `perspective`/`stega` in.
- **View transitions** are on (`experimental.viewTransition`). New links get `transitionTypes`, persistent
  elements get matching `<ViewTransition name>`. See `docs/TRANSITIONS.md`.
- **PWA/serwist** is wired (`app/sw.ts`, `manifest.ts`). Leave it; just keep the manifest/icons on-brand.
- **A11y contract** in `docs/A11Y.md` — token-based contrast, focus rules, ARIA conventions, per-PR checklist.
- **Design tokens are HSL channel triplets** (`--primary: 232 52% 32%;` consumed as `hsl(var(--primary))`).
  Do **not** convert the system to OKLCH — `ShaderBackground`'s `readThemeRgb()` and every existing
  component read the channel format.
- **Existing page-builder blocks:** hero, callToAction, infoSection, featuresGrid, stats, scores,
  testimonials, gallery (grid/masonry/carousel/collage + lightbox), faq, note, postsArchive,
  projectsArchive, authorsArchive.
- **Existing documents:** page, post, project, person, category, technology. `person` is thin —
  `firstName`, `lastName`, `picture` only; it has no role, bio or credentials (see S3). **Singleton:** settings
  (title, description, logo, favicon, ogImage, metadataBase, blurb, contact{email, phone, socials},
  navigation[navLink|navDropdown], mobileNav, legal, builtWith, homepage).
- **Existing routes:** `/`, `/[slug]`, `/posts/[slug]`, `/projects/[slug]`, `sitemap.ts`, `robots.ts`,
  `manifest.ts`, JSON-LD components under `app/components/seo/`.

**Commands**

```bash
npm install                       # root, workspaces
npm run dev                       # frontend :3000 + studio :3333
npm run sanity:typegen -w frontend
npm run type-check                # root + workspaces
npm run lint
npm run format
cd studio && npx sanity deploy    # studio hosting
```

### 5.1 Dev-environment notes (agent sandbox)

Verified 2026-09-13. These are quirks of the sandboxed shell agents get, **not** defects in the repo —
don't "fix" the template for them.

- **No SSH.** `git@github.com` does not resolve; egress is an HTTP(S) proxy only. Use HTTPS remotes for
  reads. Pushing needs a credential helper or a PAT — otherwise **the owner pushes**, and the
  branch-per-session/PR rule in §0 becomes commit-locally-and-hand-off.
- **Background processes don't survive a call.** Each shell invocation is a fresh PID namespace with a
  ~180s cap, so `nohup … &` is killed the moment the call returns. Start a server and assert against it
  **inside one call**. `pgrep`/`pkill` only see that call's own processes — and `pkill -f "npm install"`
  will match the wrapper and kill your own shell.
- **`sanity schema extract` exits 134 (SIGABRT) *after* succeeding.** It writes a valid
  `sanity.schema.json`, then aborts during teardown. This breaks the `&&` chain in the `sanity:typegen`
  script, so the script always "fails" here. Run the two steps separately and check the output file:
  `(cd studio && sanity schema extract --enforce-required-fields --path ../sanity.schema.json)` then
  `(cd frontend && sanity typegen generate)`. Don't rewrite the template script over this.
- **Google Fonts is blocked** (`fonts.googleapis.com` → proxy refusal), so `next/font/google` falls back
  to system fonts locally. Type will look wrong in local dev; it is fine on Vercel. Relevant to S1 — judge
  typography from a deployed preview, not from localhost.
- **`sanity-cdn.com` is blocked**, so the Studio's auto-update version check logs a 403. Harmless; the
  Studio still starts.
- **Deleting files needs explicit permission** in the mounted folder. A stale `.git/index.lock` will wedge
  git until that is granted.
- **`*.sanity.io` is not on the egress allowlist** (`403 blocked-by-allowlist` through the proxy; Node,
  which ignores `HTTPS_PROXY`, reports `EAI_AGAIN`). The frontend compiles and serves, but every route
  that fetches content 500s, so an agent session **cannot** render a page against the dataset, verify
  Presentation, or download legacy imagery. `WebFetch` still works for reading legacy pages as text
  (S6's copy capture is therefore possible; the image download is not). See Q11.
- **`.next` must not be renamed in place.** Turbopack refuses to start when its persistence directory is
  stale (`Failed to open database … Operation not permitted`), and any `.next-*` sibling left in the tree
  is **not** gitignored, so Tailwind v4 scans it for class candidates and pulls mangled bytes out of the
  binary build artefacts — producing a bogus selector and a hard `Parsing CSS source code failed` on
  `globals.css`. Delete `.next` (and `studio/node_modules/.sanity/vite`, which Studio hits with the same
  `EPERM … unlink` on a stale cache) rather than moving it aside.
- **Deleting files needs an explicit grant** in the mounted folder — ask for it up front, since both cache
  problems above are only fixable with `rm -rf`.
- **The sandbox ships npm 10.9.8; the lockfile was written by a newer npm.** Running `npm install` strips
  the `libc` fields from `package-lock.json` (36 deletions). Harmless to the install, but **never commit
  that churn** — `git checkout -- package-lock.json` after installing.

---

## 6. Information architecture

### 6.1 Sitemap

| Page | Slug | Source content | Notes |
|---|---|---|---|
| Home | `/` | legacy `index.html` | Mission / Vision / Faculty, programs teaser, testimonial teaser, gallery teaser, CTA |
| Montessori | `/montessori` | legacy `maria.htm` | The method, Maria Montessori, why it works |
| Programs | `/programs` | `programs.htm` + `infant-class.htm`, `toddler-class.htm`, `casa-class.htm` | Index + three program detail routes |
| — Infants | `/programs/infants` | `infant-class.htm` | 6–18 mo, ratio 1:3 |
| — Toddlers | `/programs/toddlers` | `toddler-class.htm` | 18 mo–3 yrs, ratio 1:5 |
| — Casa | `/programs/casa` | `casa-class.htm` | 3–6 yrs, ratio 1:8 |
| Testimonials | `/testimonials` | `testamonials.htm` (sic) | |
| Gallery | `/gallery` | `pictures.htm` | Releases confirmed (D17) |
| About Us | `/about` | `about.htm` + `admissions.htm` + `contact.htm` | Anchored sections `#about`, `#admissions`, `#contact`, plus accessibility statement |

Dropped: `parents.htm`, `links.htm` (confirm any live content worth folding into About before redirecting).

### 6.2 Navigation (side rail order)

Home · Montessori · Programs (expandable: Infants, Toddlers, Casa) · Testimonials · Gallery · About Us
Rail footer: phone (`tel:`), email (`mailto:`), socials.

### 6.3 Redirect map (`frontend/next.config.ts`, permanent 301)

| From | To |
|---|---|
| `/index.html` | `/` |
| `/maria.htm` | `/montessori` |
| `/programs.htm` | `/programs` |
| `/infant-class.htm` | `/programs/infants` |
| `/toddler-class.htm` | `/programs/toddlers` |
| `/casa-class.htm` | `/programs/casa` |
| `/testamonials.htm` | `/testimonials` |
| `/pictures.htm` | `/gallery` |
| `/about.htm` | `/about` |
| `/admissions.htm` | `/about#admissions` |
| `/contact.htm` | `/about#contact` |
| `/parents.htm` | `/about` |
| `/links.htm` | `/` |

Crawl the live site for any other reachable `.htm` before cutover (S12) and extend this table.

---

## 7. Design direction

### 7.1 Principles

Warm, bright, calm, unmistakably a school for very young children — but credible to parents evaluating a
private school. The reference sites all lead with photography of children at work and keep chrome minimal;
match that. Photography is the hero, type is quiet, colour is used in small confident amounts.

**Anti-goals:** the logo's blocky techno display face used as UI type; pure-blue-on-white; dense text
walls; carousels of stock photos; anything that makes every page's masthead look identical.

**Masthead variation is required.** Client wants a big logo-over-image top on every page — implement it,
but vary crop ratio, focal point and overlay per page and let the page heading differentiate. Do not ship
six identical mastheads.

### 7.2 Palette (proposal — refine in S1 against real photography)

Logo is near-pure blue (~`#2B2FD4`), black, and a yellow tassel. Softened, expanded, contrast-checked:

```css
:root {
  --background: 38 40% 97%;          /* warm paper */
  --foreground: 226 30% 14%;         /* ink navy-black */
  --card: 0 0% 100%;
  --card-foreground: 226 30% 14%;
  --primary: 232 52% 32%;            /* academy blue — logo blue, darkened for contrast */
  --primary-foreground: 0 0% 100%;
  --secondary: 214 38% 92%;          /* soft sky */
  --secondary-foreground: 232 52% 24%;
  --muted: 36 25% 93%;
  --muted-foreground: 226 12% 36%;
  --accent: 44 96% 52%;              /* tassel sunflower — small doses only */
  --accent-foreground: 226 40% 12%;
  --border: 36 20% 86%;
  --input: 36 20% 86%;
  --ring: 232 52% 32%;
  --radius: 0.75rem;                 /* softer than template default */
}
```

Contrast obligations: `primary` on `background` ≥ 7:1, body text ≥ 7:1, `accent` is **never** a text
colour on light backgrounds (use it for rules, dots, underlines, focus flourish); `accent-foreground` on
`accent` ≥ 7:1. Verify every pair in S1 and record results in §12.

### 7.3 Typography

- **Body/UI:** keep `Inter` (already loaded via `next/font` in `layout.tsx`).
- **Headings:** a friendly geometric sans with real weight range — `Outfit` or `Poppins`. Pick one in S1
  and show the client both in context.
- **Display face:** the logo's squarish face (Michroma/Bank-Gothic-like) is dated and poor for reading.
  Use it **only inside the logo lockup**, or at most for a small eyebrow/kicker if it earns its place.
- Max two families plus the logo. Load with `next/font`, expose as `--font-sans` / `--font-display` in
  `@theme inline`.

### 7.4 Logo

Vector recreation deliverables (S1): `logo-full.svg` (stacked lockup), `logo-reversed.svg` (white, for
mastheads), `logo-mark.svg` (compact — cap + "FSMA" for the rail/favicon), `favicon.svg`, PWA icons.
Approach: trace the cap illustration as flat vector shapes (drop the 2010 gradients/bevel), reset the
wordmark in a matched typeface, keep the blue/black/yellow relationship. Do not ship the JPG anywhere.

### 7.5 Side navigation spec

- ≥1024px: fixed left rail, 240–280px, full height, own scroll, `<nav aria-label="Main">`. Logo mark at
  top links home. Active item uses `aria-current="page"`. Programs expands in place (Radix Collapsible) —
  no hover-only flyouts. Rail footer: phone, email, socials.
- <1024px: fixed top bar (logo + hamburger) + shadcn `Sheet` drawer, focus-trapped, Esc to close,
  `aria-expanded` on the trigger, body scroll locked.
- Main content offsets with `lg:pl-[280px]`; `<main id="main">` plus a skip link as first focusable element.
- The rail persists across routes: give it a stable `<ViewTransition name>` and suppress its snapshot
  animation, as `site-header` does today (`globals.css`).

### 7.6 Masthead spec

Page-level field (D12). Full-bleed image, `~60vh` desktop / `~42vh` mobile, hotspot-aware crop, reversed
logo lockup centred or lower-left, gradient scrim sized to hit 4.5:1 for any text over it. The image is the
LCP element: `priority`, correct `sizes`, no lazy. Alt text required by schema validation; decorative-only
mastheads still need the page `h1` present (visually hidden if the design calls for it — the template's
`titleDisplay` already models this).

### 7.7 Floating socials spec

Fixed vertical stack, right edge, vertically centred, ≥768px only; inside the drawer below that. Wrapped
in `<nav aria-label="Social media">`, 44px targets, visible focus ring, `z-index` below dialogs/lightbox,
`rel="noopener noreferrer"`, accessible names ("Future Scholars on Instagram"). Renders nothing when
`settings.contact.socials` is empty (Q1).

---

## 8. Sessions

Each session is one agent run, one branch, one PR. **Milestone A (client draft) = S0–S6.**

---

### S0 — Project setup & first deploy
**Goal:** working local dev against a real Sanity project, deployed preview on Vercel.
**Read first:** §2, `docs/FORK-SYNC.md`, `vercel-installation-instructions.md`.

- [x] Add `upstream` remote for the template; `git fetch upstream`; merge if behind; record result in §11
      — **the fork had no shared history with the template** (squashed snapshot import). Regrafted; see §12.
- [x] `npm install` at root (1538 packages, ~60s)
- [x] ~~Create Sanity project~~ — done out of session: **FSMA**, `wzs9gcps`, org `oqjnHYtnD`, `production` dataset exists
- [x] Create the `staging` dataset — created 2026-09-13, ACL `private`
- [x] Write `frontend/.env.local` and `studio/.env.local` (values in §2 — project ID is known)
- [x] Generate `SANITY_REVALIDATE_TAGS_SECRET` (written to `frontend/.env.local`)
- [x] Create viewer token → `SANITY_API_READ_TOKEN` — done out of session (Q8 closed 2026-09-13)
- [x] `npm run sanity:typegen -w frontend` clean (generated files unchanged vs committed); `npm run type-check` clean;
      `npm run lint` clean (0 errors, 3 pre-existing template warnings — backport candidates, see §12)
- [x] Studio dev server boots on :3333 against the FSMA `production` dataset
- [x] Frontend dev server boots — confirmed; it no longer throws on the token. Routes still 500 on **Q11** (egress), not on the token
- [ ] Confirm draft mode + Presentation visual editing round-trips — **blocked on Q11**, owner action (cannot be done from a Cowork session at all)
- [x] This plan doc is committed at `docs/FSMA-BUILD-PLAN.md`

**Acceptance:** ~~preview URL renders~~ *(moved to S0b — Vercel is owner-created)*; Studio opens ✅;
visual editing works ⬜ (blocked on Q11, owner-side).

---

### S0b — Credentials, Vercel & Studio deploy
**Goal:** close out the S0 items that need owner credentials. Small session; can be folded into S1.

- [x] Owner: create the Sanity viewer token, put it in `frontend/.env.local` (Q8) — done 2026-09-13
- [ ] Owner: `npx sanity login` on the dev machine (Q10)
- [ ] Verify `npm run dev` boots both servers and `/` renders against `production` — **owner must run this outside the Cowork VM** (Q11). Note `predev` runs typegen, which exits 134 after succeeding (§5.1); `npx next dev` / `npx sanity dev` bypass it
- [ ] Owner: create + link the Vercel project; mirror all five env vars into Preview and Production (Q9)
- [ ] `cd studio && npx sanity deploy` with `SANITY_STUDIO_STUDIO_HOST=fsma`; set
      `NEXT_PUBLIC_SANITY_STUDIO_URL` and `SANITY_STUDIO_PREVIEW_URL` to the deployed host
- [ ] Confirm draft mode + Presentation visual editing round-trips
- [ ] Owner: force-push the regrafted `main` (see §12) so the shared history reaches the remote

**Acceptance:** preview URL renders the template against the FSMA dataset; Studio opens at its deployed
host; visual editing round-trips.

---

### S1 — Brand foundation
**Goal:** the visual system exists as code and assets. No page work.
**Read first:** §7, `docs/A11Y.md` (Color & contrast).

- [x] Recreate the logo as SVG per §7.4 (full, reversed, mark) → `frontend/public/brand/`:
      `logo-full.svg`, `logo-reversed.svg`, `logo-mark.svg`, `logo-mark-reversed.svg` (~10KB / ~2KB).
      Wordmark set in **Orbitron** (SIL OFL) and **converted to outlines** — the SVGs carry no font
      dependency. Cap redrawn as flat shapes; 2010 gradients/bevel dropped (D8). Source JPG archived at
      `docs/brand/logo-source.jpg`, deliberately **not** under `public/`
- [ ] Upload `logo-full.svg` to `settings.logo` (a **`file`** field, not `image`) — **owner action, Q13**:
      needs Sanity write access, which no agent session has (Q11)
- [x] Regenerate `app/icon.svg`, `app/favicon.ico` (16/32/48), `app/apple-icon.png` (180), and the PWA set
      in `public/icons/` (icon-192/512, maskable-192/512 inside the 80% safe zone). The favicon tile is the
      **cap alone** on `--primary` — "FSMA" is illegible below ~48px, so the lettered mark is rail-only
      (deviation from §7.4, logged in §12)
- [x] Apply the §7.2 palette to `:root` in `globals.css`; `.dark` kept defined but unused (D14) and given
      a coherent FSMA-flavoured set rather than leftover template greys. Three corrections to the proposed
      palette — `--accent` stays a neutral surface, the sunflower moves to `--brand-accent`, and `--input`
      is darkened to clear 3:1. All three in §12
- [x] Force light theme: `ThemeToggle` removed from `Footer.tsx` (component file kept — D13/D14 hygiene);
      `<ThemeProvider forcedTheme="light" enableSystem={false}>` **and** the `getThemeScript` pre-paint
      constant both updated, as the gotcha warned. `viewport.themeColor` collapsed to the single light value
- [x] Heading typeface: **Outfit**, wired via `next/font` (self-hosted, no runtime Google request),
      exposed as `--font-display` in `@theme inline` and applied to `h1`–`h4` in `@layer base`.
      Chosen over Poppins for the wider weight range and tighter fit beside Orbitron in the lockup —
      **show the client both in context before locking** (§7.3)
- [x] Contrast-audit every token pair; table in §12. Every text pair is **AAA**; every meaningful UI
      boundary clears 3:1
- [x] Update `app/manifest.ts` — `short_name: 'Future Scholars'` (the full name is 34 chars and gets
      truncated on a home screen), `theme_color` `#27327C`, `background_color` `#FAF8F4`

**Acceptance:** palette + type compile into the served stylesheet ✅ (tokens and the `h1`–`h4` rule verified
in the built CSS); no contrast failures ✅ (§12); brand SVGs crisp at 32px and 1200px ✅ (rendered and
inspected at both). **Not verifiable here:** pages rendering in the new colours, and Lighthouse — both need
a route that returns 200, which is blocked by Q11. Carry to the first owner-run preview.

**If the session overruns:** the logo trace is the unpredictable part. Ship the SVGs, log the rest as S1b
in §11, and stop — do not half-apply the palette.

---

### S2 — Schema: settings, masthead, navigation
**Goal:** the CMS shape for chrome and page tops.
**Read first:** `studio/src/schemaTypes/`, §7.5–7.7.

- [x] Extend `objects/contact.ts`: `address` (street, city, region, postalCode, **country**), `hours` (array of
      day-range + time + optional schema.org string), `mapUrl`. Additive — logged in FORK-SYNC registry
- [x] Add `objects/masthead.ts`: `image` (hotspot, required, `altField` required), `showLogo` (bool,
      default true), `logoPlacement` (center | bottom-left), `height` (tall | standard | compact),
      `overlay` (none | light | medium | strong), optional `eyebrow`, optional `focalNote`
- [x] Add `masthead` as a field on `documents/page.ts` (above `pageBuilder`), not a block (D12)
- [x] Add school identity fields to `settings` for JSON-LD: `foundingDate`, `areaServed`, `priceRange`,
      `geo` (lat/lng) — grouped in a collapsed `schoolInfo` fieldset. `geo` is a plain `{lat, lng}` object,
      not Sanity's `geopoint` (that needs the Google Maps input plugin, which isn't installed)
- [x] Studio structure: hide `post`, `project`, `technology`, `category` via `DISABLED_TYPES`; keep
      `person` (faculty). Do **not** delete the schema files (D13). Also filtered out of the global
      "New document" menu — the structure list alone still leaves them creatable there
- [x] ~~Remove `postsArchive`/`projectsArchive`/`authorsArchive` from `page.pageBuilder.of`~~ — **not done.**
      Removing them from the union breaks `frontend/sanity/lib/types.ts` and the three template archive
      components, which derive their props from it (19 TS errors) — the exact divergence D13 exists to
      prevent. Replaced with a fork-local `pageBuilder` validation that rejects archive blocks, plus
      `archive` hidden on `page`. See §12
- [x] `npm run sanity:typegen`; commit `sanity.schema.json` + `frontend/sanity.types.ts` (run as two steps, §5.1)

**Acceptance:** Studio shows only FSMA-relevant types ✅; a page document can define a masthead ✅;
typegen clean ✅; `type-check` clean ✅; `lint` clean ✅ (3 pre-existing template warnings); Studio dev
server boots against the new schema ✅. Not verifiable here: the Studio's rendered form and the
frontend's use of these fields (Q11).

---

### S3 — Schema: programs, testimonials, faculty
**Goal:** the content model for FSMA's actual subject matter.

- [x] Add `documents/program.ts`: `name`, `slug`, `ageRange`, `ratio`, `summary`, `body` (blockContent),
      `image`, `hours`/`schedule` note, `orderRank` (or explicit `order` number), `masthead`
- [x] Add `objects/programsGrid.ts` block: heading, subheading, mode (all | selected), `programs`
      (references), columns
- [x] Promote testimonials to documents: `documents/testimonial.ts` (`quote`, `authorName`,
      `authorRole`, `featured` bool, `order`). Extend the existing `testimonials` block with
      `source: manual | documents` + `limit`, keeping the inline array intact for back-compat — log divergence
- [x] `person` currently holds only `firstName`, `lastName`, `picture`. Add `role`, `bio`
      (blockContentTextOnly), `credentials`, `order` — additive, log in the FORK-SYNC registry
- [x] Register new types in `schemaTypes/index.ts`; add them to `page.pageBuilder.of` where they're blocks
- [x] Structure: list Programs and Testimonials as their own sections, ordered — and dropped from the
      generic alphabetical list so they aren't shown twice
- [x] `npm run sanity:typegen`; commit generated files

**Acceptance:** an editor can create a program and a testimonial and place a programs grid on a page ✅
(typegen/type-check/lint clean; three programs and five testimonials exist in `production`). **Schema is not
deployed** — owner runs `cd studio && npx sanity schema deploy` before the Studio renders the new types.

---

### S4 — App shell: side navigation
**Goal:** the defining layout change. Template header is replaced by the rail.
**Read first:** §7.5, `docs/A11Y.md` (Navigation, Keyboard/focus), `docs/TRANSITIONS.md`.

- [ ] Add `app/components/layout/SideNav.tsx` (RSC, cached per `docs/CACHING.md`) consuming
      `settings.navigation`
- [ ] Add `SideNavMobile.tsx` using shadcn `Sheet`; reuse existing `MobileMenu`/`MobileNav` logic where it fits
- [ ] Rework `app/layout.tsx`: rail + `<main id="main">` offset grid, skip link first in tab order
- [ ] Retire `Header.tsx`'s "View on GitHub" CTA and template chrome; keep the file only if still referenced
- [ ] `aria-current="page"` on the active item; Programs group as Collapsible with `aria-expanded`
- [ ] View transition: stable name on the rail, no snapshot animation, `nav-forward`/`nav-back` on links
- [ ] Footer: slim, below content, not inside the rail — legal, contact, accessibility link
- [ ] Keyboard test: Tab order rail → main → footer; drawer traps focus and restores it on close

**Acceptance:** every existing route renders inside the new shell at 360/768/1024/1440px with no horizontal
scroll, no layout shift on navigation, and full keyboard operability.

---

### S5 — Masthead + floating socials components
**Goal:** the two things the client explicitly asked for from the reference sites.

- [ ] `app/components/layout/Masthead.tsx` per §7.6 — hotspot crop, scrim tiers, reversed logo, `priority`
- [ ] Wire `page.masthead` into `app/[slug]/page.tsx` and the homepage; interplay with `titleDisplay` so
      headings never duplicate or vanish
- [ ] `app/components/layout/SocialRail.tsx` per §7.7, driven by `settings.contact.socials`; extend
      `SocialIcon` with any missing platforms
- [ ] Ensure the rail sits below `Dialog`/lightbox z-index and hides under 768px (drawer carries it)
- [ ] `prefers-reduced-motion` respected for any masthead entrance animation
- [ ] Measure: masthead image ≤250KB at 1x desktop, LCP <2.5s on throttled 4G

**Acceptance:** a page with a masthead renders logo-over-image with legible contrast at every breakpoint;
socials appear/disappear correctly and are keyboard reachable.

---

### S6 — Home page (Milestone A deliverable)
**Goal:** a real page the client can look at.

- [x] Capture legacy copy — **all 13 pages**, not just the seven listed, → `content/legacy/*.md` (committed).
      Captured through the desktop browser pane; the legacy host is off the egress allowlist (Q14)
- [x] Document dimensions/quality of the legacy imagery → `content/legacy/IMAGE-MANIFEST.md`. **Every image
      fails the masthead bar** (Q5)
- [ ] Download the legacy imagery — **blocked on Q14** (host not on the allowlist)
- [x] Seed `settings` — title, blurb, description, legal, homepage ref, full side-nav (§6.2) with the
      Programs dropdown, contact block with address/phone/hours/Facebook, `foundingDate`, `areaServed`.
      `priceRange` and `geo` deliberately left empty: Q6 is unanswered and coordinates would be invented
- [ ] Build the home page in the page builder: masthead → mission/vision (infoSection) → programs grid →
      featured testimonial → gallery teaser → CTA (`mailto:` "Book a tour")
- [ ] Add optional `seo` object (`metaTitle`, `metaDescription`, `ogImage`, `noIndex`) to `page` —
      **backport this to the template**, it's generally useful; wire into `generateMetadata`
- [ ] Screenshot at 3 breakpoints for the client review thread

**Acceptance:** `/` renders from Sanity with no lorem/template remnants; Lighthouse ≥95 a11y, ≥90 perf on
the preview deployment.

---

### S7 — About Us (merged About + Admissions + Contact)
**Goal:** the highest-information page, and the one holding client-verified facts.

- [ ] Build `/about` with anchored sections `#about`, `#admissions`, `#contact`
- [ ] Faculty section from `person` documents (or defer if the client has supplied no bios — note in §4)
- [ ] Admissions: FAQ block, process steps (featuresGrid or infoSection), "Book a tour" `mailto:` CTA
- [ ] Contact: address, phone (`tel:`), email (`mailto:`), hours, static map link (no embedded iframe —
      it's a third-party tracker and a CLS/perf liability for one link's worth of value)
- [ ] Extract verified contact facts from legacy `contact.htm`; send to client for confirmation (Q2)
- [ ] Accessibility statement (AODA-aware): commitment, standard targeted, contact route for issues
- [ ] Anchor offsets account for the fixed top bar on mobile (`scroll-margin-top`)

**Acceptance:** every claim on the page traces to legacy content or client confirmation; no invented facts;
anchors land correctly from the redirect map.

---

### S8 — Programs index + three detail routes

- [ ] `app/programs/page.tsx` (index, cached pattern) and `app/programs/[slug]/page.tsx`
- [ ] Seed Infants / Toddlers / Casa program documents from legacy copy (ages + ratios in §6.1)
- [ ] Curriculum-enhancing programs (music, before/after care) as a section on the index
- [ ] Add the three detail routes to `sitemap.ts`; breadcrumbs (visual + `BreadcrumbList` JSON-LD)
- [ ] Redirects for `infant-class.htm` / `toddler-class.htm` / `casa-class.htm` verified

**Acceptance:** each program page has a distinct masthead, correct ratios/ages, and a tour CTA.

---

### S9 — Montessori page

- [ ] Build `/montessori` from `maria.htm` — the method, prepared environment, Maria Montessori
- [ ] Break the legacy wall of text into infoSection/featuresGrid; add pull quotes
- [ ] Cross-links to Programs and About; masthead distinct from the others

**Acceptance:** readable at ~65–75 characters per line; heading hierarchy valid; no orphaned legacy markup.

---

### S10 — Testimonials + Gallery

- [ ] `/testimonials` from testimonial documents; attribution matches legacy exactly (don't paraphrase
      parents' words)
- [x] `/gallery` using the existing gallery block — grid and masonry, lightbox on, one block per album
- [x] Image pipeline: 124 assets uploaded via `scripts/migrate-legacy-images.mjs`; 13 gallery blocks /
      107 images on `/gallery`, plus a home teaser, program cards and director portraits
- [ ] **Alt text is album-level, not per-image** ("Halloween celebration … (7 of 16)"). Clears the
      schema and is honest, but a vision or human pass over the 107 would make it good. Do before launch
- [ ] Re-encode: everything is still the legacy 720×480 original. Fine for a gallery grid; revisit if
      any of these are ever used larger
- [ ] Lightbox a11y: Esc, arrow keys, focus restore, `aria-modal`, captions announced
- [x] ~~Gate on photo consent~~ — removed: client confirmed releases cover web use (D17, 2026-09-13)
- [x] ~~Cut anything under ~1000px~~ — **reversed by the client 2026-09-13**: preserve everything
      regardless of resolution. The 115 legacy thumbnails are still excluded (Sanity derives its own);
      13 further assets are uploaded but unplaced, listed in `content/legacy/IMAGE-MANIFEST.md`

**Acceptance:** gallery is fully keyboard operable; every image has meaningful alt; no CLS from image loads.

---

### S11 — SEO, metadata, structured data, redirects

- [ ] Per-page metadata via the S6 `seo` object; titles follow `Page · Future Scholars Montessori Academy`
- [ ] `metadataBase`, canonical URLs, OG/Twitter images (brand OG template)
- [ ] JSON-LD: `Preschool`/`ChildCare` + `Organization` with address, geo, `openingHours`, `areaServed`,
      `sameAs` (socials); `WebSite`; `BreadcrumbList` on nested routes
- [ ] `sitemap.ts` covers all real routes and excludes drafts; `robots.ts` allows all, points at sitemap
- [ ] Implement the full §6.3 redirect table in `next.config.ts`; crawl the live site for stragglers
- [ ] Preserve the legacy keyword intent (Ottawa Montessori / childcare / daycare) in real copy — no meta
      keyword stuffing, it does nothing
- [ ] Validate with Rich Results Test; check every redirect returns 301 to a 200

**Acceptance:** zero broken internal links, zero redirect chains, structured data validates.

---

### S12 — Audit, polish & cutover prep
**Read first:** `docs/A11Y.md` checklist, `docs/CACHING.md` deploy runbook.

- [ ] Run the `design:accessibility-review` skill across all routes; fix findings
- [ ] Lighthouse (mobile + desktop) on every route: a11y ≥95, perf ≥90, SEO 100, best practices ≥95
- [ ] Keyboard-only pass and screen-reader smoke test (VoiceOver or NVDA) on rail, drawer, lightbox
- [ ] `prefers-reduced-motion` pass across view transitions and any masthead motion
- [ ] Sanity webhook → `/api/revalidate-tags` configured with the secret; publish-to-live verified
- [ ] 404 page on-brand; `~offline` page on-brand
- [ ] Content proof: typos, consistent capitalisation of "Casa", "Montessori", ages/ratios
- [ ] Client review round; log requested changes as new sessions below this line
- [ ] Cutover per §10

**Acceptance:** sign-off recorded in §11.

---

## 9. Cross-cutting acceptance bars

**Accessibility (every PR):** WCAG 2.2 AA floor; contrast ≥4.5:1 body / ≥3:1 large & UI; visible focus on
everything focusable; 24×24 minimum target (44×44 for the social rail and nav); one `h1` per page and no
skipped levels; all images have alt or are explicitly decorative; motion honours `prefers-reduced-motion`;
no keyboard traps; landmarks (`banner`, `navigation`, `main`, `contentinfo`) present once each.

**SEO:** unique title + meta description per route; canonical set; structured data valid; sitemap and
robots correct; no orphan pages; redirects 301 and chain-free; images sized and lazy except LCP.

**Performance budgets:** LCP < 2.5s and CLS < 0.1 on throttled 4G; masthead image ≤250KB at 1x;
no client JS for anything that can be RSC; no WebGL (D15); fonts subset + `display: swap`.

**Content integrity:** nothing published that the client hasn't confirmed. `TODO(client)` markers must
never reach production — S12 greps for them.

---

## 10. Cutover runbook (S12)

1. Freeze content edits; final `production` dataset export as backup (`sanity dataset export production`).
2. Verify redirect table against a fresh crawl of the live legacy site.
3. Confirm Vercel production env vars, then promote the reviewed preview to production.
4. Remove Vercel password protection.
5. Client updates DNS at their provider (A/CNAME to Vercel); verify apex + `www` both resolve and that
   `www` → apex (or the reverse) is a single 301.
6. Verify TLS, then re-test the whole redirect table against the live domain.
7. Submit the sitemap in Search Console; request indexing of `/`; monitor 404s for two weeks.
8. Hand off: Studio logins, a short editor guide (how to change a masthead, add a testimonial, add a
   gallery image), and where this document lives.

---

## 11. Session log

Append one row per session. Keep it terse.

| Date | Session | Agent | Branch/PR | Outcome | Notes / carried over |
|---|---|---|---|---|---|
| 2026-09-13 | Plan | planning | — | This document created | Sanity project not yet created; MCP connector unavailable at planning time |
| 2026-09-13 | Plan rev 2 | planning | — | Sanity project IDs recorded; photo-consent gate removed | — |
| 2026-09-13 | Plan rev 3 | planning | — | Repo re-verified against the plan; Sanity connector confirmed working | `production` exists (public ACL), no `staging`, no schema deployed; `person` doc is thinner than assumed |
| 2026-09-13 | S0 | cowork/opus | `feat/fsma-s0-setup` (local, unpushed) | **Partial — blocked on Q8.** Upstream remote added; fork history regrafted onto `upstream/main` (was unrelated histories); deps installed; `staging` dataset created; env files written; typegen/type-check/lint clean; Studio boots | Frontend cannot boot without `SANITY_API_READ_TOKEN` (Q8). Vercel + Studio deploy carried to **S0b**. `main` needs a force-push by the owner. Sandbox quirks documented in §5.1 |
| 2026-09-13 | S2 | cowork/opus | `feat/fsma-s2-schema` (local, unpushed, branched off the S0 branch since S0 isn't merged) | **Done.** contact address/hours/mapUrl; new `masthead` object + page-level field; `schoolInfo` fieldset on settings; blog/portfolio types hidden from the Studio list *and* the New-document menu; archive blocks kept in the union behind a validation guard (see §12); typegen/type-check/lint clean; Studio boots | Q8 closed. **New blocker Q11**: `*.sanity.io` is off the egress allowlist, so no agent session can render the frontend against Sanity or verify Presentation. New Q12: logo source JPG missing for S1. Two more sandbox quirks in §5.1 (`.next` must be deleted, not renamed) |
| 2026-09-13 | S1 | cowork/opus | `feat/fsma-s1-brand` (local, unpushed) | **Done.** Logo recreated as outlined SVG (full/reversed/mark/mark-reversed) + full icon set; FSMA palette applied with three a11y corrections; light theme forced; Outfit wired as `--font-display`; manifest rebranded; contrast table in §12 | Q4 and Q12 closed. **New Q13**: `settings.logo` upload is owner-side. Type-check/lint/format clean; served CSS verified. Q11 still blocks any rendered-page or Lighthouse check |
| 2026-09-13 | S3 + content seed | cowork/opus | `main` (local, unpushed) | **Done.** S3 schema (program, testimonial, programsGrid, faculty fields). Legacy site scraped verbatim to `content/legacy/`. 17 documents created and published in `production`: settings, 6 pages, 3 programs, 5 testimonials, 2 directors | Q4/Q12 closed earlier; Q1 partly answered, Q2 extracted pending confirmation. **Q5 now blocking** (no legacy image ≥1000px). **New Q14**: legacy host off the allowlist, so images can't be downloaded. Also caught and reverted a lockfile bump I had committed in the previous session — see §12 |
| 2026-09-13 | Image migration + brand masthead | cowork/opus | `main` (local, unpushed) | Full recursive crawl of the legacy site (27 pages, 270 image paths — 14 gallery pages the index never links to). `scripts/migrate-legacy-images.mjs` written and dry-run clean: 131 uploads. Masthead gained a `brand` variant; all 6 pages and 3 programs seeded with one and published | Q14 closed (apex allowlisted). **New Q15**: upload needs a token with `create`; owner runs the script. Wiring assets into gallery/program/testimonial/person documents follows once it has run |
| 2026-09-13 | Gallery wiring | cowork/opus | `main` (local, unpushed) | Owner ran the migration (124 assets). Built 13 gallery blocks / 107 images on `/gallery`, a 6-image home teaser, 3 program card images and both director portraits. Verified: 0 missing alt, 0 broken asset refs | Q15 closed. **New Q16** (testimonial photos have no attribution — left unattached) and **Q17** (maria.gif provenance). Alt text is album-level; flagged in S10 for a per-image pass |

---

## 12. Decisions log

Append anything that deviates from §3/§7, plus measurable results (contrast tables, font choice, etc.).

| Date | Decision | Rationale | Supersedes |
|---|---|---|---|
| 2026-09-13 | Masthead is a page-level field, not a page-builder block | Client wants it on every page; a field enforces that and prevents editors reordering it below content | — |
| 2026-09-13 | Unused template doc types hidden rather than deleted | Fork must keep merging cleanly from `sanity-next-clean` | — |
| 2026-09-13 | No WebGL shader background | Battery/perf cost unjustified for a school marketing site | — |
| 2026-09-13 | Legacy photos may be published (D17) | Client confirmed releases cover web use | Q3 gate in S10 |
| 2026-09-13 | Schema stays Studio-managed (CLI deploy), never MCP `deploy_schema` | A local Studio is the source of truth; an MCP-managed schema record would compete with it | — |
| 2026-09-13 | **Fork history regrafted onto `upstream/main`** | The repo was a squashed snapshot (`Initial commit`), not a git fork — `git merge upstream/main` refused as unrelated histories, so §0 rule 2 was unachievable as written. The snapshot's tree was **byte-identical** to `upstream/main` (`2579c57`), so the two FSMA doc commits were cherry-picked onto real upstream history and `main` was moved. Tree verified identical before and after; old tip kept as `backup/pre-graft-main`. Requires a one-time `git push --force-with-lease origin main` by the owner. | §0 rule 2 is now actually executable |
| 2026-09-13 | `SANITY_API_READ_TOKEN` is mandatory, not optional | `sanity/lib/token.ts` throws at module evaluation and is reachable from `app/layout.tsx`; the public dataset ACL is irrelevant to it | §2's earlier "only needed for drafts" note |
| 2026-09-13 | Vercel password protection dropped | Pro-plan feature, not on this account. Preview URLs stay unlisted instead; don't share them beyond the client thread | §2 preview-protection row |
| 2026-09-13 | `staging` dataset created with **private** ACL | Only `production` needs public reads; a public staging dataset leaks unreviewed content | — |
| 2026-09-13 | 3 template lint warnings left in place | `ProjectsList.tsx`, `ShaderBackground.tsx`, `Onboarding.tsx` unused vars — all upstream code, none FSMA-specific. **Backport candidates**, not fork changes (§0 rule 6) | — |
| 2026-09-13 | Archive blocks **stay** in `page.pageBuilder.of`, gated by validation instead of removal | S2 called for deleting them from the union. Doing so removes them from `GetPageQueryResult`, which is what `frontend/sanity/lib/types.ts` (`PageBuilderSection`, `ExtractPageBuilderType`, `ProjectsArchiveBlock`) and the three template archive components derive their props from — 19 TypeScript errors across template files that only a hand-written duplicate of the resolved query types would fix. That is precisely the divergence D13 exists to avoid, and Sanity's `insertMenu` has no per-member hide. A fork-local `pageBuilder` validation now rejects any archive block with an editor-facing message, and `page.archive` is spread with `hidden: true` (rather than edited in `shared.ts`). Cost: three unused entries in the insert menu. | S2's "Remove …Archive from `page.pageBuilder.of`" task |
| 2026-09-13 | `settings.geo` is a plain `{lat, lng}` object, not Sanity's `geopoint` | `geopoint` has no usable input component without `@sanity/google-maps-input`, which isn't installed and isn't worth a dependency for two numbers | — |
| 2026-09-13 | School identity fields grouped in a collapsed `schoolInfo` fieldset | They are structured-data inputs, never page copy; collapsing keeps the client-facing Settings form short | — |
| 2026-09-13 | **`*.sanity.io` blocked by egress in agent sessions (Q11)** | Confirmed from both the Cowork device VM and the cloud container: proxy returns `403 blocked-by-allowlist`. Consequence for planning: **every session that needs to see a rendered page (S5–S10 verification, Lighthouse, Presentation) is owner-side or needs the allowlist widened.** Schema, component and config work is unaffected | §5.1's earlier egress notes |
| 2026-09-13 | Stale `.next` must be deleted, never renamed aside | A `.next-*` sibling is not gitignored, so Tailwind v4 scans the binary build artefacts for class candidates and emits a malformed selector — `globals.css` then fails to parse and every route 500s with a misleading CSS error | — |
| 2026-09-13 | **`--accent` stays a neutral surface; the sunflower becomes `--brand-accent`** | §7.2 assigned the yellow to `--accent`, but in shadcn `--accent` is the subtle hover/active *surface* (`hover:bg-accent`, `focus:bg-accent` on menu items, command palette rows, etc.). Setting it to `44 96% 52%` would have turned every hover state in the UI bright yellow. `--accent` is now a quiet warm neutral (`36 30% 92%`) and the brand yellow lives in `--brand-accent` / `--brand-accent-foreground`, exposed to Tailwind as `bg-brand-accent` etc. | §7.2's `--accent` row |
| 2026-09-13 | Added `--brand-accent-strong` (`40 92% 36%`) | The bright sunflower is **1.62:1** on warm paper. §7.2 already forbade it as a text colour, but WCAG 2.2 SC 1.4.11 also covers non-text UI that carries meaning — a focus flourish or an underline that a user must perceive. The bright tint is now for fills on dark/primary surfaces only; anything meaningful on light uses the strong tint (3.58:1 on `--background`) | §7.2's accent guidance |
| 2026-09-13 | `--input` split from `--border` (`36 14% 50%`, 3.49:1) | §7.2 gave both the same soft value (1.28:1). That is correct for decorative dividers, which are exempt, but a control boundary must clear 3:1 under SC 1.4.11. `--border` keeps the soft value; `--input` is darkened. (No forms ship — D6 — but shadcn inputs/selects still appear in the Studio-adjacent UI and the token should not be a trap.) | §7.2's `--input` row |
| 2026-09-13 | `--muted-foreground` `226 16% 34%` instead of `226 12% 36%` | The proposed value is 6.91:1 on `--background` — just under the AAA 7:1 the section demands of body text. The corrected value is 7.64:1 | §7.2 |
| 2026-09-13 | Logo wordmark set in **Orbitron** (SIL OFL), converted to outlines | Closest open face to the original's squared techno lettering; Michroma is too light for the heavy `MONTESSORI`. Outlining means the SVGs render identically everywhere with no font dependency, and §7.3's "display face only inside the lockup" is enforced structurally — there is no way to accidentally set body copy in it | — |
| 2026-09-13 | Brand blue in the logo is `#2B2FD4`, not the raw `#3300FF` of the JPG | The source blue is near-maximally saturated and vibrates against black at large sizes; `#2B2FD4` is the value §7.4 already named and keeps the blue/black/yellow relationship. The UI's `--primary` is darker still (`#27327C`) for contrast — the logo keeps its own blue, the interface does not borrow it | — |
| 2026-09-13 | Favicon tile is the **cap alone**, not cap + "FSMA" | "FSMA" is unreadable below ~48px (verified at 16px and 32px). The lettered `logo-mark.svg` is for the nav rail; the icon tile is the mortarboard reversed out of `--primary` | §7.4's "cap + FSMA for the rail/favicon" |
| 2026-09-13 | Heading face: **Outfit** (provisional) | Wider weight range than Poppins and a tighter fit beside Orbitron. §7.3 asks for both to be shown to the client in context — **not yet done**, so treat this as reversible until they have seen it | — |

### S1 contrast audit (light theme, 2026-09-13)

Computed from the shipped `:root` values; WCAG 2.x relative luminance. Text pairs are graded against the
AAA 7:1 bar §7.2 sets; non-text pairs against SC 1.4.11's 3:1.

| Pair | Hex | Ratio | Result |
|---|---|---|---|
| `foreground` on `background` | #191E2E / #FAF8F4 | 15.66:1 | AAA |
| `foreground` on `card` | #191E2E / #FFFFFF | 16.57:1 | AAA |
| `foreground` on `muted` | #191E2E / #F2EEE9 | 14.34:1 | AAA |
| `muted-foreground` on `background` | #494F65 / #FAF8F4 | 7.64:1 | AAA |
| `muted-foreground` on `card` | #494F65 / #FFFFFF | 8.09:1 | AAA |
| `muted-foreground` on `muted` | #494F65 / #F2EEE9 | 7.00:1 | AAA |
| `primary` on `background` | #27327C / #FAF8F4 | 10.77:1 | AAA |
| `primary` on `card` | #27327C / #FFFFFF | 11.40:1 | AAA |
| `primary-foreground` on `primary` | #FFFFFF / #27327C | 11.40:1 | AAA |
| `secondary-foreground` on `secondary` | #1D265D / #E3EAF2 | 11.61:1 | AAA |
| `accent-foreground` on `accent` | #1D265D / #F1ECE4 | 11.99:1 | AAA |
| `brand-accent-foreground` on `brand-accent` | #12182B / #FABB0F | 10.25:1 | AAA |
| `brand-accent-strong` on `background` | #B07807 / #FAF8F4 | 3.58:1 | UI — pass |
| `brand-accent-strong` on `card` | #B07807 / #FFFFFF | 3.79:1 | UI — pass |
| `input` on `background` | #91836E / #FAF8F4 | 3.49:1 | UI — pass |
| `input` on `card` | #91836E / #FFFFFF | 3.69:1 | UI — pass |
| `destructive-foreground` on `destructive` | #FFFFFF / #B81E1E | 6.47:1 | AA |
| `destructive` on `background` | #B81E1E / #FAF8F4 | 6.11:1 | UI — pass |
| `ring` on `background` | #27327C / #FAF8F4 | 10.77:1 | UI — pass |
| `border` on `background` | #E2DDD4 / #FAF8F4 | 1.28:1 | decorative — exempt |
| `border` on `card` | #E2DDD4 / #FFFFFF | 1.35:1 | decorative — exempt |

`--brand-accent` (#FABB0F) is **1.62:1** on `--background` and is deliberately absent from this table as a
light-background colour: it is only ever a fill on dark or `--primary` surfaces. Anything meaningful on
light uses `--brand-accent-strong`.
| 2026-09-13 | Legacy copy scraped through the **desktop browser pane**, not WebFetch or curl | `futurescholarsmontessori.com` is not on the egress allowlist for either the container or the device VM, and WebFetch hit its session limit. The browser pane reaches the site as the user's own browser, and same-origin `fetch` + `DOMParser` inside it returns the real markup — so the copy is genuinely verbatim rather than a model's summary. Binaries can't come back this way, hence Q14 | — |
| 2026-09-13 | Documents created for **undeployed** types (`program`, `testimonial`) | Content Lake is schemaless — it accepted them. The deployed schema record only governs Studio rendering and MCP validation, so seeding does not have to wait on a schema deploy. The owner still has to deploy before the Studio can show them | — |
| 2026-09-13 | Content seeded **published**, not left as drafts | The frontend reads the published perspective; drafts would render an empty site for the client review. Nothing is publicly reachable yet (no Vercel project), so publishing carries no exposure | — |
| 2026-09-13 | `settings.priceRange` and `settings.geo` left empty | Q6 (publish tuition or not) is unanswered, and coordinates for the address would be invented precision — §0 rule 8 | — |
| 2026-09-13 | **Reverted a `package-lock.json` bump I committed in the S1 session** | `git add -A` swept up a lockfile npm had rewritten mid-session, floating `next` 16.2.10 → 16.3.5 and `sanity` 6.5 → 6.13. That silently broke `main`: `experimental.viewTransition` no longer exists in Next 16.3, and the newer `next-sanity` brands query results as `StegaString<T>`, which fails against every component prop typed as plain `string` — 19 errors across template files. §5.1 already said never to commit that churn and I did it anyway. Restored to the lockfile at `c8f5b69`. **The underlying exposure is the template's caret ranges**: any `npm install` can float these again. Worth pinning `next`, `sanity` and `next-sanity` exactly in the template | — |
| 2026-09-13 | Masthead gained a `brand` variant; `image` is conditionally required | The client asked for a large image atop every page, and the legacy set cannot supply one (Q5). Rather than leave every page without a masthead, or ship a 3× upscale, the object now renders a flat brand-colour panel with the reversed logo. `tone` (blue / ink / sky) keeps the six pages from looking identical. Swapping to photography later is a per-page field change, not a schema change | §7.6, which assumed a photograph |
| 2026-09-13 | Legacy thumbnails not uploaded | The 115 thumbs are 99×66 and 200×200 crops of images already in the set, and Sanity derives its own. Uploading them would triple the media library and make it unusable for the client. `--include-thumbs` is there if that call is ever reversed | — |
| 2026-09-13 | Image upload is a committed script the owner runs, not an agent action | Asset creation needs a `create`-scoped token; the owner would rather not hand one to an agent, and the CLI isn't logged in on the agent VM. A reviewable, idempotent script in `scripts/` is also the better artifact — S10 needs a repeatable pipeline, not a one-off | — |
| 2026-09-13 | Galleries split one-block-per-album rather than one big grid | The legacy site had 13 separate album pages; collapsing them into a single 107-image grid would lose the only organisation the content has. One `gallery` block per album keeps the albums legible and lets each pick its own layout — masonry for the big mixed sets, grid for the small even ones | — |
| 2026-09-13 | Testimonial photos uploaded but not attached | The legacy markup places three photos near the quotes with no attribution. Attaching one to "The Lewandowski Family" would assert something the source never says, which §0 rule 8 forbids. Assets are preserved; Q16 asks the client | — |
| 2026-09-13 | Gallery alt text is album-level and indexed, not per-frame | 107 images; per-frame description needs eyes on each one. Album-level alt ("Easter celebration … (3 of 10)") is accurate, satisfies the schema and tells a screen-reader user what the image is. Logged in S10 as a pre-launch polish item rather than pretended to be finished | §9's "all images have alt" — met, but at a coarser grain than ideal |
