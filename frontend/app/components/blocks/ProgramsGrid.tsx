import Link from 'next/link'

import Image from '@/app/components/common/SanityImage'
import Reveal from '@/app/components/motion/Reveal'
import {Card} from '@/components/ui/card'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'programsGrid'>
  index: number
  pageId: string
  pageType: string
  className?: string
}

const colClass: Record<number, string> = {
  1: 'max-w-2xl',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

// Card images are ~33vw at desktop; the legacy source is 720×480, so asking the
// CDN for more than ~720 buys nothing (build plan Q5 / IMAGE-MANIFEST).
const SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

/**
 * Programs grid (build plan S6) — cards for FSMA's age-banded programs, either
 * all of them youngest-first or a hand-picked selection. The GROQ side of the
 * `mode` switch lives in `getPageQuery`, so this component always receives a
 * resolved, ordered `programs` array.
 *
 * Each card is a single link wrapping its own content (no nested interactive
 * elements): the heading text is the accessible name, and the age/ratio facts
 * sit in a `<dl>` so a screen reader hears them as labelled pairs rather than
 * as loose fragments. Cards resolve to `/programs/<slug>` — those routes land
 * in S8; the side rail already links to them.
 *
 * Card headings track the block's own heading rather than being hard-coded:
 * with a block heading the cards sit under it as `h3`, without one they are
 * the section's top level and must be `h2`. Hard-coding `h3` skipped a level
 * on every page whose grid has no heading (`/programs`, `/montessori` went
 * h1 → h3), which fails WCAG 1.3.1 and the build plan's §9 heading bar.
 */
export default function ProgramsGrid({block, className}: Props) {
  const {heading, subheading, programs, columns} = block
  const cols = columns ?? 3
  const items = programs ?? []
  // See the note above: no block heading means the cards are this section's
  // top level, so they step up to `h2`.
  const CardHeading = heading ? 'h3' : 'h2'

  if (items.length === 0) return null

  return (
    <section className={cn('container my-12 lg:my-16', className)}>
      <header className="max-w-3xl">
        {heading && (
          <Reveal as="h2" className="text-2xl md:text-3xl lg:text-4xl">
            {heading}
          </Reveal>
        )}
        {subheading && (
          <Reveal as="p" i={1} className="mt-3 text-lg leading-8 text-muted-foreground">
            {subheading}
          </Reveal>
        )}
      </header>

      <ul className={cn('mt-10 grid grid-cols-1 gap-6', colClass[cols])}>
        {items.map((program, i) => {
          const ref = program.image?.asset?._ref
          const facts = [
            program.ageRange ? {term: 'Ages', value: program.ageRange} : null,
            program.ratio ? {term: 'Ratio', value: program.ratio} : null,
            program.classroomName ? {term: 'Classroom', value: program.classroomName} : null,
          ].filter((f): f is {term: string; value: string} => f !== null)

          return (
            <Reveal as="li" key={program._id} i={i} variant="scale">
              <Card className="group/prog h-full overflow-hidden p-0 transition-[transform,box-shadow,border-color] duration-300 will-change-transform motion-safe:hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg">
                <Link
                  href={`/programs/${program.slug}`}
                  transitionTypes={['nav-forward']}
                  className="flex h-full flex-col rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {ref ? (
                    <div className="relative aspect-[3/2] w-full overflow-hidden bg-muted">
                      <Image
                        id={ref}
                        alt={program.image?.alt || ''}
                        width={720}
                        hotspot={program.image?.hotspot}
                        crop={program.image?.crop}
                        mode="cover"
                        sizes={SIZES}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out will-change-transform motion-safe:group-hover/prog:scale-105"
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <CardHeading className="font-display text-xl">{program.name}</CardHeading>

                    {facts.length > 0 && (
                      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {facts.map((fact) => (
                          <div key={fact.term} className="flex gap-1.5">
                            <dt className="font-medium">{fact.term}:</dt>
                            <dd>{fact.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    {program.summary && <p className="leading-7 text-pretty">{program.summary}</p>}

                    <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary">
                      Explore this program
                      <span
                        aria-hidden="true"
                        className="transition-transform motion-safe:group-hover/prog:translate-x-1"
                      >
                        &rarr;
                      </span>
                    </span>
                  </div>
                </Link>
              </Card>
            </Reveal>
          )
        })}
      </ul>
    </section>
  )
}
