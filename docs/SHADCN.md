# shadcn Overhaul

Migration plan for `frontend/` from hand-rolled Tailwind to shadcn/ui (new-york, neutral) with dark mode. Adopts shadcn defaults wholesale — the existing `--color-brand #f50` palette is intentionally dropped. Visual Editing, optimistic updates, RSC-first posture, and npm workspace boundaries are preserved.

This doc is the source of truth for the migration. Completed phases are compacted to a short `DONE` block with the decisions that future phases depend on; remaining phases are kept full.

---

## Status

- Phase 1 — Install + init shadcn — **DONE**
- Phase 2 — Add component set — **DONE**
- Phase 3 — Dark mode wiring — **DONE**
- Phase 4 — Component refactors — **DONE**
- Phase 5 — Route refactors — **DONE**
- Phase 6 — A11y + perf — **DONE**
- Phase 7 — Cleanup + verify — **DONE** (host build + Lighthouse pending — see RUN THIS NEXT)

---

## ⚠️ RUN THIS NEXT

Sandbox can't run `next build` (Sanity CLI config refuses to load there) and can't run Lighthouse. Both are Phase 7 follow-ups that have to happen on the host. From repo root:

```
npm run build --workspace=frontend
npm run dev
```

Then visit `http://localhost:3000`, exercise `/`, a `page` doc, `/posts/[slug]`, and the Presentation Tool with Draft Mode. Confirm `data-sanity` overlays still light up and optimistic `pageBuilder` reconciliation by `_key` survives. Finally, run Lighthouse on `/` in both light and dark — target ≥95.

Lint + type-check are already green (sandbox).

---

## Decisions (locked)

- Style `new-york`, base color `neutral`, CSS variables on, RSC on. Alias `@/components/ui`, utils at `@/lib/utils`.
- `iconLibrary: "heroicons"` in `components.json`. shadcn's stock new-york source ships lucide-react in `sheet`, `dropdown-menu`, `navigation-menu` — substituted with Heroicons (`XMarkIcon`, `CheckIcon`, `ChevronRightIcon`, `ChevronDownIcon`) and replaced lucide's `Circle` with an inline `<span class="rounded-full bg-current">` in `DropdownMenuRadioItem`.
- Brand palette intentionally dropped. If `#f50` returns, re-add as a single `--accent` override later — explicit follow-up, not part of this migration.
- Dark mode via `@teispace/next-themes` (drop-in replacement for paco's `next-themes` — resolves the React 19 inline-script warning, ships hybrid cookie+localStorage storage for zero-FOUC SSR, and exposes `getTheme()` + `getThemeScript()` from the `/server` entry). `attribute="class"`, `defaultTheme="system"`. `.dark` tokens defined in `globals.css`. Existing `@custom-variant dark (&:where(.dark, .dark *))` retained — no need to import the lib's tailwind preset since we use class-strategy only.
- Fonts `Inter` + `IBM Plex Mono` aliased into shadcn via `--font-sans` / `--font-mono` inside `@theme inline`.
- The CLI `shadcn init` was bypassed: latest CLI prompts for unsupported new-york style and requires registry auth we don't have in-sandbox. Files were written manually from canonical `/r/styles/new-york/{name}.json` sources, which match what `shadcn add` would have written.
- `tailwindcss-animate` (v3-era) → `tw-animate-css` (v4 fork). Component animation utility classes (`animate-in`, `fade-in-0`, `slide-in-from-*`, `data-[state=open]:animate-in`, etc.) are provided by tw-animate-css.

---

## Phase 1 — DONE

Substrate landed. Key artifacts:

- `frontend/components.json` (style `new-york`, baseColor `neutral`, iconLibrary `heroicons`).
- `frontend/lib/utils.ts` exporting `cn(...inputs)`.
- `frontend/app/globals.css` rewritten — HSL token blocks in `:root` and `.dark`, full `@theme inline` color/radius map (`--color-background`, `--color-foreground`, `--color-primary`, etc.), `@plugin '@tailwindcss/typography'`, `tw-animate-css` import, `Inter` / `IBM Plex Mono` aliased to `--font-sans` / `--font-mono`, `@utility container` and the `h1–h6 font-medium tracking-tight` base layer preserved.
- `frontend/package.json` extended with all deps required for phases 1–3 (see RUN THIS NEXT above).
- `frontend/tailwind.config.ts` left untouched — leftover from v3 days; v4 source of truth is `globals.css`. Delete in Phase 7 if `tsc` doesn't pick it up.

Token opacity (`bg-primary/90`, `border-destructive/50`, etc.) works in Tailwind v4 via the runtime `color-mix()` it generates around custom `@theme` colors, regardless of HSL/oklch format.

---

## Phase 2 — DONE

12 components written to `frontend/components/ui/`:

`alert.tsx`, `avatar.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `dropdown-menu.tsx`, `navigation-menu.tsx`, `separator.tsx`, `sheet.tsx`, `skeleton.tsx`, `sonner.tsx`, `tooltip.tsx`.

All sourced verbatim from `https://ui.shadcn.com/r/styles/new-york/{name}.json` except the icon swap noted in Decisions. `sonner.tsx` is the shadcn wrapper that reads `useTheme()` from `next-themes` — so the `Toaster` is theme-aware out of the box.

Mapping (used in Phase 4):

| Component | Used by |
|-----------|---------|
| `button` | Header GitHub CTA, Footer CTA, Cta block, Onboarding action, GetStartedCode copy, PortableText anchor |
| `card` | `Posts.tsx` items |
| `avatar` | `Avatar.tsx` (SanityImage embedded as the image slot) |
| `navigation-menu` + `sheet` | Header desktop nav + mobile drawer |
| `dropdown-menu` | ModeToggle (Phase 3) |
| `sonner` | replaces direct `sonner` Toaster import — theme-aware via next-themes |
| `tooltip` | replaces the hand-rolled tooltip in `GetStartedCode` |
| `skeleton` | Suspense fallback for `<AllPosts/>` / `<MorePosts/>` |
| `separator` | Header/Footer/post-header dividers |
| `badge` | "Draft" indicator, Cta `eyebrow` |
| `alert` | `BlockRenderer` unknown-block fallback, Onboarding empty states |

---

## Phase 3 — DONE

- Dark mode wired via `@teispace/next-themes` (swapped from paco's `next-themes` to fix a React 19 inline-script warning that surfaced during Phase 5 dev — see Phase 5b below).
- `frontend/app/components/ModeToggle.tsx` — `DropdownMenu` of Light / Dark / System using `SunIcon`, `MoonIcon`, `ComputerDesktopIcon` from `@heroicons/react/24/outline`. `sr-only` "Toggle theme" label. Not yet mounted in Header — that happens in Phase 4.
- `frontend/app/layout.tsx`:
  - `<html>` gained `suppressHydrationWarning`, lost `bg-white text-black`.
  - `<body>` gained `bg-background text-foreground antialiased`.
  - `<ThemeProvider>` (imported directly from `@teispace/next-themes` — it ships its own `'use client'` boundary, so layout stays a server component) wraps everything below `<body>` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`, and `initialTheme={await getTheme()}`. The anti-FOUC script is injected via `useServerInsertedHTML` — **do not** render `<script>` in JSX (e.g. inside an explicit `<head>`) or React 19 emits "Encountered a script tag while rendering React component", and the extra JSX node shifts Radix's `useId()` counter, which then mismatches between server and client (cause of a Sheet trigger hydration error during Phase 5b dev). `<SanityLive>` stays mounted at the same depth.
  - `frontend/app/providers.tsx` deleted — no longer needed.
  - `Toaster` import switched from `sonner` → `@/components/ui/sonner` so toasts are theme-aware. `DraftModeToast.tsx` logic untouched.

---

## Phase 4 — DONE

All 16 component files refactored. `frontend/app/components/icons/GithubIcon.tsx` added.

Key landed decisions Phase 5 depends on:

- **Header** — desktop `NavigationMenu` + `Sheet` mobile drawer (`Bars3Icon` trigger, `Open menu` aria-label). `ModeToggle` sits between nav and GitHub `Button`. Shell now `bg-background/80 backdrop-blur-lg`. Single `navLinks` array drives both desktop and mobile (currently just `/about`).
- **Footer** — `bg-muted`, tile PNG gone, vertical `Separator` on `lg:`+, GitHub = `Button asChild size="lg" rounded-full`, Next.js docs = `Button asChild variant="link"`.
- **Cta** — `<section className={cn('relative', isDark && 'dark bg-background text-foreground')}>`. Tile overlay removed entirely. Eyebrow is `<Badge variant="secondary">` wrapped in a flex container so it doesn't stretch. Button is `Button asChild size="lg" rounded-full` wrapping `ResolvedLink`. Body `PortableText` no longer needs `dark:prose-invert` (parent `.dark` cascades it).
- **Posts** — `Card` with relative positioning + absolute `Link` span; `aria-label={title}` on the link. `CardFooter` has `border-t pt-4`. Empty author slot kept (renders empty `<span/>`) so the time still right-aligns. Hover state is `hover:bg-accent/40`. Suspense Skeleton fallback is added in Phase 5 routes, not in this file.
- **Avatar** — radix `AvatarRoot` sizing wrapper, `SanityImage` inside as the image content (bypassing `AvatarImage` because that primitive forwards to native `<img>` and won't accept `_ref`). `AvatarFallback` shows uppercase initials (`?` fallback if no name).
- **PortableText** — inline `HeadingAnchor` helper renders `<Button asChild variant="ghost" size="icon">` with `LinkIcon`. Positioned `absolute left-0 top-1/2 -translate-y-1/2 -ml-10`. Prose `text-brand` gone; uses `prose-a:text-foreground prose-a:underline prose-a:underline-offset-4 prose-a:decoration-foreground/40 dark:prose-invert`.
- **Onboarding / PageOnboarding** — collapsed onto a single `OnboardingShell` (`Card`+`CardHeader`/`CardContent`/`CardFooter`); both exported variants just pass props. Sanity logo kept verbatim. Presentation branch still emits `data-sanity={createDataAttribute(...)}` on the button.
- **GetStartedCode** — extracted `SNIPPET` const; replaced hand-rolled tooltip with shadcn `Tooltip` ("Copy snippet") and replaced `showTooltip` state with `toast.success('Copied to clipboard')` / `toast.error('Copy failed')`. Wrapper is `bg-muted` rounded pill. Icon swapped to `ClipboardIcon` from `@heroicons/react/24/outline`.
- **BlockRenderer** — unknown block wrapped in `<div className="container my-12"><Alert variant="destructive">…</Alert></div>` with `AlertTitle`/`AlertDescription`.
- **SideBySideIcons** — only change is `text-brand` → `text-primary`.
- **DraftModeToast**, **ResolvedLink**, **Date**, **SanityImage** — untouched.

Verification ran clean: `tsc --noEmit` exits 0; ESLint clean against `app components lib` (the macOS `._*` AppleDouble cruft on the mounted volume produces parse errors but isn't on the host's lint path — npm scripts on the host won't see them).

---

## Phase 5 — DONE

All three route files refactored. `app/layout.tsx` untouched (Phase 3 already covered it; the `<section className="min-h-screen pt-24">` wrapper stays).

Key landed decisions Phase 6 depends on:

- **`app/page.tsx`** — tile bg + white gradient overlay removed; hero is a flat `<section className="bg-background">`. "A starter template for" eyebrow is now `bg-muted text-muted-foreground` (was `bg-white`). Both `Sanity` and `Next.js` links use `decoration-foreground` underlines + `hover:text-foreground/80` (brand/framework colors dropped). Body prose switched from `text-gray-700` to `text-foreground` + `dark:prose-invert`. "Sanity Documentation" inline link replaced with `<Button asChild variant="link" size="sm">` wrapping the anchor; inline external-link SVG replaced with `<ArrowTopRightOnSquareIcon>` (Heroicons outline). Bottom posts band: `border-t border-border bg-muted/40` (was `border-gray-100 bg-gray-50`). Suspense fallback is a local `<PostsSkeleton/>` rendering one `Skeleton` heading + one subheading + two `h-40 rounded-xl` card skeletons.
- **`app/[slug]/page.tsx`** — `<Head>` import and the no-op `<Head><title>` block removed (latent App-Router bug fixed). `border-gray-100` → `border-border`. `text-gray-900` → `text-foreground`. `text-gray-600` → `text-muted-foreground`. `PageOnboarding` empty-state path untouched. The redundant outer `<div className="">` was dropped — `container` is the first child of the `my-12 lg:my-24` wrapper.
- **`app/posts/[slug]/page.tsx`** — same gray-token swaps (`border-border`, `text-foreground`, `bg-muted/40` for the bottom band). Article container is now `<article className="prose max-w-none dark:prose-invert">`; the cover image inside gets `not-prose` so prose doesn't manage its margins (prose still applies to nested `PortableText` via its own wrapper, which is fine — nested prose works in tailwind-typography v0.5+). Local `<MorePostsSkeleton/>` added for the `<Suspense>` boundary (heading skeleton + two card skeletons).
- Skeleton shapes match the actual `Card` footprint (~`h-40 w-full rounded-xl`) so CLS is near-zero on slow fetches.

Verification ran clean: `tsc --noEmit` exits 0; ESLint (`app components lib`, ignoring AppleDouble `._*` cruft on the mounted volume) returns no errors.

---

## Phase 5b — `next-themes` → `@teispace/next-themes` swap

Dev-server surfaced two warnings after Phase 5 landed:

1. **Hydration mismatch** — `Posts.tsx` wrapped `<DateComponent>` (which itself renders `<time>`) in another `<time>` element. Nested `<time>` is invalid HTML. Fixed by switching the outer wrapper to `<span>`; `DateComponent`'s inner `<time dateTime>` keeps the semantics.
2. **"Encountered a script tag while rendering React component"** — paco's `next-themes` v0.4.6 renders its anti-FOUC `<script>` inside the React tree via `React.createElement('script', ...)`. React 19 emits a dev-only warning for any `<script>` element in JSX (it won't execute on hydration). Suppressing it isn't possible from userland.

Swapped `next-themes ^0.4.4` → `@teispace/next-themes ^0.5.0` in `frontend/package.json`. The replacement is a drop-in fork with:

- Anti-FOUC script via `useServerInsertedHTML` (or `getThemeScript()` in `<head>` for zero-flicker streaming).
- Hybrid cookie+localStorage storage so the server reads the same theme the client does — eliminates the need for `'use client'` wrappers around the provider.
- `useSyncExternalStore` for the store, so React 19 `Activity` / `cacheComponents` don't stale it.
- Same `useTheme()` / `ThemeProvider` surface — no consumer changes beyond the import path.

Files touched:

- `frontend/package.json` — `next-themes` removed, `@teispace/next-themes ^0.5.0` added.
- `frontend/app/layout.tsx` — direct `<ThemeProvider>` import (no client wrapper), `getTheme()` server-side seed, anti-FOUC script injected via `useServerInsertedHTML` (the default — **don't** render `<script>` JSX in `<head>` or you re-trip the React 19 warning *and* shift the `useId()` counter that Radix relies on, breaking the Sheet trigger). The provider keeps `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`.
- `frontend/app/providers.tsx` — deleted.
- `frontend/app/components/ModeToggle.tsx` — `'next-themes'` import → `'@teispace/next-themes'`.
- `frontend/components/ui/sonner.tsx` — same import swap.
- `frontend/app/components/Posts.tsx` — outer `<time>` wrapper around `<DateComponent/>` swapped for `<span>`.

**Mobile-menu Sheet was extracted into a client island.** After the swap, a hydration mismatch persisted on the SheetTrigger button — `Header` (server) → `<Sheet>` (Radix Dialog, client) → `<SheetTrigger asChild>` → `<Button>`. The DialogTrigger composes a fresh ref function every render (`useComposedRefs(forwardedRef, context.triggerRef)`) and pipes it through Slot/SlotClone onto the `<button>`; with React 19's stricter hydration diff (and an empty diff-summary that only shows `+` lines on the button), the composed-ref/Slot tree fails to match between SSR and CSR for the trigger. The whole subtree is sm-only (`sm:hidden`) and stateless until interaction, so the pragmatic fix is to render it client-only:

- New `frontend/app/components/MobileMenu.tsx` (`'use client'`) owns the entire `<Sheet>` + trigger + content. It gates render on a `useSyncExternalStore(subscribe, () => true, () => false)` snapshot (chosen over `useState` + `useEffect` to dodge the `react-hooks/set-state-in-effect` ESLint rule and skip an extra render).
- Pre-mount it renders an `h-9 w-9 sm:hidden` placeholder so the header doesn't reflow when the button slots in.
- `frontend/app/components/Header.tsx` now just renders `<MobileMenu navLinks={navLinks} githubHref={githubHref} />` — Header stays a Server Component, the rest of the desktop nav still SSRs normally.

**Next step (requires host run):** `npm install` from repo root to fetch the new dependency. Then `npm run dev` should be free of both the React 19 script warning and the SheetTrigger hydration error.

Verification (with the package temporarily copied into `node_modules` from the npm tarball): `tsc --noEmit` exits 0; ESLint clean.

---

---

## Phase 6 — DONE

A11y audit: most items were already satisfied by Phases 3–5. One concrete bump landed. Ongoing accessibility rules are codified in [docs/A11Y.md](./A11Y.md) — this section is the migration record, A11Y.md is the standing source of truth.

- **Contrast audit (`--muted-foreground`)** —
  - Dark: `hsl(0 0% 63.9%)` on `hsl(0 0% 3.9%)` = **7.83:1** → already AAA body. Untouched.
  - Light: `hsl(0 0% 45.1%)` on `hsl(0 0% 100%)` = **4.74:1** → AA only, fails AAA body. Bumped lightness `45.1% → 34%` → **~7.26:1**, AAA body. shadcn's stock neutral palette was generous on this token in light mode; the new value still reads as "subtle" against `--foreground` (3.9%) so visual hierarchy is preserved.
- **Focus rings** — shadcn's `focus-visible:ring-1 focus-visible:ring-ring` retained on every component (button, card link overlay, dropdown items, sheet trigger). The full-card link `<span>` in `Posts.tsx` carries the same ring utilities so keyboard focus is visible on Cards even though the anchor itself has no visual chrome.
- **Mobile `Sheet` trigger** — `aria-label="Open menu"` confirmed on the `Bars3Icon` button (`MobileMenu.tsx`).
- **`ModeToggle`** — both `aria-label="Toggle theme"` and a `sr-only` label present on the trigger; aria-label wins, sr-only is harmless fallback.
- **`NavigationMenu`** — Radix primitives, keyboard-nav free out of the box; no overrides.
- **Full-card `Link` in `Posts`** — `aria-label={title ?? undefined}` already in place from Phase 4; verified.
- **Icons** — `GithubIcon` has `aria-hidden="true"`; Heroicons inside buttons render alongside visible text labels so they don't need aria.
- **Skeletons** — `/` and `/posts/[slug]` use Skeleton boundaries matching final card footprint (Phase 5), so CLS stays near zero on streamed lists.

Files edited: `frontend/app/globals.css` (one token).

---

## Phase 7 — DONE (host-side verify pending)

- **`frontend/tailwind.config.ts` deleted.** Confirmed `tsc --noEmit` passes in both workspaces after removal — the v4 source of truth is `app/globals.css` (`@theme inline` block + `@plugin '@tailwindcss/typography'`).
- **All four tile PNGs deleted** from `frontend/public/images/`: `tile-1-black.png`, `tile-1-white.png`, `tile-grid-black.png`, `tile-grid-white.png`. Grep across `frontend/` and `studio/` showed zero references — they were leftovers from the pre-shadcn background-tile pattern that Phases 4–5 removed.
- **Lint + type-check** ran clean in-sandbox (`npx eslint app components lib --ignore-pattern '**/._*'` and `npm run type-check`). AppleDouble `._*` files only exist in the mount view, not on the host, so the host's `npm run lint` will not see them.
- **`npm run build --workspace=frontend`** could not run in the sandbox: Sanity CLI's `sanity typegen generate` (executed via `prebuild`) errors on config load. Build must be run on the host.
- **Lighthouse** is host-only — pending. Target ≥95 on `/` in both light and dark.

Files removed: `frontend/tailwind.config.ts`, `frontend/public/images/tile-{1,grid}-{black,white}.png`.

---

## File-touch summary

- **Added in phases 1–3**: `frontend/components.json`, `frontend/lib/utils.ts`, `frontend/components/ui/{alert,avatar,badge,button,card,dropdown-menu,navigation-menu,separator,sheet,skeleton,sonner,tooltip}.tsx`, `frontend/app/providers.tsx`, `frontend/app/components/ModeToggle.tsx`.
- **Edited in phases 1–3**: `frontend/package.json`, `frontend/app/globals.css`, `frontend/app/layout.tsx`.
- **Added in phase 4**: `frontend/app/components/icons/GithubIcon.tsx`.
- **Edited in phase 5**: `frontend/app/page.tsx`, `frontend/app/[slug]/page.tsx`, `frontend/app/posts/[slug]/page.tsx`.
- **Deleted in phase 7**: `frontend/tailwind.config.ts`, `frontend/public/images/tile-{1,grid}-{black,white}.png` (four files; the doc previously listed three but a fourth `tile-grid-white.png` was also unreferenced).
- **Edited in phase 6**: `frontend/app/globals.css` (`--muted-foreground` light-mode lightness `45.1% → 34%` for AAA).
- **Untouched**: `frontend/sanity/**`, `studio/**`, `sanity.types.ts`, `sanity.schema.json`.
