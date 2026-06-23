import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'
import {Suspense, ViewTransition} from 'react'

import {Avatar, MorePosts} from '@/app/components/posts'
import {PortableText} from '@/app/components/portable-text'
import {SanityImage as Image} from '@/app/components/common'
import {Skeleton} from '@/components/ui/skeleton'
import {sanityFetch} from '@/sanity/lib/live'
import {postPagesSlugs, postQuery} from '@/sanity/lib/queries'
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
    query: postPagesSlugs,
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
  const {data: post} = await sanityFetch({
    query: postQuery,
    params,
    // Metadata should never contain stega
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(post?.coverImage)

  return {
    authors:
      post?.author?.firstName && post?.author?.lastName
        ? [{name: `${post.author.firstName} ${post.author.lastName}`}]
        : [],
    title: post?.title,
    description: post?.excerpt,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

function MorePostsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <div className="space-y-6 pt-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  )
}

export default async function PostPage(props: Props) {
  const params = await props.params
  const [{data: post}] = await Promise.all([sanityFetch({query: postQuery, params})])

  if (!post?._id) {
    return notFound()
  }

  return (
    <>
      <div className="container my-12 grid gap-12 lg:my-24">
        <div>
          <div className="mb-6 grid gap-6 border-b border-border pb-6">
            <div className="flex max-w-3xl flex-col gap-6">
              {/* Shared-element morph target: morphs from the post card title
                  in Posts.tsx (matching name `post-title-<slug>`). */}
              <ViewTransition name={`post-title-${post.slug}`} share="morph">
                <h1 className="text-4xl text-foreground sm:text-5xl lg:text-7xl">{post.title}</h1>
              </ViewTransition>
            </div>
            <div className="flex max-w-3xl items-center gap-4">
              {post.author && post.author.firstName && post.author.lastName && (
                <Avatar person={post.author} date={post.date} />
              )}
            </div>
          </div>
          <article className="prose max-w-none dark:prose-invert">
            {post?.coverImage && (
              <Image
                id={post.coverImage.asset?._ref || ''}
                alt={post.coverImage.alt || ''}
                className="not-prose mb-8 w-full rounded-sm"
                width={1024}
                height={538}
                mode="cover"
                hotspot={post.coverImage.hotspot}
                crop={post.coverImage.crop}
              />
            )}
            {post.content?.length && (
              <PortableText
                className="max-w-2xl prose-headings:font-medium prose-headings:tracking-tight"
                value={post.content as PortableTextBlock[]}
              />
            )}
          </article>
        </div>
      </div>
      <div className="border-t border-border bg-muted/40">
        <div className="container grid gap-12 py-12 lg:py-24">
          <aside>
            <Suspense
              fallback={
                <ViewTransition exit="slide-down" default="none">
                  <MorePostsSkeleton />
                </ViewTransition>
              }
            >
              <ViewTransition enter="slide-up" default="none">
                <MorePosts skip={post._id} limit={2} />
              </ViewTransition>
            </Suspense>
          </aside>
        </div>
      </div>
    </>
  )
}
