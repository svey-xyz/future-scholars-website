import {type QueryParams} from 'next-sanity'
import {defineLive, resolvePerspectiveFromCookies, type LivePerspective} from 'next-sanity/live'
import {cookies, draftMode} from 'next/headers'

import {client} from '@/sanity/lib/client'
import {token} from '@/sanity/lib/token'

/**
 * Sanity Live configured for Cache Components (`cacheComponents: true`).
 *
 * `strict: true` makes TypeScript require `perspective` and `stega` on every
 * `sanityFetch` call and `includeDrafts` on `<SanityLive>`: request-time state
 * must be resolved OUTSIDE `'use cache'` boundaries (via
 * `getDynamicFetchOptions`) and passed in as plain props — the three-layer
 * pattern. See docs/CACHING.md.
 * Learn more: https://www.sanity.io/docs/nextjs/cache-components
 */
export const {sanityFetch, SanityLive} = defineLive({
  client,
  // Required for showing draft content when the Sanity Presentation Tool is used, or to enable the Vercel Toolbar Edit Mode
  serverToken: token,
  // Required for stand-alone live previews, the token is only shared to the browser if it's a valid Next.js Draft Mode session
  browserToken: token,
  strict: true,
})

export interface DynamicFetchOptions {
  perspective: LivePerspective
  stega: boolean
}

/**
 * Resolves `perspective` and `stega` from the request (draft-mode +
 * Presentation-Tool perspective cookie). Calls `cookies()` — a dynamic API —
 * so call it in a Suspense-wrapped dynamic component (or a route with a
 * sibling `loading.tsx`), never inside `'use cache'`.
 */
export async function getDynamicFetchOptions(): Promise<DynamicFetchOptions> {
  const {isEnabled: isDraftMode} = await draftMode()
  if (!isDraftMode) {
    return {perspective: 'published', stega: false}
  }

  const jar = await cookies()
  const perspective = await resolvePerspectiveFromCookies({cookies: jar})
  return {perspective: perspective ?? 'drafts', stega: true}
}

/** For `generateStaticParams` only — always published, never stega. */
export async function sanityFetchStaticParams<const QueryString extends string>({
  query,
  params = {},
}: {
  query: QueryString
  params?: QueryParams
}) {
  'use cache'
  const {data} = await sanityFetch({query, params, perspective: 'published', stega: false})
  return {data}
}

/**
 * For `generateMetadata`, `generateViewport`, `sitemap.ts`, `manifest.ts`,
 * `opengraph-image.tsx`, etc. Never stega, but `perspective` must still be
 * resolved (via `getDynamicFetchOptions`) so Presentation Tool can preview
 * drafts/releases in standalone windows.
 */
export async function sanityFetchMetadata<const QueryString extends string>({
  query,
  params = {},
  perspective,
}: {
  query: QueryString
  params?: QueryParams
  perspective: LivePerspective
}) {
  'use cache'
  const {data} = await sanityFetch({query, params, perspective, stega: false})
  return {data}
}
