'use client'

import {usePathname} from 'next/navigation'
import {stegaClean} from '@sanity/client/stega'
import {ArrowTopRightOnSquareIcon, ChevronDownIcon} from '@heroicons/react/24/outline'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import ResolvedLink from '@/app/components/common/ResolvedLink'
import {linkResolver} from '@/sanity/lib/utils'
import {cn} from '@/lib/utils'
import type {NavItem, NavLinkItem} from '@/sanity/lib/types'

type DesktopNavProps = {
  navigation: NavItem[]
  className?: string
}

/**
 * CMS-driven desktop navigation (Radix/shadcn NavigationMenu).
 *
 * - `navLink` → leaf link via the shared <ResolvedLink>/linkResolver.
 * - `navDropdown` → a real <button> trigger (NavigationMenuTrigger) that never
 *   navigates, plus a NavigationMenuContent panel of child links.
 * - Active state: aria-current="page" on the leaf whose resolved href matches
 *   the current pathname.
 *
 * Kept presentation-only; HeaderNav owns visibility (inline vs collapsed).
 */
export default function DesktopNav({navigation, className}: DesktopNavProps) {
  const pathname = usePathname()

  return (
    <NavigationMenu className={className}>
      <NavigationMenuList className="flex-nowrap">
        {navigation.map((item) =>
          item._type === 'navDropdown' ? (
            // `relative` so the dropdown panel anchors under THIS item.
            <NavigationMenuItem key={item._key} className="relative">
              {/* Trigger is a Radix <button> — it toggles the panel and never
                  navigates (requirement 3). The chevron rotates on open. */}
              <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
              {/* Open/close motion: fade + zoom + slide, driven by Radix
                  data-state / data-motion. tw-animate-css honours
                  prefers-reduced-motion automatically. */}
              <NavigationMenuContent
                className={cn(
                  'data-[state=open]:animate-in data-[state=closed]:animate-out',
                  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                  'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                  'data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1',
                )}
              >
                <ul className="grid w-56 gap-1 p-2">
                  {item.links?.map((child) => (
                    <li key={child._key}>
                      <DesktopNavLeaf link={child} pathname={pathname} inDropdown />
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={item._key}>
              <DesktopNavLeaf link={item} pathname={pathname} />
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function DesktopNavLeaf({
  link,
  pathname,
  inDropdown = false,
}: {
  link: NavLinkItem
  pathname: string
  inDropdown?: boolean
}) {
  const href = linkResolver(link.link)
  const label = link.resolvedTitle || link.title || ''
  // `stegaClean`: enum comparison must ignore draft-mode stega characters.
  const isExternal = stegaClean(link.link?.linkType) === 'href'
  const opensInNewTab = Boolean(link.link?.openInNewTab)
  const isActive = !isExternal && typeof href === 'string' && href === pathname

  return (
    <NavigationMenuLink asChild active={isActive}>
      {/* `aria-current="page"` is set explicitly (and forwarded by ResolvedLink),
          and is what the active styling keys off — `data-active` from Radix
          doesn't survive the asChild → ResolvedLink boundary. */}
      <ResolvedLink
        link={link.link}
        ariaCurrent={isActive ? 'page' : undefined}
        transitionTypes={isExternal ? undefined : ['nav-forward']}
        className={cn(
          'group/leaf inline-flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'aria-[current=page]:bg-accent/60 aria-[current=page]:text-accent-foreground',
          inDropdown && 'justify-between',
        )}
      >
        <span>{label}</span>
        {isExternal && (
          <>
            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {opensInNewTab && <span className="sr-only">(opens in new tab)</span>}
          </>
        )}
        {!isExternal && inDropdown && (
          <ChevronDownIcon
            className="h-3.5 w-3.5 shrink-0 -rotate-90 opacity-0 transition-opacity group-hover/leaf:opacity-60"
            aria-hidden="true"
          />
        )}
      </ResolvedLink>
    </NavigationMenuLink>
  )
}
