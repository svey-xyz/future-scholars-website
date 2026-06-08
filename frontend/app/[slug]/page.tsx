import type {Metadata} from 'next'

import PageBuilderPage from '@/app/components/PageBuilder'
import ShaderBackground from '@/app/components/shader/ShaderBackground'
import {sanityFetch} from '@/sanity/lib/live'
import {getPageQuery, pagesSlugs} from '@/sanity/lib/queries'
import {GetPageQueryResult} from '@/sanity.types'
import {OnboardingShell} from '@/app/components/Onboarding'
import { studioUrl } from '@/sanity/lib/api'
import { title } from 'process'

type Props = {
  params: Promise<{slug: string}>
}

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: pagesSlugs,
    // // Use the published perspective in generateStaticParams
    perspective: 'published',
    stega: false,
  })
  return data
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const {data: page} = await sanityFetch({
    query: getPageQuery,
    params,
    // Metadata should never contain stega
    stega: false,
  })

  return {
    title: page?.name,
    description: page?.heading,
  } satisfies Metadata
}

export default async function Page(props: Props) {
  const params = await props.params
  const [{data: page}] = await Promise.all([sanityFetch({query: getPageQuery, params})])

  if (!page?._id) {
    return (
      <div className="py-40">
				<OnboardingShell
					message={{
						title: `/${params.slug} does not exist yet`,
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
  const pageHasShader = page.background?.type === 'shader'

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
      <div className="container">
        <div className="border-b border-border pb-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl text-foreground sm:text-5xl lg:text-7xl">{page.heading}</h1>
            <p className="mt-4 text-base font-light uppercase leading-relaxed text-muted-foreground lg:text-lg">
              {page.subheading}
            </p>
          </div>
        </div>
      </div>
      <PageBuilderPage page={page as GetPageQueryResult} />
    </div>
  )
}
