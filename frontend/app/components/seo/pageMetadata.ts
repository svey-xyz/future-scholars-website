import type {Metadata} from 'next'

import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import type {GetPageQueryResult} from '@/sanity.types'

type Options = {
  /**
   * Pass the site title only for the homepage. Next's `title.template` (set in
   * the root layout) applies to *child* segments, and `app/page.tsx` is the
   * same segment that defines it — so the homepage would otherwise render a
   * bare `<title>Home</title>`. Given a site title, the homepage's title is
   * emitted as `absolute`, defaulting to the site title itself.
   */
  siteTitle?: string | null
}

/**
 * Build a page's `Metadata` from its optional `seo` object, falling back to the
 * document's own fields (build plan S6). Shared by `/` and `/[slug]` so the two
 * routes cannot drift.
 *
 * What is deliberately *not* here: `metadataBase`, the title template and the
 * site-wide Open Graph image all come from the root layout's settings-driven
 * metadata and merge automatically, so a page only supplies its own half. The
 * full canonical/JSON-LD pass is S11.
 */
export function pageMetadata(page: GetPageQueryResult, options: Options = {}): Metadata {
  const seo = page?.seo

  const name = seo?.metaTitle || page?.name || undefined
  const description = seo?.metaDescription || page?.subheading || page?.heading || undefined
  const ogImage = resolveOpenGraphImage(seo?.ogImage)

  const siteTitle = options.siteTitle || undefined
  const isHome = Boolean(siteTitle)
  const absolute = seo?.metaTitle || siteTitle
  const title: Metadata['title'] = isHome && absolute ? {absolute} : name

  return {
    title,
    description,
    // `noIndex` only adds the directive; absent, the root default applies.
    ...(seo?.noIndex ? {robots: {index: false, follow: true}} : {}),
    openGraph: {
      title: isHome ? absolute : name,
      description,
      type: 'website',
      ...(ogImage ? {images: [ogImage]} : {}),
    },
  } satisfies Metadata
}
