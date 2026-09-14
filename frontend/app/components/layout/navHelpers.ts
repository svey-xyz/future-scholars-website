import {stegaClean} from '@sanity/client/stega'

import {linkResolver} from '@/sanity/lib/utils'
import type {NavLinkItem} from '@/sanity/lib/types'

export type ResolvedNavLink = {
  /** Resolved, normalised href — `null` when the link resolves to nothing. */
  href: string | null
  /**
   * The link object to hand `<ResolvedLink>`. Identical to the authored link
   * unless normalisation changed the href, in which case it is rewritten so the
   * rendered anchor and the active check agree on one URL.
   */
  link: NavLinkItem['link']
  label: string
  /** True only for links that leave the site (http(s), mailto:, tel:, …). */
  isExternal: boolean
  opensInNewTab: boolean
}

/**
 * FSMA divergence from the template's nav leaves (DesktopNav / MobileNav).
 *
 * Those treat *every* `linkType: 'href'` link as external — it gets the
 * new-tab affordance and is never marked active. That is wrong here: the
 * Programs children are authored as `href` links to routes that don't exist
 * as `page` documents yet (`/programs/infants`, …), and `/about#admissions`
 * is authored the same way. Externality is a property of the resolved href,
 * not of how the editor happened to author it: anything starting with `/` is
 * an internal route.
 *
 * Also normalises the designated homepage. `settings.homepage` points at a
 * `page` document, so its nav link resolves to `/<slug>` — but that page is
 * also served at `/`. Pointing the Home item at `/<slug>` would ship a second
 * URL for the homepage and leave `aria-current` off on `/`.
 */
export function resolveNavLink(link: NavLinkItem, homepageSlug?: string | null): ResolvedNavLink {
  const authored = linkResolver(link.link)
  const href = normaliseHref(authored, homepageSlug)
  // `stegaClean`: draft-mode enum values carry stega characters.
  const authoredExternal = stegaClean(link.link?.linkType) === 'href'
  const rewritten = href !== null && href !== authored

  return {
    href,
    // Spread the authored link so the projected shape (page/post) is kept;
    // only the href and its type are overridden.
    link: rewritten ? {...link.link, linkType: 'href', href} : link.link,
    label: link.resolvedTitle || link.title || '',
    isExternal: href !== null && !href.startsWith('/'),
    opensInNewTab: authoredExternal && Boolean(link.link?.openInNewTab),
  }
}

/** `/<homepage-slug>` → `/`; everything else passes through unchanged. */
export function normaliseHref(href: string | null, homepageSlug?: string | null): string | null {
  if (typeof href !== 'string' || href.length === 0) return null
  const slug = homepageSlug ? stegaClean(homepageSlug) : null
  if (slug && href === `/${slug}`) return '/'
  return href
}

/**
 * Exact active-route match for a nav leaf. Compares the path only, so
 * `/about#contact` is active on `/about`; external links are never active.
 */
export function isActiveHref(href: string | null, pathname: string): boolean {
  const path = internalPath(href)
  return path !== null && path === pathname
}

/**
 * Containment match, used to decide whether a disclosure group holds the
 * current route (`/programs` contains `/programs/infants`). The group label is
 * not a link, so this drives open state and group styling — never
 * `aria-current`, which belongs to the leaf.
 */
export function isWithinHref(href: string | null, pathname: string): boolean {
  const path = internalPath(href)
  if (path === null) return false
  return path === pathname || (path !== '/' && pathname.startsWith(`${path}/`))
}

/** Path portion of an internal href, or `null` if the href leaves the site. */
function internalPath(href: string | null): string | null {
  if (!href || !href.startsWith('/')) return null
  return href.split(/[?#]/)[0]
}
