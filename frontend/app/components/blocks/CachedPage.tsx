import {notFound} from 'next/navigation'

import PageBuilder from './PageBuilder'
import {Masthead, PageTitle} from '@/app/components/layout'
import {sanityFetch, type DynamicFetchOptions} from '@/sanity/lib/live'
import {getPageQuery} from '@/sanity/lib/queries'
import {GetPageQueryResult} from '@/sanity.types'

/**
 * Cached `page`-document renderer (three-layer pattern, see docs/CACHING.md),
 * shared by `/` (via the designated homepage) and `/[slug]`. `perspective` and
 * `stega` must be resolved OUTSIDE the cache boundary and passed in.
 */
export default async function CachedPage({
  slug,
  perspective,
  stega,
}: {slug: string} & DynamicFetchOptions) {
  'use cache'
  const {data: page} = await sanityFetch({query: getPageQuery, params: {slug}, perspective, stega})

  if (!page?._id) notFound()

  // Top spacing only when PageTitle opens the page; the masthead sits flush.
  // Bottom spacing belongs to the last block (see PageBuilder `PAGE_END`).
  return (
    <div className={page.masthead ? undefined : 'mt-12 lg:mt-24'}>
      {/* When the page defines a masthead (D12) it opens the page flush to
          the shell chrome and owns the visual <h1> — PageTitle is skipped so
          the heading never duplicates. `titleDisplay: 'none'` still applies:
          the masthead keeps the h1 sr-only. */}
      {page.masthead ? (
        <Masthead
          masthead={page.masthead}
          heading={page.heading}
          subheading={page.subheading}
          titleDisplay={page.titleDisplay}
        />
      ) : null}
      {/* PageTitle stega-cleans the display mode itself. */}
      {!page.masthead ? (
        <PageTitle
          heading={page.heading}
          subheading={page.subheading}
          display={page.titleDisplay}
        />
      ) : null}
      <PageBuilder page={page as GetPageQueryResult} />
    </div>
  )
}
