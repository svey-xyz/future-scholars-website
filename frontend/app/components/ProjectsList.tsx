'use client'

import {useMemo, useState, useSyncExternalStore} from 'react'

import ProjectCard, {type ProjectCardItem} from '@/app/components/ProjectCard'
import FeaturedProjectCard from '@/app/components/FeaturedProjectCard'
import Reveal from '@/app/components/Reveal'
import {cn} from '@/lib/utils'

type Project = ProjectCardItem

const ALL = '__all__'

type SortKey = 'created' | 'updated'

type Props = {
  projects: Project[]
  /** Show the "filter by category" radio group. Default `true` (standalone `/projects`). */
  showFilter?: boolean
  /** Show the "sort by" select. Default `true`. When `false`, the incoming order is preserved
   *  (so a hand-picked / pre-ordered selection isn't re-sorted). */
  showSort?: boolean
  /** Grid columns at the widest breakpoint. Default `3`. */
  columns?: 2 | 3
  /** Heading tag for the cards. Omit to use each card's own default (regular `h3`, featured `h2`). */
  headingLevel?: 'h2' | 'h3'
  /** Wrapper override (defaults to `mt-8`). */
  className?: string
}

// 3-col layout reuses the original breakpoints; 2-col caps at `sm`.
const gridColsClass: Record<2 | 3, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
}
const featuredSpanClass: Record<2 | 3, string> = {
  2: 'sm:col-span-2',
  3: 'sm:col-span-2 lg:col-span-3',
}

// --- Hydration-safe mount flag (no setState-in-effect). Mirrors `ThemeToggle`:
// SSR + first paint get the server snapshot (`false`) so the markup is fully
// deterministic — ALL cards in newest-first order, no filter/sort applied — and
// the interactive state only engages once hydrated. Avoids the React 19
// `react-hooks/set-state-in-effect` lint rule and any hydration mismatch / CLS.
const noopSubscribe = () => () => {}
const getMountedSnapshot = () => true
const getServerSnapshot = () => false

/** Parse an ISO datetime to epoch ms; unparseable / missing → 0 (sorts last). */
function toTime(value: string | null | undefined): number {
  if (!value) return 0
  const t = Date.parse(value)
  return Number.isNaN(t) ? 0 : t
}

/**
 * Shared projects root — owns the optional filter (by category) + sort
 * (created / updated) controls and the responsive card grid. Used both by the
 * standalone `/projects` route (filter + sort on) and the embedded
 * `projectsArchive` page-builder block (controls toggled per the editor's
 * `showFilter` / `showSort` fields). **Does no fetching** — data arrives as props.
 *
 * Filtering toggles per-card visibility (`block`/`hidden` via `className`) rather
 * than unmounting cards, so Visual-Editing `data-sanity` attrs and the
 * card→detail View-Transition names stay stable. Sorting reorders the DOM (that
 * reorder is what drives the View-Transition reflow animation). With `showSort`
 * off, the incoming prop order is preserved verbatim.
 *
 * SSR-safe default: before hydration (`mounted === false`) every card renders,
 * already in newest-first (`publishedAt desc`) order when sorting is enabled,
 * with no filtering — so the server HTML and the first client render match.
 *
 * a11y: the filter is a labelled radio `fieldset`/`legend`; the sort is a
 * `<label>`-associated `<select>`. The visible result count is announced via an
 * `aria-live="polite"` region.
 */
export default function ProjectsList({
  projects,
  showFilter = true,
  showSort = true,
  columns = 3,
  headingLevel,
  className,
}: Props) {
  const mounted = useSyncExternalStore(noopSubscribe, getMountedSnapshot, getServerSnapshot)

  const [activeTag, setActiveTag] = useState<string>(ALL)
  const [sort, setSort] = useState<SortKey>('created')

  // Unique category tags across all projects, by `_id`. "All" pseudo-tag prepended.
  const tags = useMemo(() => {
    const seen = new Map<string, string>()
    for (const p of projects) {
      for (const c of p.categories ?? []) {
        if (c?._id && !seen.has(c._id)) seen.set(c._id, c.title)
      }
    }
    return [{id: ALL, title: 'All'}, ...[...seen].map(([id, title]) => ({id, title}))]
  }, [projects])

  // Effective state: filter only engages when shown + hydrated; otherwise "All".
  const effectiveTag = showFilter && mounted ? activeTag : ALL

  // Sort newest-first by the chosen datetime. Stable copy so the source prop
  // order is never mutated (it backs Visual Editing reconciliation upstream).
  // When sorting is disabled, the incoming order is preserved as-is.
  const ordered = useMemo(() => {
    if (!showSort) return projects
    const effectiveSort: SortKey = mounted ? sort : 'created'
    const key = effectiveSort === 'updated' ? 'updatedAt' : 'publishedAt'
    return [...projects].sort((a, b) => toTime(b[key]) - toTime(a[key]))
  }, [projects, showSort, sort, mounted])

  // A card is visible when "All" is selected or it carries the active category.
  const isVisible = (p: Project) =>
    effectiveTag === ALL || (p.categories ?? []).some((c) => c?._id === effectiveTag)

  const visibleCount = mounted ? ordered.filter(isVisible).length : ordered.length
  const hasControls = showFilter || showSort

  return (
    <div className={cn('mt-8', className)}>
      {hasControls && (
        <div className="flex flex-col gap-6 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          {/* Filter — labelled radio group (segmented control). */}
          {showFilter && (
            <fieldset className="min-w-0">
              <legend className="mb-2 text-sm font-medium text-muted-foreground">
                Filter by category
              </legend>
              {/* Native radios sharing `name` form the radio group; the <fieldset>/<legend>
                  names it. No explicit role needed — the inputs carry the semantics. */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const checked = effectiveTag === tag.id
                  return (
                    <label
                      key={tag.id}
                      className={cn(
                        'cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                        'focus-within:outline-none focus-within:ring-1 focus-within:ring-ring',
                        checked
                          ? 'border-transparent bg-primary text-primary-foreground'
                          : 'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
                      )}
                    >
                      <input
                        type="radio"
                        name="project-tag"
                        value={tag.id}
                        checked={checked}
                        onChange={() => setActiveTag(tag.id)}
                        className="sr-only"
                      />
                      {tag.title}
                    </label>
                  )
                })}
              </div>
            </fieldset>
          )}

          {/* Sort — labelled native select. */}
          {showSort && (
            <div className="flex shrink-0 flex-col gap-2">
              <label htmlFor="project-sort" className="text-sm font-medium text-muted-foreground">
                Sort by
              </label>
              <select
                id="project-sort"
                value={mounted ? sort : 'created'}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="created">Newest first (created)</option>
                <option value="updated">Recently updated</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Result count — polite live region. Only meaningful while filtering. */}
      {showFilter && (
        <p aria-live="polite" className="mt-4 text-sm text-muted-foreground">
          {visibleCount} {visibleCount === 1 ? 'project' : 'projects'}
        </p>
      )}

      <ul className={cn('mt-6 grid grid-cols-1 gap-6', gridColsClass[columns])}>
        {ordered.map((project, i) => {
          const visible = !mounted || isVisible(project)
          const featured = project.featured === true
          return (
            <Reveal
              as="li"
              key={project._id}
              i={i % 8}
              variant="up"
              className={cn(
                visible ? 'block' : 'hidden',
                // featured && featuredSpanClass[columns],
              )}
            >
              {featured ? (
                <FeaturedProjectCard project={project} headingLevel={headingLevel} />
              ) : (
                <ProjectCard project={project} headingLevel={headingLevel} />
              )}
            </Reveal>
          )
        })}
      </ul>

      {ordered.length === 0 && <p className="mt-8 text-muted-foreground">No projects yet.</p>}
    </div>
  )
}
