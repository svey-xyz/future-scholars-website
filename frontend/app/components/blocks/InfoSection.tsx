import {type PortableTextBlock} from 'next-sanity'
import {stegaClean} from '@sanity/client/stega'
import {ArrowTopRightOnSquareIcon} from '@heroicons/react/24/outline'

import PortableText from '@/app/components/portable-text/PortableText'
import Reveal from '@/app/components/motion/Reveal'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type InfoBlock = ExtractPageBuilderType<'infoSection'>

type InfoProps = {
  block: InfoBlock
  index: number
  // Needed if you want to createDataAttributes to do non-text overlays in Presentation (Visual Editing)
  pageId: string
  pageType: string
  className?: string
}

export default function InfoSectionBlock({block, className}: InfoProps) {
  // `stegaClean`: enum values carry stega characters in draft mode.
  const map = stegaClean(block.aside) === 'map' ? block.map : null

  const copy = (
    <>
      {block?.heading && (
        <Reveal as="h2" i={0} className="text-2xl md:text-3xl lg:text-4xl">
          {block.heading}
        </Reveal>
      )}
      {block?.subheading && (
        <Reveal
          as="span"
          i={1}
          className="block mt-4 mb-8 text-lg uppercase font-light text-muted-foreground"
        >
          {block.subheading}
        </Reveal>
      )}
      {block?.content?.length ? (
        <Reveal i={2} className="mt-4">
          <PortableText className="" value={block.content as PortableTextBlock[]} />
        </Reveal>
      ) : null}
    </>
  )

  if (!map) {
    return (
      <div className={cn('container my-12', className)}>
        <div className="max-w-3xl">{copy}</div>
      </div>
    )
  }

  // Copy left, map right from `lg`; stacked (map after the copy) below it.
  return (
    <div className={cn('container my-12', className)}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <div className="min-w-0">{copy}</div>
        <Reveal i={3} className="min-w-0 lg:pt-2">
          <MapEmbed map={map} />
        </Reveal>
      </div>
    </div>
  )
}

/**
 * FB11: a lazy Google Maps embed of the Settings address (D16 — never stored
 * twice). Pure RSC, no client JS. The 4:3 box is reserved up front, so the
 * iframe adds no CLS; `loading="lazy"` keeps the third-party page off the
 * initial load (the block sits below the fold). The visible "Open in Google
 * Maps" link is the keyboard/AT-friendly route and the fallback if the embed
 * fails or is blocked.
 *
 * Every value here goes into a URL or an attribute, so all of it is
 * stega-cleaned first.
 */
function MapEmbed({map}: {map: NonNullable<InfoBlock['map']>}) {
  const address = map.address
  const street = stegaClean(address?.street)
  const city = stegaClean(address?.city)
  const addressLine = [
    street,
    city,
    [stegaClean(address?.region), stegaClean(address?.postalCode)].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ')
  if (!addressLine) return null

  const name = stegaClean(map.name)
  const place = [street, city].filter(Boolean).join(', ')
  const title = name ? `Map showing ${name} at ${place}` : `Map showing ${place}`
  const href =
    stegaClean(map.mapUrl) ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}`

  return (
    <figure className="flex flex-col gap-3">
      <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted">
        <iframe
          src={`https://www.google.com/maps?q=${encodeURIComponent(addressLine)}&output=embed`}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full"
        />
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>{addressLine}</span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="-mx-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 font-medium text-primary underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Open in Google Maps
          <ArrowTopRightOnSquareIcon aria-hidden="true" className="size-4" />
          <span className="sr-only">(opens in new tab)</span>
        </a>
      </figcaption>
    </figure>
  )
}
