import type {Metadata} from 'next'

import ProjectsList from '@/app/components/ProjectsList'
import Reveal from '@/app/components/Reveal'
import {sanityFetch} from '@/sanity/lib/live'
import {allProjectsQuery} from '@/sanity/lib/queries'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected work and side projects.',
}

/**
 * Projects listing (SVE-40). RSC route: fetches all projects and hands them to
 * the client `ProjectsList` island, which owns the filter (by tech) + sort
 * (created / updated) UI. The route itself stays server-rendered; only the
 * interactive controls + cards are client.
 */
export default async function ProjectsPage() {
  const {data: projects} = await sanityFetch({query: allProjectsQuery})

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

      <ProjectsList projects={projects ?? []} />
    </div>
  )
}
