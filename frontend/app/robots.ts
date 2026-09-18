import type {MetadataRoute} from 'next'
import {headers} from 'next/headers'

import {resolveSiteOrigin} from '@/app/components/seo'
import {sanityFetchMetadata} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'

/**
 * Generates `/robots.txt`. Without this route the request falls through to the
 * catch-all and returns the HTML app, which Lighthouse flags as an invalid
 * robots.txt. The sitemap URL must be absolute, so we derive the origin from
 * the request host (mirrors `app/sitemap.ts`). Using `headers()` opts this
 * route into request-time rendering.
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const [{data: settings}, headersList] = await Promise.all([
    sanityFetchMetadata({query: settingsQuery, perspective: 'published'}),
    headers(),
  ])
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = /^(localhost|127\.|0\.0\.0\.0)/.test(host) ? 'http' : 'https'
  // Same reasoning as app/sitemap.ts: point crawlers at the canonical origin
  // when one is configured, not at whichever alias they arrived on.
  const origin = resolveSiteOrigin(settings) ?? `${protocol}://${host}`

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  }
}
