/**
 * Client-side "which list did the visitor come from" context for project
 * detail pages (issue #17, pattern from vsc-website), backing the detail
 * page's prev/next pagination and the context-aware back link.
 *
 * When a visitor clicks a project card on a listing, the list owner snapshots
 * the *visible* (filtered) project slugs in their *rendered* (sorted) order —
 * plus the listing's URL — into `sessionStorage`. The detail page then pages
 * prev/next through that exact list, so user-applied filter/sort state is
 * respected.
 *
 * sessionStorage (not URL params) keeps project URLs clean and canonical;
 * the trade-off is that direct links and new tabs have no context, in which
 * case the detail page falls back to the default-order list provided by the
 * server (see `projectNavListQuery`).
 *
 * Only import from client components — the helpers touch `window`.
 */

export type ProjectNavEntry = {
  /** `slug.current` — used to build `/projects/{slug}` hrefs (stega-clean). */
  slug: string
  /** Display title for the prev/next buttons (stega-cleaned at save time). */
  title?: string
}

export type ProjectNavContext = {
  /** Visible (filtered) projects in rendered (sorted) order. */
  entries: ProjectNavEntry[]
  /** pathname + search of the listing page — back-link target. */
  from: string
}

const STORAGE_KEY = 'project-nav-context:v1'

export const saveProjectNavContext = (context: ProjectNavContext): void => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(context))
  } catch {
    // Storage unavailable (private mode / quota) — pagination falls back.
  }
}

/**
 * Raw snapshot for `useSyncExternalStore` — returns the stored JSON string
 * (stable reference between renders, unlike a freshly parsed object).
 */
export const getProjectNavContextSnapshot = (): string | null => {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export const parseProjectNavContext = (raw: string | null): ProjectNavContext | null => {
  try {
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const {entries, from} = parsed as Partial<ProjectNavContext>
    if (typeof from !== 'string' || !Array.isArray(entries)) return null
    const valid = entries.filter(
      (e): e is ProjectNavEntry =>
        typeof e === 'object' && e !== null && typeof (e as ProjectNavEntry).slug === 'string',
    )
    return {entries: valid, from}
  } catch {
    return null
  }
}

/** Event-handler-friendly read (back link). */
export const readProjectNavContext = (): ProjectNavContext | null =>
  parseProjectNavContext(getProjectNavContextSnapshot())
