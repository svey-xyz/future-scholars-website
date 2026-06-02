import {type PortableTextBlock} from 'next-sanity'
import {ChevronDownIcon} from '@heroicons/react/24/outline'

import PortableText from '@/app/components/PortableText'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'faq'>
  index: number
  pageId: string
  pageType: string
}

/**
 * Native <details>/<summary> accordion — zero client JS, keyboard-operable and
 * screen-reader friendly out of the box (see docs/A11Y.md, "minimal client JS").
 */
export default function Faq({block}: Props) {
  const {heading, subheading, items} = block
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
        <div className="mt-8 max-w-3xl divide-y divide-border border-t border-border">
          {list.map((item) => (
            <details key={item._key} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium rounded-md [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <span>{item.question}</span>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              {item.answer && item.answer.length > 0 && (
                <div className="pb-5 -mt-1">
                  <PortableText value={item.answer as PortableTextBlock[]} />
                </div>
              )}
            </details>
          ))}
        </div>
      )}
    </section>
  )
}
