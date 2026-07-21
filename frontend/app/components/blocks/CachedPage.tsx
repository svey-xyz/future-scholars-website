import {stegaClean} from '@sanity/client/stega'

import PageBuilder from './PageBuilder'
import {PageTitle} from '@/app/components/layout'
import {ShaderBackground} from '@/app/components/shader'
import {OnboardingShell} from '@/app/components/starter'
import {sanityFetch, type DynamicFetchOptions} from '@/sanity/lib/live'
import {getPageQuery} from '@/sanity/lib/queries'
import {GetPageQueryResult} from '@/sanity.types'
import {studioUrl} from '@/sanity/lib/api'

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

  if (!page?._id) {
    return (
      <div className="py-40">
        <OnboardingShell
          message={{
            title: `/${slug} does not exist yet`,
            description: 'Get started by creating a new page.',
          }}
          link={{
            title: 'Create Page',
            href: `${studioUrl}/structure/intent/create/template=page;type=page;path=name`,
          }}
          type="page"
          path="name"
        />
      </div>
    )
  }

  // Page-level animated background sits behind the whole page shell when set.
  // `stegaClean`: enum comparison must ignore draft-mode stega characters.
  const pageHasShader = stegaClean(page.background?.type) === 'shader'

  return (
    <div className="my-12 lg:my-24">
      {pageHasShader ? (
        // Page-level background: anchor the canvas to the viewport via a
        // `fixed inset-0` layer so it spans the whole viewport (not just the
        // content box) and keeps a stable size as streamed/transitioned content
        // reflows. The old content-box-scoped `absolute` layer under-filled the
        // viewport and flickered the WebGL canvas on every reflow (SVE-45).
        // `-z-10` keeps it behind page content but above the body background;
        // the inner ShaderBackground's own `absolute inset-0` fills this layer.
        <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
          <ShaderBackground
            preset={page.background?.preset}
            speed={page.background?.speed}
            intensity={page.background?.intensity}
            colorSource={page.background?.colorSource}
            customColor={page.background?.customColor}
            opacity={page.background?.opacity}
          />
        </div>
      ) : null}
      {/* `_type` is safe raw (underscore-prefixed — stega never encodes it);
          PageTitle stega-cleans the display mode itself. */}
      <PageTitle
        heading={page.heading}
        subheading={page.subheading}
        display={page.titleDisplay}
        heroLeads={page.pageBuilder?.[0]?._type === 'hero'}
      />
      <PageBuilder page={page as GetPageQueryResult} />
    </div>
  )
}
