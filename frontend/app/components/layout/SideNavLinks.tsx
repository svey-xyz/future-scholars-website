'use client'

import {useState} from 'react'
import {usePathname} from 'next/navigation'
import {ArrowTopRightOnSquareIcon, ChevronDownIcon} from '@heroicons/react/24/outline'

import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@/components/ui/collapsible'
import ResolvedLink from '@/app/components/common/ResolvedLink'
import {cn} from '@/lib/utils'
import type {NavItem, NavLinkItem} from '@/sanity/lib/types'
import {isActiveHref, isWithinHref, resolveNavLink} from './navHelpers'

type SideNavLinksProps = {
  navigation: NavItem[]
  /** `settings.homepage` slug, so the Home item points at `/` (see navHelpers). */
  homepageSlug?: string | null
  /** Called after an in-panel navigation, so the mobile drawer can close. */
  onNavigate?: () => void
}

/**
 * The vertical navigation list — one implementation shared by the desktop rail
 * and the mobile drawer, so the two can never drift.
 *
 * Client component only because active state needs `usePathname()`; everything
 * around it (the rail shell, the brand mark, the contact block) stays RSC.
 *
 * a11y (docs/A11Y.md → Navigation):
 * - `navDropdown` renders a Radix `CollapsibleTrigger` — a real <button> that
 *   exposes `aria-expanded` and never navigates. The group title is a label.
 * - The active leaf carries `aria-current="page"`, which the styling keys off.
 * - Groups open by default when they contain the current route, so the active
 *   item is never hidden behind a closed disclosure on load.
 */
export default function SideNavLinks({navigation, homepageSlug, onNavigate}: SideNavLinksProps) {
  const pathname = usePathname()

  if (navigation.length === 0) return null

  return (
    <ul className="flex flex-col gap-0.5">
      {navigation.map((item) =>
        item._type === 'navDropdown' ? (
          <li key={item._key}>
            <NavGroup
              title={item.title}
              links={item.links ?? []}
              pathname={pathname}
              homepageSlug={homepageSlug}
              onNavigate={onNavigate}
            />
          </li>
        ) : (
          <li key={item._key}>
            <NavLeaf
              link={item}
              pathname={pathname}
              homepageSlug={homepageSlug}
              onNavigate={onNavigate}
            />
          </li>
        ),
      )}
    </ul>
  )
}

const leafBase =
  'flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-base font-medium ' +
  'transition-colors hover:bg-secondary hover:text-secondary-foreground ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ' +
  'focus-visible:ring-offset-background'

function NavLeaf({
  link,
  pathname,
  homepageSlug,
  nested = false,
  onNavigate,
}: {
  link: NavLinkItem
  pathname: string
  homepageSlug?: string | null
  nested?: boolean
  onNavigate?: () => void
}) {
  const {
    href,
    link: linkProp,
    label,
    isExternal,
    opensInNewTab,
  } = resolveNavLink(link, homepageSlug)
  const isActive = isActiveHref(href, pathname)

  return (
    <ResolvedLink
      // `linkProp` is the authored link, or a rewritten one when the href was
      // normalised (homepage → `/`), so the anchor and the active check can
      // never disagree. ResolvedLink still owns target/rel.
      link={linkProp}
      ariaCurrent={isActive ? 'page' : undefined}
      transitionTypes={isExternal ? undefined : ['nav-forward']}
      onClick={onNavigate}
      className={cn(
        leafBase,
        'w-full',
        // Active leaf: filled, with the brand accent as a left marker. The
        // marker is decorative — `aria-current` carries the meaning.
        'aria-[current=page]:bg-secondary aria-[current=page]:text-secondary-foreground',
        'aria-[current=page]:shadow-[inset_3px_0_0_0_hsl(var(--brand-accent-strong))]',
        nested && 'py-2 pl-6 text-sm font-normal',
      )}
    >
      <span>{label}</span>
      {isExternal && (
        <>
          <ArrowTopRightOnSquareIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {opensInNewTab && <span className="sr-only">(opens in new tab)</span>}
        </>
      )}
    </ResolvedLink>
  )
}

function NavGroup({
  title,
  links,
  pathname,
  homepageSlug,
  onNavigate,
}: {
  title: string
  links: NavLinkItem[]
  pathname: string
  homepageSlug?: string | null
  onNavigate?: () => void
}) {
  const containsActive = links.some((child) =>
    isWithinHref(resolveNavLink(child, homepageSlug).href, pathname),
  )
  const [open, setOpen] = useState(containsActive)

  // Route changed under us (rail persists across navigations): reopen the group
  // that now holds the active route. "Adjust state during render" rather than
  // an effect — react.dev/you-might-not-need-an-effect.
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    if (containsActive && !open) setOpen(true)
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn(leafBase, 'group w-full text-left', containsActive && 'text-primary')}
      >
        <span>{title}</span>
        <ChevronDownIcon
          className="h-4 w-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      {/* No `forceMount`. Radix unmounts the children while the group is
          closed, which is the behaviour docs/A11Y.md asks for — `forceMount`
          was tried and renders them without `hidden` during SSR, leaving
          invisible links in the tab order. The program routes stay
          discoverable through the /programs index and sitemap.ts (S11). */}
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {/* Indent rule ties the children to their group without relying on
            colour alone. */}
        <ul className="mt-0.5 flex flex-col gap-0.5 border-l border-border pl-2 ml-3">
          {links.map((child) => (
            <li key={child._key}>
              <NavLeaf
                link={child}
                pathname={pathname}
                homepageSlug={homepageSlug}
                nested
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}
