import {stegaClean} from '@sanity/client/stega'

import Image from '@/app/components/SanityImage'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'gallery'>
  index: number
  pageId: string
  pageType: string
}

const colClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
}

const aspectClass: Record<string, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  auto: '',
}

export default function Gallery({block}: Props) {
  const {heading, images, columns, aspect} = block
  const cols = columns ?? 3
  const a = stegaClean(aspect) || 'square'
  const fixed = a !== 'auto'
  const imgs = images ?? []

  return (
    <section className="container my-12 lg:my-16">
      {heading && <h2 className="mb-8 text-2xl md:text-3xl lg:text-4xl">{heading}</h2>}

      {imgs.length > 0 && (
        <ul className={cn('grid grid-cols-1 gap-4', colClass[cols])}>
          {imgs.map((img) =>
            img.asset?._ref ? (
              <li key={img._key}>
                <figure>
                  <div className={cn('overflow-hidden rounded-lg bg-muted', aspectClass[a])}>
                    <Image
                      id={img.asset._ref}
                      alt={img.alt || ''}
                      width={800}
                      hotspot={img.hotspot}
                      crop={img.crop}
                      mode={fixed ? 'cover' : 'contain'}
                      loading="lazy"
                      className={cn('w-full', fixed && 'h-full object-cover')}
                    />
                  </div>
                  {img.caption && (
                    <figcaption className="mt-2 text-sm text-muted-foreground">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              </li>
            ) : null,
          )}
        </ul>
      )}
    </section>
  )
}
