import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'

import PortableText from '@/app/components/PortableText'
import Image from '@/app/components/SanityImage'
import {sanityFetch} from '@/sanity/lib/live'
import {projectBySlugQuery, projectSlugsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{slug: string}>
}

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: projectSlugsQuery,
    // Use the published perspective in generateStaticParams
    perspective: 'published',
    stega: false,
  })
  return data
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const {data: project} = await sanityFetch({
    query: projectBySlugQuery,
    params,
    // Metadata should never contain stega
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  // Prefer the dedicated OG image; fall back to the cover image.
  const ogImage = resolveOpenGraphImage(project?.ogImage ?? project?.coverImage)

  return {
    title: project?.title,
    description: project?.excerpt ?? undefined,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

/**
 * Project detail (foundation for SVE-41).
 * Minimal accessible RSC render — title, cover image, body. The rich layout,
 * tech badges, website/repo links and motion land in SVE-41.
 */
export default async function ProjectPage(props: Props) {
  const params = await props.params
  const [{data: project}] = await Promise.all([
    sanityFetch({query: projectBySlugQuery, params}),
  ])

  if (!project?._id) {
    return notFound()
  }

  return (
    <div className="container my-12 grid gap-12 lg:my-24">
      <div>
        <div className="mb-6 grid gap-6 border-b border-border pb-6">
          <div className="flex max-w-3xl flex-col gap-6">
            <h1 className="text-4xl text-foreground sm:text-5xl lg:text-7xl">{project.title}</h1>
            {project.excerpt && (
              <p className="text-lg leading-8 text-muted-foreground">{project.excerpt}</p>
            )}
          </div>
        </div>
        <article className="prose max-w-none dark:prose-invert">
          {project.coverImage?.asset?._ref && (
            <Image
              id={project.coverImage.asset._ref}
              alt={project.coverImage.alt || ''}
              className="not-prose mb-8 w-full rounded-sm"
              width={1024}
              height={538}
              mode="cover"
              hotspot={project.coverImage.hotspot}
              crop={project.coverImage.crop}
            />
          )}
          {project.body?.length && (
            <PortableText
              className="max-w-2xl prose-headings:font-medium prose-headings:tracking-tight"
              value={project.body as PortableTextBlock[]}
            />
          )}
        </article>
      </div>
    </div>
  )
}
