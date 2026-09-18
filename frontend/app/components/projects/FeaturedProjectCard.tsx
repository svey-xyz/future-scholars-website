import {ViewTransition} from 'react'
import Link from 'next/link'
import {
  ArrowLongRightIcon,
  ArrowTopRightOnSquareIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline'

import Image from '@/app/components/common/SanityImage'
import {dataAttr} from '@/sanity/lib/utils'
import {Badge} from '@/components/ui/badge'
import {Card} from '@/components/ui/card'
import {cn} from '@/lib/utils'
import type {ProjectCardItem} from './ProjectCard'

/**
 * Larger, horizontally-split card for `featured === true` projects. Same
 * link/a11y/View-Transition contract as `ProjectCard` (full-card link with
 * `aria-label`, cover image wrapped in the matching
 * `project-card-${slug}` shared-element name) but a wider footprint: it spans
 * the full grid row (`sm:col-span-2 lg:col-span-3`) with the cover beside the
 * copy on larger viewports. Heading defaults to `h2` on the standalone listing.
 */
export default function FeaturedProjectCard({
  project,
  className,
  headingLevel = 'h2',
}: {
  project: ProjectCardItem
  className?: string
  headingLevel?: 'h2' | 'h3'
}) {
  const {_id, title, slug, excerpt, coverImage, website, repo, tech} = project
  const Heading = headingLevel

  return (
    <Card
      data-sanity={dataAttr({id: _id, type: 'project', path: 'title'}).toString()}
      className={cn(
        'group/card relative grid h-full grid-cols-1 overflow-hidden p-0 transition-[transform,box-shadow,border-color,background-color] duration-300 will-change-transform hover:border-primary/30 hover:shadow-lg motion-safe:hover:-translate-y-1',
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
          <div className="absolute inset-0 h-full w-full overflow-hidden bg-muted md:aspect-auto md:h-full">
            <Image
              id={coverImage.asset._ref}
              alt={coverImage.alt || ''}
              width={1200}
              height={675}
              mode="cover"
              hotspot={coverImage.hotspot}
              crop={coverImage.crop}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-full w-full object-cover transition-transform duration-900 ease-out will-change-transform motion-safe:group-hover/card:scale-105"
            />
          </div>
        </ViewTransition>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 h-full -z-1 w-full bg-muted md:aspect-auto md:h-full"
        />
      )}

      <div className="flex flex-col gap-4 p-6 lg:p-8">
        <Badge className="w-fit gap-1.5 font-mono text-[0.65rem] uppercase tracking-tight">
          <span aria-hidden="true">★</span> Featured
        </Badge>
        <CardTitleHeading>
          <Heading className="text-2xl font-medium leading-tight tracking-tight lg:text-3xl">
            {title}
          </Heading>
        </CardTitleHeading>
        {excerpt && (
          <p className="line-clamp-4 max-w-[60ch] leading-7 text-muted-foreground">{excerpt}</p>
        )}
        {tech && tech.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {tech.map((t) => (
              <li key={t._id}>
                <Badge
                  variant="secondary"
                  className="font-mono text-[0.65rem] uppercase tracking-tight"
                >
                  {t.title}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <span className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-foreground">
          View project
          <ArrowLongRightIcon
            aria-hidden="true"
            className="size-4 transition-transform duration-300 motion-safe:group-hover/card:translate-x-1"
          />
          {(website || repo) && (
            <span aria-hidden="true" className="ml-2 flex items-center gap-2 text-muted-foreground">
              {website && <ArrowTopRightOnSquareIcon className="size-4" />}
              {repo && <CodeBracketIcon className="size-4" />}
            </span>
          )}
        </span>
      </div>
    </Card>
  )
}

/* Title wrapper mirroring `CardTitle`'s typographic reset without forcing the
   small default size (we set our own larger size on the heading). */
function CardTitleHeading({children}: {children: React.ReactNode}) {
  return <div className="font-semibold leading-none tracking-tight">{children}</div>
}
