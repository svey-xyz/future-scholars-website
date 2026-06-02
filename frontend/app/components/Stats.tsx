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
        {heading && <h2 className="text-2xl md:text-3xl lg:text-4xl">{heading}</h2>}
        {subheading && (
          <p className="mt-3 text-lg leading-8 text-muted-foreground">{subheading}</p>
        )}
      </header>

      {list.length > 0 && (
        <ul className={cn('mt-10 grid gap-8', colClass[cols])}>
          {list.map((stat) => (
            <li key={stat._key} className="flex flex-col gap-1">
              <p className="text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
                {stat.value}
              </p>
              <p className="text-sm font-medium">{stat.label}</p>
              {stat.description && (
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
