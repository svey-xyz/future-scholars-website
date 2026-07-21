import {sanityFetchMetadata} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import JsonLd, {siteJsonLd} from './JsonLd'

/**
 * Site-wide `WebSite`/`Organization` JSON-LD, rendered once from the root
 * layout. Always the **published** perspective: structured data is metadata
 * for crawlers — previewing drafts in it serves no one, and pinning the
 * perspective keeps this component in the static shell in both draft and
 * published renders (`sanityFetchMetadata` is `'use cache'` and never stega).
 */
export default async function SiteJsonLd() {
  const {data: settings} = await sanityFetchMetadata({
    query: settingsQuery,
    perspective: 'published',
  })
  return <JsonLd data={siteJsonLd(settings)} />
}
