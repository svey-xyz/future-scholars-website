'use client'

import {useEffect} from 'react'

/**
 * Scroll-reveal fallback for engines without CSS scroll-driven animations
 * (`animation-timeline: view()`). The pre-paint detector in `app/layout.tsx`
 * sets `data-reveal-js` on <html> ONLY when scroll-timeline is unsupported and
 * the user allows motion — so this observer is the *only* reveal mechanism on
 * those engines, and a complete no-op everywhere else (supported engines use
 * the pure-CSS path; reduced-motion / no-JS users get fully visible content).
 *
 * Mounted once in the root layout. A single IntersectionObserver toggles
 * `data-revealed="true"` as `[data-reveal]` elements enter the viewport; a
 * MutationObserver re-scans so blocks added by client navigation or Sanity
 * Live optimistic edits still reveal (otherwise they'd stay `opacity: 0`).
 *
 * Client-only and side-effect free in markup — keeps every page-builder block a
 * Server Component (see CLAUDE.md "minimal client JS").
 */
export default function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement
    if (!root.hasAttribute('data-reveal-js')) return

    const reveal = (el: Element) => el.setAttribute('data-revealed', 'true')

    // Ancient engines without IntersectionObserver: reveal immediately so the
    // initial `opacity: 0` never strands content.
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('[data-reveal]').forEach(reveal)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target)
            io.unobserve(entry.target)
          }
        }
      },
      {rootMargin: '0px 0px -8% 0px', threshold: 0.12},
    )

    const scan = () =>
      document
        .querySelectorAll('[data-reveal]:not([data-revealed])')
        .forEach((el) => io.observe(el))

    scan()

    let raf = 0
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(scan)
    })
    mo.observe(document.body, {childList: true, subtree: true})

    return () => {
      io.disconnect()
      mo.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return null
}
