'use client'

import {useEffect, useState} from 'react'
import {XMarkIcon} from '@heroicons/react/24/outline'

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import GalleryMedia from '@/app/components/GalleryMedia'
import GalleryVideo from '@/app/components/GalleryVideo'
import {useLightbox} from '@/app/components/LightboxProvider'
import type {GalleryItem} from '@/sanity/lib/types'
import {itemCaption} from '@/app/components/gallery-utils'

type Props = {
  items: GalleryItem[]
  heading?: string
}

/**
 * Fullscreen lightbox — Radix `Dialog` (focus-trap, Esc, `aria-modal` for free)
 * wrapping an Embla carousel opened at the clicked index. Prev/next, close, an
 * `n / total` counter (announced) and a caption region. Images render contained;
 * videos render the click-to-load facade.
 */
export default function GalleryLightbox({items, heading}: Props) {
  const {open, index, close, setIndex} = useLightbox()
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(index)

  useEffect(() => {
    if (!api) return
    const sync = () => {
      const i = api.selectedScrollSnap()
      setCurrent(i)
      setIndex(i)
    }
    sync()
    api.on('select', sync)
    return () => {
      api.off('select', sync)
    }
  }, [api, setIndex])

  // Jump to the clicked slide whenever the lightbox (re)opens at a new index.
  useEffect(() => {
    if (open && api) api.scrollTo(index, true)
  }, [open, api, index])

  if (items.length === 0) return null
  const total = items.length

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent
        showCloseButton={false}
        className="flex h-dvh w-screen max-w-none flex-col gap-0 border-0 bg-background/30 p-0 backdrop-blur-lg sm:rounded-none"
      >
        <DialogTitle className="sr-only">{heading || 'Gallery'}</DialogTitle>
        <DialogDescription className="sr-only">
          Use the previous and next buttons or the left and right arrow keys to browse. Press Escape
          to close.
        </DialogDescription>

        <div className="flex items-center justify-between p-3">
          <span
            aria-live="polite"
            className="rounded-md bg-background/80 px-2 py-1 text-sm tabular-nums text-foreground"
          >
            {current + 1} / {total}
          </span>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close gallery" className="size-11 bg-background/20">
              <XMarkIcon />
            </Button>
          </DialogClose>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center px-3 pb-4 sm:px-16">
          <Carousel
            setApi={setApi}
            opts={{startIndex: index, loop: total > 1, duration: 24}}
            className="w-full"
          >
            <CarouselContent>
              {items.map((item, i) => (
                <CarouselItem
                  key={item._key}
                  aria-label={`${i + 1} of ${total}`}
                  className="flex items-center justify-center"
                >
                  <figure className="gallery-lightbox-media flex w-full flex-col items-center justify-center gap-3">
                    {item._type === 'galleryVideo' ? (
                      <div className="relative aspect-video max-h-[78vh] w-full max-w-4xl overflow-hidden rounded-lg bg-black">
                        <GalleryVideo item={item} isActive={i === current} sizes="90vw" />
                      </div>
                    ) : (
                      <GalleryMedia
                        item={item}
                        fill={false}
                        sizes="90vw"
                        loading={i === index ? 'eager' : 'lazy'}
                        className="rounded-lg"
                      />
                    )}
                    {itemCaption(item) && (
                      <figcaption className="max-w-2xl text-balance text-center text-sm text-muted-foreground">
                        {itemCaption(item)}
                      </figcaption>
                    )}
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>

            {total > 1 && (
              <>
                <CarouselPrevious className="left-1 size-11 sm:-left-12" />
                <CarouselNext className="right-1 size-11 sm:-right-12" />
              </>
            )}
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  )
}
