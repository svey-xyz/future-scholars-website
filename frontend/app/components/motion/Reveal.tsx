import * as React from 'react'

import {cn} from '@/lib/utils'

/**
 * Scroll-reveal wrapper — a **Server Component** (no client JS). It only stamps
 * the reveal class + `data-reveal` hook + `--reveal-i` cascade index onto an
 * element; the motion itself is pure CSS (see the "Scroll reveal" block in
 * `app/globals.css`):
 *   - supported engines animate via `animation-timeline: view()`
 *   - others fall back to `RevealObserver` (toggles `data-revealed`)
 *   - reduced-motion / no-JS users get fully visible content
 *
 * Polymorphic via `as` so grid items can be `as="li"` etc. without an extra
 * wrapper node (keeps layout/Visual-Editing markup intact).
 */
const variants = {
  up: 'reveal',
  left: 'reveal-left',
  right: 'reveal-right',
  scale: 'reveal-scale',
} as const

type RevealProps<T extends React.ElementType = 'div'> = {
  as?: T
  variant?: keyof typeof variants
  /** Stagger index → drives the `--reveal-i` cascade for sibling items. */
  i?: number
} & Omit<React.ComponentPropsWithoutRef<T>, 'as'>

export default function Reveal<T extends React.ElementType = 'div'>({
  as,
  variant = 'up',
  i,
  className,
  style,
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? 'div') as React.ElementType
  return (
    <Tag
      data-reveal=""
      className={cn(variants[variant], className)}
      style={i ? ({...style, '--reveal-i': i} as React.CSSProperties) : style}
      {...rest}
    />
  )
}
