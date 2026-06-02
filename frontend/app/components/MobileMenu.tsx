'use client'

import {useSyncExternalStore} from 'react'
import Link from 'next/link'
import {Bars3Icon} from '@heroicons/react/24/outline'

import {Button} from '@/components/ui/button'
import {Separator} from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import GithubIcon from '@/app/components/icons/GithubIcon'

type Props = {
  navLinks: ReadonlyArray<{href: string; label: string}>
  githubHref: string
}

/**
 * Mobile menu is mount-gated to avoid a known Radix Dialog + React 19 hydration
 * mismatch on the SheetTrigger button. SSR-rendered Slot/forwardRef trees
 * compose refs whose identity differs from the client-side render, which
 * confuses React 19's stricter hydration diff. Rendering only after mount
 * sidesteps it; the button is hidden on desktop anyway (`sm:hidden`), so the
 * pre-mount gap is invisible there. On mobile the icon flashes in once the
 * client picks up — typically within a frame.
 */
const subscribe = () => () => {}

export default function MobileMenu({navLinks, githubHref}: Props) {
  // True after first client render; false on server + first hydration pass.
  // Uses useSyncExternalStore (not useState/useEffect) to avoid the
  // react-hooks/set-state-in-effect lint rule and the extra render it implies.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  if (!mounted) {
    // Reserve the slot so layout doesn't shift when the button appears.
    return <div className="h-9 w-9 sm:hidden" aria-hidden="true" />
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="Open menu"
        >
          <Bars3Icon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-6">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              transitionTypes={['nav-forward']}
              className="rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Separator />
        <Button asChild size="lg" className="rounded-full">
          <a href={githubHref} target="_blank" rel="noopener noreferrer">
            <span>View on GitHub</span>
            <GithubIcon className="h-5 w-5" />
          </a>
        </Button>
      </SheetContent>
    </Sheet>
  )
}
