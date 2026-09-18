import Reveal from '@/app/components/motion/Reveal'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'stats'>
  index: number
  pageId: string
  pageType: string
  className?: string
}

const colClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/**
 * Key facts (`stats` block). A `<dl>`: each label (`dt`) precedes its figure
 * (`dd`) in the DOM, so assistive tech reads "Infant ratio, 1:3"; the figure is
 * lifted above the label visually with `flex-col-reverse`.
 */
export default function Stats({block, className}: Props) {
  const {heading, subheading, items, columns} = block
  const cols = columns ?? 3
  const list = items ?? []
  if (list.length === 0) return null

  return (
    <section className={cn('container my-12 lg:my-16', className)}>
      {(heading || subheading) && (
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
      )}

      <dl
        className={cn(
          'grid gap-x-8 gap-y-10',
          heading || subheading ? 'mt-10' : '',
          colClass[cols],
        )}
      >
        {list.map((stat, i) => (
          <Reveal
            key={stat._key}
            i={i}
            className="flex flex-col-reverse justify-end gap-2 border-t-2 border-brand-accent-strong pt-4"
          >
            <dt>
              <span className="block text-base font-medium">{stat.label}</span>
              {stat.description && (
                <span className="mt-1 block text-sm text-muted-foreground">{stat.description}</span>
              )}
            </dt>
            <dd className="font-display text-4xl font-medium tracking-tight text-primary tabular-nums lg:text-5xl">
              {stat.value}
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  )
}
