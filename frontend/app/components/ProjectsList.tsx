'use client'

import {useMemo, useState, useSyncExternalStore} from 'react'

import ProjectCard from '@/app/components/ProjectCard'
import FeaturedProjectCard from '@/app/components/FeaturedProjectCard'
import Reveal from '@/app/components/Reveal'
import {AllProjectsQueryResult} from '@/sanity.types'
import {cn} from '@/lib/utils'

type Project = AllProjectsQueryResult[number]

const ALL = '__all__'

type SortKey = 'created' | 'updated'

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
 * Client-side filter + sort over the projects fetched in the RSC route
 * (`app/projects/page.tsx`). **Does no fetching** — data arrives as props.
 *
 * Filtering toggles per-card visibility (`block`/`hidden` via `className`) rather
 * than unmounting cards, so Visual-Editing `data-sanity` attrs and the
 * card→detail View-Transition names stay stable. Sorting reorders the DOM (that
 * reorder is what drives the View-Transition reflow animation).
 *
 * SSR-safe default: before hydration (`mounted === false`) every card renders,
 * already in newest-first (`publishedAt desc`) order, with no filtering — so the
 * server HTML and the first client render match exactly.
 *
 * a11y: the filter is a labelled radio `fieldset`/`legend`; the sort is a
 * `<label>`-associated `<select>`. The visible result count is announced via an
 * `aria-live="polite"` region.
 */
export default function ProjectsList({projects}: {projects: Project[]}) {
  const mounted = useSyncExternalStore(noopSubscribe, getMountedSnapshot, getServerSnapshot)

  const [activeTag, setActiveTag] = useState<string>(ALL)
  const [sort, setSort] = useState<SortKey>('created')

  // Unique tech tags across all projects, by `_id`. "All" pseudo-tag prepended.
  const tags = useMemo(() => {
    const seen = new Map<string, string>()
    for (const p of projects) {
      for (const t of p.tech ?? []) {
        if (t?._id && !seen.has(t._id)) seen.set(t._id, t.title)
      }
    }
    return [{id: ALL, title: 'All'}, ...[...seen].map(([id, title]) => ({id, title}))]
  }, [projects])

  // Effective state: pre-hydration we force the SSR-safe default (All / created)
  // regardless of the (unused) initial state, so render output is deterministic.
  const effectiveTag = mounted ? activeTag : ALL
  const effectiveSort: SortKey = mounted ? sort : 'created'

  // Sort newest-first by the chosen datetime. Stable copy so the source prop
  // order is never mutated (it backs Visual Editing reconciliation upstream).
  const ordered = useMemo(() => {
    const key = effectiveSort === 'updated' ? 'updatedAt' : 'publishedAt'
    return [...projects].sort((a, b) => toTime(b[key]) - toTime(a[key]))
  }, [projects, effectiveSort])

  // A card is visible when "All" is selected or it carries the active tag.
  const isVisible = (p: Project) =>
    effectiveTag === ALL || (p.tech ?? []).some((t) => t?._id === effectiveTag)

  const visibleCount = mounted ? ordered.filter(isVisible).length : ordered.length

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-6 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        {/* Filter — labelled radio group (segmented control). */}
        <fieldset className="min-w-0">
          <legend className="mb-2 text-sm font-medium text-muted-foreground">
            Filter by tech
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

        {/* Sort — labelled native select. */}
        <div className="flex shrink-0 flex-col gap-2">
          <label htmlFor="project-sort" className="text-sm font-medium text-muted-foreground">
            Sort by
          </label>
          <select
            id="project-sort"
            value={effectiveSort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="created">Newest first (created)</option>
            <option value="updated">Recently updated</option>
          </select>
        </div>
      </div>

      {/* Result count — polite live region. */}
      <p aria-live="polite" className="mt-4 text-sm text-muted-foreground">
        {visibleCount} {visibleCount === 1 ? 'project' : 'projects'}
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((project, i) => {
          const visible = !mounted || isVisible(project)
          const featured = project.featured === true
          return (
            <Reveal
              as="li"
              key={project._id}
              i={i % 8}
              variant="up"
              className={cn(visible ? 'block' : 'hidden', featured && 'sm:col-span-2 lg:col-span-3')}
            >
              {featured ? (
                <FeaturedProjectCard project={project} />
              ) : (
                <ProjectCard project={project} />
              )}
            </Reveal>
          )
        })}
      </ul>

      {ordered.length === 0 && (
        <p className="mt-8 text-muted-foreground">No projects yet.</p>
      )}
    </div>
  )
}
