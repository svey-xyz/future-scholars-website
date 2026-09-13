# FSMA Build Plan — Future Scholars Montessori Academy

**Status:** Not started · **Last updated:** 2026-09-13 (rev 3) · **Owner:** Hayden Soule (svey)
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
| Upstream template | `sanity-next-clean` — add as `upstream` remote | ⬜ verify in S0 |
| Sanity project | **FSMA** — project ID `wzs9gcps`, org `oqjnHYtnD` | ✅ created |
| Sanity datasets | `production` ✅ (ACL: public) · `staging` — create in S0 | 🟡 |
| Studio hosting | separate, `sanity deploy` → `SANITY_STUDIO_STUDIO_HOST` (studio is **not** mounted at `/studio` in this template) | ⬜ |
| Frontend hosting | Vercel, project linked to the repo | ⬜ S0 |
| Domain | `futurescholarsmontessori.com` — client's existing DNS provider, CNAME/A updated at cutover | ⬜ S12 |
| Preview protection | Vercel password protection on preview until client sign-off | ⬜ S0 |

**Environment variables** (frontend `.env.local`, mirrored into Vercel for Preview + Production):

```
NEXT_PUBLIC_SANITY_PROJECT_ID=wzs9gcps
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-09-25
NEXT_PUBLIC_SANITY_STUDIO_URL=https://<studio-host>.sanity.studio
SANITY_API_READ_TOKEN=            # viewer token, draft mode + presentation
SANITY_REVALIDATE_TAGS_SECRET=    # webhook secret, see docs/CACHING.md
```

Studio `.env` (`studio/.env.local`): `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`,
`SANITY_STUDIO_PREVIEW_URL`, `SANITY_STUDIO_STUDIO_HOST`.

**Sanity state, verified 2026-09-13:** `production` exists (ACL `public` — a read token is therefore only
needed for drafts/Presentation, not for published reads). `staging` not yet created. **No schema deployed
yet.** The Studio in `studio/` is the only source of schema: deploy with `npx sanity@latest schema deploy`
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
| Q1 | Social accounts: which platforms, and the exact URLs? Floating social rail needs real targets. | Client | **TBD** — build the rail data-driven off `settings.contact.socials`; renders nothing if empty |
| Q2 | Confirmed street address, phone, general email, office hours (needed for About, `mailto:`/`tel:`, JSON-LD) | Client | **TBD** — pull from legacy `contact.htm` in S7 and send to client to verify |
| Q3 | ~~Photo consent for existing images of children~~ | Client | ✅ **Resolved 2026-09-13** — releases cover web use (D17) |
| Q4 | Vector logo / brand fonts | Client | ❌ none available — recreate per D8 |
| Q5 | New photography — will the client supply a shoot? | Client | TBD |
| Q6 | Tuition/fee information — publish on About/Admissions or "contact us for rates"? | Client | TBD |
| Q7 | Legacy "Recognition From The Mayor" item — keep, and where? | Client | TBD |

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
- **Typegen is mandatory:** schema change → `npm run sanity:typegen` (extracts to `sanity.schema.json`,
  regenerates `frontend/sanity.types.ts`). Both are committed. `predev`/`prebuild` run it.
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

- [ ] Add `upstream` remote for the template; `git fetch upstream`; merge if behind; record result in §11
- [ ] `npm install` at root; confirm `npm run dev` boots frontend + studio
- [x] ~~Create Sanity project~~ — done out of session: **FSMA**, `wzs9gcps`, org `oqjnHYtnD`, `production` dataset exists
- [ ] Create the `staging` dataset (`npx sanity dataset create staging`) — verified absent 2026-09-13
- [ ] Write `frontend/.env.local` and `studio/.env.local` (values in §2 — project ID is known)
- [ ] Create viewer token → `SANITY_API_READ_TOKEN`; generate `SANITY_REVALIDATE_TAGS_SECRET`
- [ ] `npm run sanity:typegen` clean; `npm run type-check` clean
- [ ] Link Vercel project to the repo, set env vars for Preview + Production, enable password protection
- [ ] `sanity deploy` the Studio; set `NEXT_PUBLIC_SANITY_STUDIO_URL` / `SANITY_STUDIO_PREVIEW_URL`
- [ ] Confirm draft mode + Presentation visual editing round-trips
- [ ] Commit this plan doc to `docs/FSMA-BUILD-PLAN.md` if not already committed

**Acceptance:** preview URL renders the template against the FSMA dataset; Studio opens; visual editing works.

---

### S1 — Brand foundation
**Goal:** the visual system exists as code and assets. No page work.
**Read first:** §7, `docs/A11Y.md` (Color & contrast).

- [ ] Recreate the logo as SVG per §7.4 (full, reversed, mark) → `frontend/public/brand/`. The rail and
      masthead read these from `public/`, not from Sanity, so they cost no fetch. `settings.logo` is a
      **`file`** field (not `image`) — upload `logo-full.svg` there for editor-facing use
- [ ] Regenerate `favicon.svg`, `app/icon.svg`, `apple-icon.png`, PWA icons in `public/icons/`
- [ ] Apply the §7.2 palette to `:root` in `globals.css`; keep `.dark` defined but unused (D14)
- [ ] Force light theme: remove `ThemeToggle` from UI, set `<ThemeProvider>` in `app/layout.tsx` to
      forced light (keep the dependency and component file — D13/D14 hygiene). **Gotcha:** the inline
      pre-paint script constant near the top of `layout.tsx` mirrors the provider options — change both or
      the first paint disagrees with the provider.
- [ ] Pick and wire the heading typeface via `next/font`; expose `--font-display`
- [ ] Contrast-audit every token pair; record the table in §12
- [ ] Update `app/manifest.ts` (name, short_name, theme_color, background_color)

**Acceptance:** template pages render in FSMA colours/type with no contrast failures; brand SVGs are crisp
at 32px and 1200px; Lighthouse a11y ≥95.

**If the session overruns:** the logo trace is the unpredictable part. Ship the SVGs, log the rest as S1b
in §11, and stop — do not half-apply the palette.

---

### S2 — Schema: settings, masthead, navigation
**Goal:** the CMS shape for chrome and page tops.
**Read first:** `studio/src/schemaTypes/`, §7.5–7.7.

- [ ] Extend `objects/contact.ts`: `address` (street, city, region, postalCode), `hours` (array of
      day-range + time strings), `mapUrl`. Additive — log in FORK-SYNC registry
- [ ] Add `objects/masthead.ts`: `image` (hotspot, required, `altField` required), `showLogo` (bool,
      default true), `logoPlacement` (center | bottom-left), `height` (tall | standard | compact),
      `overlay` (none | light | medium | strong), optional `eyebrow`, optional `focalNote`
- [ ] Add `masthead` as a field on `documents/page.ts` (above `pageBuilder`), not a block (D12)
- [ ] Add school identity fields to `settings` for JSON-LD: `foundingDate`, `areaServed`, `priceRange`,
      `geo` (lat/lng)
- [ ] Studio structure: hide `post`, `project`, `technology`, `category` via `DISABLED_TYPES`; keep
      `person` (faculty). Do **not** delete the schema files (D13)
- [ ] Remove `postsArchive`/`projectsArchive`/`authorsArchive` from `page.pageBuilder.of` — log divergence
- [ ] `npm run sanity:typegen`; commit `sanity.schema.json` + `frontend/sanity.types.ts`

**Acceptance:** Studio shows only FSMA-relevant types; a page document can define a masthead; typegen clean.

---

### S3 — Schema: programs, testimonials, faculty
**Goal:** the content model for FSMA's actual subject matter.

- [ ] Add `documents/program.ts`: `name`, `slug`, `ageRange`, `ratio`, `summary`, `body` (blockContent),
      `image`, `hours`/`schedule` note, `orderRank` (or explicit `order` number), `masthead`
- [ ] Add `objects/programsGrid.ts` block: heading, subheading, mode (all | selected), `programs`
      (references), columns
- [ ] Promote testimonials to documents: `documents/testimonial.ts` (`quote`, `authorName`,
      `authorRole`, `featured` bool, `order`). Extend the existing `testimonials` block with
      `source: manual | documents` + `limit`, keeping the inline array intact for back-compat — log divergence
- [ ] `person` currently holds only `firstName`, `lastName`, `picture`. Add `role`, `bio`
      (blockContentTextOnly), `credentials`, `order` — additive, log in the FORK-SYNC registry
- [ ] Register new types in `schemaTypes/index.ts`; add them to `page.pageBuilder.of` where they're blocks
- [ ] Structure: list Programs and Testimonials as their own sections, ordered
- [ ] `npm run sanity:typegen`; commit generated files

**Acceptance:** an editor can create a program and a testimonial and place a programs grid on a page.

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

- [ ] Capture legacy copy: fetch `index.html`, `about.htm`, `maria.htm`, `programs.htm`,
      `testamonials.htm`, `contact.htm`, `admissions.htm` → `content/legacy/*.md` (committed, for reference)
- [ ] Download legacy imagery from the old site; document dimensions/quality and flag anything too small
      for masthead use (D17: releases are confirmed, so publishing is fine)
- [ ] Seed script or manual Studio entry: settings (title, blurb, contact TODOs, navigation, homepage ref)
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
- [ ] `/gallery` using the existing gallery block (grid or masonry + lightbox)
- [ ] Image pipeline: re-encode legacy images, upload via Sanity CLI/asset API, write real alt text for
      every image (schema-enforced)
- [ ] Lightbox a11y: Esc, arrow keys, focus restore, `aria-modal`, captions announced
- [x] ~~Gate on photo consent~~ — removed: client confirmed releases cover web use (D17, 2026-09-13)
- [ ] Sort/curate rather than dumping the legacy set — cut anything under ~1000px on the long edge

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
