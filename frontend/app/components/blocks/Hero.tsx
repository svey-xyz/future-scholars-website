import {type CSSProperties} from 'react'
import {stegaClean} from '@sanity/client/stega'

import ResolvedLink from '@/app/components/common/ResolvedLink'
import Image from '@/app/components/common/SanityImage'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'hero'>
  index: number
  pageId: string
  pageType: string
}

// Inline custom-property helper (typed) for the mount-entrance cascade.
const delay = (ms: number) => ({'--enter-d': `${ms}ms`}) as CSSProperties

export default function Hero({block, index}: Props) {
  const {eyebrow, heading, lede, buttons, image, layout, theme} = block
  const isDark = stegaClean(theme) === 'dark'
  const imageRef = image?.asset?._ref
  const isSplit = stegaClean(layout) === 'split' && Boolean(imageRef)
  const priority = index === 0

  const ctas =
    buttons && buttons.length > 0 ? (
      <div
        className={cn('enter mt-8 flex flex-wrap gap-3', !isSplit && 'justify-center')}
        style={delay(240)}
      >
        {buttons.map((button, i) =>
          button.buttonText && button.link ? (
            <Button
              key={button._key}
              asChild
              size="lg"
              variant={i === 0 ? 'default' : 'outline'}
              className="rounded-full transition-transform duration-200 will-change-transform motion-safe:hover:scale-[1.04] motion-safe:active:scale-95"
            >
              <ResolvedLink link={button.link}>{button.buttonText}</ResolvedLink>
            </Button>
          ) : null,
        )}
      </div>
    ) : null

  const copy = (
    <div
      className={cn(
        'flex flex-col',
        isSplit ? 'items-start text-left' : 'items-center text-center',
      )}
    >
      {eyebrow && (
        <Badge
          variant="secondary"
          className="enter mb-4 font-mono uppercase tracking-tight"
          style={delay(0)}
        >
          {eyebrow}
        </Badge>
      )}
      <h2
        className="enter text-4xl font-semibold sm:text-5xl lg:text-6xl text-balance"
        style={delay(90)}
      >
        {heading}
      </h2>
      {lede && (
        <p
          className={cn(
            'enter mt-5 text-lg leading-8 text-muted-foreground text-pretty',
            !isSplit && 'max-w-2xl',
          )}
          style={delay(170)}
        >
          {lede}
        </p>
      )}
      {ctas}
    </div>
  )

  return (
    <section className={cn('relative isolate', isDark && 'dark bg-background text-foreground')}>
      {/* Decorative ambient glow — aria-hidden, low-opacity so body contrast is unaffected. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="animate-float-slow absolute -top-24 -left-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="animate-pulse-glow absolute -top-10 right-0 h-64 w-64 rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="animate-float absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-primary/[0.06] blur-3xl" />
      </div>

      <div className="container py-16 lg:py-24">
        {isSplit && imageRef ? (
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {copy}
            <div className="enter group/img overflow-hidden rounded-xl" style={delay(180)}>
              <Image
                id={imageRef}
                alt={image?.alt || ''}
                width={720}
                hotspot={image?.hotspot}
                crop={image?.crop}
                mode="cover"
                loading={priority ? 'eager' : 'lazy'}
                className="w-full transition-transform duration-[800ms] ease-out will-change-transform motion-safe:group-hover/img:scale-105"
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            {copy}
            {imageRef && (
              <div
                className="enter group/img mt-12 w-full overflow-hidden rounded-xl"
                style={delay(300)}
              >
                <Image
                  id={imageRef}
                  alt={image?.alt || ''}
                  width={1024}
                  hotspot={image?.hotspot}
                  crop={image?.crop}
                  mode="cover"
                  loading={priority ? 'eager' : 'lazy'}
                  className="w-full transition-transform duration-[800ms] ease-out will-change-transform motion-safe:group-hover/img:scale-105"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
