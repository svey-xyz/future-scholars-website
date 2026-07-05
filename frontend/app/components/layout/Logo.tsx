import type {SVGProps} from 'react'

/**
 * Animated "splitting-Z" monogram — a Server Component (no client JS).
 *
 * Three stacked copies of the same "Z" path are tinted in an RGB-ish offset
 * (theme-aware via CSS tokens, never hex) and **fan apart** on two triggers,
 * both pure CSS and reduced-motion-gated in `app/globals.css`:
 *   - **Scroll:** scroll progress feeds `--fan-scroll` (0→1) via
 *     `animation-timeline: scroll(root)`.
 *   - **Hover/focus:** the parent link is `group/logo`; `:hover`/`:focus-visible`
 *     feeds `--fan-hover` (0→1) with a transition.
 * Each ghost layer's transform sums both channels, so scroll + pointer fan-out
 * compose instead of clobbering one another; with both at 0 (reduced motion or
 * no scroll-timeline support) the copies sit perfectly stacked. The base copy
 * carries full `--foreground` contrast and never moves, so the mark stays
 * legible; the offset copies are decorative chromatic ghosts.
 *
 * Accessible name: when standalone, `role="img"` + `<title>` (`aria-label`).
 * When wrapped by a labelled control (the <Link> in `Header.tsx`), pass
 * `decorative` so the whole SVG is `aria-hidden` and the link owns the name.
 * Every path is `aria-hidden` regardless.
 */

// A blocky "Z" monogram, drawn once and reused per layer. Sized to a 48×48 box.
const Z_PATH = 'M10 12 H38 V19 L23 36 H38 V44 H10 V37 L25 20 H10 Z'

type LogoMarkProps = SVGProps<SVGSVGElement> & {
  /**
   * Accessible name for the mark. Used when the logo stands alone (no adjacent
   * text). In `Header.tsx` the wrapping <Link> already carries the accessible
   * name and the SVG is rendered decorative (`decorative` → `aria-hidden`) to
   * avoid a double SR announcement; pass `decorative` there.
   */
  title?: string
  /** Hide from the a11y tree (when an ancestor already provides the name). */
  decorative?: boolean
}

export default function Logo({title = 'Svey — home', decorative = false, ...props}: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? true : undefined}
      className="logo-z h-9 w-9 shrink-0 overflow-visible sm:h-10 sm:w-10"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {!decorative && <title>{title}</title>}
      {/* Chromatic ghost copies — decorative; they fan out on scroll + hover.
          Colors are theme tokens (destructive ≈ R, primary ≈ G-ish base,
          ring ≈ B-ish) blended so the offset reads as an RGB split in both
          light and dark without hardcoding hex. */}
      <path
        className="logo-z__layer logo-z--r"
        d={Z_PATH}
        fill="hsl(var(--destructive))"
        aria-hidden="true"
      />
      <path
        className="logo-z__layer logo-z--b"
        d={Z_PATH}
        fill="hsl(var(--ring))"
        aria-hidden="true"
      />
      {/* Base copy — full-contrast foreground token, sits on top and stays put. */}
      <path
        className="logo-z__layer logo-z--base"
        d={Z_PATH}
        fill="hsl(var(--foreground))"
        aria-hidden="true"
      />
    </svg>
  )
}
