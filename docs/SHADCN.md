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
- Phase 6 — A11y + perf — **PENDING**
- Phase 7 — Cleanup + verify — **PENDING**

---

## ⚠️ RUN THIS NEXT

The sandbox can't write into the host's mounted `node_modules` (EPERM on macOS perms), so deps were added to `frontend/package.json` but not installed. From repo root:

```
npm install
```

This pulls in: `@heroicons/react`, `@radix-ui/react-{avatar,dialog,dropdown-menu,navigation-menu,separator,slot,tooltip}`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `next-themes`.

After install, sanity check before Phase 4:

```
npm run lint
npm run type-check
npm run dev
```

Then visit `http://localhost:3000` — palette should now be shadcn neutral, ModeToggle (top right) toggles light/dark/system, Visual Editing still works at `:3333`.

---

## Decisions (locked)

- Style `new-york`, base color `neutral`, CSS variables on, RSC on. Alias `@/components/ui`, utils at `@/lib/utils`.
- `iconLibrary: "heroicons"` in `components.json`. shadcn's stock new-york source ships lucide-react in `sheet`, `dropdown-menu`, `navigation-menu` — substituted with Heroicons (`XMarkIcon`, `CheckIcon`, `ChevronRightIcon`, `ChevronDownIcon`) and replaced lucide's `Circle` with an inline `<span class="rounded-full bg-current">` in `DropdownMenuRadioItem`.
- Brand palette intentionally dropped. If `#f50` returns, re-add as a single `--accent` override later — explicit follow-up, not part of this migration.
- Dark mode via `next-themes` with `attribute="class"`, `defaultTheme="system"`. `.dark` tokens defined in `globals.css`. Existing `@custom-variant dark (&:where(.dark, .dark *))` retained.
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

- `frontend/app/providers.tsx` — `'use client'` wrapping `next-themes`'s `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`.
- `frontend/app/components/ModeToggle.tsx` — `DropdownMenu` of Light / Dark / System using `SunIcon`, `MoonIcon`, `ComputerDesktopIcon` from `@heroicons/react/24/outline`. `sr-only` "Toggle theme" label. Not yet mounted in Header — that happens in Phase 4.
- `frontend/app/layout.tsx`:
  - `<html>` gained `suppressHydrationWarning`, lost `bg-white text-black`.
  - `<body>` gained `bg-background text-foreground antialiased`.
  - `<Providers>` wraps everything below `<body>`. `<SanityLive>` stays mounted at the same depth.
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

---

## Phase 6 — A11y + perf (WCAG AAA where feasible)

- Keep shadcn's `focus-visible:ring-1 focus-visible:ring-ring` — don't override.
- Audit `--muted-foreground` contrast in dark mode; bump lightness if AAA body text (~7:1) fails.
- Mobile `Sheet` trigger: `aria-label="Open menu"`. ModeToggle button: `sr-only` label already in place.
- `NavigationMenu` keyboard-nav free.
- Full-card `Link` in `Posts`: add `aria-label={post.title}` to avoid empty-link-text SR announcements.
- Skeletons reduce CLS on `/` and post pages.

---

## Phase 7 — Cleanup + verify

1. Delete `frontend/tailwind.config.ts` if `tsc` still passes. Otherwise leave it (the v4 source of truth is `globals.css`).
2. Remove `/public/images/tile-grid-black.png`, `/tile-1-black.png`, `/tile-1-white.png` if unreferenced.
3. Run:
   - `npm run lint`
   - `npm run type-check`
   - `npm run build --workspace=frontend`
   - `npm run dev` — exercise `/`, a `page` doc, `/posts/[slug]`, and Presentation Tool with Draft Mode. Verify `data-sanity` overlays, optimistic `pageBuilder` reconciliation by `_key`.
4. Lighthouse pass on `/` light + dark, target ≥95.

---

## File-touch summary

- **Added in phases 1–3**: `frontend/components.json`, `frontend/lib/utils.ts`, `frontend/components/ui/{alert,avatar,badge,button,card,dropdown-menu,navigation-menu,separator,sheet,skeleton,sonner,tooltip}.tsx`, `frontend/app/providers.tsx`, `frontend/app/components/ModeToggle.tsx`.
- **Edited in phases 1–3**: `frontend/package.json`, `frontend/app/globals.css`, `frontend/app/layout.tsx`.
- **Added in phase 4**: `frontend/app/components/icons/GithubIcon.tsx`.
- **Edited in phase 5**: `frontend/app/page.tsx`, `frontend/app/[slug]/page.tsx`, `frontend/app/posts/[slug]/page.tsx`.
- **Maybe delete in Phase 7**: `frontend/tailwind.config.ts`, three tile PNGs.
- **Untouched**: `frontend/sanity/**`, `studio/**`, `sanity.types.ts`, `sanity.schema.json`.
