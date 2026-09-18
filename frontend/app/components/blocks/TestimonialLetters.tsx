import {stegaClean} from '@sanity/client/stega'

import Reveal from '@/app/components/motion/Reveal'
import TestimonialAttribution, {normalise, type Quote} from './TestimonialAttribution'
import {cn} from '@/lib/utils'

type Props = {
  items: Quote[]
  /** Scopes heading ids so two blocks showing the same documents don't collide. */
  blockKey: string
  /** Family names are h3 under a block heading, otherwise h2 (no skipped level). */
  hasHeading: boolean
}

/**
 * Letters layout — the `testimonials` block's full-page mode.
 *
 * The card grid is built for three pull quotes beside other content; on a
 * dedicated page it strands long letters behind "Read more" in a narrow column.
 * Here every testimonial is shown in full, one per row across a 12-column
 * grid: the pull quote + attribution in a sticky aside, the letter at a
 * readable measure beside it. Rows alternate sides on `lg` for rhythm; DOM
 * (and so reading/tab) order is the same for every row.
 *
 * Pure RSC — nothing to toggle, so no client island.
 */
export default function TestimonialLetters({items, blockKey, hasHeading}: Props) {
  const Name = hasHeading ? 'h3' : 'h2'

  return (
    <ol className="divide-y divide-border">
      {items.map((t, i) => {
        const nameId = `testimonial-${blockKey}-${t.key}`
        const fullQuote = stegaClean(t.quote) ?? ''
        const paragraphs = (t.quote ?? '').split(/\n{2,}/).filter(Boolean)
        // Only an editor-chosen highlight earns the pull-quote slot: the
        // auto-extracted lead sentence would just repeat the letter's opening
        // line a few centimetres away.
        const pull =
          t.highlight?.trim() && normalise(stegaClean(t.highlight)) !== normalise(fullQuote)
            ? t.highlight
            : null
        const flip = i % 2 === 1

        return (
          <Reveal as="li" key={t.key} className="py-12 first:pt-4 lg:py-20 lg:first:pt-8">
            <article
              aria-labelledby={nameId}
              className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-x-8"
            >
              <aside
                className={cn(
                  'flex flex-col gap-6 lg:sticky lg:top-8 lg:row-start-1 lg:col-span-4 lg:self-start',
                  flip ? 'lg:col-start-9' : 'lg:col-start-1',
                )}
              >
                <span
                  aria-hidden="true"
                  className="-mb-10 block h-16 select-none font-serif text-8xl leading-none text-primary/40"
                >
                  &ldquo;
                </span>
                {/* A pull quote is a verbatim excerpt of the letter below, so
                    it is hidden from AT to avoid reading it twice. */}
                {pull && (
                  <p
                    aria-hidden="true"
                    className="font-display text-2xl leading-snug font-medium text-balance md:text-3xl"
                  >
                    {pull}
                  </p>
                )}
                <TestimonialAttribution t={t} nameAs={Name} nameId={nameId} size="lg" />
              </aside>

              <blockquote
                cite={t.sourceUrl || undefined}
                className={cn(
                  'max-w-prose space-y-6 text-lg leading-8 text-pretty lg:row-start-1 lg:col-span-7',
                  flip ? 'lg:col-start-1' : 'lg:col-start-6',
                )}
              >
                {paragraphs.map((paragraph, p) => (
                  <p key={p}>{paragraph}</p>
                ))}
              </blockquote>
            </article>
          </Reveal>
        )
      })}
    </ol>
  )
}
