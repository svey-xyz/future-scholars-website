import Link from 'next/link'

import type {DynamicFetchOptions} from '@/sanity/lib/live'
import BrandMark from './BrandMark'
import ContactHub from './ContactHub'
import SideNavLinks from './SideNavLinks'
import SideNavMobile from './SideNavMobile'
import {getSettings} from './getSettings'

/**
 * The app shell's navigation (D11): a fixed left rail from `lg` up, a fixed
 * top bar + left drawer below it.
 *
 * Cached component, three-layer pattern (docs/CACHING.md): `perspective` and
 * `stega` are resolved by the layout and passed in as plain props. It shares
 * `getSettings` with the footer and the homepage, so the whole shell costs one
 * `settings` cache entry per perspective/stega pair.
 *
 * The rail itself is RSC; only the link list and the drawer are client islands.
 */
export default async function SideNav({perspective, stega}: DynamicFetchOptions) {
  'use cache'
  const settings = await getSettings({perspective, stega})

  const navigation = settings?.navigation ?? []
  const contact = settings?.contact ?? null
  const homepageSlug = settings?.homepage?.slug?.current ?? null
  const siteTitle = settings?.title || 'Future Scholars Montessori Academy'

  return (
    <>
      {/* ---- Desktop rail (≥1024px) ---- */}
      <div
        // `site-rail` pins the rail during directional content slides; CSS
        // disables its snapshot animation (globals.css), so it never slides or
        // fades with the page it frames.
        style={{viewTransitionName: 'site-rail'}}
        className="fixed inset-y-0 left-0 z-40 hidden w-68 flex-col border-r border-border bg-card lg:flex"
      >
        <div className="px-6 pb-5 pt-7">
          <Link
            href="/"
            aria-label={`${siteTitle} — home`}
            transitionTypes={['nav-back']}
            className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {/* The link carries the accessible name; the artwork is decorative
                so screen readers don't announce it twice. */}
            <BrandMark decorative priority />
          </Link>
        </div>

        {/* Own scroll (§7.5) so a long nav can't overflow a short viewport.
            Contact details no longer sit under it — phone, email and socials
            all live in the floating `ContactHub` now. */}
        <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 pb-6">
          <SideNavLinks navigation={navigation} homepageSlug={homepageSlug} />
        </nav>
      </div>

      {/* ---- Top bar + drawer (<1024px) ---- */}
      <SideNavMobile
        navigation={navigation}
        contact={contact}
        homepageSlug={homepageSlug}
        siteTitle={siteTitle}
      />

      {/* ---- Floating contact hub (≥1024px, §7.7). Below `lg` the same hub
          collapses into the foot of the drawer (see SideNavMobile). ---- */}
      <ContactHub contact={contact} />
    </>
  )
}
