import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {Suspense} from 'react'

import {CachedPage} from '@/app/components/blocks'
import {getSettings} from '@/app/components/layout'
import {OnboardingShell} from '@/app/components/starter'
import {Skeleton} from '@/components/ui/skeleton'
import {
  getDynamicFetchOptions,
  sanityFetchMetadata,
  type DynamicFetchOptions,
} from '@/sanity/lib/live'
import {getPageQuery, settingsQuery} from '@/sanity/lib/queries'
import {studioUrl} from '@/sanity/lib/api'

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
  const {perspective} = await getDynamicFetchOptions()
  const {data: settings} = await sanityFetchMetadata({query: settingsQuery, perspective})
  const slug = settings?.homepage?.slug?.current
  if (!slug) {
    return {}
  }

  const {data: page} = await sanityFetchMetadata({
    query: getPageQuery,
    params: {slug},
    perspective,
  })

  return {
    title: page?.name,
    description: page?.heading,
  } satisfies Metadata
}

/**
 * The homepage renders whichever `page` document the `settings` singleton
 * designates. Layer 1 of the three-layer pattern (see docs/CACHING.md):
 * branch on `draftMode()` only.
 */
export default async function Page() {
  const {isEnabled: isDraftMode} = await draftMode()
  if (isDraftMode) {
    return (
      <Suspense fallback={<HomeFallback />}>
        <DynamicHome />
      </Suspense>
    )
  }
  return <CachedHome perspective="published" stega={false} />
}

/** Layer 2 (draft mode only): resolve request-time values, pass plain props. */
async function DynamicHome() {
  const {perspective, stega} = await getDynamicFetchOptions()
  return <CachedHome perspective={perspective} stega={stega} />
}

/** Layer 3: resolve the designated homepage from settings, render it cached. */
async function CachedHome({perspective, stega}: DynamicFetchOptions) {
  'use cache'
  const settings = await getSettings({perspective, stega})
  const slug = settings?.homepage?.slug?.current

  if (!slug) {
    return (
      <div className="py-40">
        <OnboardingShell
          message={{
            title: `A homepage is not set yet`,
            description: 'Get started by setting a homepage in the Sanity Studio site settings.',
          }}
          link={{
            title: 'Set Homepage',
            href: `${studioUrl}/structure/intent/edit/id=siteSettings;type=siteSettings;path=homepage`,
          }}
          type="siteSettings"
          path="homepage"
        />
      </div>
    )
  }

  return <CachedPage slug={slug} perspective={perspective} stega={stega} />
}

/** Draft-mode streaming fallback — mirrors the standard-height masthead every
    seeded page opens with (S5), so streaming it in doesn't shift layout. */
function HomeFallback() {
  return <Skeleton className="h-[34vh] min-h-60 w-full rounded-none lg:h-[48vh] lg:min-h-80" />
}
