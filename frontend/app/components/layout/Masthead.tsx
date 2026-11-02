import type {CSSProperties} from 'react'
import {stegaClean} from '@sanity/client/stega'

import Image from '@/app/components/common/SanityImage'
import BrandMark from './BrandMark'
import {cn} from '@/lib/utils'
import type {GetPageQueryResult} from '@/sanity.types'

type MastheadData = NonNullable<GetPageQueryResult>['masthead']

type Props = {
  masthead: NonNullable<MastheadData>
  heading?: string | null
  subheading?: string | null
  /** Raw `page.titleDisplay` (may be stega-encoded). `none` keeps the h1 sr-only. */
  titleDisplay?: string | null
  /** Raw `program.accent` (may be stega-encoded): adds the room-colour rule (FB5). */
  accent?: string | null
}

/* Heights (schema `masthead.height`, §7.6): tall ≈ 60vh desktop / 42vh mobile,
   standard ≈ 48/34vh, compact ≈ 34/26vh, each with a rem floor for very short
   viewports. These are MIN-heights: a fixed height clipped the top of the copy
   (eyebrow + logo) whenever eyebrow + logo + h1 + subheading outgrew the box,
   e.g. compact program banners on a 1366×700 laptop lost ~88px. Growing the
   box adds no CLS — its contents are server-rendered text and a vector logo
   with intrinsic dimensions, and the photograph is absolutely positioned. */
const HEIGHTS: Record<string, string> = {
  tall: 'min-h-[max(42vh,18rem)] lg:min-h-[max(60vh,24rem)]',
  standard: 'min-h-[max(34vh,15rem)] lg:min-h-[max(48vh,20rem)]',
  compact: 'min-h-[max(26vh,13rem)] lg:min-h-[max(34vh,16rem)]',
}

/* Brand panel tones (schema `masthead.tone`). `secondary` is a light surface,
   so it takes the standard (blue/black) lockup and dark text; the dark tones
   take the reversed white lockup. All pairs are AAA per the §12 contrast table. */
const TONES: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground',
  ink: 'bg-foreground text-background',
  secondary: 'bg-secondary text-secondary-foreground',
}

/* Scrim tiers (schema `masthead.overlay`, image variant only). Centre placement
   gets a flat wash; bottom-left gets a gradient that concentrates behind the
   lockup. White text/logo over any of these on a typical photograph clears
   4.5:1 — on unusually bright photographs the editor raises the tier (the
   field description says so). */
const SCRIM_FLAT: Record<string, string> = {
  light: 'bg-black/40',
  medium: 'bg-black/55',
  strong: 'bg-black/70',
}
const SCRIM_GRADIENT: Record<string, string> = {
  light: 'bg-gradient-to-t from-black/60 via-black/25 to-transparent',
  medium: 'bg-gradient-to-t from-black/75 via-black/40 to-black/10',
  strong: 'bg-gradient-to-t from-black/85 via-black/55 to-black/25',
}

/* Logo placement (schema `masthead.logoPlacement`). `bottomCenter` (FB9) sits
   the lockup low and centred, behind the gradient scrim like `bottomLeft`. */
type Placement = 'center' | 'bottomLeft' | 'bottomCenter'
const PLACEMENT: Record<Placement, {header: string; inner: string}> = {
  center: {
    header: 'items-center justify-center text-center',
    inner: 'items-center px-6 sm:px-10 lg:px-14',
  },
  // Left placement shares the content column's `container` (max-width, auto
  // margins, 2rem gutter) so the lockup's left edge lines up with every block
  // below it.
  bottomLeft: {header: 'items-end', inner: 'container items-start'},
  bottomCenter: {
    header: 'items-end justify-center text-center',
    inner: 'items-center px-6 sm:px-10 lg:px-14',
  },
}

/* Logo widths (schema `masthead.logoSize`). The box height is fixed and the
   logo is a vector with intrinsic dimensions, so a larger logo adds no CLS. */
const LOGO_SIZES: Record<string, string> = {
  standard: 'w-48 sm:w-64 lg:w-80',
  large: 'w-64 sm:w-96 lg:w-[30rem]',
}

/* Room accents (FB5, `program.accent`). The rule is decorative — the room name
   is always in text (1.4.1) — so base tones are fine for it. The eyebrow text
   uses the `-strong` tones only, and only on the light (sky) panel they were
   measured against (docs/A11Y.md). */
const ACCENT_RULE: Record<string, string> = {
  roses: 'border-b-[6px] border-room-roses',
  shamrock: 'border-b-[6px] border-room-shamrock',
  violet: 'border-b-[6px] border-room-violet',
}
const ACCENT_TEXT: Record<string, string> = {
  roses: 'text-room-roses-strong',
  shamrock: 'text-room-shamrock-strong',
  violet: 'text-room-violet-strong',
}

// Inline custom-property helper (typed) for the mount-entrance cascade;
// `.enter` is gated on prefers-reduced-motion in
// globals.css, so reduced-motion users get everything instantly.
const delay = (ms: number) => ({'--enter-d': `${ms}ms`}) as CSSProperties

/**
 * Page-level masthead (S5, D12, §7.6): the full-bleed image — or flat brand
 * panel — that opens every page, with the logo lockup and the page heading
 * over it. Rendered by `CachedPage` for both `/` and `/[slug]`, so it is a
 * plain RSC inside the route's existing cache boundary (no fetch of its own).
 *
 * The masthead owns the page's visual `<h1>` whenever it is present
 * (`PageTitle` is suppressed by the caller): visible by default, sr-only when
 * the editor picked `titleDisplay: 'none'` (the decorative-masthead case §7.6
 * calls for). Strings stay stega-encoded so click-to-edit keeps working; only
 * the enum branches are stega-cleaned (stega discipline, CLAUDE.md).
 *
 * The photograph is the LCP element: eager + high fetch priority, a
 * hotspot-aware CDN crop, and `sizes` that accounts for the 17rem rail from
 * `lg` up. Never animated — animating the LCP image delays perceived load;
 * only the overlaid copy rides the `.enter` cascade.
 */
export default function Masthead({masthead, heading, subheading, titleDisplay, accent}: Props) {
  const variant = stegaClean(masthead.variant)
  const height = HEIGHTS[stegaClean(masthead.height) ?? 'standard'] ?? HEIGHTS.standard
  const showLogo = masthead.showLogo !== false
  const placementKey = stegaClean(masthead.logoPlacement) ?? 'center'
  const placement: Placement = placementKey in PLACEMENT ? (placementKey as Placement) : 'center'
  const logoSize = LOGO_SIZES[stegaClean(masthead.logoSize) ?? 'standard'] ?? LOGO_SIZES.standard
  const hideHeading = stegaClean(titleDisplay) === 'none'
  const accentKey = stegaClean(accent) ?? ''

  const imageRef = masthead.image?.asset?._ref
  const isImage = variant === 'image' && Boolean(imageRef)
  const tone = TONES[stegaClean(masthead.tone) ?? 'primary'] ?? TONES.primary
  // Light panel → standard lockup; dark panels (and any photograph) → reversed.
  const reversedLogo = isImage || tone !== TONES.secondary
  const overlay = stegaClean(masthead.overlay) ?? 'medium'
  const scrim = placement === 'center' ? SCRIM_FLAT[overlay] : SCRIM_GRADIENT[overlay]
  const lightPanel = !isImage && tone === TONES.secondary
  const eyebrowAccent = lightPanel ? ACCENT_TEXT[accentKey] : undefined

  return (
    <header
      className={cn(
        'relative isolate flex w-full overflow-hidden',
        height,
        !isImage && tone,
        PLACEMENT[placement].header,
        ACCENT_RULE[accentKey],
      )}
    >
      {isImage && imageRef ? (
        <>
          <Image
            id={imageRef}
            alt={masthead.image?.alt || ''}
            width={1600}
            height={600}
            mode="cover"
            hotspot={masthead.image?.hotspot}
            crop={masthead.image?.crop}
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 64rem) calc(100vw - 17rem), 100vw"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          {scrim ? (
            <div aria-hidden="true" className={cn('absolute inset-0 -z-10', scrim)} />
          ) : null}
        </>
      ) : null}

      <div
        className={cn(
          'flex flex-col gap-4 py-8 lg:py-12',
          PLACEMENT[placement].inner,
          // Photographs take the on-dark token (white) for copy; brand panels
          // inherit their tone's foreground from the header element.
          isImage && 'text-primary-foreground',
        )}
      >
        {masthead.eyebrow ? (
          <p
            className={cn(
              'enter text-xs font-semibold uppercase tracking-[0.2em]',
              // Accent eyebrows stay fully opaque: opacity would eat the
              // measured contrast of the -strong tone.
              eyebrowAccent ?? 'opacity-90',
            )}
            style={delay(0)}
          >
            {masthead.eyebrow}
          </p>
        ) : null}
        {showLogo ? (
          <div className={cn('enter', logoSize)} style={delay(90)}>
            <BrandMark
              variant="full"
              reversed={reversedLogo}
              decorative
              priority
              className="drop-shadow-sm"
            />
          </div>
        ) : null}
        {hideHeading ? (
          // Decorative masthead (titleDisplay: 'none'): the h1 must still exist
          // (§7.6, one h1 per route), it just isn't part of the visual design.
          <h1 className="sr-only">{heading}</h1>
        ) : (
          <h1
            className="enter max-w-4xl text-3xl text-balance sm:text-4xl lg:text-5xl"
            style={delay(showLogo ? 180 : 90)}
          >
            {heading}
          </h1>
        )}
        {subheading && !hideHeading ? (
          <p
            className="enter max-w-2xl text-sm uppercase leading-relaxed tracking-wide opacity-90 lg:text-base"
            style={delay(showLogo ? 260 : 170)}
          >
            {subheading}
          </p>
        ) : null}
      </div>
    </header>
  )
}
