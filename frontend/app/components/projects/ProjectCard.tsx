import {ViewTransition} from 'react'
import Link from 'next/link'
import {ArrowTopRightOnSquareIcon, CodeBracketIcon} from '@heroicons/react/24/outline'

import Image from '@/app/components/common/SanityImage'
import {dataAttr} from '@/sanity/lib/utils'
import {AllProjectsQueryResult} from '@/sanity.types'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {cn} from '@/lib/utils'

export type ProjectCardItem = AllProjectsQueryResult[number]

/**
 * Shared project card — used by the filterable `/projects` listing
 * (`ProjectsList`) and the embedded `projectsArchive` page-builder block
 * (`ProjectsArchive`). Mirrors the a11y posture in `PostCard`:
 *   - the full card is a single link carrying `aria-label={title}` (no empty
 *     "link" SR announcement); the overlay copies the standard focus-ring tokens.
 *   - the website/repo chips are NOT links (a nested link inside the card link is
 *     invalid HTML); they're decorative affordance hints surfaced on the detail
 *     page instead.
 *
 * View-Transition contract: the cover image is wrapped in
 * `<ViewTransition name={`project-card-${slug}`} share="morph">`. SVE-41's detail
 * route MUST put the *same* name on its hero/cover image so the thumbnail morphs
 * into the detail hero on navigation. The name is unique per slug (one card per
 * slug renders at a time), and reduced motion is neutralised globally in
 * `globals.css` (`::view-transition-*(*)` reset).
 */
export default function ProjectCard({
  project,
  className,
  headingLevel = 'h3',
}: {
  project: ProjectCardItem
  className?: string
  /** Heading tag for the title — `h2` on the standalone listing, `h3` when embedded under a block <h2>. */
  headingLevel?: 'h2' | 'h3'
}) {
  const {_id, title, slug, excerpt, coverImage, website, repo, tech} = project
  const Heading = headingLevel

  return (
    <Card
      data-sanity={dataAttr({id: _id, type: 'project', path: 'title'}).toString()}
      className={cn(
        'group/card relative flex h-full flex-col overflow-hidden p-0 transition-[transform,box-shadow,border-color,background-color] duration-300 will-change-transform hover:border-primary/30 hover:shadow-lg motion-safe:hover:-translate-y-1',
        className,
      )}
    >
      <Link
        href={`/projects/${slug}`}
        aria-label={title ?? undefined}
        transitionTypes={['nav-forward']}
      >
        <span className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </Link>

      {coverImage?.asset?._ref ? (
        <ViewTransition name={`project-card-${slug}`} share="morph">
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <Image
              id={coverImage.asset._ref}
              alt={coverImage.alt || ''}
              width={800}
              height={450}
              mode="cover"
              hotspot={coverImage.hotspot}
              crop={coverImage.crop}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-cover transition-transform duration-900 ease-out will-change-transform motion-safe:group-hover/card:scale-105"
            />
          </div>
        </ViewTransition>
      ) : (
        <div aria-hidden="true" className="aspect-video w-full bg-muted" />
      )}

      <CardHeader className="pt-6">
        <CardTitle className="text-xl">
          <Heading className="font-medium leading-tight">{title}</Heading>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        {excerpt && (
          <p className="line-clamp-3 max-w-[60ch] leading-6 text-muted-foreground">{excerpt}</p>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4">
        {tech && tech.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {tech.map((t) => (
              <li key={t._id}>
                <Badge variant="secondary" className="font-mono text-[0.65rem] uppercase tracking-tight">
                  {t.title}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <span />
        )}
        {(website || repo) && (
          <span
            aria-hidden="true"
            className="ml-auto flex items-center gap-2 text-muted-foreground"
          >
            {website && <GlobeChip />}
            {repo && <RepoChip />}
          </span>
        )}
      </CardFooter>
    </Card>
  )
}

/* Decorative affordance hints (aria-hidden — the card link is the real target;
   the actionable website/repo links live on the detail page). */
function GlobeChip() {
  return <ArrowTopRightOnSquareIcon className="size-4" />
}
function RepoChip() {
  return <CodeBracketIcon className="size-4" />
}
