# shadcn Overhaul

Migration plan for `frontend/` from hand-rolled Tailwind to shadcn/ui (new-york, neutral) with dark mode. Adopts shadcn defaults wholesale — the existing `--color-brand #f50` palette is intentionally dropped. Visual Editing, optimistic updates, RSC-first posture, and npm workspace boundaries are preserved.

This doc is the source of truth for the migration. Completed phases are compacted to a short `DONE` block with the decisions that future phases depend on; remaining phases are kept full.

---

## Status

- Phase 1 — Install + init shadcn — **DONE**
- Phase 2 — Add component set — **DONE**
- Phase 3 — Dark mode wiring — **DONE**
- Phase 4 — Component refactors — **PENDING**
- Phase 5 — Route refactors — **PENDING**
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

## Phase 4 — Component refactors

Contract for each: Server Component unless hooks are required; every `data-sanity={dataAttr(...).toString()}` preserved verbatim; prop shapes unchanged.

### `Header.tsx`
`NavigationMenu` at `sm:`+. `Sheet` (triggered by `Button` with `Bars3Icon`) on mobile. Site title stays as left `Link`. GitHub button: `<Button asChild size="lg" className="rounded-full">…</Button>` wrapping the external `<a>`. Drop the inline GitHub SVG into `frontend/app/components/icons/GithubIcon.tsx`. Mount `<ModeToggle/>` on the right. Shell stays `fixed h-24 backdrop-blur` but swap `bg-white/80` → `bg-background/80`.

### `Footer.tsx`
Drop `bg-gray-50` + `tile-grid-black.png` overlay (no dark equivalent). Use `bg-muted`. CTAs become `<Button asChild>` variants (`default`, `link`). Add `Separator` between heading and CTA row.

### `Cta.tsx`
Keep `isDark` / `isImageFirst` logic. Pill link → `<Button asChild size="lg" className="rounded-full"><ResolvedLink …>…</ResolvedLink></Button>`. `isDark` wrapper becomes `<section className={cn('relative', isDark && 'dark bg-background text-foreground')}>`. Eyebrow → `<Badge variant="secondary">`. Tile overlay gated `dark:` only or removed.

### `InfoSection.tsx`
Color swaps only: `text-gray-900/70` → `text-muted-foreground`.

### `Posts.tsx`
Each `<Post>` becomes `Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardFooter`. Preserve the full-card-click `<Link><span className="absolute inset-0 z-10"/></Link>` + add `aria-label={title}` for SR. Suspense fallback: 2–3 `Skeleton` card placeholders.

### `Avatar.tsx`
shadcn `Avatar` shell with `SanityImage` inside the image slot (`AvatarImage` only accepts `src`; SanityImage builds URLs from `_ref`). `AvatarFallback` shows initials. `text-gray-500` → `text-muted-foreground`.

### `PortableText.tsx`
Heading anchor inline SVG → `<Button asChild variant="ghost" size="icon"><a href={`#${_key}`}><LinkIcon/></a></Button>`. Drop `prose-a:text-brand`; use `prose-a:text-foreground prose-a:underline prose-a:underline-offset-4 prose-a:decoration-foreground/40`. Keep `dark:prose-invert`.

### `Onboarding.tsx` / `PageOnboarding`
Orange card → `Card` + `CardHeader`/`CardContent`/`CardFooter`. Inline link/button pair → `<Button asChild>` / `<Button>` with `PlusIcon`. Keep Sanity logo SVG.

### `GetStartedCode.tsx`
Wrap snippet + button in `Card` (or `bg-muted` div). Replace hand-rolled tooltip with shadcn `Tooltip`. Replace local `showTooltip` state with `toast.success('Copied!')`.

### `DraftModeToast.tsx`
Logic unchanged — `Toaster` source already swapped in layout.

### `BlockRenderer.tsx`
Unknown-block `<div>` → `<Alert variant="destructive">`.

### `ResolvedLink.tsx`
No internal change. Becomes a child of `<Button asChild>` at call sites.

### `SideBySideIcons.tsx`
Inline SVG `text-brand` → `text-primary`. Animation untouched.

### `Date.tsx`, `SanityImage.tsx`
No changes.

---

## Phase 5 — Route refactors

### `app/page.tsx`
Drop the tiled hero background + white gradient overlay; clean centered hero on `bg-background`. Title decorations: keep, but `decoration-brand` / `text-framework` → `decoration-foreground` / `text-foreground`. "Sanity Documentation" link → `<Button asChild variant="link">`. Suspense fallback uses `Skeleton`.

### `app/[slug]/page.tsx`
Remove `<Head>` — App Router page, it's a no-op (latent bug). `border-gray-100` → `border-border`, `text-gray-600` → `text-muted-foreground`.

### `app/posts/[slug]/page.tsx`
Same gray-token swap. Article wrapper: `prose dark:prose-invert max-w-none`.

### `app/layout.tsx`
Phase 3 already covers the structural changes. Wrapper is `<section className="min-h-screen pt-24">`; can stay or move padding into `<main>`.

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
- **Still to add in phases 4–5**: `frontend/app/components/icons/GithubIcon.tsx`.
- **Still to edit in phases 4–5**: all 16 files under `frontend/app/components/`, plus `frontend/app/page.tsx`, `frontend/app/[slug]/page.tsx`, `frontend/app/posts/[slug]/page.tsx`.
- **Maybe delete in Phase 7**: `frontend/tailwind.config.ts`, three tile PNGs.
- **Untouched**: `frontend/sanity/**`, `studio/**`, `sanity.types.ts`, `sanity.schema.json`.
