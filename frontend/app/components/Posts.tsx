import {ViewTransition} from 'react'
import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/live'
import {morePostsQuery, allPostsQuery} from '@/sanity/lib/queries'
import {AllPostsQueryResult} from '@/sanity.types'
import DateComponent from '@/app/components/Date'
import OnBoarding from '@/app/components/Onboarding'
import Avatar from '@/app/components/Avatar'
import {dataAttr} from '@/sanity/lib/utils'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const Post = ({post}: {post: AllPostsQueryResult[number]}) => {
  const {_id, title, slug, excerpt, date, author} = post

  return (
    <Card
      data-sanity={dataAttr({id: _id, type: 'post', path: 'title'}).toString()}
      className="relative flex flex-col justify-between transition-colors hover:bg-accent/40"
    >
      <Link
        href={`/posts/${slug}`}
        aria-label={title ?? undefined}
        transitionTypes={['nav-forward']}
      >
        <span className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </Link>
      <CardHeader>
        {/* Shared-element morph: this title morphs into the <h1> on the post
            detail page (matching name in app/posts/[slug]/page.tsx). */}
        <ViewTransition name={`post-title-${slug}`} share="morph">
          <CardTitle className="text-2xl">{title}</CardTitle>
        </ViewTransition>
        {excerpt && (
          <CardDescription className="line-clamp-3 max-w-[70ch] leading-6">
            {excerpt}
          </CardDescription>
        )}
      </CardHeader>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        {author && author.firstName && author.lastName ? (
          <Avatar person={author} small={true} />
        ) : (
          <span />
        )}
        <span className="text-muted-foreground text-xs font-mono">
          <DateComponent dateString={date} />
        </span>
      </CardFooter>
    </Card>
  )
}

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

export const MorePosts = async ({skip, limit}: {skip: string; limit: number}) => {
  const {data} = await sanityFetch({
    query: morePostsQuery,
    params: {skip, limit},
  })

  if (!data || data.length === 0) {
    return null
  }

  return (
    <Posts heading={`Recent Posts (${data?.length})`}>
      {data?.map((post: AllPostsQueryResult[number]) => (
        <Post key={post._id} post={post} />
      ))}
    </Posts>
  )
}

export const AllPosts = async () => {
  const {data} = await sanityFetch({query: allPostsQuery})

  if (!data || data.length === 0) {
    return <OnBoarding />
  }

  return (
    <Posts
      heading="Recent Posts"
      subHeading={`${data.length === 1 ? 'This blog post is' : `These ${data.length} blog posts are`} populated from your Sanity Studio.`}
    >
      {data.map((post: AllPostsQueryResult[number]) => (
        <Post key={post._id} post={post} />
      ))}
    </Posts>
  )
}
