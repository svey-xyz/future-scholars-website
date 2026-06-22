import {stegaClean} from '@sanity/client/stega'

import ProjectsList from '@/app/components/ProjectsList'
import {type ProjectCardItem} from '@/app/components/ProjectCard'
import Reveal from '@/app/components/Reveal'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'projectsArchive'>
  index: number
  pageId: string
  pageType: string
}

/**
 * Projects-archive page-builder block (SVE-40). A thin server wrapper around the
 * shared {@link ProjectsList} root. This block IS the projects listing — a page
 * designated the Projects archive (`page.archive`) carries exactly one of these.
 * The block owns only its `heading`/`subheading`; the cards, grid, and the
 * optional filter/sort controls all live in `ProjectsList`, toggled by the
 * editor's `showFilter` / `showSort` fields.
 *
 * The block's `projects` projection shares `projectFields` with
 * `AllProjectsQueryResult`, so it feeds `ProjectsList` directly. Editor `columns`
 * (2|3) selects the grid width; featured items span the row.
 */
export default function ProjectsArchive({block}: Props) {
  const {heading, subheading, source, projects, limit, columns, category} = block
  // `showFilter`/`showSort` may predate the deployed TypeGen output — read them
  // via the same `'x' in block` idiom used for `background` in `BlockRenderer`.
  // A `category` constraint narrows the grid to one tag, so the filter is
  // suppressed even if a stale `showFilter: true` lingers from before it was set
  // (hidden Studio fields keep their stored value).
  const showFilter = 'showFilter' in block && block.showFilter === true && !category
  const showSort = 'showSort' in block && block.showSort === true

  const all = (projects ?? []) as ProjectCardItem[]
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

      <ProjectsList
        projects={shown}
        showFilter={showFilter}
        showSort={showSort}
        columns={cols}
        headingLevel="h3"
      />
    </section>
  )
}
