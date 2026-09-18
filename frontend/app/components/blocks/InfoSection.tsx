import {type PortableTextBlock} from 'next-sanity'

import PortableText from '@/app/components/portable-text/PortableText'
import Reveal from '@/app/components/motion/Reveal'
import {InfoSection} from '@/sanity.types'
import {cn} from '@/lib/utils'

type InfoProps = {
  block: InfoSection
  index: number
  // Needed if you want to createDataAttributes to do non-text overlays in Presentation (Visual Editing)
  pageId: string
  pageType: string
  className?: string
}

export default function InfoSectionBlock({block, className}: InfoProps) {
  return (
    <div className={cn('container my-12', className)}>
      <div className="max-w-3xl">
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
      </div>
    </div>
  )
}
