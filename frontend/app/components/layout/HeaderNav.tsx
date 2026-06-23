'use client'

import {useCallback, useLayoutEffect, useRef, useState} from 'react'
import {usePathname} from 'next/navigation'

import DesktopNav from './DesktopNav'
import MobileNav from './MobileNav'
import {cn} from '@/lib/utils'
import type {
  NavItem,
  SettingsContact,
  SettingsLegal,
  SettingsMobileNav,
} from '@/sanity/lib/types'

type HeaderNavProps = {
  navigation: NavItem[]
  mobileNav: SettingsMobileNav
  contact: SettingsContact
  legal: SettingsLegal
}

/**
 * Owns the desktop-inline ↔ collapsed-hamburger decision based on available
 * space (not a fixed breakpoint).
 *
 * Measurement: the inline <DesktopNav> lives in a `flex-1 min-w-0` track whose
 * `clientWidth` is the space actually available to the nav (header width minus
 * the logo and the actions cluster, which sit outside this component). Because
 * the nav track is `flex-nowrap` and clips via `overflow-hidden`, the nav's
 * `scrollWidth` reports its *intrinsic* (un-wrapped) width even while clipped.
 * If intrinsic > available → collapse.
 *
 * The inline nav stays mounted (visually hidden + inert when collapsed) so
 * widening the viewport re-measures and can re-expand it.
 *
 * SSR / no-JS fallback: before hydration we render inline at `md:` and the
 * hamburger below (pure CSS), so the first paint is usable; once mounted, JS
 * takes over and refines the threshold by measured width.
 */
export default function HeaderNav({
  navigation,
  mobileNav,
  contact,
  legal,
}: HeaderNavProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const navRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()

  // `null` = not yet measured (SSR + first paint) → use the CSS md: fallback.
  const [collapsed, setCollapsed] = useState<boolean | null>(null)

  const measure = useCallback(() => {
    const track = trackRef.current
    const nav = navRef.current
    if (!track || !nav) return
    const available = track.clientWidth
    const intrinsic = nav.scrollWidth
    // 1px slack avoids flip-flopping on sub-pixel rounding.
    setCollapsed(intrinsic > available + 1)
  }, [])

  // Measure pre-paint to avoid a flash of the wrong layout.
  useLayoutEffect(() => {
    measure()

    const track = trackRef.current
    if (!track || typeof ResizeObserver === 'undefined') return

    let frame = 0
    const observer = new ResizeObserver(() => {
      // Debounce bursts of resize callbacks into one rAF.
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    })
    observer.observe(track)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [measure])

  // Recompute when the route changes (active item width can shift the layout).
  useLayoutEffect(() => {
    measure()
  }, [measure, pathname])

  if (navigation.length === 0) return null

  const measured = collapsed !== null
  const showInline = measured ? !collapsed : false
  const showHamburger = measured ? collapsed : false

  return (
    <div className="flex min-w-0 flex-1 items-center justify-end">
      {/* Available-space track. `min-w-0` lets it shrink below content size.
          We clip with `overflow-hidden` only while the nav is NOT shown inline
          (pre-measure or collapsed) so the over-wide nav never spills or forces a
          horizontal scrollbar — but we drop the clip once it fits inline, because
          otherwise the NavigationMenu dropdown panel (rendered just below the bar
          via an absolutely-positioned viewport) gets clipped away.
          `track.clientWidth` is the space available to the nav. */}
      <div
        ref={trackRef}
        className={cn('flex min-w-0 flex-1 justify-end', !showInline && 'overflow-hidden')}
      >
        <div
          ref={navRef}
          className={cn(
            'flex w-max flex-nowrap',
            // Pre-measure (SSR/no-JS): inline from md: up via CSS.
            !measured && 'hidden md:flex',
            // Post-measure: stay in flow + mounted (so widening re-measures and
            // re-expands), but hide + make inert when collapsed.
            measured && !showInline && 'pointer-events-none invisible',
          )}
          aria-hidden={measured && !showInline ? true : undefined}
          inert={measured && !showInline}
        >
          <DesktopNav navigation={navigation} />
        </div>
      </div>

      <MobileNav
        navigation={navigation}
        mobileNav={mobileNav}
        contact={contact}
        legal={legal}
        // Pre-measure (SSR/no-JS): hamburger below md: via CSS.
        className={cn(!measured && 'md:hidden', measured && !showHamburger && 'hidden')}
      />
    </div>
  )
}
