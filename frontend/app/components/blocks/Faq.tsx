import {type PortableTextBlock} from 'next-sanity'
import {ChevronDownIcon} from '@heroicons/react/24/outline'

import PortableText from '@/app/components/portable-text/PortableText'
import Reveal from '@/app/components/motion/Reveal'
import {ExtractPageBuilderType} from '@/sanity/lib/types'
import {cn} from '@/lib/utils'

type Props = {
  block: ExtractPageBuilderType<'faq'>
  index: number
  pageId: string
  pageType: string
  className?: string
}

/**
 * Native <details>/<summary> accordion — zero client JS, keyboard-operable and
 * screen-reader friendly out of the box (see docs/A11Y.md, "minimal client JS").
 * Reveal-on-scroll + an open-panel slide are pure CSS (globals.css).
 */
export default function Faq({block, className}: Props) {
  const {heading, subheading, items} = block
  const list = items ?? []

  return (
    <section className={cn('container my-12 lg:my-16', className)}>
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
        <div className="mt-8 max-w-3xl divide-y divide-border border-t border-border">
          {list.map((item, i) => (
            <Reveal as="details" key={item._key} i={i} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 -mx-2 px-2 py-4 text-left font-medium rounded-md transition-colors hover:bg-accent/40 [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <span className="transition-transform duration-200 motion-safe:group-open:translate-x-1">
                  {item.question}
                </span>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 group-hover:text-foreground motion-reduce:transition-none"
                />
              </summary>
              {item.answer && item.answer.length > 0 && (
                <div className="faq-panel pb-5 -mt-1">
                  <PortableText value={item.answer as PortableTextBlock[]} />
                </div>
              )}
            </Reveal>
          ))}
        </div>
      )}
    </section>
  )
}
