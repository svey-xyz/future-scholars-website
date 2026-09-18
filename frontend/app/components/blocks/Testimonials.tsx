import {ArrowTopRightOnSquareIcon} from '@heroicons/react/24/outline'
import {stegaClean} from '@sanity/client/stega'

import Image from '@/app/components/common/SanityImage'
import Reveal from '@/app/components/motion/Reveal'
import TestimonialQuote from './TestimonialQuote'
import {Avatar as AvatarRoot, AvatarFallback} from '@/components/ui/avatar'
import {Card} from '@/components/ui/card'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'testimonials'>
  index: number
  pageId: string
  pageType: string
}

const colClass: Record<number, string> = {
  1: 'max-w-2xl',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
}

/**
 * The shape the card renders, whichever source the block draws from. Derived
 * from the inline member rather than hand-written so the image sub-type (asset
 * ref, hotspot, crop) stays whatever typegen says it is.
 */
type InlineTestimonial = NonNullable<ExtractPageBuilderType<'testimonials'>['testimonials']>[number]

type Quote = {
  key: string
  quote: string | null
  highlight?: string | null
  authorName: string | null
  authorRole?: string | null
  sourceUrl?: string | null
  authorImage?: InlineTestimonial['authorImage'] | null
}

/** Normalised for comparison only: whitespace, case and edge punctuation. */
const normalise = (value: string): string =>
  value
    .replace(/\s+/g, ' ')
    .replace(/^[\s"'\u201c\u201d\u2018\u2019.\u2026]+|[\s"'\u201c\u201d\u2018\u2019.\u2026]+$/g, '')
    .toLowerCase()

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

export default function Testimonials({block}: Props) {
  const {heading, subheading, testimonials, documentTestimonials, columns, limit} = block
  const cols = columns ?? 3

  // FSMA fork (build plan S3/S6): `source` picks between the template's inline
  // array and the `testimonial` documents, so the same quote can appear here
  // and on /testimonials without being retyped. GROQ resolves the documents
  // (ordered, featured-filtered); the `limit` is applied here rather than as a
  // GROQ slice, which cannot take a runtime value from the enclosing block.
  // `stegaClean`: enum values carry stega characters in draft mode, so a raw
  // comparison would always fall through to the inline array.
  const fromDocuments = stegaClean(block.source) === 'documents'

  const items: Quote[] = fromDocuments
    ? (documentTestimonials ?? []).slice(0, limit ?? 3).map((t) => ({
        key: t._id,
        quote: t.quote,
        highlight: t.highlight,
        authorName: t.authorName,
        authorRole: t.authorRole,
        authorImage: t.authorImage,
      }))
    : (testimonials ?? []).map((t) => ({
        key: t._key,
        quote: t.quote,
        highlight: t.highlight,
        authorName: t.authorName,
        authorRole: t.authorRole,
        sourceUrl: t.sourceUrl,
        authorImage: t.authorImage,
      }))

  if (items.length === 0) return null

  return (
    <section className="container my-12 lg:my-16">
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

      <ul className={cn('mt-8 grid grid-cols-1 gap-6', colClass[cols])}>
        {items.map((t, i) => {
          const ref = t.authorImage?.asset?._ref
          // `stegaClean` before any comparison: in draft mode both strings
          // carry invisible markers, so a raw `includes`/`!==` would always
          // report the pull quote as different from the full quote.
          const fullQuote = stegaClean(t.quote) ?? ''
          const highlight = t.highlight?.trim() ? t.highlight : leadSentences(fullQuote)
          const expandable = normalise(stegaClean(highlight) ?? '') !== normalise(fullQuote)
          const authorNameText = stegaClean(t.authorName)
          const initials =
            t.authorName
              ?.split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')
              .toUpperCase() || '?'
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
                  <TestimonialQuote
                    highlight={highlight}
                    quote={t.quote ?? ''}
                    expandable={expandable}
                    authorName={authorNameText}
                    cite={t.sourceUrl}
                  />
                  <figcaption className="mt-auto flex items-center gap-3">
                    <AvatarRoot className="h-10 w-10 transition-transform duration-300 will-change-transform motion-safe:group-hover/quote:scale-110">
                      {ref ? (
                        <Image
                          id={ref}
                          alt={t.authorImage?.alt || t.authorName || ''}
                          width={40}
                          height={40}
                          hotspot={t.authorImage?.hotspot}
                          crop={t.authorImage?.crop}
                          mode="cover"
                          className="aspect-square h-full w-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      )}
                    </AvatarRoot>
                    <span className="flex flex-col">
                      <span className="font-medium">{t.authorName}</span>
                      {t.authorRole && (
                        <span className="text-sm text-muted-foreground">{t.authorRole}</span>
                      )}
                    </span>
                    {t.sourceUrl && (
                      <a
                        href={t.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex min-h-11 items-center gap-1 rounded-md font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        Source
                        <ArrowTopRightOnSquareIcon aria-hidden="true" className="size-3.5" />
                        <span className="sr-only">
                          : original article for {t.authorName}&rsquo;s quote (opens in new tab)
                        </span>
                      </a>
                    )}
                  </figcaption>
                </figure>
              </Card>
            </Reveal>
          )
        })}
      </ul>
    </section>
  )
}
