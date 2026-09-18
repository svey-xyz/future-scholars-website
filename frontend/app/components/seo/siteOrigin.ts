import {stegaClean} from '@sanity/client/stega'

import type {SettingsQueryResult} from '@/sanity.types'

/**
 * The site's absolute origin, used for `metadataBase`, canonical URLs and
 * every `@id`/`url` in the JSON-LD graph.
 *
 * Why this exists: `settings.ogImage.metadataBase` is an editor-entered field
 * that stays empty until the apex-vs-`www` decision (plan Q26), and an empty
 * `metadataBase`
 * silently costs a lot: Next emits no canonical link, relative Open Graph
 * image URLs never resolve, and `siteJsonLd` drops the `Organization` node
 * entirely because it has no `@id` to hang it on. All of that was invisible
 * until the rendered HTML was read.
 *
 * So the value falls back through what the deployment already knows:
 *
 * 1. `settings.ogImage.metadataBase` — the editor's deliberate answer, and
 *    the only one that survives a domain change without a redeploy.
 * 2. `NEXT_PUBLIC_SITE_URL` — an explicit override for non-Vercel hosts.
 * 3. `VERCEL_PROJECT_PRODUCTION_URL` — the project's *production* domain,
 *    identical on preview and production builds, which is what a canonical
 *    URL wants: a preview should point search engines at production, never
 *    at itself.
 * 4. `VERCEL_URL` — this specific deployment. Last resort, and deliberately
 *    below the production URL for the reason above.
 *
 * Returns the bare origin, no trailing slash, or `undefined` when nothing is
 * configured — callers must keep working without it.
 */
export function resolveSiteOrigin(settings?: SettingsQueryResult): string | undefined {
  const candidates = [
    stegaClean(settings?.ogImage?.metadataBase ?? undefined),
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ]

  for (const candidate of candidates) {
    const origin = toOrigin(candidate)
    if (origin) return origin
  }
  return undefined
}

/** `example.com` and `https://example.com/x` both normalise to `https://example.com`. */
function toOrigin(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  // Vercel's env vars carry a bare host; a settings value should carry a
  // scheme but may not, and `new URL('example.com')` throws rather than
  // guessing.
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    return new URL(withScheme).origin
  } catch {
    return undefined
  }
}

/** `metadataBase` for Next's metadata resolver — a `URL`, or undefined. */
export function siteMetadataBase(settings?: SettingsQueryResult): URL | undefined {
  const origin = resolveSiteOrigin(settings)
  return origin ? new URL(origin) : undefined
}
