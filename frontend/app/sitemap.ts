import {MetadataRoute} from 'next'
import {sanityFetchMetadata} from '@/sanity/lib/live'
import {resolveSiteOrigin} from '@/app/components/seo'
import {settingsQuery, sitemapData} from '@/sanity/lib/queries'
import {headers} from 'next/headers'

/**
 * This file creates a sitemap (sitemap.xml) for the application. Learn more about sitemaps in Next.js here: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * Be sure to update the `changeFrequency` and `priority` values to match your application's content.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Metadata-route fetch ('use cache' lives in the helper): crawler-facing, so
  // always the published perspective and never stega.
  const [allPostsAndPages, {data: settings}] = await Promise.all([
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

  if (allPostsAndPages != null && allPostsAndPages.data.length != 0) {
    let priority: number
    let changeFrequency:
      'monthly' | 'always' | 'hourly' | 'daily' | 'weekly' | 'yearly' | 'never' | undefined
    let url: string

    for (const p of allPostsAndPages.data) {
      switch (p._type) {
        case 'page':
          priority = 0.8
          changeFrequency = 'monthly'
          url = `${origin}/${p.slug}`
          break
        case 'post':
          priority = 0.5
          changeFrequency = 'never'
          url = `${origin}/posts/${p.slug}`
          break
        // FSMA fork (build plan S8): program detail routes.
        case 'program':
          priority = 0.8
          changeFrequency = 'monthly'
          url = `${origin}/programs/${p.slug}`
          break
        case 'project':
          priority = 0.6
          changeFrequency = 'monthly'
          url = `${origin}/projects/${p.slug}`
          break
      }
      sitemap.push({
        lastModified: p._updatedAt || new Date(),
        priority,
        changeFrequency,
        url,
      })
    }
  }

  return sitemap
}
