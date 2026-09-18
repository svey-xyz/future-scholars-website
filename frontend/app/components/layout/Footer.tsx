import FooterContent from './FooterContent'
import type {DynamicFetchOptions} from '@/sanity/lib/live'
import {getSettings} from './getSettings'

/**
 * Cached component (three-layer pattern, see docs/CACHING.md): `perspective`
 * and `stega` are resolved by the layout and passed in as plain props.
 */
export default async function Footer({perspective, stega}: DynamicFetchOptions) {
  'use cache'
  const settings = await getSettings({perspective, stega})
  const contact = settings?.contact ?? null
  const legal = settings?.legal ?? null

  return (
    <footer className="bg-muted">
      <div className="container">
        {/* Socials + legal line. FooterContent renders null when both are empty. */}
        <div className="flex flex-col gap-4 pb-18 pt-12 sm:flex-row sm:items-center">
          <FooterContent contact={contact} legal={legal} className="sm:flex-1" />
        </div>
      </div>
    </footer>
  )
}
