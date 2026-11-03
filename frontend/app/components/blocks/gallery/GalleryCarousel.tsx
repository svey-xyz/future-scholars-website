'use client'

import {useEffect, useState} from 'react'

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import GalleryTile from './GalleryTile'
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
 * arrows, dots, and roving keyboard nav (handled by the primitive).
 *
 * No autoplay: auto-advancing content needs a visible pause control to satisfy
 * WCAG 2.2.2, and the carousel is already fully operable by arrows / dots /
 * swipe / keyboard. (Autoplay was scoped as optional — see docs/A11Y.md.)
 */
/* Prev/next. With a block room (FB5) they take the room's deep tone on a tint
   hover — ≥ 7:1 for any pick (lib/room.ts); unset, the shadcn outline look. */
const NAV =
  'size-11 cursor-pointer room:border-room/40 room:text-room-strong room:hover:bg-room-tint room:hover:text-room-strong room:focus-visible:ring-room-strong'
const NAV_RIGHT = 'right-2 sm:-right-16'

export default function GalleryCarousel({items, aspect, enableLightbox}: Props) {
  const [api, setApi] = useState<CarouselApi>()
  const [selected, setSelected] = useState(0)
  const [count, setCount] = useState(0)

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

  return (
    <Carousel
      setApi={setApi}
      opts={{loop: multiple, align: 'center', duration: 22}}
      className="mx-auto w-full max-w-4xl"
    >
      <CarouselContent>
        {items.map((item, i) => (
          <CarouselItem
            key={item._key}
            aria-label={`Slide ${i + 1} of ${items.length}`}
            className="flex flex-col items-center justify-center"
          >
            <GalleryTile
              item={item}
              index={i}
              galleryAspect={aspect}
              enableLightbox={enableLightbox}
              contained
              isActive={i === selected}
              sizes={SIZES}
              animate={false}
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      {multiple && (
        <>
          <CarouselPrevious className={cn('left-2 sm:-left-16', NAV)} />
          <CarouselNext className={cn(NAV_RIGHT, NAV)} />
          <div className="mt-4 flex justify-center gap-1">
            {Array.from({length: count}).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === selected}
                onClick={() => api?.scrollTo(i)}
                className="grid size-6 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring room:focus-visible:ring-room-strong cursor-pointer"
              >
                <span
                  className={cn(
                    'size-2 rounded-full transition-colors',
                    i === selected
                      ? 'bg-foreground room:bg-room-strong'
                      : 'bg-foreground/40 hover:bg-foreground/60 room:bg-room-strong/40 room:hover:bg-room-strong/60',
                  )}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </Carousel>
  )
}
