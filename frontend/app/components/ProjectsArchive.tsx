import {stegaClean} from '@sanity/client/stega'
import Link from 'next/link'

import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'projectsArchive'>
  index: number
  pageId: string
  pageType: string
}

/**
 * Minimal projects-archive renderer (foundation for SVE-40).
 * Keeps the page builder + type-check consistent now that `projectsArchive`
 * is a registered block; the rich card/grid + motion UI lands in SVE-40.
 */
export default function ProjectsArchive({block}: Props) {
  const {heading, subheading, source, projects, limit} = block
  const all = projects ?? []
  // GROQ caps 'latest' at 24; apply the editor's exact limit here.
  const shown = stegaClean(source) === 'latest' ? all.slice(0, limit ?? 6) : all

  return (
    <section className="container my-12 lg:my-16">
      <header className="max-w-3xl">
        {heading && <h2 className="text-2xl md:text-3xl lg:text-4xl">{heading}</h2>}
        {subheading && (
          <p className="mt-3 text-lg leading-8 text-muted-foreground">{subheading}</p>
        )}
      </header>

      {shown.length > 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((project) => (
            <li key={project._id}>
              <Link
                href={`/projects/${project.slug}`}
                className="block rounded-xl border border-border p-6 transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <h3 className="text-xl font-medium">{project.title}</h3>
                {project.excerpt && (
                  <p className="mt-2 line-clamp-3 text-muted-foreground">{project.excerpt}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-muted-foreground">No projects to show yet.</p>
      )}
    </section>
  )
}
