import type {Metadata} from 'next'
import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/live'
import {allProjectsQuery} from '@/sanity/lib/queries'
import {AllProjectsQueryResult} from '@/sanity.types'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected work and side projects.',
}

/**
 * Projects listing (foundation for SVE-40).
 * Minimal accessible RSC list — headings + links. The rich filterable grid,
 * cover images, tech badges and motion land in SVE-40.
 */
export default async function ProjectsPage() {
  const {data: projects} = await sanityFetch({query: allProjectsQuery})

  return (
    <div className="container my-12 lg:my-24">
      <header className="max-w-3xl border-b border-border pb-6">
        <h1 className="text-4xl text-foreground sm:text-5xl lg:text-7xl">Projects</h1>
        <p className="mt-4 text-base font-light uppercase leading-relaxed text-muted-foreground lg:text-lg">
          Selected work and side projects.
        </p>
      </header>

      {projects && projects.length > 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: AllProjectsQueryResult[number]) => (
            <li key={project._id}>
              <Link
                href={`/projects/${project.slug}`}
                className="block h-full rounded-xl border border-border p-6 transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <h2 className="text-2xl font-medium">{project.title}</h2>
                {project.excerpt && (
                  <p className="mt-2 line-clamp-3 text-muted-foreground">{project.excerpt}</p>
                )}
                {project.tech && project.tech.length > 0 && (
                  <p className="mt-4 font-mono text-xs uppercase tracking-tight text-muted-foreground">
                    {project.tech.map((t) => t.title).join(' · ')}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-muted-foreground">No projects yet.</p>
      )}
    </div>
  )
}
