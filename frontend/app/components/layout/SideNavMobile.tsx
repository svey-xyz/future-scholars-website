'use client'

import {useState, useSyncExternalStore} from 'react'
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
import BrandMark from './BrandMark'
import NavContact from './NavContact'
import SideNavLinks from './SideNavLinks'
import type {NavItem, SettingsContact} from '@/sanity/lib/types'

// Mount gate, same as the template's `MobileNav`: a store that reads `false`
// on the server and `true` on the client. An effect would be the obvious
// alternative, but `react-hooks/set-state-in-effect` (React Compiler) rejects
// setState inside an effect body — this is the sanctioned isomorphic form.
const subscribe = () => () => {}

type SideNavMobileProps = {
  navigation: NavItem[]
  contact: SettingsContact
  homepageSlug?: string | null
  siteTitle: string
}

/**
 * Below `lg`, the side rail becomes a fixed top bar plus a left drawer (D11).
 *
 * The Sheet is **modal** here — unlike the template's `MobileNav`, which had to
 * go non-modal so the persistent header underneath stayed operable. Nothing in
 * this bar needs to stay live behind the drawer, so Radix's own modal
 * behaviour does the work the spec asks for and we hand-roll none of it:
 * focus trap, Esc to close, focus returned to the hamburger, body scroll lock,
 * and the rest of the page hidden from assistive tech (docs/A11Y.md — "Don't
 * reproduce this manually").
 */
export default function SideNavMobile({
  navigation,
  contact,
  homepageSlug,
  siteTitle,
}: SideNavMobileProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

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

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-lg lg:hidden"
      // Anchors the bar so it doesn't slide with the content during directional
      // navigations (same treatment as `site-rail`; see globals.css).
      style={{viewTransitionName: 'site-topbar'}}
    >
      <Link
        href="/"
        aria-label={`${siteTitle} — home`}
        transitionTypes={['nav-back']}
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
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-11"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
              >
                <HamburgerIcon open={open} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-[19rem] max-w-[85vw] flex-col gap-0 p-0">
              <div className="px-5 pb-4 pt-6">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
                <BrandMark className="w-48" />
              </div>

              <nav
                aria-label="Main"
                className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4"
              >
                <SideNavLinks
                  navigation={navigation}
                  homepageSlug={homepageSlug}
                  onNavigate={() => setOpen(false)}
                />
              </nav>

              <div className="shrink-0 px-3 pb-6">
                <Separator className="mb-3" />
                <NavContact contact={contact} />
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
 * Hamburger ↔ close morph; three bars, the outer two rotating to an X.
 * `motion-reduce:transition-none` keeps it instant under reduced motion.
 */
function HamburgerIcon({open}: {open: boolean}) {
  return (
    <span className="relative block h-5 w-5" aria-hidden="true">
      <span
        className={`absolute left-0 top-[3px] h-0.5 w-5 rounded-full bg-current transition-transform duration-300 motion-reduce:transition-none ${open ? 'translate-y-[7px] rotate-45' : ''}`}
      />
      <span
        className={`absolute left-0 top-[9px] h-0.5 w-5 rounded-full bg-current transition-opacity duration-200 motion-reduce:transition-none ${open ? 'opacity-0' : ''}`}
      />
      <span
        className={`absolute left-0 top-[15px] h-0.5 w-5 rounded-full bg-current transition-transform duration-300 motion-reduce:transition-none ${open ? '-translate-y-[5px] -rotate-45' : ''}`}
      />
    </span>
  )
}
