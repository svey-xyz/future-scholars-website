import {stegaClean} from '@sanity/client/stega'

import PostCard from '@/app/components/posts/PostCard'
import Reveal from '@/app/components/motion/Reveal'
import {Badge} from '@/components/ui/badge'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'postsArchive'>
  index: number
  pageId: string
  pageType: string
}

// Literal class strings so Tailwind can statically detect them.
const colClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
}

export default function PostsArchive({block}: Props) {
  const {heading, subheading, source, posts, limit, columns, category} = block
  const cols = columns ?? 3
  const all = posts ?? []
  // GROQ caps 'latest' at 24; apply the editor's exact limit here.
  const shown = stegaClean(source) === 'latest' ? all.slice(0, limit ?? 6) : all

  return (
    <section className="container my-12 lg:my-16">
      <header className="max-w-3xl">
        {heading && (
          <Reveal as="h2" className="text-2xl md:text-3xl lg:text-4xl">
            {heading}
          </Reveal>
        )}
        {category?.title && (
          <Reveal i={1}>
            <Badge variant="secondary" className="mt-3 font-mono uppercase tracking-tight">
              {category.title}
            </Badge>
          </Reveal>
        )}
        {subheading && (
          <Reveal as="p" i={2} className="mt-3 text-lg leading-8 text-muted-foreground">
            {subheading}
          </Reveal>
        )}
      </header>

      {shown.length > 0 ? (
        <div className={cn('mt-8 grid grid-cols-1 gap-6', colClass[cols])}>
          {shown.map((post, i) => (
            <Reveal key={post._id} i={i} className="h-full">
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-muted-foreground">No posts to show yet.</p>
      )}
    </section>
  )
}
