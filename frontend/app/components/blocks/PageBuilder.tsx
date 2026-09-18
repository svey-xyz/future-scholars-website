'use client'

import {SanityDocument} from 'next-sanity'
import {useOptimistic} from 'next-sanity/hooks'

import BlockRenderer from './BlockRenderer'
import {GetPageQueryResult} from '@/sanity.types'
import {dataAttr} from '@/sanity/lib/utils'
import {PageBuilderSection} from '@/sanity/lib/types'

type PageBuilderPageProps = {
  page: GetPageQueryResult
}

type PageData = {
  _id: string
  _type: string
  pageBuilder?: PageBuilderSection[]
}

/**
 * End-of-page spacing, owned by the LAST block so a block background (brand
 * CTA, panel pull quote) runs down to the footer instead of stopping short of
 * a page-level margin. `mb-0` cancels the `my-*` rhythm margin content blocks
 * carry (v4 emits `margin-bottom` after `margin-block`, so it wins without `!`);
 * each block merges `className` last via `cn`, so `pb-*` also beats a panel's
 * `py-*`. Net end spacing matches the old page wrapper (48px / 96px at lg).
 */
const PAGE_END = 'mb-0 pb-12 lg:mb-0 lg:pb-24'

/**
 * The PageBuilder component is used to render the blocks from the `pageBuilder` field in the Page type in your Sanity Studio.
 */

function RenderSections({
  pageBuilderSections,
  page,
}: {
  pageBuilderSections: PageBuilderSection[]
  page: GetPageQueryResult
}) {
  if (!page) {
    return null
  }
  return (
    <div
      data-sanity={dataAttr({
        id: page._id,
        type: page._type,
        path: `pageBuilder`,
      }).toString()}
    >
      {pageBuilderSections.map((block: PageBuilderSection, index: number) => (
        <BlockRenderer
          key={block._key}
          index={index}
          block={block}
          pageId={page._id}
          pageType={page._type}
          className={index === pageBuilderSections.length - 1 ? PAGE_END : undefined}
        />
      ))}
    </div>
  )
}

function RenderEmptyState({page}: {page: GetPageQueryResult}) {
  if (!page) {
    return null
  }

  return (
    <div
      className="container mt-10 mb-12 lg:mb-24"
      data-sanity={dataAttr({
        id: page._id,
        type: 'page',
        path: `pageBuilder`,
      }).toString()}
    >
      <div className="prose">
        <h2 className="">This page has no content!</h2>
        <p className="">Open the page in Sanity Studio to add content.</p>
      </div>
    </div>
  )
}

export default function PageBuilder({page}: PageBuilderPageProps) {
  const pageBuilderSections = useOptimistic<
    PageBuilderSection[] | undefined,
    SanityDocument<PageData>
  >(page?.pageBuilder || [], (currentSections, action) => {
    // The action contains updated document data from Sanity
    // when someone makes an edit in the Studio

    // If the edit was to a different document, ignore it
    if (action.id !== page?._id) {
      return currentSections
    }

    // If there are sections in the updated document, use them
    if (action.document.pageBuilder) {
      // Reconcile References. https://www.sanity.io/docs/enabling-drag-and-drop#ffe728eea8c1
      return action.document.pageBuilder.map(
        (section) => currentSections?.find((s) => s._key === section?._key) || section,
      )
    }

    // Otherwise keep the current sections
    return currentSections
  })

  return pageBuilderSections && pageBuilderSections.length > 0 ? (
    <RenderSections pageBuilderSections={pageBuilderSections} page={page} />
  ) : (
    <RenderEmptyState page={page} />
  )
}
