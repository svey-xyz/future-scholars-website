import Reveal from '@/app/components/Reveal'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'stats'>
  index: number
  pageId: string
  pageType: string
}

const colClass: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
}

export default function Stats({block}: Props) {
  const {heading, subheading, items, columns} = block
  const cols = columns ?? 4
  const list = items ?? []

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

      {list.length > 0 && (
        <ul className={cn('mt-10 grid gap-8', colClass[cols])}>
          {list.map((stat, i) => (
            <Reveal as="li" key={stat._key} i={i} variant="scale" className="group/stat flex flex-col gap-1">
              <p className="text-4xl font-semibold tracking-tight text-foreground tabular-nums transition-transform duration-300 will-change-transform motion-safe:group-hover/stat:scale-105 origin-left lg:text-5xl">
                {stat.value}
              </p>
              {/* Animated gradient accent that pans and widens on hover. */}
              <span
                aria-hidden="true"
                className="animate-gradient-pan mt-1 block h-0.5 w-8 rounded-full bg-linear-to-r from-primary/50 via-primary to-primary/50 transition-[width] duration-300 group-hover/stat:w-16"
              />
              <p className="mt-1 text-sm font-medium">{stat.label}</p>
              {stat.description && (
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              )}
            </Reveal>
          ))}
        </ul>
      )}
    </section>
  )
}
