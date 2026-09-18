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
  /** `rail` — the compact desktop rail; `drawer` — larger, thumb-sized mobile type. */
  variant?: Variant
}

type Variant = 'rail' | 'drawer'

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
export default function SideNavLinks({
  navigation,
  homepageSlug,
  onNavigate,
  variant = 'rail',
}: SideNavLinksProps) {
  const pathname = usePathname()

  if (navigation.length === 0) return null

  return (
    <ul className={cn('flex flex-col', variant === 'drawer' ? 'pt-4 gap-2' : 'gap-2')}>
      {navigation.map((item) =>
        item._type === 'navDropdown' ? (
          <li key={item._key}>
            <NavGroup
              title={item.title}
              links={item.links ?? []}
              pathname={pathname}
              homepageSlug={homepageSlug}
              onNavigate={onNavigate}
              variant={variant}
            />
          </li>
        ) : (
          <li key={item._key}>
            <NavLeaf
              link={item}
              pathname={pathname}
              homepageSlug={homepageSlug}
              onNavigate={onNavigate}
              variant={variant}
            />
          </li>
        ),
      )}
    </ul>
  )
}

/**
 * Shared row styling for leaves and group triggers. Flat and typographic (per
 * the reference sites): muted ink at rest, a soft sky wash on hover, and a
 * solid academy-blue pill for the current page.
 *
 * Contrast (docs/A11Y.md §12): muted-foreground on card/paper ≥ 7.6:1,
 * secondary-foreground on secondary ≥ 9:1, white on primary ≈ 10:1 — all AAA.
 * The sunflower is no longer used here: it can't carry state on a light ground
 * (1.62:1) and the darker `--brand-accent-strong` read as a dull ochre.
 */
const rowBase =
  'flex w-full items-center justify-between gap-2 rounded-lg px-3 text-muted-foreground ' +
  'transition-colors duration-150 motion-reduce:transition-none ' +
  'hover:bg-secondary hover:text-secondary-foreground ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-background'

// ≥ 44px rows at the top level (SC 2.5.5, AAA); nested rows keep 44px too.
const rowSize: Record<Variant, {top: string; nested: string}> = {
  rail: {top: 'min-h-11 py-2 text-[0.9375rem] font-medium', nested: 'min-h-11 py-2 text-sm'},
  drawer: {
    top: 'min-h-13 py-3 font-display text-xl font-medium',
    nested: 'min-h-12 py-2.5 text-base',
  },
}

function NavLeaf({
  link,
  pathname,
  homepageSlug,
  nested = false,
  onNavigate,
  variant,
}: {
  link: NavLinkItem
  pathname: string
  homepageSlug?: string | null
  nested?: boolean
  onNavigate?: () => void
  variant: Variant
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
        rowBase,
        nested ? rowSize[variant].nested : rowSize[variant].top,
        // Current page: a solid pill. Styling keys off `aria-current`, so the
        // visual and the announced state can't disagree.
        'aria-[current=page]:bg-primary aria-[current=page]:font-semibold',
        'aria-[current=page]:text-primary-foreground aria-[current=page]:shadow-sm',
        'aria-[current=page]:hover:bg-primary aria-[current=page]:hover:text-primary-foreground',
      )}
    >
      <span>{label}</span>
      {isExternal && (
        <>
          <ArrowTopRightOnSquareIcon className="size-4 shrink-0 opacity-70" aria-hidden="true" />
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
  variant,
}: {
  title: string
  links: NavLinkItem[]
  pathname: string
  homepageSlug?: string | null
  onNavigate?: () => void
  variant: Variant
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
        className={cn(
          rowBase,
          rowSize[variant].top,
          'group text-left',
          // Holds the current page: full-strength ink, so the section reads as
          // "you are here" without competing with the active pill below it.
          containsActive && 'font-semibold text-foreground',
        )}
      >
        <span>{title}</span>
        <ChevronDownIcon
          className="size-4 shrink-0 opacity-70 transition-transform duration-200 motion-reduce:transition-none group-data-[state=open]:rotate-180"
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
        <ul className="mb-1 ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-2">
          {links.map((child) => (
            <li key={child._key}>
              <NavLeaf
                link={child}
                pathname={pathname}
                homepageSlug={homepageSlug}
                nested
                onNavigate={onNavigate}
                variant={variant}
              />
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}
