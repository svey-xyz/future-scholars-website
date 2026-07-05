import {sanityFetch, type DynamicFetchOptions} from '@/sanity/lib/live'
import {morePostsQuery, allPostsQuery} from '@/sanity/lib/queries'
import {AllPostsQueryResult} from '@/sanity.types'
import {OnboardingShell} from '@/app/components/starter/Onboarding'
import PostCard from './PostCard'
import {studioUrl} from '@/sanity/lib/api'

const Posts = ({
  children,
  heading,
  subHeading,
}: {
  children: React.ReactNode
  heading?: string
  subHeading?: string
}) => (
  <div>
    {heading && <h2 className="text-3xl sm:text-4xl lg:text-5xl">{heading}</h2>}
    {subHeading && <p className="mt-2 text-lg leading-8 text-muted-foreground">{subHeading}</p>}
    <div className="pt-6 space-y-6">{children}</div>
  </div>
)

/**
 * Cached components (three-layer pattern, see docs/CACHING.md): callers
 * resolve `perspective`/`stega` outside the cache boundary and pass them in.
 */
export const MorePosts = async ({
  skip,
  limit,
  perspective,
  stega,
}: {skip: string; limit: number} & DynamicFetchOptions) => {
  'use cache'
  const {data} = await sanityFetch({
    query: morePostsQuery,
    params: {skip, limit},
    perspective,
    stega,
  })

  if (!data || data.length === 0) {
    return null
  }

  return (
    <Posts heading={`Recent Posts (${data?.length})`}>
      {data?.map((post: AllPostsQueryResult[number]) => (
        <PostCard key={post._id} post={post} />
      ))}
    </Posts>
  )
}

export const AllPosts = async ({perspective, stega}: DynamicFetchOptions) => {
  'use cache'
  const {data} = await sanityFetch({query: allPostsQuery, perspective, stega})

  if (!data || data.length === 0) {
    return (
      <OnboardingShell
        message={{
          title: 'No posts yet',
          description: 'Get started by creating your first post in Sanity Studio.',
        }}
        link={{
          title: 'Create Post',
          href: `${studioUrl}/structure/intent/create/template=post;type=post;path=title`,
        }}
        type="post"
        path="title"
      />
    )
  }

  return (
    <Posts
      heading="Recent Posts"
      subHeading={`${data.length === 1 ? 'This blog post is' : `These ${data.length} blog posts are`} populated from your Sanity Studio.`}
    >
      {data.map((post: AllPostsQueryResult[number]) => (
        <PostCard key={post._id} post={post} />
      ))}
    </Posts>
  )
}
