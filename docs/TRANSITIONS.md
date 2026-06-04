# View transitions

How animated navigation works in this repo, and the rules for keeping it consistent. **Read this before adding or changing any component, page, route, or navigation** — page transitions are a first-class concern here, not an afterthought.

Built on React's [`<ViewTransition>`](https://react.dev/reference/react/ViewTransition) + the browser [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API), integrated by Next via `experimental.viewTransition`. Reference: [Next.js — Designing view transitions](https://nextjs.org/docs/app/guides/view-transitions). Where browser support is missing, the app works normally — transitions just don't animate (progressive enhancement).

## How it's wired

| Concern | Where | Notes |
| --- | --- | --- |
| Feature flag | `frontend/next.config.ts` → `experimental.viewTransition: true` | Required for Next to trigger transitions on navigation. |
| App-wide boundary | `frontend/app/components/PageTransition.tsx` | RSC. Wraps `{children}` inside `<main>` in `app/layout.tsx`. Maps `transitionTypes` → directional slides; untyped navigations crossfade. |
| Directional intent | `<Link transitionTypes={[…]}>` | `nav-forward` (going deeper) / `nav-back` (going up). Set on post cards, header/mobile nav links, and the home-logo link. |
| Shared-element morph | `Posts.tsx` (`CardTitle`) ↔ `app/posts/[slug]/page.tsx` (`<h1>`) | Matching `<ViewTransition name={`post-title-${slug}`} share="morph">`. The title morphs between list and detail. |
| Suspense reveals | `app/page.tsx`, `app/posts/[slug]/page.tsx` | Fallback wrapped in `<ViewTransition exit="slide-down">`, content in `<ViewTransition enter="slide-up" default="none">`. |
| Header anchor | `Header.tsx` `style={{viewTransitionName: 'site-header'}}` | CSS pins it so the fixed header doesn't slide/fade with content. |
| CSS / keyframes | view-transition block in `app/globals.css` | Class names match the strings passed to `enter`/`exit`/`share` and `transitionTypes`. |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` in `globals.css` | Zeroes all view-transition durations → instant swap. Never bypass it. |

## What activates a transition

`<ViewTransition>` animations only run during a React **Transition**, **`<Suspense>`** reveal, or `useDeferredValue` — *not* on plain `setState` or initial SSR mount. In Next, route navigations are Transitions, so the boundaries animate automatically on navigation; the home/post lists animate their skeleton→content handoff via Suspense. No initial-load flash because first paint isn't a transition.

## Adding new UI — checklist

- **New `<Link>` / `router.push`/`replace`:** decide direction and pass `transitionTypes: ['nav-forward']` (deeper) or `['nav-back']` (up/back). Omit only when a plain crossfade is intended.
- **An element that persists across two routes** (image, title, card → hero): wrap both ends in `<ViewTransition name="…">` with the *same* name. Add `share="morph"` to customize. Names must be unique per rendered page.
- **New streaming `<Suspense>`:** wrap the fallback in `<ViewTransition exit="…">` and the content in `<ViewTransition enter="…" default="none">`. `default="none"` stops it animating during unrelated navigations.
- **New animation flavor:** add the class to the view-transition block in `globals.css` (`::view-transition-old/new/group(.your-class)` + a `@keyframes vt-*`). Reuse the existing `vt-fade` / `vt-slide` / `vt-slide-y` / `vt-blur` keyframes where possible.
- **Anything fixed/sticky** that should stay put during slides: give it a unique `viewTransitionName` and disable its snapshot animation (see `site-header`).

## Rules

- **Keep transition components RSC.** `PageTransition` and the `<ViewTransition>` wrappers carry no client JS — don't add `'use client'` to introduce them. (Matches the perf posture in `CLAUDE.md`.)
- **Always honour `prefers-reduced-motion`** — it's handled globally; don't add hand-rolled transitions that ignore it. Directional slides are the highest motion-sensitivity risk (see [A11Y.md](./A11Y.md)).
- **One `name` per element per page.** Duplicate active names break the morph.
- Names are global strings; keep them descriptive and collision-free (`post-title-<slug>`, `site-header`).

## Gotchas

- **`default="none"` on the app-wide boundary is load-bearing.** `<SanityLive>` revalidates frequently under draft mode / Presentation, and those revalidations are React Transitions. If the top-level `PageTransition` has an animating `default` (e.g. `page-fade`), every live refresh re-runs a full-page crossfade → constant flicker / "never finishes loading". Keep top-level `default="none"`; untyped navigations still crossfade because the `enter`/`exit` `default` keys only fire when the routed children actually swap (navigation), not on in-place updates. Same rule for the Suspense fallback/content wrappers — keep `default="none"` on them so live updates don't replay the reveal.
- `transitionTypes` on `<Link>` requires Next ≥ 16.2 (we're on 16.2.x). It maps to `React.addTransitionType` inside the navigation transition.
- Browser-initiated back/forward (button, swipe) carry **no** transition type, so directional slides don't play for them — the crossfade (`page-fade`) and any matching shared-element morph still do. This is intended.
- Safari may animate some patterns differently; verify there, and confirm the no-support fallback (instant swap) still looks correct.

## Gallery block

The `gallery` page-builder block (`Gallery.tsx`) layers four motion sources, all reduced-motion-gated:

- **Reveal stagger** on grid/masonry tiles (`reveal-scale`, scroll-driven) — unchanged from the original grid.
- **Hover** scale + scrim on tiles (`group/gal`, `motion-safe:`).
- **Embla easing** on the carousel layout and the lightbox track (`opts.duration`).
- **Lightbox open:** Radix `Dialog` fade + zoom (`tw-animate-css`) plus a gentle `.gallery-lightbox-media` rise (declared in the `prefers-reduced-motion: no-preference` block of `globals.css`, so it self-disables under reduced motion).

The optional **tile → lightbox-image shared-element morph** is intentionally *not wired*. The CSS hook is in place (`::view-transition-group(.gallery-media)` + `vt-blur` image-pair in the view-transition block), but activating it needs a matching `<ViewTransition name="gallery-media-…">` on **both** the clicked tile and the active lightbox slide. Since a view-transition name may exist only once per page at a time, the tile would have to drop its name while the lightbox is open — i.e. read client open-state and therefore become a Client Component — which breaks the RSC-first grid/masonry goal. Left as a documented opt-in rather than compromising the server-rendering posture.
