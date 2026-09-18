'use client'

import {useId, useState} from 'react'
import {ChevronDownIcon} from '@heroicons/react/24/outline'

import {cn} from '@/lib/utils'

type Props = {
  /** The pull quote: the strongest sentence or two, verbatim from `quote`. */
  highlight: string
  /** The full testimonial, shown once expanded. */
  quote: string
  /** False when the pull quote already *is* the whole quote — no control then. */
  expandable: boolean
  authorName?: string | null
  cite?: string | null
}

/**
 * Read-more disclosure for a testimonial card.
 *
 * The card leads with the pull quote and swaps in the full testimonial on
 * demand. Because `highlight` is validated in the Studio as a verbatim excerpt
 * of `quote`, the swap reads as the same voice getting longer rather than as
 * two different texts — and each field keeps its own stega payload, so
 * click-to-edit in Presentation still lands on the right field in both states.
 *
 * This is one of the few client islands in `blocks/` (cf. the native
 * `<details>` accordion in `Faq.tsx`). A `<details>` here would make the entire
 * quote the accessible name of a disclosure button, which fails the AAA bar in
 * docs/A11Y.md; a real `<button aria-expanded aria-controls>` beside plain text
 * does not. The island is a leaf — `Testimonials` itself stays an RSC.
 */
export default function TestimonialQuote({highlight, quote, expandable, authorName, cite}: Props) {
  const [expanded, setExpanded] = useState(false)
  const id = useId()

  const body = expanded ? quote : highlight
  const paragraphs = body.split(/\n{2,}/).filter(Boolean)

  return (
    <>
      <blockquote
        id={id}
        cite={cite || undefined}
        className={cn(
          'space-y-4',
          expanded ? 'leading-7 text-pretty' : 'text-lg leading-8 font-medium text-pretty',
        )}
      >
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </blockquote>

      {expandable && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={id}
          className="-mx-2 -my-1 inline-flex min-h-11 w-fit items-center gap-1 rounded-md px-2 py-1 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {expanded ? 'Read less' : 'Read more'}
          <ChevronDownIcon
            aria-hidden="true"
            className={cn(
              'size-4 transition-transform duration-200 motion-reduce:transition-none',
              expanded && 'rotate-180',
            )}
          />
          <span className="sr-only">of {authorName || 'this family'}&rsquo;s testimonial</span>
        </button>
      )}
    </>
  )
}
