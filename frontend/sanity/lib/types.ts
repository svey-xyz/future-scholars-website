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

// Represents a Link after GROQ dereferencing (page/post become slug strings)
export type DereferencedLink = {
  _type: 'link'
  linkType?: 'href' | 'page' | 'post'
  href?: string
  page?: string | null
  post?: string | null
  openInNewTab?: boolean
}

// CMS-driven header navigation — derived from the typed `settingsQuery` result
// so the nav islands never hand-widen the shape. `navigation` is a discriminated
// union on `_type` (navLink leaf | navDropdown group).
type SettingsNavigation = NonNullable<NonNullable<SettingsQueryResult>['navigation']>
export type NavItem = SettingsNavigation[number]
export type NavLinkItem = Extract<NavItem, {_type: 'navLink'}>
export type NavDropdownItem = Extract<NavItem, {_type: 'navDropdown'}>

// Footer / mobile-footer content shared between <Footer> and the mobile <Sheet>.
export type SettingsContact = NonNullable<SettingsQueryResult>['contact']
export type SettingsLegal = NonNullable<SettingsQueryResult>['legal']
export type SettingsMobileNav = NonNullable<SettingsQueryResult>['mobileNav']
