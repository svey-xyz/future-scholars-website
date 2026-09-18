'use client'

import {useEffect, useRef, useState, useSyncExternalStore} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'

import {Button} from '@/components/ui/button'
import {Separator} from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {cn} from '@/lib/utils'
import BrandMark from './BrandMark'
import ContactHub from './ContactHub'
import SideNavLinks from './SideNavLinks'
import type {NavItem, SettingsContact} from '@/sanity/lib/types'

// Mount gate: a store that reads `false`
// on the server and `true` on the client. An effect would be the obvious
// alternative, but `react-hooks/set-state-in-effect` (React Compiler) rejects
// setState inside an effect body — this is the sanctioned isomorphic form.
const subscribe = () => () => {}

/** Matches the `lg` breakpoint where the desktop rail takes over. */
const DESKTOP_QUERY = '(min-width: 64rem)'

type SideNavMobileProps = {
  navigation: NavItem[]
  contact: SettingsContact
  homepageSlug?: string | null
  siteTitle: string
}

/**
 * Below `lg`, the side rail becomes a fixed top bar plus a full-screen menu
 * that drops down from under it (D11).
 *
 * The bar stays visible and live while the menu is open — its hamburger morphs
 * into the X that closes it. That rules out a *modal* Radix Sheet (modal mode
 * hides and disables everything outside the panel, the bar included), so the
 * Sheet runs `modal={false}` and we restore the modal contract ourselves, with
 * the platform doing the heavy lifting:
 *
 * - `inert` on everything except the bar + panel → focus containment, the page
 *   hidden from assistive tech, and no stray pointer input (replaces Radix's
 *   focus trap + `hideOthers`).
 * - `overflow: hidden` on <html> → scroll lock.
 * - Radix still owns Esc to close, focus into the panel on open, focus back to
 *   the hamburger on close, and trigger `aria-expanded`/`aria-controls`.
 *
 * The bar, not the panel, is the dialog's "header": the panel sits flush under
 * it (`top-16`) and the bar is stacked above it, so the slide-down reads as the
 * menu unrolling out of the bar.
 */
export default function SideNavMobile({
  navigation,
  contact,
  homepageSlug,
  siteTitle,
}: SideNavMobileProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Radix Dialog's trigger hydrates with a React 19 mismatch when it is
  // server-rendered, so the trigger mounts only after hydration.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  // Close after a route change. In-panel links also call `onNavigate`, which
  // matters when the target is the route we are already on.
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    if (open) setOpen(false)
  }

  // Modal contract for the non-modal Sheet (see the component doc).
  useEffect(() => {
    if (!open) return
    const keep = [headerRef.current, panelRef.current].filter(
      (el): el is HTMLElement => el !== null,
    )
    const releaseInert = inertOutside(keep)
    const root = document.documentElement
    const prevOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      releaseInert()
      root.style.overflow = prevOverflow
    }
  }, [open])

  // The bar and panel are `lg:hidden`: growing past the breakpoint with the
  // menu open would otherwise leave the page inert behind an invisible panel.
  useEffect(() => {
    if (!open) return
    const mql = window.matchMedia(DESKTOP_QUERY)
    const onChange = (e: MediaQueryListEvent) => e.matches && setOpen(false)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [open])

  return (
    <header
      ref={headerRef}
      className={cn(
        // z-[60]: above the panel (z-50) so it slides out from underneath.
        'fixed inset-x-0 top-0 z-[60] flex h-16 items-center gap-3 border-b px-4 transition-colors duration-200 motion-reduce:transition-none lg:hidden',
        // Solid while open so the panel's slide is hidden behind the bar
        // rather than blurred through it.
        open
          ? 'border-transparent bg-background'
          : 'border-border bg-background/90 backdrop-blur-lg',
      )}
      // Anchors the bar so it doesn't slide with the content during directional
      // navigations (same treatment as `site-rail`; see globals.css).
      style={{viewTransitionName: 'site-topbar'}}
    >
      <Link
        href="/"
        aria-label={`${siteTitle} — home`}
        transitionTypes={['nav-back']}
        onClick={() => setOpen(false)}
        className="flex min-w-0 items-center gap-2.5 rounded-md py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* The link owns the accessible name, so the mark is decorative. The
            full lockup's wordmark is illegible at bar height — the mark plus
            live text reads at 360px and is selectable/translatable. */}
        <BrandMark variant="mark" decorative priority className="h-9 w-auto" />
        <span className="truncate font-display text-base font-semibold text-foreground">
          Future Scholars
        </span>
      </Link>

      <div className="ml-auto">
        {mounted ? (
          <Sheet open={open} onOpenChange={setOpen} modal={false}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 rounded-lg hover:bg-secondary hover:text-secondary-foreground"
                aria-label={open ? 'Close menu' : 'Open menu'}
              >
                <HamburgerIcon open={open} />
              </Button>
            </SheetTrigger>
            <SheetContent
              ref={panelRef}
              side="top"
              showClose={false}
              // The bar is part of the menu's UI, not "outside" it: tabbing or
              // clicking back up to it mustn't dismiss. The hamburger toggles
              // and the home link closes explicitly.
              onInteractOutside={(event) => {
                if (headerRef.current?.contains(event.target as Node)) event.preventDefault()
              }}
              className={cn(
                // Full screen below the bar. `dvh`-safe via top/bottom insets.
                'top-16 bottom-0 flex flex-col gap-0 border-b-0 bg-background p-0 shadow-none lg:hidden',
                // Drop down from the bar: a full-height slide with a strong
                // ease-out, quicker on the way back up. Reduced motion: none.
                'data-[state=open]:duration-400 data-[state=closed]:duration-250',
                'data-[state=open]:ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:ease-in',
                'motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none',
              )}
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>

              <nav
                aria-label="Main"
                className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4"
              >
                <SideNavLinks
                  navigation={navigation}
                  homepageSlug={homepageSlug}
                  onNavigate={() => setOpen(false)}
                  variant="drawer"
                />
              </nav>

              <div className="shrink-0 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <Separator className="mb-3" />
                <ContactHub contact={contact} variant="stacked" />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          // Reserve the slot so nothing shifts when the trigger hydrates.
          <div className="size-11" aria-hidden="true" />
        )}
      </div>
    </header>
  )
}

/**
 * Makes every element outside `keep` inert, walking down only through the
 * ancestors of kept nodes (the same shape as `aria-hidden`'s `hideOthers`).
 * Returns a cleanup that restores exactly what it changed.
 */
function inertOutside(keep: HTMLElement[]): () => void {
  const touched: HTMLElement[] = []
  const walk = (parent: Element) => {
    for (const child of Array.from(parent.children)) {
      if (!(child instanceof HTMLElement) || keep.includes(child)) continue
      if (keep.some((el) => child.contains(el))) {
        walk(child)
      } else if (!child.inert && !['SCRIPT', 'STYLE', 'LINK', 'TEMPLATE'].includes(child.tagName)) {
        child.inert = true
        touched.push(child)
      }
    }
  }
  walk(document.body)
  return () => touched.forEach((el) => (el.inert = false))
}

/**
 * Hamburger ↔ close morph: three bars on a 5px pitch; the outer two travel to
 * the centre line and rotate into an X while the middle one fades.
 * `motion-reduce:transition-none` keeps it instant under reduced motion.
 */
function HamburgerIcon({open}: {open: boolean}) {
  const bar = 'absolute left-0 h-0.5 w-5 rounded-full bg-current motion-reduce:transition-none'
  return (
    <span className="relative block size-5" aria-hidden="true">
      <span
        className={cn(
          bar,
          'top-1 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open && 'translate-y-[5px] rotate-45',
        )}
      />
      <span
        className={cn(
          bar,
          'top-[9px] transition-[opacity,scale] duration-200',
          open && 'scale-x-0 opacity-0',
        )}
      />
      <span
        className={cn(
          bar,
          'top-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open && '-translate-y-[5px] -rotate-45',
        )}
      />
    </span>
  )
}
