import {PortableTextBlock} from 'next-sanity'
import {stegaClean} from '@sanity/client/stega'

import ResolvedLink from '@/app/components/ResolvedLink'
import PortableText from '@/app/components/PortableText'
import Image from '@/app/components/SanityImage'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type CtaProps = {
  block: ExtractPageBuilderType<'callToAction'>
  index: number
  // Needed if you want to createDataAttributes to do non-text overlays in Presentation (Visual Editing)
  pageType: string
  pageId: string
}

export default function CTA({block}: CtaProps) {
  const {heading, eyebrow, body = [], button, image, theme, contentAlignment} = block

  const isDark = theme === 'dark'
  const isImageFirst = stegaClean(contentAlignment) === 'imageFirst'

  return (
    <section className={cn('relative', isDark && 'dark bg-background text-foreground')}>
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 py-12">
          <div
            className={cn(
              'flex flex-col gap-2',
              isImageFirst && image && 'row-start-2 lg:row-start-1 lg:col-start-2',
            )}
          >
            {eyebrow && (
              <div>
                <Badge variant="secondary" className="font-mono uppercase tracking-tight">
                  {eyebrow}
                </Badge>
              </div>
            )}
            {heading && <h2 className="text-2xl md:text-3xl lg:text-4xl">{heading}</h2>}
            {body && (
              <div className="lg:text-left">
                <PortableText value={body as PortableTextBlock[]} />
              </div>
            )}

            {button?.buttonText && button?.link && (
              <div className="flex mt-4">
                <Button asChild size="lg" className="rounded-full">
                  <ResolvedLink link={button.link}>{button.buttonText}</ResolvedLink>
                </Button>
              </div>
            )}
          </div>

          {image?.asset?._ref && (
            <Image
              id={image.asset._ref}
              alt="Demo image"
              width={704}
              crop={image.crop}
              mode="cover"
              className="rounded-sm"
            />
          )}
        </div>
      </div>
    </section>
  )
}
