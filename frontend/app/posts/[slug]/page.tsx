import type {Metadata, ResolvingMetadata} from 'next'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'
import {Suspense, ViewTransition} from 'react'

import {Avatar, MorePosts} from '@/app/components/posts'
import {PortableText} from '@/app/components/portable-text'
import {SanityImage as Image} from '@/app/components/common'
import {Skeleton} from '@/components/ui/skeleton'
import {
  getDynamicFetchOptions,
  sanityFetch,
  sanityFetchMetadata,
  sanityFetchStaticParams,
  type DynamicFetchOptions,
} from '@/sanity/lib/live'
import {JsonLd, blogPostingJsonLd} from '@/app/components/seo'
import {postPagesSlugs, postQuery, settingsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{slug: string}>
}

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const {data} = await sanityFetchStaticParams({query: postPagesSlugs})
  // Cache Components requires ≥1 param (`empty-generate-static-params`). When
  // the dataset has zero posts the param space is genuinely empty, so
  // prerender a placeholder slug instead — `CachedPost` 404s any slug with no
  // matching document, which turns this into a build-time render of the
  // not-found page. (Next.js docs-sanctioned pattern; backport candidate.)
  return data.length > 0 ? data : [{slug: '__placeholder__'}]
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const [params, {perspective}] = await Promise.all([props.params, getDynamicFetchOptions()])
  const {data: post} = await sanityFetchMetadata({query: postQuery, params, perspective})
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

/**
 * Layer 1 of the three-layer pattern (see docs/CACHING.md): branch on
 * `draftMode()` only.
 */
export default async function PostPage(props: Props) {
  const {isEnabled: isDraftMode} = await draftMode()
  if (isDraftMode) {
    return (
      <Suspense fallback={<PostFallback />}>
        {/* `params` stays un-awaited here so the Suspense boundary works. */}
        <DynamicPost params={props.params} />
      </Suspense>
    )
  }
  const {slug} = await props.params
  return <CachedPost slug={slug} perspective="published" stega={false} />
}

/** Layer 2 (draft mode only): resolve request-time values, pass plain props. */
async function DynamicPost({params}: Pick<Props, 'params'>) {
  const [{slug}, {perspective, stega}] = await Promise.all([params, getDynamicFetchOptions()])
  return <CachedPost slug={slug} perspective={perspective} stega={stega} />
}

/** Layer 3: cached post render. */
async function CachedPost({slug, perspective, stega}: {slug: string} & DynamicFetchOptions) {
  'use cache'
  const {data: post} = await sanityFetch({query: postQuery, params: {slug}, perspective, stega})

  if (!post?._id) {
    return notFound()
  }

  // JSON-LD is metadata (crawler-facing): always built from the published
  // perspective, never stega — matching generateMetadata, not the page body.
  const {data: settings} = await sanityFetchMetadata({
    query: settingsQuery,
    perspective: 'published',
  })
  const {data: publishedPost} =
    perspective === 'published' && !stega
      ? {data: post}
      : await sanityFetchMetadata({query: postQuery, params: {slug}, perspective: 'published'})

  return (
    <>
      {publishedPost && <JsonLd data={blogPostingJsonLd(publishedPost, settings)} />}
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
                <MorePosts skip={post._id} limit={2} perspective={perspective} stega={stega} />
              </ViewTransition>
            </Suspense>
          </aside>
        </div>
      </div>
    </>
  )
}

/** Draft-mode streaming fallback — mirrors the post header block, no CLS. */
function PostFallback() {
  return (
    <div className="container my-12 grid gap-12 lg:my-24">
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-14 w-2/3" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full rounded-sm" />
      </div>
    </div>
  )
}
