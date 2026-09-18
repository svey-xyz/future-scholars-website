# Keeping a fork in sync with the template

`sanity-next-clean` is a **template**. Other sites (e.g. `soule-directory-site`) are **git
forks** of it and are updated *from* it: the template is upstream, the forks are downstream.
Site-specific work flows template → fork, never the reverse. The one sanctioned reverse flow
is a **deliberate backport** of a general fix — see "Backporting general fixes" below; it
goes through a branch + PR on the template, never a direct push to `main`.

## Remotes: a fork's `origin` is NEVER this template

**Incident, 2026-07-12:** a fork's working copy still had this template as `origin`; a
routine `git push` fast-forwarded 11 site-specific commits onto template `main` (silently —
fast-forwards don't warn), replacing the demo content model. `main` was reset to `1d40509`.

Rules:

- `origin` points at the fork's own repo (GitHub or Gitea). The template is registered as
  `upstream` and is fetched from, never pushed to.
- First thing in any fork working copy — and before any push an agent makes — run
  `git remote -v` and verify `origin` is not `…/sanity-next-clean`. If it is, fix it first:
  `git remote rename origin upstream && git remote add origin <fork-url>`.
- Keep `main` protected in the template's Gitea repo settings so a stray push is rejected.

## Rule: sync from upstream before editing a fork

**Before making any edit to a fork of `sanity-next-clean`, first check for upstream template
changes and merge them in.** Editing a stale fork re-introduces bugs already fixed upstream
and creates avoidable merge conflicts. Sync first, then build.

Agents: treat this as a hard precondition. `git fetch` the template and report whether the
fork is behind before proposing any change.

## How to sync — use git's merge, never hand-copy files

A real three-way `git merge` applies every non-conflicting upstream change automatically
(lockfiles included), preserves history (the fork keeps a true merge commit with the
template as a parent), and makes the next sync cheap. Copying files by hand silently drops
or duplicates changes — don't.

From a fork's working copy, with `main` up to date:

```bash
# one-time: register the template as an 'upstream' remote
git remote add upstream https://gitea.tarte.svey.xyz/svey/sanity-next-clean.git

git fetch upstream
git switch -c sync/template-main
git merge upstream/main      # resolve conflicts (see "Handling divergence")
git push origin sync/template-main
# then open a PR: sync/template-main → main
```

If you can't push from where the merge happens, produce it locally and hand off a git
bundle — `git bundle create sync.bundle sync/template-main` — for someone to `git fetch`
from the bundle and push.

## Backporting general fixes (fork → template)

Forks accumulate improvements the template should have. Periodically (or after any burst of
fork work) review fork commits since their merge-base with the template and split them:

- **Backport:** bug fixes, a11y/perf improvements, doc corrections, schema/utility patterns
  any site would want (e.g. a validation fix, a stega-discipline miss, a shadcn component
  extension). Land them on a `backport/*` branch on the template via PR — cherry-pick or
  re-author against template code, template-neutral styling only. Larger ports become
  template issues first (see #12–#20 for the 2026-07-17 review's batch).
- **Leave in the fork:** branding, theme tokens, content-model changes specific to the
  site, deploy-config specifics (project IDs, Vercel build wiring).

After a backport lands in the template, forks pick it up through the normal sync — git
recognises cherry-picked/re-authored changes and merges them cleanly.

## Handling divergence

Most files fast-forward to the template with no conflict. Conflicts arise only where a fork
has **intentionally customized** a file the template also changed. Resolve by **keeping the
fork's customization and layering the template's change on top** — never discard a fork's
deliberate divergence just to "win" the merge.

Keep this registry of known per-fork divergences current so future syncs stay predictable:

| Fork | File | Divergence | On merge |
| --- | --- | --- | --- |
| soule-directory-site | `frontend/app/components/layout/Header.tsx` | custom `HeaderLogo` + `select-none` | keep the fork's structure; take the template's className changes (e.g. `z-50 → z-40`) |
| vsc-website (GitHub `svey-xyz/vsc-website`) | content model + `frontend/app/components/**` | full VSC port: flat pageBuilder blocks, `articles/` + `blocks/archive/` trees, own image stack (`common/Image` + custom loader), VSC theme, `@breadcrumb` parallel route | template demo types/components were removed — expect large renames; sync mostly touches `sanity/lib`, docs, config |
| murphy-website (`svey/murphy-website`, branch `feat/brand-book`) | theme + layout (`globals.css`, `Header/Footer`, `MobileNav`), music types (`release`/`event`), `seo/`, `releases/` | Murphy design language; dark default; discography/tour blocks | keep murphy structure; take template changes beneath it — murphy forked at `81044c4`, so first sync crosses the live-caching rework |
| future-scholars-website (`svey-xyz/future-scholars-website`) | `studio/src/schemaTypes/objects/contact.ts` | added `address` (street/city/region/postalCode/country), `hours[]` (days/time/schemaOrg), `mapUrl` | additive — take the template's changes and keep the extra fields |
| future-scholars-website | `studio/src/schemaTypes/objects/masthead.ts` (new), `schemaTypes/index.ts` | FSMA-only `masthead` object, registered in the schema array | new file; on merge only the `index.ts` import/array lines conflict |
| future-scholars-website | `studio/src/schemaTypes/documents/page.ts` | `masthead` page-level field (build plan D12); optional `seo` field (S6); the three archive blocks **stay** in `pageBuilder.of` but are rejected by a fork-local validation guard; `archiveField` spread with `hidden: true` rather than edited in `shared.ts` | keep the FSMA field list and the guard; take template changes to the surrounding validation/options. Re-enabling archives means deleting the guard and dropping the `hidden` override — the `of` entries are already there |
| future-scholars-website | `studio/src/schemaTypes/singletons/settings.tsx` | `schoolInfo` fieldset: `foundingDate`, `areaServed[]`, `priceRange`, `geo{lat,lng}` for JSON-LD | additive — keep the fieldset and fields |
| future-scholars-website | `studio/src/structure/index.ts` | `FSMA_HIDDEN_TYPES` (`post`, `project`, `technology`, `category`) folded into `DISABLED_TYPES` and into the new-document template filter | keep the constant; take template changes to the structure body. Unhiding is deleting one array |
| future-scholars-website | `frontend/app/globals.css` | FSMA palette in `:root` and `.dark`; `--brand-accent{,-foreground,-strong}` added and exposed in `@theme inline`; `--radius` 0.75rem; `h1`–`h4` bound to `--font-display` in `@layer base`; FSMA view-transition anchors inside the view-transition block (`site-rail`, `site-topbar`, `contact-hub`) | keep the FSMA token values **and** the FSMA anchor rules; take template changes to the rest of the view-transition block and utilities. A template palette change is **not** taken |
| future-scholars-website | `frontend/sanity/lib/queries.ts` | `masthead` projected in `getPageQuery` (S5) | keep the field line; take template changes to the rest of the query |
| future-scholars-website | `frontend/app/components/blocks/CachedPage.tsx` | renders `Masthead` when `page.masthead` is set; `PageTitle` becomes conditional (masthead owns the visual h1); flush top margin under a masthead (S5) | keep the masthead branch; take template changes around it |
| future-scholars-website | `frontend/app/page.tsx`, `frontend/app/[slug]/page.tsx` | draft-mode fallbacks reshaped to the standard-height masthead (S5) | keep the FSMA fallback shape; take template changes to the route logic |
| future-scholars-website | `frontend/app/components/layout/{SideNav,SideNavLinks,SideNavMobile,ContactHub,BrandMark,Masthead}.tsx` (new) | FSMA app shell (S4) and masthead/contact chrome (S5). `ContactHub` replaced the earlier `NavContact` + `SocialRail` pair | new files, no conflict |
| future-scholars-website | `frontend/app/{posts,projects}/[slug]/page.tsx` | `generateStaticParams` returns `__placeholder__` when the dataset has no posts/projects (Cache Components rejects an empty array — Q20) | keep the guard; **backport candidate** — if the template takes it upstream, accept the template's version wholesale |
| future-scholars-website | `frontend/app/layout.tsx` | Outfit added as `--font-display`; `ThemeProvider` + `getThemeScript` forced to light (D14); `viewport.themeColor` collapsed to one value | keep the forced-light options in **both** places; take template changes to the surrounding shell |
| future-scholars-website | `frontend/app/components/layout/Footer.tsx` | `ThemeToggle` import and usage removed (component file untouched) | keep the removal; take template changes to the rest of the footer |
| future-scholars-website | `frontend/app/manifest.ts`, `app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png`, `public/icons/*`, `public/brand/*` | FSMA brand assets and manifest values | ours wholesale — these are brand files, never take the template's |
| future-scholars-website | `studio/src/schemaTypes/documents/{program,testimonial}.ts`, `objects/programsGrid.ts` (new) | FSMA content model for programs and parent testimonials | new files; only the `index.ts` and `page.ts` registration lines conflict |
| future-scholars-website | `studio/src/schemaTypes/documents/person.ts` | `role`, `credentials[]`, `bio`, `order` added; preview subtitle shows the role | additive — keep the fields, take template changes around them |
| future-scholars-website | `studio/src/schemaTypes/objects/testimonials.ts` | `source` (manual \| documents), `featuredOnly`, `limit`; the inline array is hidden and its `required` relaxed when sourcing from documents | keep the source switch; the template's inline array is untouched underneath it |
| future-scholars-website | `studio/src/schemaTypes/objects/seo.ts` (new), `documents/page.ts`, `schemaTypes/index.ts` | optional `seo` object on `page` — `metaTitle`, `metaDescription`, `ogImage`, `noIndex` (S6) | **backport candidate**, not FSMA-specific. New file; only the `index.ts` and `page.ts` registration lines conflict. If the template takes it upstream, accept the template's version wholesale |
| future-scholars-website | `frontend/app/components/seo/pageMetadata.ts` (new), `app/page.tsx`, `app/[slug]/page.tsx` | shared `pageMetadata()` consumes the `seo` object; the homepage passes `siteTitle` so its `<title>` is emitted as `absolute` (S6) | **backport candidate** — the bare-`<title>Home</title>` bug is the template's too. Keep the FSMA wiring until the template has its own |
| future-scholars-website | `frontend/app/components/blocks/ProgramsGrid.tsx` (new), `BlockRenderer.tsx`, `blocks/index.ts` | renderer for the FSMA-only `programsGrid` block (S6) | new file; only the registry import/entry lines conflict |
| future-scholars-website | `frontend/app/components/blocks/Testimonials.tsx` | normalises the template's inline array and FSMA's `testimonial` documents to one shape; `limit` applied in JS (S6) | keep the normalisation; take template changes to the card markup, which is untouched |
| future-scholars-website | `frontend/sanity/lib/queries.ts` | `seo` projected in `getPageQuery`; `programCardFields` / `testimonialCardFields` fragments; `programsGrid` and `testimonials` block projections (S6) | keep the FSMA fragments and projections; take template changes to the rest of the query |
| future-scholars-website | `studio/src/schemaTypes/objects/shared.ts` | `anchorField` added (S7) | **backport candidate** — upstream it belongs on every page-builder block. Additive; take template changes to the other shared fields |
| future-scholars-website | `studio/src/schemaTypes/objects/{infoSection,callToAction,featuresGrid,programsGrid}.ts` | `anchorField` spread into each (S7) | one added line per file — keep it, take everything else |
| future-scholars-website | `frontend/app/components/blocks/BlockRenderer.tsx` | `programsGrid`/`facultyGrid`/`contactDetails` in the registry; wrapper renders `id={anchor}` + `scroll-mt` (S7) | keep both; the registry object and the wrapper `div` are the only conflict points |
| future-scholars-website | `studio/src/schemaTypes/objects/{contactDetails,facultyGrid}.ts` (new), `frontend/app/components/blocks/{ContactDetails,FacultyGrid}.tsx` (new) | FSMA About-page blocks (S7) | new files; only the `index.ts` / `page.ts` / registry lines conflict |
| future-scholars-website | `studio/src/schemaTypes/objects/contact.ts` | `fax` added (S7), on top of the S2 address/hours/mapUrl fields | additive — take the template's changes and keep the extra fields |
| future-scholars-website | `frontend/lib/utils.ts`, `frontend/app/components/layout/ContactHub.tsx` | `telHref()` helper; the hub's phone link uses it instead of emitting a country-code-less `tel:` (S7) | **backport candidate** — the template's `NavContact` has the same bug. Keep the FSMA fix until upstream has its own |
| future-scholars-website | `prettier.config.mjs` (new), `package.json`, `.prettierignore` | Prettier config moved out of the package.json `prettier` key (which Prettier resolves first, making any config file dead); `.prettierignore` extended to exclude markdown, `.agents/skills/**`, `frontend/components/ui/**` and machine-written JSON (audit 2026-09-17, Q21) | **backport candidate** — nothing FSMA-specific. If the template pins a width or moves its own config, take the template's and delete this |
| future-scholars-website | `frontend/next.config.ts` | `redirects()` — the §6.3 legacy `.htm` map plus `/home` → `/`, as `statusCode: 301` rather than `permanent: true` (which emits 308) | site-specific URL map; keep it wholesale and take template changes to the rest of the config object |
| future-scholars-website | `frontend/app/components/seo/siteOrigin.ts` (new), `app/layout.tsx`, `app/components/seo/JsonLd.tsx` | site origin resolved from Settings → `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL`; `siteUrl()` delegates to it; `metadataBase` comes from it | **backport candidate** — the template has the same gap (an unset `metadataBase` drops the whole `Organization` node). New file; `layout.tsx` and `JsonLd.tsx` conflict on a few lines each |
| future-scholars-website | `frontend/app/components/seo/JsonLd.tsx` | organisation typed `['Preschool', 'ChildCare']` and fed `contact.address`, `contact.hours[].schemaOrg`, `telephone`, `areaServed`, `foundingDate`, `geo`, `priceRange` | the *field plumbing* is generic and a backport candidate; the two schema.org **types** are FSMA's and must stay ours on merge |
| future-scholars-website | `frontend/app/components/seo/pageMetadata.ts`, `app/page.tsx`, `app/[slug]/page.tsx` | `path` → `alternates.canonical` + `og:url`; `settings` passed in so the site-wide OG image survives (Next drops a parent's `openGraph` once a child sets one) | **backport candidate** — both are template bugs. Keep the FSMA wiring until upstream has its own |
| future-scholars-website | `frontend/sanity/lib/queries.ts` | `pagesSlugs` and `sitemapData` exclude the designated homepage's own slug, so it is neither prerendered nor advertised at a second URL | **backport candidate** — any consumer using `settings.homepage` has the same duplicate. Keep the filter; take template changes to the rest of the query |
| future-scholars-website | `frontend/app/{sitemap,robots}.ts` | prefer the configured site origin over the request host, falling back to the host | **backport candidate**; keep the `resolveSiteOrigin(...) ??` line and take template changes around it |
| future-scholars-website | `frontend/app/components/blocks/{ProgramsGrid,FacultyGrid}.tsx` | item headings step up to `h2` when the block has no heading of its own, so a headingless grid cannot skip a level | FSMA blocks (new files) — no conflict, but the *pattern* is a backport candidate for the template's own grid blocks |
| future-scholars-website | `frontend/app/components/blocks/gallery/GalleryLightbox.tsx` | arrow-key navigation handled on the dialog (shadcn's carousel handler never fires there), guarded on `defaultPrevented` | **backport candidate** — the template's lightbox makes the same sr-only promise and does not keep it |
