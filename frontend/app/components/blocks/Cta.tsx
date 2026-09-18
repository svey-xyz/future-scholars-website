import {PortableTextBlock} from 'next-sanity'
import {stegaClean} from '@sanity/client/stega'

import ResolvedLink from '@/app/components/common/ResolvedLink'
import PortableText from '@/app/components/portable-text/PortableText'
import Image from '@/app/components/common/SanityImage'
import Reveal from '@/app/components/motion/Reveal'
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
  className?: string
}

export default function CTA({block, className}: CtaProps) {
  const {heading, eyebrow, body = [], button, image, theme, contentAlignment} = block

  // `stegaClean`: enum values carry stega characters in draft mode.
  const isBrand = stegaClean(theme) === 'brand'
  const isImageFirst = stegaClean(contentAlignment) === 'imageFirst'

  return (
    <section
      className={cn(
        'relative isolate overflow-x-clip',
        // Brand panel: the academy blue with the sunflower button — the one
        // place the bright accent may be a fill (§7.2).
        isBrand && 'bg-primary text-primary-foreground',
        className,
      )}
    >
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 py-12">
          <div
            className={cn(
              'flex flex-col gap-2',
              isImageFirst && image && 'row-start-2 lg:row-start-1 lg:col-start-2',
            )}
          >
            {eyebrow && (
              <Reveal i={0}>
                <Badge variant="secondary" className="uppercase tracking-wide">
                  {eyebrow}
                </Badge>
              </Reveal>
            )}
            {heading && (
              <Reveal as="h2" i={1} className="text-2xl md:text-3xl lg:text-4xl">
                {heading}
              </Reveal>
            )}
            {body && (
              <Reveal i={2} className="lg:text-left">
                <PortableText
                  value={body as PortableTextBlock[]}
                  className={cn(
                    isBrand &&
                      'prose-invert prose-a:text-primary-foreground prose-a:decoration-primary-foreground/60',
                  )}
                />
              </Reveal>
            )}

            {button?.buttonText && button?.link && (
              <Reveal i={3} className="flex mt-4">
                <Button
                  asChild
                  size="lg"
                  className={cn(
                    'group/cta relative overflow-hidden rounded-full transition-transform duration-200 will-change-transform motion-safe:hover:scale-[1.04] motion-safe:active:scale-95',
                    isBrand &&
                      'bg-brand-accent text-brand-accent-foreground hover:bg-brand-accent/90 focus-visible:ring-primary-foreground',
                  )}
                >
                  <ResolvedLink link={button.link}>
                    {/* Sheen sweep on hover (decorative). */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-primary-foreground/30 to-transparent transition-transform duration-700 ease-out motion-safe:group-hover/cta:translate-x-full"
                    />
                    {button.buttonText}
                  </ResolvedLink>
                </Button>
              </Reveal>
            )}
          </div>

          {image?.asset?._ref && (
            <Reveal variant="scale" className="group/img relative isolate">
              <div className="overflow-hidden rounded-sm">
                <Image
                  id={image.asset._ref}
                  alt={image.alt ?? ''}
                  width={704}
                  crop={image.crop}
                  mode="cover"
                  className="w-full transition-transform duration-[800ms] ease-out will-change-transform motion-safe:group-hover/img:scale-[1.04]"
                />
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
