import {stegaClean} from '@sanity/client/stega'

import Image from '@/app/components/common/SanityImage'
import Reveal from '@/app/components/motion/Reveal'
import {Avatar as AvatarRoot, AvatarFallback} from '@/components/ui/avatar'
import {Card} from '@/components/ui/card'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'authorsArchive'>
  index: number
  pageId: string
  pageType: string
}

const colClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

export default function AuthorsArchive({block}: Props) {
  const {heading, subheading, source, authors, limit, columns} = block
  const cols = columns ?? 3
  const all = authors ?? []
  const shown = stegaClean(source) === 'picked' ? all : all.slice(0, limit ?? 12)

  return (
    <section className="container my-12 lg:my-16">
      <header className="max-w-3xl">
        {heading && (
          <Reveal as="h2" className="text-2xl md:text-3xl lg:text-4xl">
            {heading}
          </Reveal>
        )}
        {subheading && (
          <Reveal as="p" i={1} className="mt-3 text-lg leading-8 text-muted-foreground">
            {subheading}
          </Reveal>
        )}
      </header>

      {shown.length > 0 ? (
        <ul className={cn('mt-8 grid grid-cols-1 gap-6', colClass[cols])}>
          {shown.map((author, i) => {
            const ref = author.picture?.asset?._ref
            const initials =
              `${author.firstName?.[0] ?? ''}${author.lastName?.[0] ?? ''}`.toUpperCase() || '?'
            return (
              <Reveal as="li" key={author._id} i={i} variant="scale">
                <Card className="group/author flex h-full flex-col items-center gap-3 p-6 text-center transition-[transform,box-shadow,border-color] duration-300 will-change-transform motion-safe:hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg">
                  <AvatarRoot className="h-16 w-16 ring-2 ring-transparent transition-[transform,box-shadow] duration-300 will-change-transform group-hover/author:ring-primary/30 motion-safe:group-hover/author:scale-110">
                    {ref ? (
                      <Image
                        id={ref}
                        alt={author.picture?.alt || `${author.firstName} ${author.lastName}`}
                        width={64}
                        height={64}
                        hotspot={author.picture?.hotspot}
                        crop={author.picture?.crop}
                        mode="cover"
                        className="aspect-square h-full w-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                    )}
                  </AvatarRoot>
                  <p className="font-medium">
                    {author.firstName} {author.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {author.postCount} {author.postCount === 1 ? 'post' : 'posts'}
                  </p>
                </Card>
              </Reveal>
            )
          })}
        </ul>
      ) : (
        <p className="mt-8 text-muted-foreground">No authors to show yet.</p>
      )}
    </section>
  )
}
