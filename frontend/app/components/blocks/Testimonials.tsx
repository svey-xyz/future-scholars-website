import Link from 'next/link'
import {stegaClean} from '@sanity/client/stega'
import {ArrowRightIcon} from '@heroicons/react/24/outline'

import Reveal from '@/app/components/motion/Reveal'
import TestimonialAttribution, {
  normalise,
  testimonialAnchor,
  type Quote,
} from './TestimonialAttribution'
import TestimonialLetters from './TestimonialLetters'
import TestimonialQuote from './TestimonialQuote'
import {Card} from '@/components/ui/card'
import {cn} from '@/lib/utils'
import {documentHref} from '@/sanity/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'testimonials'>
  index: number
  pageId: string
  pageType: string
  className?: string
}

const colClass: Record<number, string> = {
  1: 'max-w-2xl',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
}

/**
 * Fallback pull quote for a testimonial with no editorial `highlight`: the
 * opening sentence, or the first two if the first is very short. Deliberately
 * dumb — the Studio field is where a human picks the strongest line.
 */
function leadSentences(quote: string): string {
  const first = quote.split(/\n{2,}/)[0]?.trim() ?? ''
  const sentences = first.match(/[^.!?]+[.!?]*/g) ?? [first]
  let lead = ''
  for (const sentence of sentences) {
    if (lead && lead.length >= 90) break
    lead += sentence
  }
  lead = lead.trim()
  return lead.length > 240 ? `${lead.slice(0, 237).trimEnd()}\u2026` : lead || quote
}

export default function Testimonials({block, className}: Props) {
  const {heading, subheading, documentTestimonials, columns, limit} = block
  const cols = columns ?? 3
  // Presentation only — both layouts consume the same normalised items.
  // `stegaClean`: enum values carry stega characters in draft mode.
  const letters = stegaClean(block.layout) === 'letters'
  // Where "Read more" goes: the letters page, if one exists (see query).
  const fullPage = block.fullPageSlug ? documentHref('page', block.fullPageSlug) : null

  // GROQ resolves the documents (ordered, featured-filtered); the `limit` is
  // applied here rather than as a GROQ slice, which cannot take a runtime
  // value from the enclosing block.
  const items: Quote[] = (documentTestimonials ?? []).slice(0, limit ?? 3).map((t) => ({
    key: t._id,
    quote: t.quote,
    highlight: t.highlight,
    authorName: t.authorName,
    authorRole: t.authorRole,
    authorImage: t.authorImage,
  }))

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

      {letters ? (
        <div className={cn((heading || subheading) && 'mt-8 lg:mt-12')}>
          <TestimonialLetters items={items} blockKey={block._key} hasHeading={Boolean(heading)} />
        </div>
      ) : (
        <ul className={cn('mt-8 grid grid-cols-1 gap-6', colClass[cols])}>
          {items.map((t, i) => {
            // `stegaClean` before any comparison: in draft mode both strings
            // carry invisible markers, so a raw `includes`/`!==` would always
            // report the pull quote as different from the full quote.
            const fullQuote = stegaClean(t.quote) ?? ''
            const highlight = t.highlight?.trim() ? t.highlight : leadSentences(fullQuote)
            const expandable = normalise(stegaClean(highlight) ?? '') !== normalise(fullQuote)
            const authorNameText = stegaClean(t.authorName)
            return (
              <Reveal as="li" key={t.key} i={i} variant="scale">
                <Card className="testimonial-card group/quote relative h-full overflow-hidden transition-[transform,box-shadow,border-color] duration-300 will-change-transform motion-safe:hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg">
                  {/* Decorative quote mark. Sized to anchor the card rather than
                    garnish it; the float only runs on hover/focus-within (see
                    `.testimonial-card .quote-mark` in globals.css), so a grid of
                    cards is static at rest. */}
                  <span
                    aria-hidden="true"
                    className="quote-mark pointer-events-none absolute -top-6 -right-2 select-none font-serif text-[15rem] leading-none text-primary/12 transition-colors duration-300 group-hover/quote:text-primary/25 md:-top-8 md:text-[18rem]"
                  >
                    &rdquo;
                  </span>
                  <figure className="relative flex h-full flex-col gap-4 p-6">
                    {fullPage ? (
                      <>
                        <blockquote className="space-y-4 text-lg leading-8 font-medium text-pretty">
                          {highlight
                            .split(/\n{2,}/)
                            .filter(Boolean)
                            .map((paragraph, p) => (
                              <p key={p}>{paragraph}</p>
                            ))}
                        </blockquote>
                        {expandable && (
                          <Link
                            href={`${fullPage}#${testimonialAnchor(t.authorName, t.key)}`}
                            transitionTypes={['nav-forward']}
                            className="group/more -mx-2 -my-1 inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md px-2 py-1 font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            Read more
                            <span className="sr-only">
                              {' '}
                              of {authorNameText || 'this family'}&rsquo;s testimonial
                            </span>
                            <ArrowRightIcon
                              aria-hidden="true"
                              className="size-4 transition-transform duration-200 motion-safe:group-hover/more:translate-x-0.5 motion-reduce:transition-none"
                            />
                          </Link>
                        )}
                      </>
                    ) : (
                      <TestimonialQuote
                        highlight={highlight}
                        quote={t.quote ?? ''}
                        expandable={expandable}
                        authorName={authorNameText}
                      />
                    )}
                    <figcaption className="mt-auto">
                      <TestimonialAttribution
                        t={t}
                        avatarClassName="transition-transform duration-300 will-change-transform motion-safe:group-hover/quote:scale-110"
                      />
                    </figcaption>
                  </figure>
                </Card>
              </Reveal>
            )
          })}
        </ul>
      )}
    </section>
  )
}
