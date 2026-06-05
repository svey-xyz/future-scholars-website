import {stegaClean} from '@sanity/client/stega'

import ProjectCard, {type ProjectCardItem} from '@/app/components/ProjectCard'
import FeaturedProjectCard from '@/app/components/FeaturedProjectCard'
import Reveal from '@/app/components/Reveal'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType, ProjectsArchiveItem} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'projectsArchive'>
  index: number
  pageId: string
  pageType: string
}

// The block's `projects` projection (`ProjectsArchiveItem`) is structurally the
// same as `AllProjectsQueryResult[number]` (both use the shared `projectFields`),
// so the cards take it directly — no widening.
const asCardItem = (p: ProjectsArchiveItem): ProjectCardItem => p

const colClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
}

/**
 * Projects-archive page-builder block (SVE-40). Reuses the shared `ProjectCard`
 * / `FeaturedProjectCard` for a consistent embedded list. Server Component — the
 * block has no filter/sort UI (that lives on the standalone `/projects` route);
 * it just renders its pre-projected, pre-ordered `projects` selection. Editor
 * `columns` (2|3) controls the grid; featured items span the row.
 */
export default function ProjectsArchive({block}: Props) {
  const {heading, subheading, source, projects, limit, columns} = block
  const all = projects ?? []
  // GROQ caps 'latest' at 24; apply the editor's exact limit here.
  const shown = stegaClean(source) === 'latest' ? all.slice(0, limit ?? 6) : all
  const cols = columns === 2 ? 2 : 3

  return (
    <section className="container my-12 lg:my-16">
      <header className="max-w-3xl">
        {heading && (
          <Reveal as="h2" className="text-2xl md:text-3xl lg:text-4xl">
            {heading}
          </Reveal>
        )}
        {subheading && (
          <Reveal i={1} as="p" className="mt-3 text-lg leading-8 text-muted-foreground">
            {subheading}
          </Reveal>
        )}
      </header>

      {shown.length > 0 ? (
        <ul className={cn('mt-8 grid grid-cols-1 gap-6', colClass[cols])}>
          {shown.map((project, i) => {
            const featured = project.featured === true
            return (
              <Reveal
                as="li"
                key={project._id}
                i={i % 8}
                variant="up"
                className={cn(featured && cols === 3 ? 'lg:col-span-3 sm:col-span-2' : featured && 'sm:col-span-2')}
              >
                {featured ? (
                  <FeaturedProjectCard project={asCardItem(project)} headingLevel="h3" />
                ) : (
                  <ProjectCard project={asCardItem(project)} headingLevel="h3" />
                )}
              </Reveal>
            )
          })}
        </ul>
      ) : (
        <p className="mt-8 text-muted-foreground">No projects to show yet.</p>
      )}
    </section>
  )
}
