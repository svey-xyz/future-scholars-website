'use client'

import {useMemo, useSyncExternalStore} from 'react'
import Link from 'next/link'
import {ChevronLeftIcon, ChevronRightIcon} from '@heroicons/react/24/outline'

import {
  getProjectNavContextSnapshot,
  parseProjectNavContext,
  type ProjectNavEntry,
} from './nav-context'

// sessionStorage never changes out from under a rendered project page (the
// only writers are list pages), so subscribing is a no-op — the store read
// still gets the correct SSR (null) → client (snapshot) handoff.
const subscribeNoop = () => () => {}
const getServerSnapshot = () => null

/**
 * Bottom-of-page prev/next navigation for `/projects/[slug]` (issue #17).
 *
 * Pages through the list the visitor actually navigated from: the
 * sessionStorage nav context (visible/filtered projects in their sorted
 * order — see `nav-context.ts`) when it exists and contains the current
 * project, otherwise the server-provided default-order list
 * (`fallbackEntries`, from `projectNavListQuery`).
 *
 * SSR renders the fallback (server snapshot is `null`); after hydration
 * `useSyncExternalStore` re-reads the real snapshot, so cached (published)
 * pages stay fully static-shell friendly. Buttons hide at the ends of the
 * list (no wrap-around). Prev navigates with `nav-back`, next with
 * `nav-forward`, matching the app's directional slides (docs/TRANSITIONS.md).
 */
export default function ProjectPagination({
  slug,
  fallbackEntries,
  className,
}: {
  /** Current project slug (stega-clean). */
  slug: string
  /** Default-order list used when no in-tab nav context exists. */
  fallbackEntries: ProjectNavEntry[]
  className?: string
}) {
  const rawContext = useSyncExternalStore(
    subscribeNoop,
    getProjectNavContextSnapshot,
    getServerSnapshot,
  )

  const entries = useMemo(() => {
    const context = parseProjectNavContext(rawContext)
    // Only adopt the context if it can actually locate this project —
    // e.g. a stale snapshot from a filtered list that excluded it must not
    // strand the visitor with no pagination.
    if (context && context.entries.some((entry) => entry.slug === slug)) {
      return context.entries
    }
    return fallbackEntries
  }, [rawContext, slug, fallbackEntries])

  const index = entries.findIndex((entry) => entry.slug === slug)
  const prev = index > 0 ? entries[index - 1] : undefined
  const next = index >= 0 && index < entries.length - 1 ? entries[index + 1] : undefined

  if (!prev && !next) return null

  const linkClass =
    'group flex min-h-11 items-center gap-2 rounded-md py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

  return (
    <nav
      aria-label="Adjacent projects"
      className={`flex items-stretch justify-between gap-8 border-t border-border pt-6 ${className ?? ''}`}
    >
      {prev ? (
        <Link
          rel="prev"
          href={`/projects/${prev.slug}`}
          transitionTypes={['nav-back']}
          className={`${linkClass} -ml-2 pl-2 pr-4`}
        >
          <ChevronLeftIcon
            aria-hidden="true"
            className="size-5 shrink-0 motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:-translate-x-1"
          />
          <span className="flex flex-col">
            <span className="text-sm uppercase opacity-70">Previous</span>
            {prev.title && (
              <span className="font-medium text-foreground underline-offset-2 group-hover:underline group-focus-visible:underline">
                {prev.title}
              </span>
            )}
          </span>
        </Link>
      ) : (
        // Placeholder keeps "Next" pinned to the right edge on first pages.
        <span aria-hidden="true" />
      )}
      {next && (
        <Link
          rel="next"
          href={`/projects/${next.slug}`}
          transitionTypes={['nav-forward']}
          className={`${linkClass} -mr-2 pl-4 pr-2 text-right`}
        >
          <span className="flex flex-col">
            <span className="text-sm uppercase opacity-70">Next</span>
            {next.title && (
              <span className="font-medium text-foreground underline-offset-2 group-hover:underline group-focus-visible:underline">
                {next.title}
              </span>
            )}
          </span>
          <ChevronRightIcon
            aria-hidden="true"
            className="size-5 shrink-0 motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:translate-x-1"
          />
        </Link>
      )}
    </nav>
  )
}
