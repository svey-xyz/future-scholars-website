import {stegaClean} from '@sanity/client/stega'

import Reveal from '@/app/components/motion/Reveal'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'pullQuote'>
  index: number
  pageId: string
  pageType: string
  className?: string
}

/**
 * Pull quote (`pullQuote` block). `<figure>` + `<blockquote>` + `<figcaption>`
 * ties the attribution to the quote for assistive tech.
 *
 * `repeatsText` hides the figure from the a11y tree: a quote lifted from the
 * page's own copy would otherwise be read twice. It stays visible — this is a
 * visual device only.
 *
 * Contrast: plain = `primary` on paper (10.77:1), panel = `secondary-foreground`
 * on `secondary` (11.61:1); attribution = `muted-foreground` (7.64 / 7.00-class
 * on the panel, measured in plan §7.2). The quote glyph is decorative and uses
 * `brand-accent-strong`, which is a UI-pass colour, never text.
 */
export default function PullQuote({block, className}: Props) {
  const {quote, attribution} = block
  if (!quote) return null

  const isPanel = stegaClean(block.tone) === 'panel'
  const hidden = block.repeatsText === true

  return (
    <div className={cn('my-12 lg:my-16', isPanel && 'bg-secondary py-12 lg:py-16', className)}>
      <div className="container">
        <Reveal
          as="figure"
          aria-hidden={hidden || undefined}
          className="relative max-w-3xl pl-10 sm:pl-14 sm:ml-14"
        >
          <span
            aria-hidden="true"
            className="absolute -top-3 left-0 font-display text-7xl leading-none text-brand-accent-strong sm:-top-4 sm:text-8xl"
          >
            &ldquo;
          </span>
          <blockquote>
            <p
              className={cn(
                'font-display text-2xl leading-snug text-pretty md:text-3xl lg:text-[2.125rem] lg:leading-tight',
                isPanel ? 'text-secondary-foreground' : 'text-primary',
              )}
            >
              {quote}
            </p>
          </blockquote>
          {attribution ? (
            <figcaption
              className={cn(
                'mt-5 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em]',
                isPanel ? 'text-secondary-foreground' : 'text-muted-foreground',
              )}
            >
              <span aria-hidden="true" className="h-0.5 w-8 bg-brand-accent-strong" />
              {attribution}
            </figcaption>
          ) : null}
        </Reveal>
      </div>
    </div>
  )
}
