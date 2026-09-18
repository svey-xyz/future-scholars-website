import {MetadataRoute} from 'next'
import {sanityFetchMetadata} from '@/sanity/lib/live'
import {resolveSiteOrigin} from '@/app/components/seo'
import {settingsQuery, sitemapData} from '@/sanity/lib/queries'
import {headers} from 'next/headers'
import {documentHref} from '@/sanity/lib/utils'

/**
 * sitemap.xml: the site root, every `page` (except the designated homepage,
 * which is `/`) and every `program` detail route.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Metadata-route fetch ('use cache' lives in the helper): crawler-facing, so
  // always the published perspective and never stega.
  const [allPages, {data: settings}] = await Promise.all([
    sanityFetchMetadata({query: sitemapData, perspective: 'published'}),
    sanityFetchMetadata({query: settingsQuery, perspective: 'published'}),
  ])
  const headersList = await headers()
  const sitemap: MetadataRoute.Sitemap = []
  // Sitemap entries must be absolute URLs with a scheme. Prefer the site's
  // configured origin (Settings, then the deployment's production domain —
  // see components/seo/siteOrigin.ts) so the sitemap advertises canonical
  // URLs whichever alias served the request; a production deployment is
  // reachable at its `*.vercel.app` alias as well as the real domain, and a
  // sitemap that lists whichever one the crawler happened to arrive on is a
  // duplicate-content generator. Falls back to the request host when nothing
  // is configured, which is what local and non-Vercel runs need.
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = /^(localhost|127\.|0\.0\.0\.0)/.test(host) ? 'http' : 'https'
  const origin = resolveSiteOrigin(settings) ?? `${protocol}://${host}`
  sitemap.push({
    url: origin,
    lastModified: new Date(),
    priority: 1,
    changeFrequency: 'monthly',
  })

  for (const p of allPages?.data ?? []) {
    const path = p.slug ? documentHref(p._type, p.slug) : null
    if (!path) continue
    sitemap.push({
      url: `${origin}${path}`,
      lastModified: p._updatedAt || new Date(),
      priority: 0.8,
      changeFrequency: 'monthly',
    })
  }

  return sitemap
}
