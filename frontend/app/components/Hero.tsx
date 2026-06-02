import {stegaClean} from '@sanity/client/stega'

import ResolvedLink from '@/app/components/ResolvedLink'
import Image from '@/app/components/SanityImage'
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

export default function Hero({block, index}: Props) {
  const {eyebrow, heading, lede, buttons, image, layout, theme} = block
  const isDark = stegaClean(theme) === 'dark'
  const imageRef = image?.asset?._ref
  const isSplit = stegaClean(layout) === 'split' && Boolean(imageRef)
  const priority = index === 0

  const ctas =
    buttons && buttons.length > 0 ? (
      <div className={cn('mt-8 flex flex-wrap gap-3', !isSplit && 'justify-center')}>
        {buttons.map((button, i) =>
          button.buttonText && button.link ? (
            <Button
              key={button._key}
              asChild
              size="lg"
              variant={i === 0 ? 'default' : 'outline'}
              className="rounded-full"
            >
              <ResolvedLink link={button.link}>{button.buttonText}</ResolvedLink>
            </Button>
          ) : null,
        )}
      </div>
    ) : null

  const copy = (
    <div className={cn('flex flex-col', isSplit ? 'items-start text-left' : 'items-center text-center')}>
      {eyebrow && (
        <Badge variant="secondary" className="mb-4 font-mono uppercase tracking-tight">
          {eyebrow}
        </Badge>
      )}
      <h2 className="text-4xl font-semibold sm:text-5xl lg:text-6xl text-balance">{heading}</h2>
      {lede && (
        <p
          className={cn(
            'mt-5 text-lg leading-8 text-muted-foreground text-pretty',
            !isSplit && 'max-w-2xl',
          )}
        >
          {lede}
        </p>
      )}
      {ctas}
    </div>
  )

  return (
    <section className={cn('relative', isDark && 'dark bg-background text-foreground')}>
      <div className="container py-16 lg:py-24">
        {isSplit && imageRef ? (
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {copy}
            <Image
              id={imageRef}
              alt={image?.alt || ''}
              width={720}
              hotspot={image?.hotspot}
              crop={image?.crop}
              mode="cover"
              loading={priority ? 'eager' : 'lazy'}
              className="w-full rounded-xl"
            />
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            {copy}
            {imageRef && (
              <Image
                id={imageRef}
                alt={image?.alt || ''}
                width={1024}
                hotspot={image?.hotspot}
                crop={image?.crop}
                mode="cover"
                loading={priority ? 'eager' : 'lazy'}
                className="mt-12 w-full rounded-xl"
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
