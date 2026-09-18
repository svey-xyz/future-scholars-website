import {stegaClean} from '@sanity/client/stega'
import {toPlainText, type PortableTextBlock} from 'next-sanity'

import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import {telHref} from '@/lib/utils'
import {resolveSiteOrigin} from './siteOrigin'
import type {SettingsQueryResult} from '@/sanity.types'

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

/**
 * Site base URL, normalised without trailing slash.
 *
 * Delegates to `resolveSiteOrigin`, which falls back from the editor-entered
 * `Settings → ogImage.metadataBase` to the deployment's own domain. Before
 * that fallback existed an unset field silently dropped the whole
 * `Organization` node from the graph, since every `@id` here is built from
 * this value.
 */
export function siteUrl(settings: SettingsQueryResult): string | undefined {
  return resolveSiteOrigin(settings)
}

/**
 * The organisation's schema.org type(s).
 *
 * A plain `Organization` would be true but says nothing a search engine can
 * act on. FSMA is a Montessori
 * school for 6 months – 6 years, so it is both a `Preschool` (an
 * `EducationalOrganization`) and a `ChildCare` (a `LocalBusiness`) — the two
 * together are what make a "Montessori daycare near me" query resolvable, and
 * they are what let the address, opening hours and geo below mean anything.
 * Both inherit from `Organization`, so every `publisher` reference to
 * `#organization` stays valid.
 *
 * Hard-coded rather than an editor field on purpose: what kind of institution
 * this is, is not content that changes, so it is not a setting.
 */
const ORGANIZATION_TYPE = ['Preschool', 'ChildCare']

/** `PostalAddress` from Settings → Contact → Address, or undefined. */
function postalAddress(settings: SettingsQueryResult) {
  const a = settings?.contact?.address
  const street = clean(a?.street)
  const city = clean(a?.city)
  if (!street && !city) return undefined
  return {
    '@type': 'PostalAddress',
    ...(street ? {streetAddress: street} : {}),
    ...(city ? {addressLocality: city} : {}),
    ...(clean(a?.region) ? {addressRegion: clean(a?.region)} : {}),
    ...(clean(a?.postalCode) ? {postalCode: clean(a?.postalCode)} : {}),
    ...(clean(a?.country) ? {addressCountry: clean(a?.country)} : {}),
  }
}

/**
 * `openingHours` strings from Settings → Contact → Hours.
 *
 * Only rows with an explicit `schemaOrg` value are included. The display rows
 * are human prose ("Montessori day" / "8:30 am – 3:30 pm") and guessing a
 * machine-readable equivalent from them would publish a claim about when the
 * school is open that no one verified — the field exists precisely so an
 * editor opts a row in.
 */
function openingHours(settings: SettingsQueryResult): string[] {
  return (settings?.contact?.hours ?? [])
    .map((row) => clean(row?.schemaOrg))
    .filter((v): v is string => Boolean(v))
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

  const phone = clean(settings.contact?.phone)
  const address = postalAddress(settings)
  const hours = openingHours(settings)
  const areaServed = (settings.areaServed ?? [])
    .map((a) => clean(a))
    .filter((v): v is string => Boolean(v))
  const geo = settings.geo
  const foundingDate = clean(settings.foundingDate)
  const priceRange = clean(settings.priceRange)

  const organization = {
    '@type': ORGANIZATION_TYPE,
    ...(url ? {'@id': `${url}/#organization`, url} : {}),
    name,
    ...(description ? {description} : {}),
    ...(image ? {logo: image, image} : {}),
    ...(email ? {email} : {}),
    // E.164 for the same reason the rendered `tel:` links use it — a bare
    // NANP number is ambiguous to anything that does not assume Ontario.
    ...(phone ? {telephone: telHref(phone)} : {}),
    ...(address ? {address} : {}),
    ...(hours.length ? {openingHours: hours} : {}),
    ...(areaServed.length ? {areaServed} : {}),
    ...(typeof geo?.lat === 'number' && typeof geo?.lng === 'number'
      ? {geo: {'@type': 'GeoCoordinates', 'latitude': geo.lat, 'longitude': geo.lng}}
      : {}),
    ...(foundingDate ? {foundingDate} : {}),
    ...(priceRange ? {priceRange} : {}),
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

/** One rung of a breadcrumb trail: a display name and a site-relative path. */
export type BreadcrumbItem = {name: string; path: string}

/**
 * `BreadcrumbList` for a nested route (build plan S8/S11). Built from the same
 * items the visual `<Breadcrumbs>` renders, so the two cannot disagree.
 *
 * Returns `null` without a site origin: `item` must be an absolute URL for
 * Google to use it, and emitting relative ones would publish a list that
 * validates but resolves against nothing. `siteOrigin`'s fallback chain means
 * this is only ever null in a local run with no origin configured.
 */
export function breadcrumbJsonLd(items: BreadcrumbItem[], settings: SettingsQueryResult) {
  const base = siteUrl(settings)
  if (!base || items.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': clean(item.name) ?? item.name,
      'item': `${base}${item.path}`,
    })),
  }
}
