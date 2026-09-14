import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {Suspense} from 'react'

import {CachedPage} from '@/app/components/blocks'
import {Skeleton} from '@/components/ui/skeleton'
import {
  getDynamicFetchOptions,
  sanityFetchMetadata,
  sanityFetchStaticParams,
} from '@/sanity/lib/live'
import {getPageQuery, pagesSlugs} from '@/sanity/lib/queries'

type Props = {
  params: Promise<{slug: string}>
}

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const {data} = await sanityFetchStaticParams({query: pagesSlugs})
  return data
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const [params, {perspective}] = await Promise.all([props.params, getDynamicFetchOptions()])
  const {data: page} = await sanityFetchMetadata({query: getPageQuery, params, perspective})

  return {
    title: page?.name,
    description: page?.heading,
  } satisfies Metadata
}

/**
 * Layer 1 of the three-layer pattern (see docs/CACHING.md): branch on
 * `draftMode()` only. Published requests render the cached page directly
 * (maximal static shell); draft requests resolve request-time perspective /
 * stega inside a Suspense boundary.
 */
export default async function Page(props: Props) {
  const {isEnabled: isDraftMode} = await draftMode()
  if (isDraftMode) {
    return (
      <Suspense fallback={<PageFallback />}>
        {/* `params` stays un-awaited here so the Suspense boundary works. */}
        <DynamicPage params={props.params} />
      </Suspense>
    )
  }
  const {slug} = await props.params
  return <CachedPage slug={slug} perspective="published" stega={false} />
}

/** Layer 2 (draft mode only): resolve request-time values, pass plain props. */
async function DynamicPage({params}: Pick<Props, 'params'>) {
  const [{slug}, {perspective, stega}] = await Promise.all([params, getDynamicFetchOptions()])
  return <CachedPage slug={slug} perspective={perspective} stega={stega} />
}

/** Draft-mode streaming fallback — mirrors the standard-height masthead every
    seeded page opens with (S5), so streaming it in doesn't shift layout. */
function PageFallback() {
  return <Skeleton className="h-[34vh] min-h-60 w-full rounded-none lg:h-[48vh] lg:min-h-80" />
}
