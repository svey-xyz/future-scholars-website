import {ViewTransition} from 'react'

/**
 * App-wide route transition boundary.
 *
 * Wraps the routed content in a React `<ViewTransition>` so every navigation is
 * animated by the browser's View Transitions API (enabled via
 * `experimental.viewTransition` in `next.config.ts`).
 *
 * Behaviour is driven by the `transitionTypes` carried on the originating
 * `<Link>` (or `router.push`/`replace`):
 *   - `nav-forward` → content slides in from the right (going deeper)
 *   - `nav-back`    → content slides in from the left (going up/back)
 *   - untyped navigation (browser back/forward, typeless links) → subtle crossfade
 *
 * `default="none"` is critical: it scopes animation to genuine navigations
 * (where the routed children actually enter/exit). Without it, EVERY transition
 * — including each `<SanityLive>` revalidation and Suspense re-resolve — would
 * re-run a full-page crossfade, which loops into constant flicker under draft
 * mode / Presentation. The `enter`/`exit` `default` keys still crossfade on
 * untyped navigations, because enter/exit only fire when children swap.
 *
 * The matching keyframes/classes live in `app/globals.css`, which also
 * anchors the fixed header and honours `prefers-reduced-motion`.
 *
 * RSC by design — no client JS. Keep it that way (see docs/TRANSITIONS.md).
 */
export default function PageTransition({children}: {children: React.ReactNode}) {
  return (
    <ViewTransition
      default="none"
      enter={{
        'nav-forward': 'nav-forward',
        'nav-back': 'nav-back',
        'default': 'page-fade',
      }}
      exit={{
        'nav-forward': 'nav-forward',
        'nav-back': 'nav-back',
        'default': 'page-fade',
      }}
    >
      {children}
    </ViewTransition>
  )
}
