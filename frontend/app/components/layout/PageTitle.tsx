import {stegaClean} from '@sanity/client/stega'

import {roomStyle} from '@/lib/room'
import {cn} from '@/lib/utils'
import type {TitleDisplay} from '@/sanity/lib/types'

type Props = {
  heading?: string | null
  subheading?: string | null
  /** Raw `page.titleDisplay` value (may be stega-encoded). Unset = auto. */
  display?: string | null
  /** Raw `program.accent` (may be stega-encoded): forces the highlighted panel in the room tint (FB5). */
  accent?: string | null
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
 * - unset         — `plain`.
 *
 * With an `accent` (program pages without a masthead) the panel is always
 * highlighted, tinted and ruled in the room colour, with the heading in the
 * room's `-strong` tone (≥ 8.25:1 on the tint).
 *
 * The mode drives *logic*, so it is stega-cleaned before branching
 * (CLAUDE.md stega discipline); heading/subheading stay un-cleaned so
 * click-to-edit overlays keep working.
 */
export default function PageTitle({heading, subheading, display, accent}: Props) {
  const mode = (stegaClean(display ?? undefined) as TitleDisplay | undefined) ?? 'plain'
  const room = roomStyle(accent)

  if (mode === 'none') return <h1 className="sr-only">{heading}</h1>

  const highlighted = mode === 'highlighted' || Boolean(room)

  return (
    <header className="container" style={room}>
      <div
        className={cn(
          highlighted
            ? 'relative overflow-hidden rounded-xl border px-6 py-8 sm:px-10 sm:py-12'
            : 'border-b border-border pb-6',
          highlighted && (room ? 'border-room/25 bg-room-tint' : 'bg-muted/30'),
        )}
      >
        {highlighted && (
          // Accent hairline along the panel top — decorative only.
          <span
            aria-hidden="true"
            className={cn('absolute inset-x-0 top-0', room ? 'h-1.5 bg-room' : 'h-1 bg-primary')}
          />
        )}
        <div className="max-w-3xl">
          <h1
            className={cn(
              'text-4xl sm:text-5xl lg:text-7xl',
              room ? 'text-room-strong' : 'text-foreground',
            )}
          >
            {heading}
          </h1>
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
