'use client'

import {useEffect, useMemo, useState} from 'react'
import Autoplay from 'embla-carousel-autoplay'

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import GalleryTile from '@/app/components/GalleryTile'
import {cn} from '@/lib/utils'
import type {GalleryAspect, GalleryItem} from '@/sanity/lib/types'

type Props = {
  items: GalleryItem[]
  aspect: GalleryAspect
  enableLightbox: boolean
}

const SIZES = '(min-width: 1024px) 66vw, 100vw'

/**
 * Carousel layout — one slide at a time via the shadcn (Embla) Carousel, with
 * arrows, dots, and roving keyboard nav (handled by the primitive). Autoplay is
 * opt-in *and* gated by `prefers-reduced-motion`: it stays off for the SSR/first
 * render (no hydration mismatch) and only engages once motion is confirmed safe.
 */
export default function GalleryCarousel({items, aspect, enableLightbox}: Props) {
  const [api, setApi] = useState<CarouselApi>()
  const [selected, setSelected] = useState(0)
  const [count, setCount] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(true)

  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: 5000,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    [],
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!api) return
    const sync = () => {
      setCount(api.scrollSnapList().length)
      setSelected(api.selectedScrollSnap())
    }
    sync()
    api.on('select', sync)
    api.on('reInit', sync)
    return () => {
      api.off('select', sync)
      api.off('reInit', sync)
    }
  }, [api])

  const multiple = items.length > 1
  const plugins = reducedMotion || !multiple ? [] : [autoplay]

  return (
    <Carousel
      setApi={setApi}
      plugins={plugins}
      opts={{loop: multiple, align: 'center', duration: 22}}
      className="mx-auto w-full max-w-4xl"
    >
      <CarouselContent>
        {items.map((item, i) => (
          <CarouselItem key={item._key}>
            <GalleryTile
              item={item}
              index={i}
              galleryAspect={aspect}
              enableLightbox={enableLightbox}
              sizes={SIZES}
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      {multiple && (
        <>
          <CarouselPrevious className="left-2 size-9 sm:-left-12" />
          <CarouselNext className="right-2 size-9 sm:-right-12" />
          <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Choose slide">
            {Array.from({length: count}).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-label={`Go to slide ${i + 1}`}
                aria-selected={i === selected}
                onClick={() => api?.scrollTo(i)}
                className={cn(
                  'size-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  i === selected ? 'bg-foreground' : 'bg-foreground/30 hover:bg-foreground/50',
                )}
              />
            ))}
          </div>
        </>
      )}
    </Carousel>
  )
}
