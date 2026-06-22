import type {Metadata} from 'next'

import ProjectsList from '@/app/components/ProjectsList'
import Reveal from '@/app/components/Reveal'
import {sanityFetch} from '@/sanity/lib/live'
import {allProjectsQuery} from '@/sanity/lib/queries'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected work and side projects.',
}

/** First value of a search param (Next passes `string | string[] | undefined`). */
function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

type Props = {
  searchParams: Promise<{tag?: string | string[]; tech?: string | string[]}>
}

/**
 * Projects listing (SVE-40). RSC route: fetches all projects and hands them to
 * the client `ProjectsList` island, which owns the filters (by category + tech)
 * and sort (created / updated) UI. The route itself stays server-rendered; only
 * the interactive controls + cards are client.
 *
 * Deep-linking: `?tag=<categorySlug>` / `?tech=<technologySlug>` (set by the
 * chips on a project detail page) seed the matching filter on arrival.
 */
export default async function ProjectsPage({searchParams}: Props) {
  const [{data: projects}, {tag, tech}] = await Promise.all([
    sanityFetch({query: allProjectsQuery}),
    searchParams,
  ])

  return (
    <div className="container my-12 lg:my-24">
      <header className="max-w-3xl">
        <Reveal as="h1" className="text-4xl text-foreground sm:text-5xl lg:text-7xl">
          Projects
        </Reveal>
        <Reveal
          i={1}
          as="p"
          className="mt-4 text-base font-light uppercase leading-relaxed text-muted-foreground lg:text-lg"
        >
          Selected work and side projects.
        </Reveal>
      </header>

      <ProjectsList
        projects={projects ?? []}
        initialCategory={firstParam(tag)}
        initialTech={firstParam(tech)}
      />
    </div>
  )
}
