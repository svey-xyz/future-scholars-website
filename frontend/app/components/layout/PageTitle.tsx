import {stegaClean} from '@sanity/client/stega'

import {cn} from '@/lib/utils'
import type {TitleDisplay} from '@/sanity/lib/types'

type Props = {
  heading?: string | null
  subheading?: string | null
  /** Raw `page.titleDisplay` value (may be stega-encoded). Unset = auto. */
  display?: string | null
  /** When a hero block leads the page it owns the visual headline. */
  heroLeads?: boolean
}

/**
 * Route-level page heading/subheading with CMS-selected display mode
 * (`page.titleDisplay`):
 *
 * - `plain`       — the standard bordered headline block.
 * - `highlighted` — an emphasized panel treatment (accent hairline + muted
 *                   surface) for pages that need a stronger opening.
 * - `none`        — visually hidden; the `<h1>` stays sr-only (single H1 per
 *                   route, docs/A11Y.md).
 * - unset         — auto: `plain`, or `none` when a hero block leads the page.
 *
 * The mode drives *logic*, so it is stega-cleaned before branching
 * (CLAUDE.md stega discipline); heading/subheading stay un-cleaned so
 * click-to-edit overlays keep working.
 */
export default function PageTitle({heading, subheading, display, heroLeads}: Props) {
  const mode =
    (stegaClean(display ?? undefined) as TitleDisplay | undefined) ?? (heroLeads ? 'none' : 'plain')

  if (mode === 'none') return <h1 className="sr-only">{heading}</h1>

  const highlighted = mode === 'highlighted'

  return (
    <header className="container">
      <div
        className={cn(
          highlighted
            ? 'relative overflow-hidden rounded-xl border bg-muted/30 px-6 py-8 sm:px-10 sm:py-12'
            : 'border-b border-border pb-6',
        )}
      >
        {highlighted && (
          // Accent hairline along the panel top — decorative only.
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />
        )}
        <div className="max-w-3xl">
          <h1 className="text-4xl text-foreground sm:text-5xl lg:text-7xl">{heading}</h1>
          {subheading ? (
            <p className="mt-4 text-base font-light uppercase leading-relaxed text-muted-foreground lg:text-lg">
              {subheading}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  )
}
