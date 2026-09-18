import type {Metadata} from 'next'

import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import type {GetPageQueryResult, SettingsQueryResult} from '@/sanity.types'

type Options = {
  /**
   * Pass the site title only for the homepage. Next's `title.template` (set in
   * the root layout) applies to *child* segments, and `app/page.tsx` is the
   * same segment that defines it — so the homepage would otherwise render a
   * bare `<title>Home</title>`. Given a site title, the homepage's title is
   * emitted as `absolute`, defaulting to the site title itself.
   */
  siteTitle?: string | null
  /**
   * The route this page is served at, e.g. `/` or `/about`. Emitted as the
   * canonical URL, resolved against the root layout's `metadataBase`.
   *
   * §9 of the build plan requires a canonical on every route and there was
   * none: `/` and `/<homepage-slug>` served identical content with nothing
   * telling a crawler which one counts. The redirect in `next.config.ts`
   * closes that particular hole; the canonical closes the general one
   * (query strings, `www` vs apex, a future preview domain being linked).
   */
  path?: string
  /**
   * Settings, for the site-wide Open Graph fallback.
   *
   * Next inherits a parent segment's `openGraph` **only when the child sets
   * none at all** (`generate-metadata.md` → Inheriting fields). This helper
   * always sets one, so the root layout's `openGraph.images` — the site-wide
   * share image — was being dropped from every page. Passing settings in lets
   * the page fall back to it explicitly.
   */
  settings?: SettingsQueryResult
}

/**
 * Build a page's `Metadata` from its optional `seo` object, falling back to the
 * document's own fields (build plan S6). Shared by `/` and `/[slug]` so the two
 * routes cannot drift.
 *
 * What is deliberately *not* here: `metadataBase` and the title template come
 * from the root layout and merge automatically, so a page only supplies its
 * own half.
 */
export function pageMetadata(page: GetPageQueryResult, options: Options = {}): Metadata {
  const seo = page?.seo

  const name = seo?.metaTitle || page?.name || undefined
  const description = seo?.metaDescription || page?.subheading || page?.heading || undefined
  // Page-level share image first, then the site-wide one (see `settings` above).
  const ogImage =
    resolveOpenGraphImage(seo?.ogImage) ?? resolveOpenGraphImage(options.settings?.ogImage)

  const siteTitle = options.siteTitle || undefined
  const isHome = Boolean(siteTitle)
  const absolute = seo?.metaTitle || siteTitle
  const title: Metadata['title'] = isHome && absolute ? {absolute} : name

  return {
    title,
    description,
    // Relative on purpose: Next resolves it against `metadataBase`, so a
    // canonical is still emitted (as a relative URL) even before the
    // production domain is settled, and becomes absolute the moment it is.
    ...(options.path ? {alternates: {canonical: options.path}} : {}),
    // `noIndex` only adds the directive; absent, the root default applies.
    ...(seo?.noIndex ? {robots: {index: false, follow: true}} : {}),
    openGraph: {
      title: isHome ? absolute : name,
      description,
      type: 'website',
      ...(options.path ? {url: options.path} : {}),
      ...(ogImage ? {images: [ogImage]} : {}),
    },
  } satisfies Metadata
}
