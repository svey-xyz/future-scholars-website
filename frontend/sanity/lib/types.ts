import type {CSSProperties} from 'react'
import type {StegaBranded} from '@sanity/client/stega'
import type {GetPageQueryResult, SettingsQueryResult} from '@/sanity.types'

/**
 * A query result as `sanityFetch` may return it: stega-branded when `stega: true`
 * (next-sanity ≥13.4 brands those strings as `StegaString`), plain otherwise.
 * Components that render CMS data take this so both paths type-check, and any
 * literal comparison is forced through `stegaClean`.
 */
export type MaybeStega<T> = T | StegaBranded<T>

export type PageBuilderSection = NonNullable<NonNullable<GetPageQueryResult>['pageBuilder']>[number]
export type ExtractPageBuilderType<T extends PageBuilderSection['_type']> = Extract<
  PageBuilderSection,
  {_type: T}
>

// Gallery — derived from the typed `gallery` page-builder block (never hand-widen).
export type GalleryBlock = ExtractPageBuilderType<'gallery'>
export type GalleryItem = NonNullable<GalleryBlock['items']>[number]
export type GalleryImageItem = Extract<GalleryItem, {_type: 'galleryImage'}>
export type GalleryVideoItem = Extract<GalleryItem, {_type: 'galleryVideo'}>
export type GalleryAspect = NonNullable<GalleryBlock['aspect']>

// `page.titleDisplay` display modes (see layout/PageTitle.tsx). Mirrors the
// schema options list in studio documents/page.ts; unset = auto.
export type TitleDisplay = 'plain' | 'highlighted' | 'none'

// Represents a Link after GROQ dereferencing: `page` becomes the referenced
// document's slug and `pageType` its `_type` (see `documentHref`).
export type DereferencedLink = {
  _type: 'link'
  linkType?: MaybeStega<'href' | 'page'>
  href?: string
  page?: string | null
  pageType?: string | null
  /** Block anchor on the target document, rendered as `#anchor`. */
  anchor?: string | null
  openInNewTab?: boolean
}

// CMS-driven site navigation — derived from the typed `settingsQuery` result
// so the nav islands never hand-widen the shape. `navigation` is a discriminated
// union on `_type` (navLink leaf | navDropdown group).
type SettingsNavigation = NonNullable<NonNullable<MaybeStega<SettingsQueryResult>>['navigation']>
export type NavItem = SettingsNavigation[number]
export type NavLinkItem = Extract<NavItem, {_type: 'navLink'}>
/** Nav leaf `_key` → room CSS variables (`roomStyle()`), built server-side by `SideNav`. */
export type NavRooms = Record<string, CSSProperties>
export type NavDropdownItem = Extract<NavItem, {_type: 'navDropdown'}>

// Contact + legal content from Settings (rail, drawer, footer, contact block).
export type SettingsContact = NonNullable<MaybeStega<SettingsQueryResult>>['contact']
export type SettingsLegal = NonNullable<MaybeStega<SettingsQueryResult>>['legal']
