'use client'

import type {ReactNode, MouseEvent} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'

import {readProjectNavContext} from './nav-context'

/**
 * Context-aware back link for `/projects/[slug]` (issue #17). Progressive
 * enhancement over a plain archive link — resolution order on click:
 *
 * 1. Same-origin history → `router.back()` (returns to the exact page the
 *    visitor came from: the filtered archive, or the previous project when
 *    they've been paging with prev/next).
 * 2. No usable history (new tab / direct link) but an in-tab nav context →
 *    the originating list URL, filters and sort intact.
 * 3. Otherwise → the `href` (the designated projects-archive page), which is
 *    also what SSR/no-JS renders.
 */
export default function ProjectBackLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  const router = useRouter()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (new tab etc.) behave like a normal link.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return
    }
    const cameFromThisSite =
      window.history.length > 1 && document.referrer.startsWith(window.location.origin)
    if (cameFromThisSite) {
      event.preventDefault()
      router.back()
      return
    }
    const from = readProjectNavContext()?.from
    if (from) {
      event.preventDefault()
      router.push(from)
    }
  }

  return (
    <Link href={href} transitionTypes={['nav-back']} onClick={handleClick} className={className}>
      {children}
    </Link>
  )
}
