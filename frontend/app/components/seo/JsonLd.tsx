import {stegaClean} from '@sanity/client/stega'
import {toPlainText, type PortableTextBlock} from 'next-sanity'

import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import type {PostQueryResult, SettingsQueryResult} from '@/sanity.types'

/**
 * Renders a schema.org JSON-LD `<script>`. React/Next render
 * `type="application/ld+json"` inline safely in RSC (it's data, not
 * executable JS). `data` may be a single node or an array of nodes; nullish
 * data renders nothing.
 *
 * JSON-LD is metadata: builders below stega-clean every CMS string (`clean`)
 * and should only ever be fed published content — like `generateMetadata`,
 * never draft-perspective markers.
 */
export default function JsonLd({data}: {data: unknown}) {
  if (!data || (Array.isArray(data) && data.length === 0)) return null
  return (
    <script
      type="application/ld+json"
      // Escape `<` so CMS text can never break out of the script context.
      dangerouslySetInnerHTML={{__html: JSON.stringify(data).replace(/</g, '\\u003c')}}
    />
  )
}

function clean(value: string | null | undefined): string | undefined {
  const c = stegaClean(value ?? undefined)
  return c && c.length > 0 ? c : undefined
}

/** Every social URL from Settings as a de-duped `sameAs` array. */
export function collectSameAs(settings: SettingsQueryResult): string[] {
  const urls = (settings?.contact?.socials ?? []).map((s) => s?.url)
  const out: string[] = []
  for (const u of urls) {
    const c = clean(u)
    if (c && !out.includes(c)) out.push(c)
  }
  return out
}

/** Site base URL (Settings → ogImage.metadataBase), normalised without trailing slash. */
export function siteUrl(settings: SettingsQueryResult): string | undefined {
  const raw = clean(settings?.ogImage?.metadataBase)
  if (!raw) return undefined
  try {
    return new URL(raw).origin
  } catch {
    return undefined
  }
}

/**
 * Site-wide `WebSite` + `Organization` nodes built from Settings. The
 * organization doubles as the site publisher; socials become `sameAs`.
 */
export function siteJsonLd(settings: SettingsQueryResult) {
  if (!settings) return null
  const name = clean(settings.title)
  if (!name) return null

  const url = siteUrl(settings)
  const image = resolveOpenGraphImage(settings.ogImage)?.url
  const sameAs = collectSameAs(settings)
  const email = clean(settings.contact?.email)
  const description = settings.description
    ? clean(toPlainText(settings.description as PortableTextBlock[]))
    : undefined

  const organization = {
    '@type': 'Organization',
    ...(url ? {'@id': `${url}/#organization`, url} : {}),
    name,
    ...(description ? {description} : {}),
    ...(image ? {logo: image, image} : {}),
    ...(email ? {email} : {}),
    ...(sameAs.length ? {sameAs} : {}),
  }

  const webSite = {
    '@type': 'WebSite',
    ...(url ? {'@id': `${url}/#website`, url} : {}),
    name,
    ...(description ? {description} : {}),
    ...(url ? {publisher: {'@id': `${url}/#organization`}} : {publisher: organization}),
  }

  return {
    '@context': 'https://schema.org',
    '@graph': url ? [organization, webSite] : [webSite],
  }
}

/** `BlogPosting` node for a post detail route. */
export function blogPostingJsonLd(
  post: NonNullable<PostQueryResult>,
  settings?: SettingsQueryResult,
) {
  const headline = clean(post.title)
  if (!headline) return null

  const base = settings ? siteUrl(settings) : undefined
  const slug = clean(post.slug)
  const url = base && slug ? `${base}/posts/${slug}` : undefined
  const image = resolveOpenGraphImage(post.coverImage)?.url
  const author =
    post.author?.firstName && post.author?.lastName
      ? {
          '@type': 'Person',
          name: `${clean(post.author.firstName)} ${clean(post.author.lastName)}`,
        }
      : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    ...(url ? {url, mainEntityOfPage: {'@type': 'WebPage', '@id': url}} : {}),
    ...(clean(post.excerpt) ? {description: clean(post.excerpt)} : {}),
    ...(image ? {image} : {}),
    ...(post.date ? {datePublished: post.date} : {}),
    ...(author ? {author} : {}),
    ...(base ? {publisher: {'@id': `${base}/#organization`}} : {}),
  }
}
