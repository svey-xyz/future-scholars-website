# Phase 0 — Modernization & conventions audit

**Issue:** SVE-30. **Date:** 2026-06-05. **Scope:** Verify/align the repo to latest **stable** Next 16 / React 19 / Tailwind v4 / shadcn / Sanity v5 conventions **before** feature work (SVE-31+). This is a **conformance + dependency audit + doc baseline**, _not_ an upgrade — the lockfile is intentionally not mutated here (see [Dependency audit](#dependency-audit)).

**Verification status (offline):** `type-check` ✅, `lint` ✅ (after the one fix below), TypeGen ✅ (extract + generate, no drift). `next build` was **not** run — it fetches Google Fonts (`next/font/google`) and the sandbox is offline, so a full build is expected to fail on network and tells us nothing about conformance. Run the build on a networked machine before release.

---

## Summary verdict

The repo is **already on current stable lines** across the board. No deprecated APIs are in use. One pre-existing **lint error** (not introduced by this audit) was fixed as part of conformance — see [Fix applied](#fix-applied). Everything else is recorded as findings / recommendations; no behavioral or dependency changes were made beyond that single fix.

---

## Dependency audit

Read-only (`npm outdated` at root + `npm view <pkg> version` against the registry). **No versions were bumped** — the committed `package-lock.json` is macOS-only and mutating it here corrupts the user's environment. Treat the "behind" rows as **recommendations to apply on a networked machine** (`npm outdated` / `npm update` / targeted installs), then re-run the full verification incl. `next build`.

> Note on tooling: per-workspace `npm outdated` returns empty because deps are hoisted to the root `node_modules`; the **root** `npm outdated` + direct registry comparison below is authoritative.

### On latest stable (no action)

| Package | Installed | Latest | Notes |
| --- | --- | --- | --- |
| `next` | 16.2.7 | 16.2.7 | Current. |
| `react` / `react-dom` | 19.2.7 | 19.2.7 | Current. |
| `sanity` (Studio + frontend) | 5.30.0 | 5.30.0 | Current v5 line. |
| `@sanity/client` | 7.22.1 | 7.22.1 | Current. |
| `@sanity/vision` | 5.30.0 | 5.30.0 | Current. |
| `@sanity/assist` | 6.0.7 | 6.0.7 | Current. |
| `tailwindcss` / `@tailwindcss/postcss` | 4.3.0 | 4.3.0 | Current v4. |
| `shadcn` (CLI) | 4.10.0 | 4.10.0 | Current. |
| `tw-animate-css` | 1.4.0 | 1.4.0 | Current. |
| `sonner`, `embla-carousel-react`, `tailwind-merge`, `clsx`, `cva`, `styled-components`, `rxjs`, `@types/node`, `@types/react-dom` | — | — | All at latest. |

### Behind latest (recommendations only — do NOT apply in-sandbox)

| Package | Installed | Latest | Δ | Recommendation |
| --- | --- | --- | --- | --- |
| `next-sanity` | 12.4.5 | 13.0.11 | **major** | Defer. v13 is a major; review its changelog (Live / `defineLive` / visual-editing entrypoints) before bumping — the Live + Presentation wiring here is load-bearing. Pin-test on a branch. |
| `typescript` | 5.9.3 | 6.0.3 | **major** | Defer. TS 6.0 is a major; the repo declares `typescript: 5.9.3`. Validate `tsc --noEmit` in both workspaces + Sanity TypeGen compatibility before adopting. |
| `eslint` | 9.39.4 | 10.4.1 | **major** | Defer until `eslint-config-next` / `@sanity/eslint-config-studio` officially support ESLint 10. Flat config is already in use (`eslint.config.mjs`), so the migration surface is small, but the shared configs gate it. |
| `eslint-config-next` | 16.2.2 | 16.2.7 | patch | Safe patch bump to match `next` 16.2.7 — apply with the next networked `npm install`. |
| `@types/react` | 19.2.14 | 19.2.16 | patch | Trivial patch. |
| `npm-run-all2` (root dev dep) | 5.0.2 | 9.0.1 | **major** | Dev-only (parallel `dev:*`). Several majors behind; low risk but verify `run-p` flags still parse after bump. |
| `date-fns` | 4.1.0 | 4.4.0 | minor | Safe minor. |
| `@vercel/speed-insights` | 1.3.1 | 2.0.0 | **major** | Defer; review v2 migration notes (used in `app/layout.tsx`). |

`@sanity/cli` is pinned to `6.6.0` via a root `overrides` entry — intentional; leave as-is unless a Studio CLI feature requires it.

---

## Next 16 conformance

Docs consulted: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`, `.../05-config/01-next-config-js/viewTransition.md`, `.../cacheComponents.md`, `.../01-getting-started/01-installation.md` (Turbopack default).

- **`middleware` → `proxy` rename.** Next 16 deprecates the `middleware.ts` file convention and renames it to `proxy.ts`. **The repo has neither `middleware.*` nor `proxy.*`** (it doesn't need request-level interception). ✅ Conformant. _If_ a proxy is ever added, use `frontend/proxy.ts` exporting `proxy(request: NextRequest)` — not `middleware`.
- **View Transitions.** `experimental.viewTransition: true` is set in `frontend/next.config.ts` — this is the correct (still `experimental`-namespaced) flag that enables Next's integration of React's `<ViewTransition>`. ✅ Matches docs and `docs/TRANSITIONS.md`. `<Link transitionTypes>` (used app-wide) requires Next ≥ 16.2 — satisfied.
- **Turbopack default.** Next 16 makes **Turbopack the default bundler** for `next dev` and `next build`; no flag is needed (Webpack now requires opt-out via `--webpack`). The repo's scripts are plain `next dev` / `next build` — ✅ correct, riding the default. No `turbopack`/`webpack` config block present (none needed).
- **Caching posture — PPR / Cache Components.** `cacheComponents` is **not** enabled (no `cacheComponents: true` in `next.config.ts`), and there is no `experimental.ppr` / `experimental.dynamicIO` / `experimental.useCache` (all removed/renamed in v16 — and absent here, so nothing to migrate). ✅ This is the **correct posture for this app**: data is fetched via `sanityFetch` + `<SanityLive>` and is dynamic by design (draft mode, Presentation, live revalidation). Enabling Cache Components / PPR would layer `use cache` semantics on top of an always-live fetch model and is **out of scope** — revisit only if a deliberate static-shell strategy is wanted later. Note `<SanityLive>` revalidations are React Transitions; see the `default="none"` gotcha in `docs/TRANSITIONS.md`.
- **No other deprecated Next APIs** found in `app/` (no legacy `next/legacy/image`, no `getServerSideProps`/`getStaticProps` — App Router throughout; metadata + static params already pass `stega: false`).

**Follow-up:** none required for v16 conformance. If `next-sanity` is later bumped to v13, re-verify the Live/visual-editing entrypoints against v16.

---

## shadcn conformance

Doc/source consulted: `frontend/components.json` vs the current shadcn schema (`https://ui.shadcn.com/schema.json`, referenced by the file).

- `style: "new-york"`, `rsc: true`, `tsx: true`, `tailwind.css: "app/globals.css"`, `tailwind.config: ""` (correct for Tailwind v4 — no JS config), `cssVariables: true`, `baseColor: "neutral"`. ✅ All valid against the current schema.
- **`iconLibrary: "heroicons"`** is set. ✅ Confirms the "Heroicons only, no lucide" rule — `lucide-react` is **not** a dependency (verified in `frontend/package.json`). New primitives pulled via the CLI will map icons to Heroicons.
- shadcn **CLI** is at 4.10.0 (latest); installed primitives live in `frontend/components/ui/` per convention.
- **Drift to note (non-breaking):** the design tokens in `app/globals.css` use **HSL channel** triplets (e.g. `--background: 0 0% 100%`), not the **OKLCH** format that the current shadcn init emits by default. This is a valid, deliberate choice (the a11y contrast measurements in `docs/A11Y.md` are computed against these HSL values) and does **not** need changing. Flagged only so that anyone re-pulling a primitive from a fresh `shadcn add` is aware the token format differs from upstream defaults and should not "helpfully" convert the palette to OKLCH without re-measuring every contrast pair (see `docs/A11Y.md`). **No re-pull of primitives was performed** (offline; and none was trivially needed).

**Follow-up:** none required.

---

## Tailwind v4 conformance

Source consulted: `frontend/app/globals.css`, repo-wide search for `tailwind.config.*`.

- **CSS-first config is the single source of truth.** `app/globals.css` opens with `@import 'tailwindcss';`, declares tokens via `@theme inline { … }` (line ~53), pulls the typography plugin via `@plugin '@tailwindcss/typography'`, and defines the dark variant via `@custom-variant dark (&:where(.dark, .dark *))`. ✅
- **No `tailwind.config.{js,ts,mjs,cjs}` anywhere** in the repo (verified by find, excluding `node_modules`). ✅ Matches the "no JS Tailwind config" rule and the empty `tailwind.config` in `components.json`.
- **`tw-animate-css` usage is correct.** Imported via `@import 'tw-animate-css';` (the v4-native CSS-import path — _not_ the legacy `@plugin`/JS-plugin route). It supplies the `animate-*` / `fade-*` / Radix data-state animation utilities used by `tw-animate-css` and honours `prefers-reduced-motion` automatically (relied on by `docs/A11Y.md` and `docs/TRANSITIONS.md`). ✅
- PostCSS pipeline uses `@tailwindcss/postcss` 4.3.0 (+ `autoprefixer`, `postcss`) — current. ✅

**Follow-up:** none required.

---

## Sanity v5 conformance

Sources consulted: `frontend/sanity/lib/{live,queries,client,token}.ts`, `app/layout.tsx`, `studio/sanity.config.ts`; ran the full TypeGen workflow.

- **TypeGen workflow is green and drift-free.** Ran `sanity schema extract --enforce-required-fields --path ../sanity.schema.json` (studio) then `sanity typegen generate` (frontend): **8 queries, 56 schema types**, "Successfully generated types". `git status` shows **no diff** in `sanity.schema.json` or `frontend/sanity.types.ts` after regeneration → the committed generated artifacts are up to date. ✅ (Both run offline.)
- **Live / Presentation wiring is healthy.**
  - `frontend/sanity/lib/live.ts` exports `{sanityFetch, SanityLive}` via `defineLive` from `next-sanity/live`, with `serverToken` + `browserToken` (browser token only shared under a valid Draft Mode session). ✅
  - `app/layout.tsx` renders `<SanityLive onError={handleError} />` unconditionally (required for live updates), and gates `<VisualEditing />` + `<DraftModeToast />` behind `draftMode().isEnabled`. ✅
  - `studio/sanity.config.ts` wires the **Presentation Tool** with `previewUrl` (origin = `SANITY_STUDIO_PREVIEW_URL`, enable route `/api/draft-mode/enable`), `mainDocuments` for `/`, `/:slug`, `/posts/:slug`, and `locations` resolvers for `settings`/`page`/`post` — mirroring the Next routes. `resolveHref` covers `post`/`page`. ✅
  - All queries use `defineQuery` in `frontend/sanity/lib/queries.ts` (so TypeGen can type results); metadata/static-params fetches pass `stega: false`. ✅
- **No deprecated Sanity APIs.** Schema uses `defineType`/`defineField`/`defineQuery`; Studio config uses `defineConfig` + `structureTool` + `presentationTool` (v5 imports from `sanity/structure` and `sanity/presentation`). ✅

**Follow-up:** none required. Keep TypeGen on the `predev`/`prebuild` hooks; re-run after any schema change **before** writing queries against new fields (else results type as `unknown`).

---

## Fix applied

One change was made to bring the **lint baseline to green** — it was failing on `main` before this branch, so it is a genuine Phase 0 conformance gap (a new React 19 / Next 16 lint rule), not a regression introduced here.

- **File:** `frontend/app/components/ThemeToggle.tsx`
- **Error:** `react-hooks/set-state-in-effect` (from `eslint-plugin-react-hooks` v6, surfaced via `eslint-config-next` on the Next 16 / React 19.2 line) flagged the hydration-gate pattern `useEffect(() => setMounted(true), [])` as cascading-render-prone.
- **Fix:** replaced the `useState` + `useEffect(setState)` mount gate with `useSyncExternalStore(noopSubscribe, () => true, () => false)` — the idiomatic React 19 hydration-safe pattern (server snapshot `false`, client snapshot `true`, no synchronous setState in an effect). **Behavior, DOM output, a11y, and the placeholder are identical**; only the mechanism changed. No suppression comment used.
- **Result:** `lint` now exits 0 (0 errors). 15 pre-existing `@typescript-eslint/no-unused-vars` **warnings** remain (in `app/page.tsx`, `app/[slug]/page.tsx`, `app/components/Onboarding.tsx`) — non-blocking, out of scope for this audit. See [Known non-blocking warnings](#known-non-blocking-warnings).

### Known non-blocking warnings

ESLint reports **15 warnings, 0 errors** (warnings do not fail the lint script). They are dead imports/bindings, mostly in `app/page.tsx` (a heavily-edited demo page) plus one each in `app/[slug]/page.tsx` (`title`) and `app/components/Onboarding.tsx` (`studioUrl`). Cleaning these is trivial but cosmetic; left for a follow-up so this audit stays a no-behavioral-change conformance pass. **Recommendation:** sweep unused imports in a separate housekeeping commit.

---

## Shared contracts (baseline for downstream issues)

### Page-builder block = three changes (cross-reference)

Adding a new `pageBuilder` block type requires **three** coordinated changes (canonical list in `CLAUDE.md` → Gotchas):

1. **Schema:** new object in `studio/src/schemaTypes/objects/<block>.ts`, added to the `page.pageBuilder` array.
2. **GROQ projection:** a `_type == "<block>" => { … }` branch in `getPageQuery` (`frontend/sanity/lib/queries.ts`).
3. **Renderer:** a component registered in the `Blocks` map in `frontend/app/components/BlockRenderer.tsx` (current keys: `hero`, `callToAction`, `infoSection`, …).

Then **re-run TypeGen before** writing/extending queries, or new fields type as `unknown`.

### New routable document type (cross-reference)

Adding a routable document type requires (canonical list in `CLAUDE.md` → Gotchas):

1. Presentation `mainDocuments` **+** `locations` entry in `studio/sanity.config.ts`.
2. A Next route under `frontend/app/`.
3. A `_type` branch in `frontend/app/sitemap.ts` (current branches: `page`, `post`).
4. A `resolveHref` case in `studio/sanity.config.ts`.

### Background object contract — **stub spec** (owned by SVE-31, do NOT build here)

SVE-31 introduces a reusable **`background`** Sanity object (WebGL shader background via `@svey-xyz/simple-shader-component`, attachable per-block and per-page). **This audit does NOT create the schema object** — it only records the intended shape so downstream wiring (GROQ projections, renderer, TypeGen expectations) has a stable baseline to reference. Authoritative source: SVE-31.

**Intended object shape** (`studio/src/schemaTypes/objects/background.ts`, _to be created by SVE-31_):

```ts
// SHAPE ONLY — not a real schema; SVE-31 owns the defineType/defineField impl.
background = {
  type:        'none' | 'shader',        // default 'none'
  preset:      string,                   // GLSL registry key (e.g. 'blob'); relevant when type === 'shader'
  speed:       number,                   // animation rate multiplier (feeds u_time scaling)
  intensity:   number,                   // effect strength
  colorSource: 'theme' | 'custom',       // 'theme' reads the Tailwind @theme accent CSS var; 'custom' uses customColor
  customColor?: <color>,                 // used only when colorSource === 'custom'
  opacity?:    number,                   // 0–1, canvas/gradient opacity
}
```

**Integration expectations recorded for SVE-31 (so this baseline stays accurate):**

- The field is added as an **optional** `background` to (a) **each page-builder block** (via a shared mixin in `studio/src/schemaTypes/objects/shared.ts`) and (b) the **`page` document** (page-level background).
- **GROQ:** project `background{ … }` in `getPageQuery` (per-block) and the page-level query; then **run TypeGen** before consuming the new field.
- **Renderer:** `BlockRenderer` reads `block.background` → wraps the block in a `relative` container + a `'use client'` `ShaderBackground`; the page route reads `page.background` → wraps the page shell.
- **A11y / motion (binds to `docs/A11Y.md` + `docs/TRANSITIONS.md`):** canvas is `aria-hidden`; under `prefers-reduced-motion: reduce` render a **static CSS gradient fallback** (no WebGL canvas); foreground content must keep **AAA** contrast over the background; cap concurrent WebGL contexts (prefer one page-level or a few block-level instances).

> Reminder for SVE-31: this is a **page-builder block-adjacent** addition (a cross-cutting field, not a new block type), so the "three changes" list applies to the _consumption_ side (schema field + GROQ projection + renderer wrapping), and TypeGen must be re-run after the schema field lands.

---

## Acceptance checklist (this issue)

- [x] Dependency audit captured (read-only; no lockfile mutation). Recommendations listed.
- [x] Next 16 conformance verified (no `middleware`; `proxy` is the v16 convention; `experimental.viewTransition` set; Turbopack default; PPR/`cacheComponents` deliberately off).
- [x] shadcn `components.json` verified (Heroicons, no lucide; OKLCH-vs-HSL token drift noted as intentional).
- [x] Tailwind v4 `@theme inline` confirmed single source of truth; no `tailwind.config.*`; `tw-animate-css` import correct.
- [x] Sanity v5: TypeGen green + drift-free; Live/Presentation wiring healthy.
- [x] `docs/PHASE0-AUDIT.md` created; CLAUDE.md checklists cross-referenced; `background` stub spec documented (schema NOT created — SVE-31 owns it).
- [x] `type-check` ✅, `lint` ✅, TypeGen ✅.
- [ ] `next build` — **skipped (offline):** `next/font/google` fetches Google Fonts at build; run on a networked machine before release.
- **Deprecated APIs found:** none.
