import {GetPageQueryResult, SettingsQueryResult} from '@/sanity.types'

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
  linkType?: 'href' | 'page'
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
type SettingsNavigation = NonNullable<NonNullable<SettingsQueryResult>['navigation']>
export type NavItem = SettingsNavigation[number]
export type NavLinkItem = Extract<NavItem, {_type: 'navLink'}>
export type NavDropdownItem = Extract<NavItem, {_type: 'navDropdown'}>

// Contact + legal content from Settings (rail, drawer, footer, contact block).
export type SettingsContact = NonNullable<SettingsQueryResult>['contact']
export type SettingsLegal = NonNullable<SettingsQueryResult>['legal']
