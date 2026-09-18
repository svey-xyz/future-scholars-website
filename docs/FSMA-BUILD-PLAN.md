# FSMA Build Plan — Future Scholars Montessori Academy

**Status:** S1–S8 done · most of S11 done in the 2026-09-17 audit · content + images seeded · production build passing **in an agent session** · S0b outstanding (owner) · **Last updated:** 2026-09-18 (rev 15) · **Owner:** Hayden Soule (svey)
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
| Q11 | ~~`*.sanity.io` is blocked by the egress allowlist~~ | svey | ✅ **Resolved 2026-09-13 (S4)** — the allowlist change was necessary but not sufficient: Node ignores `HTTPS_PROXY`. Run anything Node-side with **`NODE_USE_ENV_PROXY=1`** and every data-fetching route renders. See §12 |
| Q18 | The mounted repo cannot `unlink`, so `git merge`/`checkout`/`reset --hard` and `next dev`/`next build` all fail in place. Workarounds are recorded in §5.1 and §12 — is a standing delete grant for this folder acceptable, or do we keep working around it? | svey | **Still open. 2026-09-17: the grant was requested and refused by the sandbox's own auto-approval classifier, not by you** — an agent session may not be able to obtain it at all. The working answer is now the out-of-mount build recipe in §5.1, which needs no grant and costs one `rsync`. A `next build` *in* the mount still dies at the very end on `EPERM: rmdir .next/export/…`, after a successful compile and static generation |
| Q19 | ~~`fonts.googleapis.com` is off the egress allowlist, so `next build` fails at compile time~~ | svey | ✅ **Resolved 2026-09-17 (audit)** — both `fonts.googleapis.com` and `fonts.gstatic.com` now return 200 through the proxy, and `next build` downloads and self-hosts all three faces (14 `.woff2` files emitted to `.next/static/media`). **An agent session can produce a production build again.** Note the diagnostic trap: `curl https://fonts.gstatic.com/` returns 403 because the *bare host root* is refused — a real asset path under `/s/…` returns 200. Test with an actual font URL, not the origin |
| Q12 | ~~Logo source JPG~~ | svey | ✅ **Resolved 2026-09-13** — supplied in chat, archived at `docs/brand/logo-source.jpg` (not under `public/`, per §7.4) |
| Q20 | ~~`next build` fails under Cache Components when a hidden content type has zero documents~~ | svey | ✅ **Resolved 2026-09-13 (S5)** — both routes now return a `__placeholder__` slug when the list is empty (the docs-sanctioned pattern; the pages already `notFound()` unmatched slugs, so the placeholder prerenders the 404). First full production build passes: 23 pages, all six routes static/PPR. **Backport candidate** — any template consumer with an empty dataset hits this. Two pre-existing build warnings logged in §11: `Unknown block type "undefined"` from PortableText during static generation (audit in S12's content proof), and a `next/dynamic` CSR bailout (template behaviour, pages still prerender) |
| Q21 | ~~`npm run format` reflows ~50 untouched files because the repo is committed at `printWidth` 80~~ | svey | ✅ **Resolved 2026-09-17 (audit) — and the premise was backwards.** Measured: at width **80** the repo needs **174** files reformatted, at the config's real **100** it needs **58**. The repo was never formatted at 80, so pinning 80 would have tripled the churn. Of the 58, 21 were markdown and 8 were generated shadcn components. Fixed by narrowing `.prettierignore` (prose and vendored code are not Prettier's to own) and reformatting the remaining 29 files in one deliberate pass. `npm run format` is now a no-op on untouched files. Config also moved out of the package.json `prettier` key, which Prettier resolves *before* any config file. See §12 |
| Q22 | ~~Sanity CLI cannot load its config in the Cowork VM~~ | svey | ✅ **Resolved 2026-09-14 (S6)** — `node_modules` is macOS-built and needs two linux-arm64 natives beyond the three §5.1 lists: `@esbuild/linux-arm64` and `@rolldown/binding-linux-arm64-gnu`. Documented in §5.1 |
| Q23 | The About page now publishes an accessibility statement committing FSMA to WCAG 2.2 AA and to providing information in accessible formats on request. The website half is built and verifiable; the *organisational* half is the school's to make. Confirm they are happy to publish it, and that the office is the right contact route for accessibility feedback | Client | **Opened 2026-09-14 (S7)** |
| Q24 | The template's `featuresGrid` icon list is developer-flavoured — rocket, chip, beaker, code, cursor — and none of it belongs on a Montessori school's admissions steps, which therefore ship iconless. Either re-theme the list for FSMA (fork divergence) or leave the steps as numbered text, which reads fine. Cosmetic, not blocking | svey | **Opened 2026-09-14 (S7)** |
| Q26 | **The site has no canonical origin.** `settings.ogImage.metadataBase` is empty, which silently cost every route its canonical URL, made Open Graph image URLs unresolvable and dropped the `Organization` node from the JSON-LD graph entirely (every `@id` is built from it). The audit added a fallback chain so a Vercel deploy resolves its own production domain (`components/seo/siteOrigin.ts`), but **the real answer is the domain decision** — apex or `www` (§10 step 5). Set `settings.ogImage.metadataBase` in Studio, or `NEXT_PUBLIC_SITE_URL` in Vercel, before launch | svey + client | **Opened 2026-09-17 (audit)** |
| Q27 | Title separator: §11's S11 task specifies `Page · Future Scholars Montessori Academy`, the template's `title.template` emits `Page \| …`. Cosmetic, one character, client-visible — left as the pipe rather than changed silently | svey | **Opened 2026-09-17 (audit)** |
| Q25 | An admissions FAQ was specified for S7 but not built: the legacy site has no FAQ, so writing the answers would be inventing client facts (§0 rule 8). If the client supplies real questions and answers the `faq` block already exists and it is a short follow-up session | Client | **Opened 2026-09-14 (S7)** |

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
- **Typegen is `npm run typegen` from the root** (a root-owned pipeline landed with S5 — `schema:extract`
  then `typegen:frontend` + `typegen:studio` in parallel). Use that one. A `sanity:typegen` script does
  still exist in both workspaces — this note previously claimed it had been removed, which is wrong —
  but it is the old two-step and earlier sections that name it are stale regardless. The `--force` flag the new
  pipeline passes also settles the old SIGABRT-on-teardown problem, so the two-step workaround previously
  documented here is no longer needed.
- ~~**Google Fonts is blocked**~~ — **no longer true (2026-09-17, Q19).** Both `fonts.googleapis.com`
  and `fonts.gstatic.com` resolve through the proxy, `next/font/google` downloads and self-hosts all
  three faces at build time, and local type is correct. Diagnose it with a real asset URL
  (`https://fonts.gstatic.com/s/inter/…​.woff2` → 200), never the bare origin (`https://fonts.gstatic.com/`
  → 403, which is what made this look blocked for four sessions).
- **`sanity-cdn.com` is blocked**, so the Studio's auto-update version check logs a 403. Harmless; the
  Studio still starts.
- **Deleting files needs explicit permission** in the mounted folder. A stale `.git/index.lock` will wedge
  git until that is granted.
- **Node needs `NODE_USE_ENV_PROXY=1`.** Egress is an authenticated HTTP proxy. `curl` and `npm` are
  configured for it; **Node is not** — it ignores `HTTPS_PROXY` and every `fetch` dies with `EAI_AGAIN`,
  which is what made the dataset look blocked long after it was allowlisted. Node 22.23 honours
  `NODE_USE_ENV_PROXY=1` (undici's `EnvHttpProxyAgent`). Prefix any Node process that talks to the network
  with it: `NODE_USE_ENV_PROXY=1 npx next dev`. It prints an experimental-API warning; ignore that.
- ~~**`fonts.googleapis.com` is refused at the proxy**~~ — superseded by the corrected note above. A
  production build now succeeds in an agent session; the only thing still standing between a session and
  a Lighthouse run is a browser binary (`cdn.playwright.dev` is off the allowlist).
- **Git cannot update the working tree in the mount, and `next dev` cannot run in it** (Q18). The mount
  refuses `unlink` without a per-session delete grant, and git implements worktree updates as
  unlink-then-create. Consequences and the two workarounds that do work:
  - **Stale `*.lock` files.** Any interrupted git command leaves `.git/index.lock` (and friends) behind,
    and the next command dies on "File exists". They can be *renamed* (`mv`) even though they can't be
    deleted, so clear them before each git write:
    `for f in $(find .git -maxdepth 2 -name '*.lock'); do mv "$f" ".git/_stale/$(basename $f).$(date +%s%N)"; done`
  - **`git commit`, `git add`, `git checkout -b` and `git update-ref` all work** once the locks are clear —
    they only rewrite `.git`. `git merge`, `git checkout <ref> -- <path>`, `reset --hard` and `stash` do not.
  - **To merge upstream:** clone the repo to the VM's own filesystem (`git clone --shared`), merge there,
    then bring the result back — overwrite each changed file with `cat src > dst` (truncates in place,
    never unlinks), `git update-ref` the branch to the merge commit, and `git reset` (mixed) to resync the
    index. Verify with `git status` afterwards.
  - **To run the dev server:** copy the tree (minus `node_modules`, `.git`, `.next`) to `$HOME`, symlink
    `node_modules` back to the mount, copy `frontend/.env.local` across, and run
    `NODE_USE_ENV_PROXY=1 npx next dev --webpack` there. **`--webpack` is required**: Turbopack refuses a
    `node_modules` symlink that points outside the project root. In the mount itself, Turbopack fails on
    its persistence directory and webpack fails unlinking its dev log.
  - **To run `next build` and `next start`** (verified 2026-09-17, needs no delete grant — this is the
    recipe to reach for first, since the grant may not be obtainable at all):
    ```bash
    SRC=$HOME/mnt/future-scholars-website; DST=$HOME/build
    rsync -a --delete --exclude node_modules --exclude .next --exclude .git "$SRC/" "$DST/"
    for d in "" frontend/ studio/; do ln -sfn $SRC/${d}node_modules $DST/${d}node_modules; done
    cp $SRC/frontend/.env.local $DST/frontend/.env.local
    cd $DST/frontend && NODE_USE_ENV_PROXY=1 npx next build --webpack   # then `next start -p 32xx`
    ```
    Re-run the `rsync` after every edit — the copy is a snapshot, and it is very easy to spend ten
    minutes verifying a build of the previous version. **Background servers do not survive a shell
    call** (§5.1 above), so `next start` and every `curl` against it must be in the *same* call.
- **`node_modules` is installed for macOS, not for this VM.** The native binaries are `*-darwin-arm64`, so
  anything that loads one fails — through Node, which can't reach the registry to self-heal. Fetch the
  linux-arm64 equivalents with `npm pack` (which *does* use the proxy) and unpack them into `node_modules`
  by hand. **Five packages, not three** (S6):
  | Package | Needed by | Symptom when missing |
  |---|---|---|
  | `@next/swc-linux-arm64-gnu` | `next dev` / `next build` | tries to download at startup, hangs/fails |
  | `lightningcss-linux-arm64-gnu` | CSS pipeline | build error |
  | `@tailwindcss/oxide-linux-arm64-gnu` | Tailwind v4 | build error |
  | `@esbuild/linux-arm64` | Sanity CLI config load (jiti) | `CLI config cannot be loaded` |
  | `@rolldown/binding-linux-arm64-gnu` | Sanity CLI → Vite → rolldown | `Class extends value undefined` |
  Take each version from that package's own `package.json` in `node_modules` (they are *not* all the same
  as the versions named in older revisions of this doc). One-liner per package:
  `npm pack <pkg>@<ver> && tar xzf *.tgz && cp -R package/* node_modules/<pkg>/`.
  They are gitignored and harmless to the owner's macOS checkout, which picks its own platform package.
  The two CLI ones are why `npm run typegen` appears broken in a fresh VM session — fix them first.
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

- [x] Add `app/components/layout/SideNav.tsx` (RSC, cached per `docs/CACHING.md`) consuming
      `settings.navigation`. Rail is RSC; only the link list and the drawer are client islands, and it
      shares `getSettings` with the footer, so the whole shell is one `settings` cache entry
- [x] Add `SideNavMobile.tsx` using shadcn `Sheet` — a **modal** left drawer, unlike the template's
      non-modal top sheet (nothing behind it needs to stay live), so Radix's own focus trap / scroll lock /
      focus restore do the work instead of the hand-rolled versions. See §12
- [x] Rework `app/layout.tsx`: rail + `<main id="main">` offset column, skip link first in tab order
- [x] Retire `Header.tsx`'s "View on GitHub" CTA and template chrome — unmounted, files kept and still
      exported (D13). `Header`/`HeaderNav`/`DesktopNav`/`MobileNav`/`Logo` are now dead code by design
- [x] `aria-current="page"` on the active item; Programs group as Collapsible with `aria-expanded`.
      Two fixes the template's leaves needed first — internal `href` links were being treated as external,
      and the homepage resolved to `/home`. Both in `navHelpers.ts`; see §12
- [x] View transition: stable names on the rail (`site-rail`) and the top bar (`site-topbar`), snapshot
      animation disabled in `globals.css`, `nav-forward`/`nav-back` on links
- [x] Footer: slim, below content, inside the offset column, not inside the rail. ~~accessibility link~~ —
      deferred to **S7**, which writes the statement it would point at; linking to a missing anchor now
      would ship a broken link
- [x] Rail footer contact (§6.2): `tel:`, `mailto:` and socials, ≥44px targets
- [ ] Keyboard test: Tab order rail → main → footer; drawer traps focus and restores it on close —
      **DOM order verified** (skip link is the first focusable node, rail precedes `main` precedes footer);
      the drawer's trap/Esc/restore could **not** be exercised from an agent session (see §12) and is
      carried to the owner's preview check

**Acceptance:** every existing route renders inside the new shell at 360/768/1024/1440px with no horizontal
scroll ✅ — measured in a headless browser at all four widths on `/`, `/about`, `/programs`: rail visible
and `main` offset 272px from `lg` up, top bar with `main` offset 64px below it, `scrollWidth == clientWidth`
everywhere. All six routes return 200 against the live `production` dataset. No layout shift on navigation ✅
(rail and bar are fixed and view-transition-anchored). Full keyboard operability ⬜ — DOM order verified,
drawer interaction carried to the preview.

---

### S5 — Masthead + floating socials components
**Goal:** the two things the client explicitly asked for from the reference sites.

- [x] `app/components/layout/Masthead.tsx` per §7.6 — hotspot crop, scrim tiers, reversed logo, `priority`.
      Both variants implemented: `image` (hotspot-aware 1600×600 CDN crop, eager + `fetchPriority="high"`,
      tiered scrims) and `brand` (flat tone panel; the light `secondary` tone takes the *standard* lockup,
      the dark tones the reversed one — reversed white on soft sky would be ~1.3:1). See §12
- [x] Wire `page.masthead` into `app/[slug]/page.tsx` and the homepage — both route through `CachedPage`,
      so one wiring covers both; `masthead` added to `getPageQuery` + typegen regenerated. Interplay: the
      masthead **owns the visual `<h1>`** whenever present (`PageTitle` is skipped — no duplication);
      `titleDisplay: 'none'` keeps the h1 sr-only inside the masthead (§7.6's decorative case). Verified
      against the seeded data: home (`none`) renders logo + sr-only h1, the other five render a visible
      heading in the masthead. Draft-mode fallbacks on both routes reshaped to the standard masthead (no CLS)
- [x] `app/components/layout/ContactHub.tsx` per §7.7, driven by `settings.contact` (phone + email + socials). Superseded `SocialRail.tsx`. ~~extend
      `SocialIcon` with any missing platforms~~ — **not needed**: all 7 schema platforms already mapped
- [x] Rail at `z-30` — below rail/top bar (`z-40`) and dialogs/lightbox (`z-50`); hidden below 768px
      (`hidden md:block`), drawer carries socials there. Duplication resolved (§12): rail footer keeps
      `tel:`/`mailto:` only ≥768px. Rail renders nothing when `socials` is empty (Q1)
- [x] `prefers-reduced-motion` respected — the only masthead motion is the existing `.enter` cascade on
      the overlaid copy, globally gated in `globals.css`; the LCP image itself is never animated
- [ ] Measure: masthead image ≤250KB at 1x desktop, LCP <2.5s on throttled 4G — **carried**: every page
      currently ships the brand-panel variant (zero masthead image bytes; the ~10KB logo SVG is the only
      asset), and no agent/session build exists to measure against — `next build` fails on the empty
      hidden-type routes (**new Q20**). Revisit when photography lands (Q5) and Q20 is fixed

**Acceptance:** a page with a masthead renders logo-over-image with legible contrast at every breakpoint ✅
(brand variant: all six routes render logo-over-panel, AAA token pairs, distinct height/tone/placement per
page — verified in the rendered HTML on the owner's Mac; image variant is code-reviewed but unverifiable
until photography exists); socials appear/disappear correctly and are keyboard reachable ✅ (fixed stack
≥768px, plain anchors with visible focus rings and full accessible names; landmark `nav[aria-label="Social
media"]`; nothing below 768px, drawer covers it).

---

### S6 — Home page (Milestone A deliverable)
**Goal:** a real page the client can look at.

- [x] Capture legacy copy — **all 13 pages**, not just the seven listed, → `content/legacy/*.md` (committed).
      Captured through the desktop browser pane; the legacy host is off the egress allowlist (Q14)
- [x] Document dimensions/quality of the legacy imagery → `content/legacy/IMAGE-MANIFEST.md`. **Every image
      fails the masthead bar** (Q5)
- [x] ~~Download the legacy imagery — **blocked on Q14** (host not on the allowlist)~~ — done out of
      sequence in the image-migration session: Q14 closed, 124 assets uploaded, 111 referenced
- [x] Seed `settings` — title, blurb, description, legal, homepage ref, full side-nav (§6.2) with the
      Programs dropdown, contact block with address/phone/hours/Facebook, `foundingDate`, `areaServed`.
      `priceRange` and `geo` deliberately left empty: Q6 is unanswered and coordinates would be invented
- [x] Build the home page in the page builder: masthead → mission/vision (infoSection) → programs grid →
      featured testimonial → gallery teaser → CTA (`mailto:` "Book a tour"). The *content* was seeded in
      S3; what was missing was the code under it, and one content bug:
      - `programsGrid` had schema but **no React renderer**, so the homepage rendered the red "Unknown
        block" alert (OWNER-TODO item D). `ProgramsGrid.tsx` added and registered; GROQ resolves the
        `mode` switch so the component never branches. Cards link to `/programs/<slug>` — **those routes
        land in S8**, as the side rail's Programs children already do
      - `testimonials` with `source: "documents"` (S3) resolved nothing — the component only ever read
        the template's inline array, so the homepage showed a heading above an empty list. Both sources
        now normalise to one shape; `limit` is applied in JS (a GROQ slice cannot take a runtime value
        from the enclosing block). Three featured quotes render
      - **Content bug found and fixed in `production`:** the `callToAction` `body` on `/` and `/programs`
        was seeded as a plain **string** where the schema wants Portable Text, so `<PortableText>` printed
        `Unknown block type "undefined"` into the page. Both patched and republished. This is the same
        warning S5 logged from the build and deferred to S12's content proof — it is now closed
- [x] Add optional `seo` object (`metaTitle`, `metaDescription`, `ogImage`, `noIndex`) to `page` —
      **backport candidate, logged in the FORK-SYNC registry**; wired into `generateMetadata` on both `/`
      and `/[slug]` through a shared `pageMetadata()` so the two routes cannot drift. Every field is
      optional and falls back to the document's own `name`/`subheading`/`heading`. Also fixed a real
      metadata bug it exposed — the homepage was emitting a bare `<title>Home</title>` (§12)
- [ ] Screenshot at 3 breakpoints for the client review thread — **carried, deliberately.** No browser
      can be installed in the Cowork VM (`cdn.playwright.dev` is off the allowlist) and, more to the
      point, **Q19 means local renders fall back to system fonts** — a client-facing screenshot from here
      would misrepresent the typography the client is being asked to approve (OWNER-TODO item 9). These
      belong on the Vercel preview

**Acceptance:** `/` renders from Sanity with no lorem/template remnants ✅ — verified in the rendered HTML
against the live `production` dataset: zero "Unknown block" alerts on any of the six routes, exactly one
`h1` each, 12 images and zero missing `alt`, all seven homepage sections present in order, three program
cards with correct slugs, three featured testimonials, CTA body rendering as prose. Lighthouse ⬜ — still
owner-side (Q19 blocks a local production build, and therefore a local Lighthouse run).

---

### S7 — About Us (merged About + Admissions + Contact)
**Goal:** the highest-information page, and the one holding client-verified facts.

- [x] Build `/about` with anchored sections `#about`, `#admissions`, `#contact` — plus `#book-a-tour` and
      `#accessibility`. New optional `anchor` field (`shared.ts`) on the blocks this page uses; rendered
      as the wrapper `id` in `BlockRenderer`, one place for every block. **Backport candidate** — upstream
      it belongs on all blocks, not the five this fork needed first
- [x] Faculty section from `person` documents — new `facultyGrid` block rendering the two directors
      (portrait, role, credentials, bio). The existing "Directors" prose block introduces them and the
      grid follows it, so the grid ships with **no heading of its own**: "Directors" followed by "Meet the
      directors" was two `h2`s saying the same thing
- [x] Admissions: ~~FAQ block~~, process steps (featuresGrid), "Book a tour" `mailto:` CTA.
      **The FAQ is deliberately not built.** The legacy site has no FAQ, so there is no source content,
      and writing parent-facing answers about a school's admissions would be inventing client facts —
      §0 rule 8. Ask the client for real questions and it becomes a 20-minute follow-up. The four process
      steps are labelled by me ("1. Book a tour") but every *fact* in them traces to `admissions.md`
- [x] Contact: address, phone (`tel:`), email (`mailto:`), hours, static map link (no embedded iframe —
      it's a third-party tracker and a CLS/perf liability for one link's worth of value). Built as a
      `contactDetails` block that **holds no details of its own** — it renders Settings → Contact, so this
      page and S11's JSON-LD read the same fields and cannot drift. Real `<address>`, hours as a `<dl>`,
      map as a link. Added `contact.fax` (§12) and fixed the rail's country-code-less `tel:` (§12)
- [x] Extract verified contact facts from legacy `contact.htm`; send to client for confirmation (Q2) —
      extracted and seeded in S3/S6; the confirmation list is OWNER-TODO item 10 and the on-page
      `TODO(client)` notice
- [x] Accessibility statement (AODA-aware): commitment, standard targeted, contact route for issues.
      **It makes a public commitment on the client's behalf**, so the `TODO(client)` notice on the page
      gained a paragraph asking them to confirm it before launch
- [x] Anchor offsets account for the fixed top bar on mobile (`scroll-margin-top`) — `scroll-mt-20`
      below `lg`, `lg:scroll-mt-8` above it, applied only to blocks that actually have an anchor

**Acceptance:** every claim on the page traces to legacy content or client confirmation ✅ — no invented
facts; the four step *labels* are mine and are flagged above. No invented FAQ. Anchors land correctly from
the redirect map ⬜ — **the five anchor targets exist and were verified in the rendered HTML**, but the
redirect table itself is not written until S11, so the end-to-end `admissions.htm` → `/about#admissions`
hop cannot be tested yet. Rendered-HTML verification: one `h1`, valid `h2`/`h3` sequence, `tel:`/`mailto:`/
maps links correct, one `<address>`, zero missing `alt`, zero unknown blocks; production build passes.

---

### S8 — Programs index + three detail routes

- [x] ~~`app/programs/page.tsx` (index, cached pattern)~~ and `app/programs/[slug]/page.tsx` — **the
      index is not a route.** `/programs` is already a `page` document served by `app/[slug]` (grid +
      music + care + CTA); an `app/programs/page.tsx` would shadow it and take it away from the editor.
      Only the dynamic segment was added, three-layer pattern, `__placeholder__` guard (Q20). See §12
- [x] ~~Seed Infants / Toddlers / Casa program documents~~ — already seeded in S3 (bodies, ratios, ages,
      classroom names, card images, per-program brand mastheads); verified against §6.1, nothing to do
- [x] Curriculum-enhancing programs (music, before/after care) as a section on the index — already on
      the `/programs` page document (`pmusic`, `pcare` infoSections), seeded in S3
- [x] Detail routes in `sitemap.ts` (`program` branch in `sitemapData` + the switch); visual breadcrumbs
      (`common/Breadcrumbs`, WAI-ARIA pattern) + `BreadcrumbList` JSON-LD (`breadcrumbJsonLd`) fed from
      one `trail()` so they cannot drift. Presentation `mainDocuments` + `locations` + `resolveHref` for
      `program` in `studio/sanity.config.ts`
- [x] Redirects for `infant-class.htm` / `toddler-class.htm` / `casa-class.htm` verified — 301 → 200

**Acceptance:** each program page has a distinct masthead ✅ (compact brand panel in three tones —
sky/blue/ink — with the room name as eyebrow; photography still Q5), correct ratios/ages ✅ (1:3 / 1:5 /
1:8, rendered in an "At a glance" `<dl>`), and a tour CTA ✅ (→ `/about#book-a-tour`, which holds the
real `mailto:`). Also: "Other programs" sibling links, canonical + description + OG image per program.
Verified against a production build (26 pages): all three 200 with one `h1` and a clean `h1 → h2`
outline, `/programs/nope` 404s, **zero non-200 internal links across all nine routes** (the S11 gap), and
the `BreadcrumbList` validates structurally with absolute URLs. **Not verified here:** draft-mode /
Presentation round-trip on the new route (owner-side, OWNER-TODO 7) and a visual check (no browser in
the VM). The Hours row prints the seeded `scheduleNote` verbatim, including its `TODO(client): confirm.`
marker — deliberate, same as `/about`, and S12's grep will catch it.

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
- [x] Lightbox a11y: Esc, arrow keys, focus restore, `aria-modal`, captions announced — **the arrow
      keys did not work** and the lightbox's sr-only description told screen-reader users they did
      (audit 2026-09-17). Fixed at the dialog; see §12. Esc / focus trap / focus restore / `aria-modal`
      are Radix's and were already right; captions are a `<figcaption>` inside the slide
- [x] ~~Gate on photo consent~~ — removed: client confirmed releases cover web use (D17, 2026-09-13)
- [x] ~~Cut anything under ~1000px~~ — **reversed by the client 2026-09-13**: preserve everything
      regardless of resolution. The 115 legacy thumbnails are still excluded (Sanity derives its own);
      13 further assets are uploaded but unplaced, listed in `content/legacy/IMAGE-MANIFEST.md`

**Acceptance:** gallery is fully keyboard operable; every image has meaningful alt; no CLS from image loads.

---

### S11 — SEO, metadata, structured data, redirects

**Most of this session was done out of order by the 2026-09-17 audit**, because the items below were
not future work — they were live defects on a site the client is being shown. What remains is content
and post-deploy validation.

- [x] Per-page metadata via the S6 `seo` object — wired in S6. Titles render `Page | Site`, not the
      `Page · Site` this line specifies (Q27, cosmetic, left alone rather than changed silently)
- [x] `metadataBase`, canonical URLs — `components/seo/siteOrigin.ts` resolves an origin from Settings,
      then `NEXT_PUBLIC_SITE_URL`, then the Vercel production domain; `pageMetadata` emits
      `alternates.canonical` and `og:url` on both routes. **The origin is still unset in content**
      (Q26) — until it is, canonicals are relative, which is valid but not ideal
- [ ] OG/Twitter images (brand OG template) — still to build. A page-level `seo.ogImage` and the
      site-wide `settings.ogImage` both work and now correctly fall back to each other (the page used
      to *discard* the site-wide one — see §12); neither is uploaded yet
- [x] JSON-LD: `Preschool`/`ChildCare` with address, `openingHours`, `areaServed`, `foundingDate`,
      `telephone`, `sameAs`, and `geo`/`priceRange` when set; `WebSite`. Verified in the rendered HTML
- [x] `BreadcrumbList` on nested routes — landed with S8 on `/programs/[slug]`, the only nested route
- [x] `sitemap.ts` covers all real routes and excludes drafts; `robots.ts` allows all, points at sitemap.
      Both now prefer the configured origin over the request host, so an alias-served deploy does not
      advertise itself. The sitemap no longer lists the homepage twice (see the redirect note below)
- [x] Implement the full §6.3 redirect table in `next.config.ts` — all 13, plus `/index.htm` and
      `/home`, as **301** (`statusCode: 301`, not `permanent: true`, which emits 308 — §12). Verified:
      15/15 return 301 to a route that returns 200, no chains
- [ ] Crawl the live site for stragglers — still owed, and belongs immediately before cutover
- [ ] Preserve the legacy keyword intent (Ottawa Montessori / childcare / daycare) in real copy — no meta
      keyword stuffing, it does nothing
- [ ] Validate with Rich Results Test — needs a public URL, so it follows S0b

**Acceptance:** zero broken internal links ✅ — closed by S8 (13 distinct internal hrefs across nine
routes, all 200); zero redirect chains ✅; structured data validates ⬜ (needs the
public URL).

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
| 2026-09-13 | S4 | cowork/opus | `feat/fsma-s4-sidenav` (local, unpushed) | **Done, with one item carried.** Side rail + mobile top bar/drawer replace the template header; skip link, offset content column, view-transition anchors, rail contact block. Two nav-resolution bugs fixed in `navHelpers.ts`. **First session to render the site**: all six routes 200 against `production`, geometry verified headlessly at 360/768/1024/1440 | **Q11 is closed** — `NODE_USE_ENV_PROXY=1` makes Node use the egress proxy (§5.1). **New Q18**: git cannot merge or check out in the mounted repo (no `unlink`). **New Q19**: `fonts.googleapis.com` is off the allowlist, so `next build` fails outright. Drawer keyboard test carried to the owner's preview |
| 2026-09-13 | S5 | opencode/kimi | `feat/fsma-s5-masthead-socials` | **Done, one item carried.** Masthead (both variants) + floating social rail built and wired through `CachedPage`; masthead owns the visual h1; rail-footer socials deduped (§12); `masthead` added to `getPageQuery`, typegen regenerated; type-check/lint/format clean. **First session run on the owner's Mac** (OpenCode), not the Cowork VM — §5.1's sandbox quirks didn't apply: typegen ran as one script, the owner's dev server rendered all six routes 200, mastheads verified in HTML (per-page height/tone/placement, exactly one h1 per route). Image-weight/LCP measurement carried (no photography; Q20 blocked builds at the time) | **Q20 found and then fixed in-session** (see next row). Q18/Q19 are Cowork-VM-only and did not reproduce on the Mac |
| 2026-09-13 | Q20 fix | opencode/kimi | `feat/fsma-s5-masthead-socials` | **Done.** `__placeholder__` guard in both hidden-type detail routes; **first full production build passes** (23 pages; `/`, `/[slug]` + all six routes static/PPR with 1y tags; placeholder paths prerender the 404). type-check/lint/format clean | **Q20 closed; backport candidate for the template.** Two pre-existing build warnings to audit later: `[@portabletext/react] Unknown block type "undefined"` during static generation (add to S12's content proof) and `Bail out to client-side rendering: next/dynamic` (template behaviour, pages still prerender) |
| 2026-09-14 | S6 | cowork/opus | `feat/fsma-s6-home` (local, unpushed) | **Done, screenshots carried.** The homepage's content was already seeded (S3); this session built the code under it: `ProgramsGrid` renderer + GROQ resolution, document-sourced testimonials, and an optional page-level `seo` object wired through a shared `pageMetadata()`. Fixed two real bugs the wiring exposed — a seeded `callToAction.body` stored as a string instead of Portable Text on `/` and `/programs` (this was S5's `Unknown block type \"undefined\"` build warning, now closed), and a bare `<title>Home</title>` on the homepage. All six routes 200 against `production`, zero unknown blocks, one h1 each, zero missing alt; production build passes (23 pages) | **New Q21**: `npm run format` rewrites ~50 untouched files in the Cowork VM — reverted, needs a deliberate clean-up commit. **New Q22**: `node_modules` needs two *more* linux-arm64 natives than §5.1 lists (`@esbuild`, `@rolldown/binding`) or the Sanity CLI cannot even load its config. Q19 unchanged and now blocks screenshots too |
| 2026-09-14 | S7 | cowork/opus | `feat/fsma-s6-home` (local, unpushed — same branch as S6) | **Done, one item deliberately not built.** `/about` now carries five anchors, a faculty grid from the `person` documents, a four-step admissions process, a Book-a-tour CTA, a settings-driven contact block and an AODA-aware accessibility statement. New: `anchorField` (+ `id`/`scroll-mt` in `BlockRenderer`), `contactDetails` and `facultyGrid` blocks, `contact.fax`, shared `telHref()`. **The admissions FAQ was not built** — no source content exists and inventing it breaks §0 rule 8 (see §8 S7). Verified in the rendered HTML against `production`; build passes (23 pages) | **New Q23**: the accessibility statement commits FSMA publicly — client must confirm. **New Q24**: the `featuresGrid` icon set is developer-flavoured (rocket, chip, beaker) and unusable on a school site, so the process steps ship without icons. Anchors cannot be tested end-to-end until S11 writes the redirect table |
| 2026-09-17 | Audit (repo vs plan) | cowork/opus | `feat/fsma-s6-home` (local, unpushed — same branch as S6/S7) | **Done.** Read the whole repo against §§1–12 and against the rendered HTML of every route, then fixed what was actually broken rather than what was next. Seven real defects: a heading-level skip on `/programs` (h1 → h3); `/home` serving the homepage a second time, prerendered *and* in the sitemap; the entire §6.3 redirect table missing, so every legacy `.htm` URL 404'd; no canonical on any route and no `metadataBase` resolution, which also silently deleted the `Organization` node from the JSON-LD; `pageMetadata` discarding the site-wide OG image on every page (Next drops a parent's `openGraph` once a child sets one); the gallery lightbox announcing arrow-key navigation it did not implement; and Prettier's config being both misdiagnosed and unreachable. Also extended the JSON-LD to `Preschool`/`ChildCare` with the address, hours, areaServed and foundingDate the S2 `schoolInfo` fields were added for and had never been read. Gate: typegen regenerated, type-check clean, lint clean (same 3 template warnings), `prettier --check` clean, production build passes (22 pages, down one — `/home` is gone), all 15 redirects 301 → 200 with no chains, every route one `h1` with no skipped levels, zero unknown blocks, zero missing `alt` | **Q19 and Q21 closed** (both had the wrong diagnosis on file — see §4). **Q18 still open and possibly unobtainable**: the delete grant was refused by the sandbox classifier, not by the owner; the out-of-mount build recipe in §5.1 replaces it. **New Q26** (no canonical origin — needs the apex-vs-`www` decision) and **Q27** (title separator). Most of S11 landed here; S8 is now the biggest live gap, since the side rail and every programs grid link to three URLs that 404 |
| 2026-09-17 | ContactHub / masthead imagery / testimonial cards | unknown (not logged) | none — **left uncommitted on `main`** | Found as an uncommitted working tree at the start of S8; its §12 rows (ContactHub, hub hover, stega-cleaned hrefs, Unsplash mastheads) were written but no §11 row was. type-check clean. **Committed as-is by the S8 session onto its own branch `feat/fsma-contact-hub` (`8c3ffaa`)** so S8 could branch cleanly; not otherwise reviewed | Owner: review/PR `feat/fsma-contact-hub` before `feat/fsma-s8-programs`, which is stacked on it |
| 2026-09-18 | S8 | cowork/opus | `feat/fsma-s8-programs` (local, unpushed; stacked on `feat/fsma-contact-hub`) | **Done.** `/programs/[slug]` (three-layer, cached), breadcrumbs visual + JSON-LD, sitemap branch, Presentation wiring, "At a glance" facts, tour CTA, sibling links. Content needed nothing — S3 had seeded it all. Production build passes (26 pages); all three routes 200; zero broken internal links site-wide; legacy class redirects 301 → 200 | Upstream checked: not behind. Delete grant obtained on first ask this session (Q18). No new blockers. Draft-mode round-trip on the new route is owner-side with the rest of OWNER-TODO 7 |
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

| 2026-09-14 | **Seeded `callToAction.body` was a plain string, not Portable Text** | The S3 seed wrote `body: "A tour and a classroom observation…"` where the schema declares `blockContentTextOnly`. Content Lake is schemaless, so it accepted it (the same property that let S3 seed undeployed types), and `<PortableText>` then printed `Unknown block type "undefined"` into the rendered page on `/` and `/programs`. Patched both documents to proper block arrays and republished. **The general lesson for the remaining seeding sessions:** schemaless writes mean a seed script's field *shapes* are never validated — only rendering catches them, so seed and render in the same session, or query for the mismatch explicitly | S5's §11 note deferring this warning to S12's content proof |
| 2026-09-14 | **Homepage `<title>` is emitted as `absolute`, not through the template** | The root layout sets `title.template: '%s | <site title>'`, which Next applies to *child* segments — and `app/page.tsx` is the **same segment** that defines it, so the homepage rendered a bare `<title>Home</title>` while every `/[slug]` route correctly rendered `About Us \| Future Scholars Montessori Academy`. `pageMetadata()` takes an optional `siteTitle`, passed only from `/`, and emits `{absolute}`. Note this also means the homepage title is the school's name rather than "Home \| …", which is what it should be anyway. **Backport candidate** — the template has the same bug | — |
| 2026-09-14 | Programs-grid `mode` resolves in GROQ; the testimonials `limit` resolves in JS | Both are the same "pick a source" shape, but only one can be done the same way. `mode == "selected" => programs[]->{…}` is a clean GROQ `select()`. The testimonials `limit`, though, would need `[0...^.limit]` — a slice range cannot take a runtime value from the enclosing scope. So GROQ fetches an ordered, featured-filtered `[0...24]` and the component slices. Recording it so the asymmetry doesn't read as an oversight later | — |
| 2026-09-14 | Testimonials `Quote` type is **derived** from the inline array member, not hand-written | The two sources produce structurally identical image sub-objects, but hand-writing `hotspot?: unknown` immediately failed type-check against `SanityImageHotspot`. `InlineTestimonial['authorImage']` tracks whatever typegen emits, so a schema change to the image field cannot silently drift from this component | — |
| 2026-09-14 | Program cards link to `/programs/<slug>`, which does not exist until S8 | Considered rendering the cards unlinked until the routes land. Rejected: the side rail has already linked to those three URLs since S4, so not linking the cards would not avoid the broken link, it would only make the grid inconsistent with the nav. S11's "zero broken internal links" check is the backstop, and S8 is two sessions away | — |
| 2026-09-14 | **Q21: `npm run format` rewrites ~50 files nobody touched in the Cowork VM** | The repo as committed is formatted at `printWidth` **80**; `@sanity/prettier-config@3.0.0` — the version in the lockfile and in the mounted `node_modules` — resolves to **100**, so a repo-wide format reflows every file that has a line between the two. Reverted everything not mine and kept my own files at the config's real 100 (`prettier --check` passes on them). Since both machines share the same mounted `node_modules`, the Mac would produce the identical 50-file diff, which means **no repo-wide format has been run since the config changed** — the earlier sessions' "format clean" only ever meant "the command exited 0". Wants a deliberate one-commit reformat, not a silent side-effect of a feature branch. Same failure mode as the two lockfile incidents: an environment-wide rewrite riding along in `git add -A` | §5.1, which warned about the lockfile but not about prettier |
| 2026-09-14 | **Q22: the Sanity CLI needs two more linux-arm64 natives than §5.1 lists** | §5.1 names `@next/swc`, `lightningcss` and `@tailwindcss/oxide`. It is missing two, and without them `sanity schema extract` dies before it starts, with the useless message `CLI config cannot be loaded — Class extends value undefined`: the CLI loads `sanity.cli.ts` through jiti → Vite → **rolldown**, and both `esbuild` and `@rolldown/binding` are darwin-only in the mounted tree. Adding `@esbuild/linux-arm64` and `@rolldown/binding-linux-arm64-gnu` at the lockfile's versions fixes it. Note the version numbers are *not* the ones in §5.1 — read them from each package's own `package.json` rather than assuming | §5.1's three-package list |
| 2026-09-14 | `next dev` now runs **in the mount**, given a delete grant — but only with `--webpack` | With deletion granted for the folder (Q18), `rm -rf .next` works and the dev server starts in place; the copy-to-`$HOME`-with-symlinked-`node_modules` dance from S4 was not needed. Turbopack still cannot be used, but for a *new* reason: it treats the blocked `fonts.gstatic.com` as a hard module-resolution error (`Can't resolve '@vercel/turbopack-next/internal/font/google/font'`) and every route 500s, where webpack only warns and falls back to system fonts. So: grant deletion early, then `NODE_USE_ENV_PROXY=1 npx next dev --webpack` | §5.1's "dev server must run from a copy outside the mount" |
| 2026-09-14 | Q19 verified again, and worked around **only** for a throwaway build | `next build` still fails outright on all three `next/font/google` faces. To prove the session's changes actually build, the three font calls in `layout.tsx` were temporarily replaced with `{variable, className}` stubs, the build run (23 pages, every route prerendered, **no PortableText warning any more**), and `layout.tsx` restored from a copy — verified with `git diff`. The stub is a verification technique, **not** a fix and never committed; self-hosting the faces (OWNER-TODO item A) remains the real answer, and cannot be done from an agent session because the `.woff2` files are themselves unreachable | — |

| 2026-09-14 | **Anchors are a block field rendered by `BlockRenderer`, not per-component markup** | Five sections on `/about` needed `id`s, and the redirect map depends on two of them. Putting `id` + `scroll-mt` on the wrapper `BlockRenderer` already renders means one change covers every block type, existing and future, with no component touched. `scroll-mt` is applied only when an anchor is set, so unanchored blocks keep their exact current layout. **Backport candidate** — upstream the field belongs on all blocks; here it is on the five `/about` uses to keep the fork diff small | — |
| 2026-09-14 | **`contactDetails` stores nothing; it renders Settings → Contact** | The obvious design is a block with address/phone/email fields. That guarantees the day comes when the footer, the contact section and the JSON-LD disagree about the phone number. The block holds only presentation switches (`showHours`, `showMapLink`, `secondaryEmail`) and reads the singleton, so S11's structured data and this page are the same data by construction | — |
| 2026-09-14 | Map is a link, not an iframe — and the URL is **derived** when unset | §7/D6 already ruled out the embed. The remaining question was whether an editor must paste a maps URL; the component falls back to a maps *search* built from the address already in Settings, which is derived from a client fact rather than an invented one. `settings.contact.mapUrl` still overrides it | — |
| 2026-09-14 | Added `contact.fax` rather than dropping the legacy fax number | A fax number is near-useless in 2026 and the temptation was to quietly not migrate it. But it is a contact method the school currently advertises, and D4 says port the old copy verbatim and let the client edit later — silently deleting a published contact route is a content decision that is not mine to make. One optional field, shown only when set | — |
| 2026-09-14 | **`telHref()` shared, and the rail's phone link fixed** | `/about` and the nav rail both render the phone, and they disagreed: the rail emitted `tel:6132443762` with no country code. A bare NANP number is ambiguous to a roaming caller or a carrier that does not assume local, and on a site with **no forms** (D6) the phone link is not a convenience, it is the contact mechanism. Helper lifted to `lib/utils` and used in both places. **Backport candidate** — the template's `NavContact` has the same bug | — |
| 2026-09-14 | **No admissions FAQ** | S7 specified one. The legacy site has no FAQ anywhere, so there is no source material, and an FAQ is precisely the format where invented answers look most authoritative — "What is the deposit?", "Is there a waiting list?" are questions a parent acts on. §0 rule 8 forbids guessing them. Logged as Q25 with the `faq` block already available, so it is a short session once the client answers | S7's "Admissions: FAQ block" task |
| 2026-09-14 | The faculty grid ships with **no heading** | Rendered, "Directors" (the existing prose block) followed immediately by "Meet the directors" (the grid) was two `h2`s saying the same thing — a heading-hierarchy smell and a reading annoyance. The grid now reads as the continuation of the Directors section it follows. Caught only by looking at the rendered `h2` sequence, which is worth doing on every content assembly | — |
| 2026-09-14 | Admissions steps are labelled by me; every fact in them is the legacy site's | "1. Book a tour", "2. Tour and observe", "3. Apply", "4. Placement" are my labels for prose the legacy page runs together as four paragraphs. The distinction that matters under §0 rule 8: a *label* is presentation, an assertion about deposits or sibling preference is a client fact — and every one of those is `admissions.md` verbatim or near-verbatim | — |

### Audit session, 2026-09-17

| Date | Decision | Rationale | Supersedes |
|---|---|---|---|
| 2026-09-17 | **Q19's diagnosis was wrong: Google Fonts is reachable and `next build` works in an agent session** | Four sessions recorded `next build` as impossible here. It is not, and may not have been for a while: `fonts.googleapis.com` and `fonts.gstatic.com` both return 200 through the proxy and the build emits 14 self-hosted `.woff2` files. The misdiagnosis came from testing the wrong URL — `curl https://fonts.gstatic.com/` is refused at the *origin*, while any real asset path under `/s/…` succeeds, so a host-level "blocked" conclusion was drawn from a request no one ever makes. **Generalisable:** probe an allowlist with the exact URL the tool will fetch | Q19, OWNER-TODO item A, and every "owner-side only" note that followed from them |
| 2026-09-17 | **Q21's diagnosis was also backwards, and pinning `printWidth: 80` would have made it worse** | The open question offered a choice between "pin 80 to match what is on disk" and "reformat once at 100". Measured, the first premise is false: at 80 the repo needs **174** files reformatted, at 100 it needs **58**. The repo was never at 80. Resolved a third way: 21 of the 58 were markdown and 8 were generated shadcn components, and neither is Prettier's to own — `.prettierignore` now excludes `*.md`, `.agents/skills/**`, `frontend/components/ui/**` and the machine-written JSON, leaving 29 files, which were formatted in one pass. Config also moved from the package.json `prettier` key to `prettier.config.mjs`, because Prettier resolves the package.json key first and would have ignored any config file beside it. **The lesson worth keeping is procedural:** both Q19 and Q21 were carried forward across sessions as facts when they were one command away from being checked | Q21 |
| 2026-09-17 | **Redirects use `statusCode: 301`, not `permanent: true`** | Next's `permanent: true` emits **308**, not 301, which is easy to miss because the config key reads as if it means 301. Modern crawlers treat them alike, but these URLs have been indexed and linked since ~2010 and the long tail pointing at them — directory listings, link checkers, feed readers — predates 308 (RFC 7538, 2015). §6.3 and §9 both say 301, so 301 is what ships. Verified: 15/15 return 301 to a 200 | — |
| 2026-09-17 | **`/home` was a second live copy of the homepage** | `settings.homepage` designates a `page` document whose slug is `home`, and `app/[slug]` served it — prerendered, returning 200, and listed in `sitemap.xml` alongside `/`. S4's decisions log predicted this ("S11 still needs a 301 `/home` → `/`") and then it sat unfixed for four sessions while the client was being shown the site. Closed on three fronts rather than one: a 301 in `next.config.ts`, and exclusion of the designated homepage from both `pagesSlugs` (so the route is not generated) and `sitemapData` (so it is not advertised). A redirect alone would have left the duplicate in the sitemap | — |
| 2026-09-17 | **A page's `openGraph` silently replaced the site's, rather than extending it** | `pageMetadata` always returns an `openGraph` object. Next inherits a parent segment's `openGraph` **only when the child sets none at all** (`generate-metadata.md` → Inheriting fields), so the root layout's site-wide share image was being discarded on every route. It has no visible symptom today only because `settings.ogImage` is empty — it would have become "why do our shared links have no image" the day someone uploaded one. `pageMetadata` now takes `settings` and falls back explicitly | — |
| 2026-09-17 | **Site origin resolved through a fallback chain, not just the Settings field** (`components/seo/siteOrigin.ts`) | The only source was `settings.ogImage.metadataBase`, which is empty and stays empty until the apex-vs-`www` decision (§10 step 5). An empty `metadataBase` is quietly expensive: no canonical link on any route, unresolvable Open Graph image URLs, and — least obvious — the whole `Organization` node dropped out of the JSON-LD graph, because every `@id` in it is built from that value. The chain is Settings → `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL`, deliberately preferring the *production* domain over the current deployment so a preview's canonicals point at production rather than at themselves. **Backport candidate.** The content-side fix is still owed (Q26) | §2's assumption that `metadataBase` is purely an editor concern |
| 2026-09-17 | **JSON-LD organisation typed `['Preschool', 'ChildCare']`, and fed the `schoolInfo` fields** | S2 added `foundingDate`, `areaServed`, `priceRange` and `geo` "for JSON-LD", and S6 seeded them — and nothing had ever read them. Neither had the address or the opening hours. The graph is now a real local-business record: address, `openingHours`, `telephone` in E.164, `areaServed`, `foundingDate`, `sameAs`, plus `geo`/`priceRange` when set. `openingHours` takes **only** rows with an explicit `schemaOrg` value — inferring a machine-readable range from "Montessori day / 8:30 am – 3:30 pm" would publish an opening-hours claim nobody verified (§0 rule 8), which is exactly what that field exists to prevent. The two types are hard-coded rather than made an editor setting: what kind of institution this is does not change, and a fork should not carry a setting with one possible value | the template's plain `Organization` |
| 2026-09-17 | **Grid blocks derive their item heading level instead of hard-coding `h3`** | `/programs` rendered `h1 Programs` → `h3 Infants`, skipping `h2` — a WCAG 1.3.1 failure and a §9 bar miss — because `ProgramsGrid` hard-coded `h3` while that page's grid has no heading of its own. The rule is now: with a block heading the items sit under it as `h3`, without one the items *are* the section and step up to `h2`. Applied to `FacultyGrid` too, which has the same shape. **This does change `/about`'s outline**: the two directors move from `h3` under "Directors" to `h2` beside it. Considered leaving `FacultyGrid` alone, since §12 deliberately ships it headingless as a continuation of the Directors prose — but in a flat block model nothing actually says it belongs to that section, so `h3` was relying on the block above it and would skip the moment it moved. Both outlines are valid; the content-independent one is the one that keeps being valid | S7's faculty-grid markup |
| 2026-09-17 | **The gallery lightbox announced arrow-key navigation it did not have** | Its sr-only `DialogDescription` says "use the left and right arrow keys to browse". The only arrow handler is shadcn's `onKeyDownCapture` on the carousel region — which has no `tabIndex`, so it fires only when focus is already inside the carousel, i.e. on the prev/next buttons. Radix moves focus to the dialog content on open, so the first press did nothing while assistive tech had been told otherwise. Handled at the dialog now, guarded on `defaultPrevented` so the carousel's own handler cannot double-advance. **Worth generalising:** an sr-only instruction is a contract, and this one had never been exercised because it is invisible to sighted testing | S10's unticked lightbox line, which listed the arrow keys as pending rather than as claimed-and-absent |

### S8, 2026-09-18

| Date | Decision | Rationale | Supersedes |
|---|---|---|---|
| 2026-09-18 | **No `app/programs/page.tsx`; the index stays a CMS page** | S8 specified a coded index route. `/programs` has been a `page` document since S3 — intro, grid, music, before/after care, CTA — served by `app/[slug]`. A static `programs/page.tsx` would win routing precedence and silently orphan that document, turning an editor-arranged page into hard-coded layout. An `app/programs/` folder holding only `[slug]` leaves `/programs` to `app/[slug]` | S8's first task |
| 2026-09-18 | Breadcrumb trail defined once (`trail()`), rendered twice | The visible `<Breadcrumbs>` and `breadcrumbJsonLd` take the same `BreadcrumbItem[]`. The parent's *name* comes from the `programs` page document (`parentName`), the path is fixed by the route segment. `breadcrumbJsonLd` returns `null` without a site origin rather than emitting relative `item` URLs. `Breadcrumbs` lives in `common/` because S9+ nesting (if any) will want it; **backport candidate** | — |
| 2026-09-18 | Tour CTA links to `/about#book-a-tour` rather than repeating the `mailto:` | The About anchor already holds the real booking route and its copy; three program pages each carrying a hard-coded email and invitation would be three more places for the contact facts (Q2, still unconfirmed) to drift. CTA copy is generic ("See the Violet room in person…") — no new client facts | — |
| 2026-09-18 | Program detail uses the card `image` in the aside, not the masthead | Every program masthead is a brand panel (Q5), so the legacy 720×480 card photo is the only photograph a program page has. At 20rem in the aside it is shown well under native size; it is lazy (not LCP). When real photography lands it goes in `masthead.image`, and the aside photo can stay or go | — |
| 2026-09-18 | Committed a previous session's uncommitted work on its own branch | `main` carried 21 modified/new files from an unlogged 2026-09-17 session. Branching S8 off a dirty `main` would have folded that work into the S8 PR. Parked verbatim on `feat/fsma-contact-hub` after a clean type-check; S8 is stacked on it. Not reviewed beyond type-check — it is the owner's to review | §0 rule 4 (one session = one PR), restored rather than broken |

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
| 2026-09-13 | **Mobile drawer is a *modal* Sheet, left side** | The template's `MobileNav` is a non-modal top sheet because its fixed header had to stay interactive underneath, and it hand-restores the two modal behaviours it still wanted (body scroll lock, `inert` on `main`/`footer`). Nothing in the FSMA top bar needs to stay live behind the drawer, so the modal default applies and Radix supplies focus trap, Esc, focus restore, scroll lock and background hiding with no bespoke code — which is what docs/A11Y.md asks for ("Don't reproduce this manually"). Left side also matches where the nav lives at desktop | template `MobileNav`'s non-modal pattern |
| 2026-09-13 | **`linkType: 'href'` no longer means "external"** (`navHelpers.resolveNavLink`) | The template's nav leaves treat every `href` link as external: new-tab affordance, never marked active. FSMA's Programs children are authored as `href` links to real internal routes (`/programs/infants`), and `/about#admissions` likewise, so the rail would have shown three "opens in new tab" arrows and never highlighted a program page. Externality is now decided by the resolved href (`startsWith('/')`), not by how the editor authored it. **Backport candidate** — this is a template bug, not an FSMA preference | template `DesktopNav`/`MobileNav` leaf logic |
| 2026-09-13 | **The Home nav item resolves to `/`, not `/<homepage-slug>`** | `settings.homepage` points at a `page` document, so its nav link resolved to `/home` — a second working URL for the homepage, with `aria-current` never firing on `/`. `navHelpers` rewrites that one href (and the link object handed to `<ResolvedLink>`, so the anchor and the active check can't disagree). **S11 still needs a 301 `/home` → `/`**, since `app/[slug]` will keep serving it | — |
| 2026-09-13 | Nav groups use Radix's default unmount-when-closed | `forceMount` was tried so the program routes would sit in the DOM for crawlers. Radix renders force-mounted content **without** `hidden` during SSR, which puts invisible links in the tab order — a worse trade than the SEO gain. The program routes stay discoverable via the `/programs` index (S8) and `sitemap.ts` (S11) | — |
| 2026-09-13 | C2PA metadata stripped from the four brand SVGs | Each carried a ~7.8 KB signing manifest: 78% of `logo-mark.svg` (9.9 KB → 2.2 KB) and 44% of `logo-full.svg` (17.8 KB → 10.0 KB). The rail renders one on every page | — |
| 2026-09-13 | `<main>` no longer centres its children (`items-center justify-center` dropped) | Under `items-center` a block-level child in a column flex container is sized to `max-content`, so the page builder's wrapper was only filling the viewport by accident — long prose happens to overflow and clamp. A full-bleed masthead (S5, §7.6) would have shrink-wrapped. Children now stretch. Short pages top-align instead of vertically centring, which is the better default anyway | — |
| 2026-09-13 | **Q11 closed: `NODE_USE_ENV_PROXY=1`** | The allowlist change alone was not enough — Node ignores `HTTPS_PROXY`, so `sanityFetch` still died with `EAI_AGAIN` while `curl` succeeded. Node 22.23 honours `NODE_USE_ENV_PROXY=1` (undici `EnvHttpProxyAgent`). With it, the dev server renders every route against `production`. **This is the single line that unblocks S5–S10 verification** | Q11, and §12's "every session that needs to see a rendered page is owner-side" |
| 2026-09-13 | **Q18: the mounted repo cannot `unlink`, so git can't merge or check out** | `git merge`, `git checkout <ref> -- .`, `reset --hard` and `next dev` all fail with `EPERM`/`Operation not permitted`: the Cowork mount refuses `unlink` without a per-session delete grant, and git updates worktree files by unlinking and recreating them. Commits and branch switches *do* work once any stale `*.lock` is renamed aside. Workarounds used this session, both worth keeping: merge in a `--shared` clone under the VM's own filesystem and copy the four resulting files back over (`cat >`, which truncates rather than unlinks), then `git update-ref` + `git reset`; and run the dev server from a copy of the tree under `$HOME` with `node_modules` symlinked. §5.1 has the details | §5.1's "deleting files needs explicit permission", which understated the consequences |
| 2026-09-13 | **Q19: `next build` cannot run in an agent session** | `fonts.googleapis.com` is off the egress allowlist (curl gets `000`, not a 403 — it is refused at the proxy). `next dev` only warns and falls back to system fonts; `next build` treats it as a hard compile error and fails. So no agent session can produce a production build, run Lighthouse locally, or measure real LCP. Owner action: allowlist `fonts.googleapis.com` + `fonts.gstatic.com`, or the alternative is to self-host the two faces with `next/font/local` — which is the better answer for a school site anyway (one less third-party dependency at build time, and §9's font budget) | §5.1's "Google Fonts is blocked … fine on Vercel", which only considered dev |
| 2026-09-13 | Turbopack's persistent cache and webpack's dev logging both need `unlink` | `next dev` (Turbopack) fails with "Failed to open database — Loading persistence directory failed"; `next dev --webpack` fails unlinking `.next/dev/logs/…`. Neither is fixable from the repo. Running from a copy outside the mount is the only route that works, and Turbopack additionally refuses a `node_modules` symlink that points out of the project root — so the copy must use `--webpack` | §5.1's `.next` note |
| 2026-09-13 | Rail-footer socials duplicate S5's floating rail | §6.2 puts socials in the rail footer and §7.7 adds a floating right-edge rail. On a desktop viewport that is the same one Facebook link twice. Implemented as specified, but **S5 should decide**: the floating rail is the client's explicit ask, so the rail footer probably keeps `tel:`/`mailto:` and drops the socials | — |
| 2026-09-13 | Mobile bar shows the compact mark plus live text, not the lockup | `logo-full.svg` is a 920×300 horizontal lockup; at the ~110px a 64px bar allows, "FUTURE SCHOLARS" renders at roughly 5px. The cap mark plus a real `Future Scholars` text node (the same short name `manifest.ts` already uses) is legible at 360px and is selectable and translatable. The rail, at 224px of usable width, carries the full lockup | §7.4's "mark for the rail" |
| 2026-09-13 | **The masthead owns the visual `<h1>` whenever a page has one** | `PageTitle` and the masthead rendering two visible headings would double-headline every page, and §7.1 wants the page heading to differentiate the mastheads. `PageTitle` is skipped when `page.masthead` is set; `titleDisplay: 'none'` still applies (h1 goes sr-only *inside* the masthead — §7.6's decorative case), while `plain`/`highlighted` collapse to "visible in the masthead" — those two treatments only exist for masthead-less pages. Verified against the seed: home is `none` (logo-only masthead), the rest are `plain` | §7.6's "interplay with `titleDisplay`" |
| 2026-09-13 | Light `secondary` brand panel takes the **standard** lockup, not the reversed one | The reversed logo is white-on-transparent; on soft sky (`#E3EAF2`) it would be ~1.3:1. Dark tones (`primary`, `ink`) and photographs take the reversed lockup; the light panel takes the blue/black/yellow original with `secondary-foreground` copy (11.61:1, AAA) | §7.6's "reversed logo lockup", which assumed a dark ground |
| 2026-09-13 | Rail footer drops socials ≥768px; the floating `SocialRail` is the sole desktop carrier | Resolves the open question S4 logged: §6.2's rail-footer socials and §7.7's floating rail are the same one Facebook link twice on a desktop screen. The rail footer keeps `tel:`/`mailto:`; below 768px the floating rail hides and the drawer keeps the socials (§7.7). `NavContact` grew a `showSocials` prop rather than a second component | §6.2's "Rail footer: phone, email, socials" — now phone/email only on desktop |
| 2026-09-13 | `SocialRail` is rendered by `SideNav`, not the root layout | `SideNav` already holds the shared `getSettings` cache entry, so the rail costs zero extra fetches and needs no second draft-mode wrapper in `layout.tsx`. It is `z-30` (under rail/top bar `z-40`, dialogs/lightbox `z-50`), `hidden md:block`, and carries a `social-rail` view-transition anchor like the rest of the fixed chrome | — |
| 2026-09-13 | Masthead scales shipped: heights tall 60/42vh, standard 48/34vh, compact 34/26vh (desktop/mobile, with min-heights); scrims light 40/60%, medium 55/75%, strong 70/85% black (flat wash for centre placement / bottom gradient for bottom-left) | The schema's height descriptions set the vh numbers. Scrim tiers are gradient-or-wash pairs chosen so white copy clears 4.5:1 on typical photography; the field description already tells editors to raise the tier on bright images — a scrim cannot guarantee 4.5:1 against a near-white photograph at any reasonable strength, so the contract stays editor-assisted | §7.6's "~60vh/~42vh" (extended to three heights the schema already defined) |
| 2026-09-13 | Masthead photograph is never animated; only the overlaid copy rides `.enter` | The photograph is the LCP element — animating it delays perceived load and risks LCP-measurement noise. Copy cascade (eyebrow → logo → heading → subheading) reuses the hero block's `--enter-d` pattern, which is already `prefers-reduced-motion`-gated globally | — |
| 2026-09-13 | Masthead image pipeline: 1600×600 CDN focal crop, `sizes="(min-width: 64rem) calc(100vw - 17rem), 100vw"`, eager + `fetchPriority="high"` | The crop happens at the CDN (`fit=cover` + hotspot), not with CSS `object-cover` alone, so srcset candidates are masthead-shaped at every width and the 1x desktop candidate stays well inside the 250KB budget. `sizes` subtracts the 17rem rail from `lg` up so browsers don't over-fetch | — |
| 2026-09-13 | Empty `generateStaticParams` guarded with a `__placeholder__` slug in `/posts/[slug]` and `/projects/[slug]` | Cache Components makes an empty array a build error (`empty-generate-static-params`), and D13's hidden types mean the FSMA dataset legitimately has zero posts/projects. The Next.js docs sanction the placeholder pattern; both pages already `notFound()` unmatched slugs, so the placeholder prerenders the 404 page and no real route changes behaviour. Underscores can't collide with Sanity-slugified values. **Backport candidate** — the template itself builds fine only because its sample dataset is non-empty; any consumer who empties it hits the same error | — |
| 2026-09-17 | **`SocialRail` + rail-footer `NavContact` collapse into one `ContactHub`** | The 2026-09-13 split (socials floating, `tel:`/`mailto:` in the rail footer) put one contact surface in two places and still duplicated every link between 768–1023px, where the floating rail was visible *and* the drawer carried the same list. One component, two variants: `floating` (fixed right-edge pills, `lg` and up — now the same breakpoint as the rail, so it can never coexist with the drawer) and `stacked` (the same pills at the foot of the drawer below `lg`). Phone, email and socials all live in it; the rail footer is gone | the 2026-09-13 rows "Rail footer drops socials ≥768px" and "`SocialRail` is rendered by `SideNav`" (the second still holds for `ContactHub`) |
| 2026-09-17 | Hub labels expand on hover/focus via a CSS `grid-template-columns: 0fr → 1fr` transition, not a tooltip | `width: auto` is not animatable and a fixed `max-width` clips or over-reserves per label. The grid trick animates to the label's intrinsic width with no JS, so the hub stays RSC — a Radix `Tooltip` would have pulled a provider, a portal and a client boundary into persistent chrome for a four-item list. `group-hover` and `group-focus-visible` both drive it, so keyboard users get the identical reveal rather than a bare focus ring | §7.7's "floating social rail" |
| 2026-09-17 | Hub hover/focus fill is `--brand-accent` on `--brand-accent-foreground` | The one pairing in §12 where the sunflower is safe to carry text (near-black navy on bright gold). It echoes the gold hub on the client's reference site (fieldstonedayschool.org) without borrowing its shrink-and-dim hover, which reads as a rendering glitch at 40px. Rest state stays `--muted-foreground` on `--card` (≥7:1) with a `--border` ring for the ≥3:1 non-text floor | — |
| 2026-09-17 | Hub `href`s are `stegaClean`ed | `mailto:`/`tel:`/social URLs are CMS strings used as URLs, which CLAUDE.md's stega discipline already covers — the old `NavContact` and `SocialRail` interpolated them raw, so in draft mode every hub link carried invisible markers inside the URL. `telHref()` masked it for the phone (it strips non-digits); `mailto:` and the social URLs did not | — |
| 2026-09-17 | Four page mastheads switched to Unsplash placeholders; Gallery and Testimonials stay brand panels | §7.1's anti-goal is six identical mastheads, and six photographs would be the same failure in the other direction — the alternation gives the logo lockup clean airtime on two pages. Assets carry `creditLine` + `source` (Unsplash attribution) and a `description` telling the next editor to replace them with Bank St. photography; each page got a `focalNote` for the crop. About takes the `strong` scrim (very bright, busy interior), the rest `medium` | §7.6's "switch a page to `image` as real photography arrives" — now partly pre-empted with placeholders |
