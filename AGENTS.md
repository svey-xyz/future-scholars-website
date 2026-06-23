<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:a11y-agent-rules -->

# Accessibility: read docs/A11Y.md before any UI change

Before adding, restyling, or refactoring any UI (components, routes, page-builder blocks, schema-driven UI strings), read [`docs/A11Y.md`](docs/A11Y.md). It defines contrast targets (WCAG 2.2 AAA where feasible, AA floor), the token system, focus rules, ARIA conventions, and the per-PR checklist. Run the `design:accessibility-review` skill on non-trivial visual changes and Lighthouse Accessibility ≥95 in both light and dark before merging.

<!-- END:a11y-agent-rules -->

<!-- BEGIN:view-transitions-agent-rules -->

# View transitions: always consider them when building UI

This repo ships React View Transitions (`experimental.viewTransition` in `frontend/next.config.ts`). **Whenever you add or change a component, page, route, or navigation, consider how it should transition** — don't ship UI that ignores the system. Read [`docs/TRANSITIONS.md`](docs/TRANSITIONS.md) before touching navigation, route content, Suspense boundaries, or any element that visually persists across routes.

Defaults already in place: app-wide crossfade + directional slides (`app/components/motion/PageTransition.tsx`, wired in `app/layout.tsx`), shared-element morph on post titles, Suspense reveals, and an anchored header. New work should fit this model: tag new `<Link>`s with `transitionTypes` (`nav-forward`/`nav-back`), give elements that persist across routes a matching `<ViewTransition name>`, wrap new streaming `<Suspense>` boundaries in enter/exit `<ViewTransition>`s, and add any new CSS classes to the view-transition block in `app/globals.css`. Keep transition components RSC and honour `prefers-reduced-motion` (handled globally in `globals.css` — don't bypass it).

<!-- END:view-transitions-agent-rules -->
