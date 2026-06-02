import Image from '@/app/components/SanityImage'
import {Avatar as AvatarRoot, AvatarFallback} from '@/components/ui/avatar'
import {Card} from '@/components/ui/card'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'testimonials'>
  index: number
  pageId: string
  pageType: string
}

const colClass: Record<number, string> = {
  1: 'max-w-2xl',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
}

export default function Testimonials({block}: Props) {
  const {heading, subheading, testimonials, columns} = block
  const cols = columns ?? 3
  const items = testimonials ?? []

  return (
    <section className="container my-12 lg:my-16">
      <header className="max-w-3xl">
        {heading && <h2 className="text-2xl md:text-3xl lg:text-4xl">{heading}</h2>}
        {subheading && (
          <p className="mt-3 text-lg leading-8 text-muted-foreground">{subheading}</p>
        )}
      </header>

      <ul className={cn('mt-8 grid grid-cols-1 gap-6', colClass[cols])}>
        {items.map((t) => {
          const ref = t.authorImage?.asset?._ref
          const initials =
            t.authorName
              ?.split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')
              .toUpperCase() || '?'
          return (
            <li key={t._key}>
              <Card className="h-full">
                <figure className="flex h-full flex-col gap-4 p-6">
                  <blockquote className="leading-7 text-pretty">{t.quote}</blockquote>
                  <figcaption className="mt-auto flex items-center gap-3">
                    <AvatarRoot className="h-10 w-10">
                      {ref ? (
                        <Image
                          id={ref}
                          alt={t.authorImage?.alt || t.authorName}
                          width={40}
                          height={40}
                          hotspot={t.authorImage?.hotspot}
                          crop={t.authorImage?.crop}
                          mode="cover"
                          className="aspect-square h-full w-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      )}
                    </AvatarRoot>
                    <span className="flex flex-col">
                      <span className="font-medium">{t.authorName}</span>
                      {t.authorRole && (
                        <span className="text-sm text-muted-foreground">{t.authorRole}</span>
                      )}
                    </span>
                  </figcaption>
                </figure>
              </Card>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
