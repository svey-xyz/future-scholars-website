import {ViewTransition} from 'react'
import Link from 'next/link'

import DateComponent from '@/app/components/Date'
import Avatar from '@/app/components/Avatar'
import {dataAttr} from '@/sanity/lib/utils'
import {AllPostsQueryResult} from '@/sanity.types'
import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'

/**
 * Shared post card used by the home/post lists (Posts.tsx) and the
 * `postsArchive` page-builder block. Keep the markup in sync with docs/A11Y.md:
 * full-card link carries `aria-label`, overlay copies the focus-ring tokens, and
 * the title morphs into the post detail <h1> via the matching ViewTransition name.
 */
export default function PostCard({post}: {post: AllPostsQueryResult[number]}) {
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
