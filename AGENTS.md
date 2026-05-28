<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:a11y-agent-rules -->

# Accessibility: read docs/A11Y.md before any UI change

Before adding, restyling, or refactoring any UI (components, routes, page-builder blocks, schema-driven UI strings), read [`docs/A11Y.md`](docs/A11Y.md). It defines contrast targets (WCAG 2.2 AAA where feasible, AA floor), the token system, focus rules, ARIA conventions, and the per-PR checklist. Run the `design:accessibility-review` skill on non-trivial visual changes and Lighthouse Accessibility ≥95 in both light and dark before merging.

<!-- END:a11y-agent-rules -->
