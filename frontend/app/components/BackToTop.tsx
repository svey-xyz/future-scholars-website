'use client'

import {ChevronUpIcon} from '@heroicons/react/24/outline'
import {useEffect, useRef, useState} from 'react'

import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'

/** Base gap from the viewport bottom (matches the original `bottom-6` = 1.5rem). */
const GAP = 24

/**
 * Back-to-top affordance — a tiny client island pinned to the bottom-right of
 * the content column, revealed after the user scrolls past ~1 viewport.
 *
 * - Smooth-scrolls to top; instant under `prefers-reduced-motion`.
 * - Hidden from the a11y tree and tab order until shown (`inert` + `aria-hidden`,
 *   mirroring the collapsed-nav pattern in docs/A11Y.md).
 * - Fixed-position, so it never shifts layout (no CLS). The button rides inside
 *   the same `.container` utility every section uses, `justify-end`, so its right
 *   edge stays flush with the content border at every breakpoint. The wrappers
 *   are `pointer-events-none` (the empty track never eats clicks); only the
 *   button itself opts back in via `pointer-events-auto`.
 *
 * Mounted once in `app/layout.tsx` (inside the theme provider, outside `<main>`).
 *
 * Motion — the circle (button background) and the chevron animate *separately*:
 * the circle scales/translates in with a springy back-out ease and grows on
 * hover / squishes on press; the chevron fades up on a slight delay (a stagger
 * that reads as two distinct pops) and nudges/launches upward on hover/press.
 * All of it is dropped under reduced motion via `motion-reduce:*` guards
 * (docs/A11Y.md), leaving instant, static state changes.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reveal past ~1 viewport, with a 140px floor so short pages still surface it.
    const threshold = () => Math.max(140, window.innerHeight * 0.2)
    const footer = document.querySelector('footer')

    let raf = 0
    const update = () => {
      raf = 0
      setVisible(window.scrollY > threshold())

      // Sticky bottom floor: never let the button enter the footer. Track how far
      // the footer has risen into the viewport and lift the track by that amount,
      // keeping a constant GAP above its top edge. Written straight to the DOM so
      // scroll-driven updates don't churn React state.
      const track = trackRef.current
      if (track && footer) {
        const overlap = window.innerHeight - footer.getBoundingClientRect().top
        track.style.bottom = `${GAP + Math.max(0, overlap)}px`
      }
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }

    update() // sync initial state (handles restored scroll positions)
    window.addEventListener('scroll', onScroll, {passive: true})
    window.addEventListener('resize', onScroll, {passive: true})
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const handleClick = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({top: 0, behavior: reduced ? 'auto' : 'smooth'})
  }

  return (
    <div
      ref={trackRef}
      inert={!visible}
      aria-hidden={!visible}
      style={{bottom: GAP}}
      className="pointer-events-none fixed inset-x-0 z-50 print:hidden"
    >
      <div className="container flex justify-end">
        <Button
          type="button"
          size="icon"
          aria-label="Back to top"
          onClick={handleClick}
          className={cn(
            // The circle: springy back-out enter, grow on hover, squish on press.
            'group pointer-events-auto size-11 rounded-full shadow-lg cursor-pointer',
            'transition-[transform,opacity,box-shadow,background-color,color,scale,translate-y] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            'hover:scale-110 hover:shadow-xl active:scale-90 active:duration-150',
            'motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
            visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-10 opacity-0',
          )}
        >
          <ChevronUpIcon
            aria-hidden="true"
            className={cn(
              // The chevron: own transform track — staggered fade-up on enter,
              // nudge up on hover, launch up on press. Separate from the circle.
              'size-5 transition-[transform,opacity,translate-y,scale] delay-150 duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
              'group-hover:-translate-y-0.5 group-active:-translate-y-1.5',
              'motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-active:translate-y-0',
              visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
            )}
          />
          <span className="sr-only">Back to top</span>
        </Button>
      </div>
    </div>
  )
}
