# FSMA Build Plan — Future Scholars Montessori Academy

**Status:** S0–S9 done; most of S11 done; 404 page built. Next up: S10. · **Updated:** 2026-11-02 (rev 19, client feedback R1 F1–F2) · **Owner:** Hayden Soule (svey)
**Repo:** `github.com/svey-xyz/future-scholars-website` (started from `sanity-next-clean`; no longer synced with it)
**Owner actions and client questions:** `docs/OWNER-TODO.md`

---

## 0. Rules for agents

1. **One session per run.** Finish it, update this doc, commit, stop.
2. **Read before coding:** `AGENTS.md`, then the doc for your area — `docs/A11Y.md` (UI),
   `docs/CACHING.md` (routes/data), `docs/TRANSITIONS.md` (navigation).
   For Next.js APIs, read `node_modules/next/dist/docs/`.
3. **Branch per session:** `feat/fsma-s<N>-<slug>` off `main`. Agents can't push; the owner pushes and
   opens the PR.
4. **Update this doc before finishing:** delete the tasks you completed, add one line to §11, add a
   line to §12 for any decision that differs from this plan, and put new blockers in §4.
5. **Read only what you need.** The schema or component you're editing, plus the section referenced
   in the task.
6. **Never invent client facts.** If an address, phone, hours, URL or name isn't confirmed, leave a
   `TODO(client)` marker and add it to `OWNER-TODO.md`.
7. **Re-check inherited blockers.** Two blockers were carried for four sessions with the wrong
   diagnosis. Re-run the check before working around one.

**Done means:** `npm run type-check` and `npm run lint` pass; `npm run typegen` was run and committed if
the schema changed; Lighthouse a11y ≥95 on the routes you touched; the session's acceptance list is met.

---

## 1. Brief & scope

Montessori school in Ottawa (ages 6 months – 6 years). We're replacing a ~2010 static HTML site
(`futurescholarsmontessori.com`) with a Next.js + Sanity site.

**What the client asked for**
- Pages: Home, Montessori, Programs, Testimonials, Gallery, and About Us. About Us merges the old
  About, Admissions and Contact pages.
- A large image with the logo over it at the top of every page.
- Floating social links.
- Side menu, not a top bar.

**Reference sites:** fieldstonedayschool.org · rotherglen.com · parkdalemontessori.ca

**Out of scope:** forms (use `mailto:`/`tel:` links), French, blog/news/events, calendar, logins,
payments, analytics, cookie banner.

---

## 2. Environments

| Thing | Value |
|---|---|
| Sanity | project `wzs9gcps`, org `oqjnHYtnD`. Datasets: `production` (public), `staging` (private) |
| Studio | deployed separately with `sanity deploy`. It isn't mounted at `/studio` |
| Frontend | Vercel, linked to the repo; env vars set for Preview and Production |
| Domain | the client's DNS; repointed at cutover (§10) |

**Env vars:** as listed in `CLAUDE.md`. Two things to know:
- `SANITY_API_READ_TOKEN` is **required**. `token.ts` throws on import, so every route returns 500
  without it, even for published content.
- Deploy the schema only with the Studio CLI (`cd studio && npx sanity schema deploy`). Never use the
  Sanity MCP `deploy_schema` tool: it creates a second schema record that competes with the Studio's.

---

## 3. Locked decisions

Reopening one of these requires a line in §12.

| # | Decision |
|---|---|
| D1 | Started from the `sanity-next-clean` template. Detached on 2026-09-18: no upstream remote, no sync, no backports. Change anything freely. |
| D2 | Hosted on Vercel; DNS stays with the client. |
| D3 | Every legacy `.htm` URL gets a **301**. Use `statusCode: 301`, because `permanent: true` sends a 308. |
| D4 | Old copy is ported verbatim; the client edits it later in Studio. |
| D5 | Legacy photos are reused for now. The client holds releases for web use. |
| D6 | No forms. Contact is by `mailto:`/`tel:` only. |
| D7 | Static marketing site only. |
| D8 | Logo recreated as outlined SVG (Orbitron wordmark), with full, reversed and mark variants. |
| D9 | Palette is a softened version of the logo colours (§7.2). |
| D10 | WCAG 2.2 AA is the floor; aim for AAA where feasible. |
| D11 | Desktop side rail from 1024px up; below that, a persistent top bar + full-screen menu that drops from under it (hamburger morphs to close). |
| D12 | The masthead is a **page field**, not a page-builder block. When present, it owns the visual `<h1>`. |
| D13 | Template-only features are **deleted**, not hidden: posts, projects, categories, technologies, archive blocks, hero, scores, shader backgrounds, starter/onboarding, built-with footer, the template top-bar nav and the PWA. |
| D14 | Light theme only. No dark tokens, no theme provider, no `dark:` variants. |
| D15 | No WebGL `ShaderBackground`. |
| D16 | Contact data lives only in `settings.contact`. The rail, `contactDetails` block and JSON-LD all read from there. |
| D17 | `/programs` is a CMS `page`. Only `app/programs/[slug]` is coded. |

---

## 4. Open dev questions

Client and owner questions are tracked in `OWNER-TODO.md`.

| # | Question | Status |
|---|---|---|
| Q26 | No canonical origin is set. Needs the apex-vs-`www` decision; then set `settings.ogImage.metadataBase` or `NEXT_PUBLIC_SITE_URL`. `siteOrigin.ts` falls back to the Vercel domain until then. | Owner (OWNER-TODO) |
| Q27 | Title separator: the site uses `\|`, the original spec said `·`. | Owner (OWNER-TODO) |

---

## 5. Project conventions

`CLAUDE.md` covers the architecture. The highlights:

- **Typegen:** `npm run typegen` from the repo root.
- **Tokens** are HSL channel triplets (`--primary: 232 52% 32%`). Don't convert them to OKLCH.
- **Content types:** `page`, `program`, `testimonial`, `person` (staff: `role`, `bio`, `credentials`,
  `order`) and the `settings` singleton (with `schoolInfo`: `foundingDate`, `areaServed`, `priceRange`,
  and `geo` as a plain `{lat, lng}`). Page fields `masthead` and `seo`. Blocks: `callToAction`,
  `infoSection`, `featuresGrid`, `stats` (Key facts), `testimonials`, `programsGrid`, `facultyGrid`,
  `contactDetails`, `gallery`, `faq`, `note`, `pullQuote`.
- **Anchors:** the `anchor` field is rendered as the block wrapper's `id` by `BlockRenderer`, with
  `scroll-mt` so the fixed bar doesn't cover the target.
- **Grid headings:** grid items are `h3` under a block heading and `h2` when the block has no heading.
- **Empty `generateStaticParams`:** return a `__placeholder__` slug. Cache Components fails the build
  on an empty array.
- **Stega:** run CMS strings through `stegaClean` before using them in an `href`.

### 5.1 Agent sandbox quirks

These are environment issues, not repo bugs. Don't change the code to work around them.

- **Node needs the proxy flag.** Prefix every networked Node command with `NODE_USE_ENV_PROXY=1`
  (for example `next dev`, `next build` or a script). Node ignores `HTTPS_PROXY` without it.
- **No SSH and no push.** Commit locally; the owner pushes.
- **Nothing survives a shell call.** Background processes die when the call ends, so start
  `next start` and `curl` against it in the same call.
- **Ask for the delete grant early.** The mounted folder refuses `unlink` without it, which breaks
  `.next` cleanup, `git merge/checkout/reset` and in-place builds.
  - With the grant: run `rm -rf .next`, then use `next dev --webpack` or `next build --webpack` in
    place.
  - Without it: build from a copy, and re-run `rsync` after every edit:
    ```bash
    SRC=$HOME/mnt/future-scholars-website; DST=$HOME/build
    rsync -a --delete --exclude node_modules --exclude .next --exclude .git "$SRC/" "$DST/"
    for d in "" frontend/ studio/; do ln -sfn $SRC/${d}node_modules $DST/${d}node_modules; done
    cp $SRC/frontend/.env.local $DST/frontend/.env.local
    cd $DST/frontend && NODE_USE_ENV_PROXY=1 npx next build --webpack
    ```
  - For git without the grant: stale `.git/*.lock` files can be moved but not deleted. Commits work;
    merges don't, so merge in a `git clone --shared` copy and copy the result back.
- **`.next` must be deleted, never renamed.** Tailwind scans a renamed `.next-*` folder and breaks
  `globals.css`.
- **Linux native packages.** `node_modules` is built for macOS. Install these five with `npm pack`,
  taking each version from the package's own `package.json`:
  `@next/swc-linux-arm64-gnu`, `lightningcss-linux-arm64-gnu`, `@tailwindcss/oxide-linux-arm64-gnu`,
  `@esbuild/linux-arm64`, `@rolldown/binding-linux-arm64-gnu`. Without the last two, the Sanity CLI
  fails with `Class extends value undefined`.
  Command: `npm pack <pkg>@<ver> && tar xzf *.tgz && cp -R package/* node_modules/<pkg>/`
- **Never commit lockfile churn.** The sandbox's npm strips `libc` fields from `package-lock.json`.
  Run `git checkout -- package-lock.json` after any install.
- **Test the exact URL when checking the allowlist.** For example, the bare `fonts.gstatic.com`
  returns 403 while real font paths return 200.
- **No browser binary**, so Lighthouse and screenshots have to be done by the owner.

---

## 6. Information architecture

| Page | Route | Notes |
|---|---|---|
| Home | `/` | |
| Montessori | `/montessori` | from `maria.htm` |
| Programs | `/programs` + `/programs/{infants,toddlers,casa}` | ratios 1:3 / 1:5 / 1:8 |
| Testimonials | `/testimonials` | |
| Gallery | `/gallery` | 13 album blocks, 107 images |
| About Us | `/about` | anchors `#about` `#admissions` `#book-a-tour` `#contact` |

**Rail order:** Home · Montessori · Programs (Infants, Toddlers, Casa) · Testimonials · Gallery · About
Us.

**Redirects** live in `frontend/next.config.ts`: 15 × 301, including `/home` → `/`. Crawl the live
site for any missing URLs right before cutover.

---

## 7. Design direction

**Tone:** warm, bright and calm, but credible to parents choosing a private school. Photography leads;
type is quiet; colour is used sparingly. **Avoid:** the logo's techno face used as UI type, raw blue on
white, walls of text, and identical mastheads.

**7.2 Colour.** Shipped values are in `globals.css`.
- `--brand-accent` (sunflower) is only a fill on dark surfaces. It's 1.62:1 on paper.
- Use `--brand-accent-strong` for anything on a light background that users must see.
- `--accent` is shadcn's neutral hover surface. It is not the brand yellow.

**Contrast audit (light theme):**

| Pair | Ratio |
|---|---|
| foreground / background | 15.66 AAA |
| muted-foreground / background | 7.64 AAA |
| muted-foreground / muted | 7.00 AAA |
| primary / background | 10.77 AAA |
| primary-foreground / primary | 11.40 AAA |
| secondary-foreground / secondary | 11.61 AAA |
| brand-accent-foreground / brand-accent | 10.25 AAA |
| brand-accent-strong / background | 3.58 (UI pass) |
| input / background | 3.49 (UI pass) |
| border / background | 1.28 (decorative, exempt) |

**Room accents (FB5, client feedback R1).** Sampled from the legacy room thumbnails. Base tones are
decorative fills and rules only; `-strong` tones are the only text colours. Measured on `--secondary`
(sky) and `--background` (paper):

| Token | Hex | On sky | On paper | Use |
|---|---|---|---|---|
| `room-roses` | `#bd000d` | 5.46 | 6.27 | rules/fills |
| `room-roses-strong` | `#910811` | 7.67 AAA | 8.81 AAA | text |
| `room-shamrock` | `#55ba0d` | 2.05 | 2.36 | rules/fills only, **never text or icons** |
| `room-shamrock-strong` | `#22500b` | 7.74 AAA | 8.89 AAA | text |
| `room-violet` | `#2222d8` | 7.55 | 8.68 | rules/fills |
| `room-violet-strong` | `#1d1da5` | 9.75 AAA | 11.21 AAA | text |

Roses = Infants, Shamrock = Toddlers, Violet = Casa (`program.accent`). The colour repeats on the
program banner (6px bottom rule + eyebrow), the "At a glance" card and the programs grid cards (4px top
rule). It is decorative: the room name is always in text (1.4.1).

**7.3 Type.** Body is Inter; headings are **Outfit** (provisional until the client sees it next to
Poppins). Orbitron appears only inside the logo, as outlines.

**7.4 Logo.** SVGs live in `frontend/public/brand/`; the source JPG is in `docs/brand/`. It must never
ship. The cap is black (`#191E2E`) on every variant (FB3); on the reversed art it carries a white
keyline drawn as one silhouette around board + skull, so dark grounds (including the ink panel) never
swallow it. The favicon is the cap alone on `--primary`, because "FSMA" is illegible below about 48px.

**7.6 Masthead.** Two variants:
- `image`: a 1600×600 hotspot crop from the CDN, loaded eagerly with `fetchPriority="high"`, with
  scrim tiers light, medium and strong.
- `brand`: a flat panel in one of three tones. The light `secondary` tone takes the standard logo; the
  dark tones take the reversed logo.

Heights are tall, standard or compact. Give each page a different combination. Home, About, Montessori
and Programs currently use Unsplash placeholders; Gallery and Testimonials use brand panels.
Image combos in use: Home tall/bottom-centre/large logo, Montessori tall/bottom-left, About
standard/centre/strong, Programs standard/bottom-left. Program pages use the `secondary` brand panel
with a room-accent rule (FB5). Heights are **minimums**: the box grows rather than clipping the copy.
Logo placement is `center` | `bottomLeft` | `bottomCenter`; `logoSize` is `standard` | `large`.

**7.7 ContactHub.** One component, fed by `settings.contact`:
- From `lg` up: floating pills on the right edge.
- Below `lg`: stacked inside the drawer.
- Targets are 44px. On hover or focus, the label expands and the pill fills with `brand-accent`.

---

## 8. Remaining work

### Carried from earlier sessions (owner-side unless noted)
- [ ] Mobile drawer keyboard check: focus stays inside, Esc closes, focus returns to the trigger.
- [ ] Draft mode and Presentation round-trip, including a program page.
- [ ] Masthead image ≤250KB at 1x and LCP <2.5s on throttled 4G. Measure once real photography
      replaces the placeholders.

### S10 — Testimonials + Gallery
- [ ] `/testimonials` from testimonial documents. Attribution must match the legacy site exactly.
- [ ] Per-image alt text for the 107 gallery images; alt text is currently per album.
- [ ] Re-encode images only if any are ever shown larger than 720×480.

**Acceptance:** the gallery is keyboard-operable, alt text is meaningful, and images cause no CLS.

### S11 — SEO leftovers
- [ ] Brand OG image template; upload `settings.ogImage`.
- [ ] Use the legacy keyword intent (Ottawa Montessori / childcare / daycare) in real copy, with no
      keyword stuffing.
- [ ] Rich Results Test on the public URL.
- [ ] Crawl the live legacy site for missing URLs before cutover.

### S12 — Audit, polish, cutover
- [ ] Run `design:accessibility-review` on every route and fix the findings.
- [ ] Lighthouse on mobile and desktop for every route: a11y ≥95, perf ≥90, SEO 100, best practices
      ≥95.
- [ ] Keyboard and screen-reader pass on the rail, drawer and lightbox; reduced-motion pass.
- [ ] Sanity webhook → `/api/revalidate-tags` using the secret; confirm publishing reaches the live
      site.
- [ ] Content proof (spelling, "Casa"/"Montessori" capitalisation, ages and ratios). Grep for
      `TODO(client)`; none can ship.
- [ ] Client review round, then cutover (§10).

---

## 9. Acceptance bars (every PR)

**A11y:**
- WCAG 2.2 AA minimum; text ≥4.5:1, UI ≥3:1.
- Visible focus on everything focusable.
- Targets ≥24px (44px for the rail and hub).
- One `h1` per page, with no skipped heading levels.
- Alt text on every image.
- Reduced motion respected; no keyboard traps; each landmark appears once.

**SEO:**
- Unique title and description on every route.
- Canonical URL set and structured data valid.
- Sitemap and robots correct.
- 301s with no chains.
- All images lazy-loaded except the LCP image.

**Perf:**
- LCP <2.5s and CLS <0.1 on 4G.
- No client JS for anything that can be an RSC.
- No WebGL.

**Content:** nothing unconfirmed ships.

---

## 10. Cutover runbook

1. Freeze edits and back up production: `sanity dataset export production`.
2. Re-crawl the legacy site; extend the redirect list if needed.
3. Confirm Vercel production env vars, then promote the reviewed preview.
4. Client repoints DNS. Confirm the apex and `www` both resolve and one redirects to the other with a
   single 301.
5. Confirm TLS, then re-test every redirect on the live domain.
6. Submit the sitemap to Search Console and request indexing of `/`. Watch 404s for two weeks.
7. Hand off: Studio logins, a short editor guide (mastheads, testimonials, gallery) and the location
   of this doc.

---

## 11. Session log

One line per session.

| Date | Session | Outcome |
|---|---|---|
| 09-13 | Plan, S0, S1, S2, S3 | Setup and history regraft, brand system, schema, content seeded |
| 09-13 | Images, S4, S5 | 124 assets migrated, side-nav shell, masthead and socials, first production build |
| 09-14 | S6, S7 | Home page, `seo` object; About page with anchors, faculty and contact blocks |
| 09-17 | Audit, ContactHub | Redirects, canonicals, JSON-LD, heading and lightbox fixes; ContactHub and placeholder mastheads |
| 09-18 | S8 | `/programs/[slug]`, breadcrumbs, sitemap entries (PRs #6, #7 merged) |
| 09-18 | Docs trim | Plan and OWNER-TODO cut to open work only |
| 09-18 | Drop template | Detached from `sanity-next-clean`; template types, blocks, dark mode, PWA and docs removed; school icon set; blueprint pointed at `wzs9gcps` |
| 09-18 | S9 + 404 | `pullQuote` block; `/montessori` restructured (saved as a **draft**, publish after deploy); themed `app/not-found.tsx`; prose capped at 58ch; Key facts top-aligned |
| 11-02 | F1 (feedback R1) | Content pass as drafts: gmail address everywhere (incl. three `mailto:` CTA buttons the sweep found), deposit wording, hours rows school/office/core, prose + `scheduleNote` cleared, program mastheads → sky, Toddlers copy, Agata bio, Priyanka NAMC credential, Galleries last in nav |
| 11-02 | F3 (feedback R1) | About: map beside Facility; faculty `split` layout (intro left, round headshots right, bio dialog); About draft restructured (`afaculty` merged into the grid) |
| 11-02 | F2 (feedback R1) | Black cap on reversed logos; home logo large + bottom centre; room accents; "At a glance" reads Core program from settings; masthead heights → min-heights (fixes clipped banners) |

---

## 12. Decisions log

Only decisions that are still relevant and not already covered in §3–§7.

- Admissions FAQ **not built**: there's no source content, so the answers would have to be invented
  (rule 6). The `faq` block is ready if the client supplies Q&As.
- The four admissions step *labels* are ours; every fact in them comes from `admissions.md`.
- The fax number is kept because the old site advertises it. The client decides whether to drop it.
- `openingHours` in JSON-LD only uses rows that have an explicit `schemaOrg` value; nothing is
  inferred.
- **Hours live only in `settings.contact.hours`** (FB10, extends D16). Rows carry a `key`
  (`school` | `office` | `core`, each used once); code finds rows by `key`, never by label. Program
  pages show the `core` row as "Montessori program"; `program.scheduleNote` is only for a
  program-specific note under it. Prose must not repeat hours.
- **Justified text was declined** (FB2): it fails WCAG 1.4.8 (AAA). Body copy stays left-aligned with
  `text-pretty` and a capped measure; the note to the client is in `CLIENT-FEEDBACK-R1.md` §5.
- Program colours use an explicit `program.accent` enum rather than matching `classroomName`: labels
  are editor prose and carry stega in draft mode.
- **Faculty `split` layout (FB6, FB7).** Teachers are round headshots in a 2/3/4-column grid; each is a
  `<button>` ("{name}, {role}: read bio") opening a Radix dialog with credentials + bio. Portraits are
  `alt=""` there (the name is the adjacent text). The dialog sits at `z-[70]`, above the mobile top bar
  (`z-[60]`), and forces `animate-none` under reduced motion: shadcn's `data-[state]` enter/exit
  animations are **not** gated by tw-animate-css, contrary to the old A11Y.md note (the gallery
  lightbox and the mobile Sheet share that gap — see OWNER-TODO).
- `PageBuilder` is `'use client'`, so every block (and its imports) ships in the client bundle; "server
  children" in the bio dialog only pay off if the page builder becomes a server component. Worth a
  separate session (server PageBuilder; optimistic client wrapper only in draft mode).
- Masthead heights are min-heights (fix in F2). The fixed `h-[…vh]` clipped the eyebrow and logo on
  compact banners at short laptop heights.
- JSON-LD type is `['Preschool', 'ChildCare']`, hard-coded.
- The homepage title uses `{absolute}`, because the root layout's `title.template` doesn't apply to
  its own segment.
- `linkType: 'href'` links are internal when the href starts with `/`.
- The mobile menu is a non-modal Radix Sheet (the top bar stays live); `inert` on the rest of the page + an `<html>` scroll lock restore the modal contract — see docs/A11Y.md → Navigation.
- Nav groups unmount when closed. Force-mounting put hidden links in the tab order.
- About → Facility shows a lazy Google Maps embed beside the copy (client request, 2026-11-02); the
  visible link remains for keyboard/AT users and as the fallback. (Reverses "the map is a link, not an
  iframe", FB11.) The `infoSection.aside: 'map'` option reads the Settings address via the page query,
  so the block adds no fetch. Elsewhere the map is still a link; with no `mapUrl` set, it falls back to
  a search on the Settings address.
- `telHref()` adds the country code.
- Content Lake doesn't validate what seed scripts write, so check the rendered page in the same
  session as any seeding. A CTA body once shipped as a string instead of Portable Text.
- Legacy thumbnails aren't uploaded; Sanity generates its own.
- The three testimonial photos are uploaded but not attached, because the source doesn't say who is in
  them.
- **Template removal (rev 17).** Unknown slugs now 404 instead of showing the template's "create
  this page" onboarding. The `testimonials` block always reads testimonial documents (the inline
  array, `source` switch and source links are gone). The CTA `theme` is `light` | `brand` (academy blue
  with a sunflower button); the old `dark` option depended on dark tokens. CTA images now carry real
  alt text instead of "Demo image". `stats` is re-labelled **Key facts** and renders a `<dl>`.
  IBM Plex Mono is gone; small-caps labels use Inter semibold. Settings lost `builtWith`, `mobileNav`,
  `favicon` and `logo` (none were rendered); `blurb` is now the default meta description.
  Social platforms: GitHub and Mastodon removed.
- `sanity.blueprint.ts` pointed the `invalidate-tags` Function at the template's Sanity project
  (`h52u3jiw`), so publishing never revalidated this site. Fixed to `wzs9gcps.production`; redeploy
  the blueprint (OWNER-TODO).
- Data left by removed fields is cleaned by `studio/migrations/drop-template-fields.ts`, run after
  the frontend deploy (OWNER-TODO).
- **S9 (rev 18).** `/montessori` is built from `maria.htm` with every sentence verbatim (D4); only
  headings, Key-facts labels and feature titles are ours, and each fact in them comes from the copy.
  The programs grid was replaced by a "Three classrooms, one method" features grid that links each
  class paragraph to its program page; the page links to `/programs` inline and ends on a brand CTA
  to `/about#book-a-tour`. The Maria Montessori photo is **not** used (provenance still unchecked).
- New `pullQuote` block (`figure` / `blockquote` / `figcaption`). `repeatsText` sets `aria-hidden`
  on quotes lifted from the page's own copy so screen readers don't read them twice.
- Content that renders a block type the deployed frontend doesn't know must be saved as a **draft**
  and published after the deploy; otherwise the live site shows the "Unknown block" alert.
- `PortableText` is capped at `max-w-[58ch]`: prose's 65ch ran ~82 characters per line in Inter.
- 404: root `app/not-found.tsx` (not `global-not-found`), so the rail, ContactHub and footer stay.
  Static, no fetch; links to `/`, `/programs` (D17) and `/about#contact` (redirect target). Its
  illustration hops once on load (no loop, WCAG 2.2.2) and is static under reduced motion.
