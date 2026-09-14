import {sanityFetchMetadata} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import JsonLd, {siteJsonLd} from './JsonLd'

/**
 * Site-wide `WebSite`/`Organization` JSON-LD, rendered once from the root
 * layout. Always the **published** perspective: structured data is metadata
 * for crawlers — previewing drafts in it serves no one — and
 * `sanityFetchMetadata` is `'use cache'` and never stega, so published
 * renders serve this from the static shell. Draft mode bypasses `'use cache'`
 * entirely, though: under Presentation this becomes an uncached request-time
 * fetch, which is why the root layout renders it inside `<Suspense>`.
 */
export default async function SiteJsonLd() {
  const {data: settings} = await sanityFetchMetadata({
    query: settingsQuery,
    perspective: 'published',
  })
  return <JsonLd data={siteJsonLd(settings)} />
}
