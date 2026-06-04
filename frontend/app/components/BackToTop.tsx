'use client'

import {ChevronUpIcon} from '@heroicons/react/24/outline'
import {useEffect, useState} from 'react'

import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'

/**
 * Back-to-top affordance — a tiny client island pinned bottom-center, revealed
 * after the user scrolls past ~1 viewport (the old chevron from `ThemeHandler`).
 *
 * - Smooth-scrolls to top; instant under `prefers-reduced-motion`.
 * - Hidden from the a11y tree and tab order until shown (`inert` + `aria-hidden`,
 *   mirroring the collapsed-nav pattern in docs/A11Y.md).
 * - Fixed-position, so it never shifts layout (no CLS).
 *
 * Mounted once in `app/layout.tsx` (inside the theme provider, outside `<main>`).
 * Visibility rides an opacity/translate transition that echoes the repo's reveal
 * fade/translate language; the transition is dropped under reduced motion via
 * `motion-reduce:transition-none` (the scroll-driven `.reveal` classes are
 * one-shot entrance animations, so a state-driven transition is used instead).
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Reveal past ~1 viewport, with a 140px floor so short pages still surface it.
    const threshold = () => Math.max(140, window.innerHeight * 0.8)

    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        setVisible(window.scrollY > threshold())
      })
    }

    onScroll() // sync initial state (handles restored scroll positions)
    window.addEventListener('scroll', onScroll, {passive: true})
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const handleClick = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({top: 0, behavior: reduced ? 'auto' : 'smooth'})
  }

  return (
    <div
      inert={!visible}
      aria-hidden={!visible}
      className="fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit justify-center print:hidden"
    >
      <Button
        type="button"
        size="icon"
        aria-label="Back to top"
        onClick={handleClick}
        className={cn(
          'size-11 rounded-full shadow-lg transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none [&_svg]:size-5',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        )}
      >
        <ChevronUpIcon aria-hidden="true" />
        <span className="sr-only">Back to top</span>
      </Button>
    </div>
  )
}
