'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import {ChevronLeftIcon, ChevronRightIcon, XMarkIcon} from '@heroicons/react/24/outline'

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import GalleryMedia from './GalleryMedia'
import GalleryVideo from './GalleryVideo'
import {useLightbox} from './LightboxProvider'
import {useSwipeToDismiss} from './useSwipeToDismiss'
import type {GalleryItem} from '@/sanity/lib/types'
import {itemCaption} from './utils'

type Props = {
  items: GalleryItem[]
  heading?: string
}

/**
 * Fullscreen lightbox — Radix `Dialog` (focus-trap, Esc, `aria-modal` for free)
 * wrapping an Embla carousel opened at the clicked index. Prev/next, close, an
 * `n / total` counter (announced) and a caption region. Images render contained;
 * videos render the click-to-load facade.
 *
 * Arrow keys are handled here, at the dialog, not left to the shadcn
 * `Carousel`: its own handler is an `onKeyDownCapture` on the carousel region,
 * which has no `tabIndex`, so it only ever fires while focus is already inside
 * the carousel — in practice only on the prev/next buttons. Radix moves focus
 * to the dialog content on open, so the very first Left/Right press did
 * nothing, while the sr-only description below told screen-reader users the
 * arrow keys browse the gallery. Making the announced contract true is the
 * point; `defaultPrevented` keeps the carousel's own handler from advancing
 * twice when focus *is* inside it.
 *
 * Mobile: the content fills the viewport, so Radix's overlay never receives a
 * tap — "outside" is handled here instead: a *tap* (pointer moved < 10px, so
 * never the tail of a swipe) on anything that isn't media, caption or a
 * control closes. Swiping down on the stage also dismisses
 * (`useSwipeToDismiss`). Prev/next move off the image into a bottom pill below
 * `sm`; the side arrows only render from `sm` up. Targets stay 44px (AAA 2.5.5).
 */
const KEEP_OPEN = 'img, video, iframe, button, a, figcaption, [data-lightbox-keep]'
const TAP_SLOP = 10
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

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // Already handled by the carousel's own capture handler, or a browser
      // shortcut the user meant (Alt+Left is Back).
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
      if (!api) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        api.scrollPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        api.scrollNext()
      }
    },
    [api],
  )

  const tapStart = useRef<{x: number; y: number} | null>(null)
  const onPointerDown = useCallback((event: React.PointerEvent) => {
    tapStart.current = {x: event.clientX, y: event.clientY}
  }, [])
  const onBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      const start = tapStart.current
      tapStart.current = null
      // No pointerdown → keyboard-synthesised click; moved → end of a drag.
      if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP) return
      if ((event.target as Element).closest(KEEP_OPEN)) return
      close()
    },
    [close],
  )

  const overlayRef = useRef<HTMLDivElement>(null)
  const stageRef = useSwipeToDismiss(close, overlayRef)

  if (items.length === 0) return null
  const total = items.length

  const counter = `${current + 1} / ${total}`
  // Chrome fades out as the stage is pulled down (`--lb-drag`, set by the swipe hook).
  const chromeFade = 'opacity-[calc(1-var(--lb-drag,0))]'
  const pillButton = 'size-11 rounded-full text-foreground hover:bg-foreground/10 [&_svg]:size-5'

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent
        showCloseButton={false}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onClick={onBackdropClick}
        overlayRef={overlayRef}
        // Backdrop fades with the pull (`--lb-drag`, 0–1): overlay opacity, then the
        // content layer's paper tint + blur, revealing the page underneath.
        overlayClassName="opacity-[calc(1-var(--lb-drag,0))]"
        className="flex h-dvh w-screen max-w-none touch-manipulation flex-col gap-0 border-0 bg-[hsl(var(--background)/calc(0.3*(1-var(--lb-drag,0))))] p-0 backdrop-blur-[calc(16px*(1-var(--lb-drag,0)))] sm:rounded-none"
      >
        <DialogTitle className="sr-only">{heading || 'Gallery'}</DialogTitle>
        <DialogDescription className="sr-only">
          Use the previous and next buttons or the left and right arrow keys to browse. Press Escape
          to close.
        </DialogDescription>
        {/* Single announced counter; the visible ones below are aria-hidden. */}
        <span aria-live="polite" className="sr-only">
          {counter}
        </span>

        <div
          className={`flex items-center justify-between px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] ${chromeFade}`}
        >
          {total > 1 && (
            // Desktop only — below `sm` the counter lives in the bottom pill.
            <span
              aria-hidden="true"
              className="hidden rounded-full bg-background/85 px-3 py-1 text-sm tabular-nums text-foreground shadow-sm ring-1 ring-foreground/10 sm:inline-block"
            >
              {counter}
            </span>
          )}
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close gallery"
              className="ml-auto size-11 rounded-full bg-background/85 text-foreground shadow-sm ring-1 ring-foreground/10 hover:bg-background [&_svg]:size-6"
            >
              <XMarkIcon aria-hidden="true" />
            </Button>
          </DialogClose>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center px-3 sm:px-16 sm:pb-4">
          <Carousel
            setApi={setApi}
            opts={{startIndex: index, loop: total > 1, duration: 24}}
            className="w-full"
          >
            <div ref={stageRef} className="will-change-transform">
              <CarouselContent>
                {items.map((item, i) => (
                  <CarouselItem
                    key={item._key}
                    aria-label={`${i + 1} of ${total}`}
                    className="flex items-center justify-center"
                  >
                    <figure className="gallery-lightbox-media flex w-full flex-col items-center justify-center gap-3">
                      {item._type === 'galleryVideo' ? (
                        <div
                          data-lightbox-keep
                          className="relative aspect-video max-h-[70dvh] w-full max-w-4xl overflow-hidden rounded-lg bg-black sm:max-h-[78vh]"
                        >
                          <GalleryVideo item={item} isActive={i === current} sizes="90vw" />
                        </div>
                      ) : (
                        <GalleryMedia
                          item={item}
                          fill={false}
                          sizes="90vw"
                          loading={i === index ? 'eager' : 'lazy'}
                          className="max-h-[70dvh] rounded-lg sm:max-h-[85vh]"
                        />
                      )}
                      {itemCaption(item) && (
                        <figcaption
                          className={`max-w-2xl text-balance px-2 text-center text-sm text-foreground/80 ${chromeFade}`}
                        >
                          {itemCaption(item)}
                        </figcaption>
                      )}
                    </figure>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </div>

            {total > 1 && (
              <>
                <CarouselPrevious className="hidden size-11 sm:-left-12 sm:inline-flex" />
                <CarouselNext className="hidden size-11 sm:-right-12 sm:inline-flex" />
              </>
            )}
          </Carousel>
        </div>

        {/* Mobile controls: a compact pill below the image instead of arrows over it. */}
        {total > 1 && (
          <div
            data-lightbox-keep
            className={`flex justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:hidden ${chromeFade}`}
          >
            <div className="flex items-center gap-1 rounded-full bg-background/85 p-1 shadow-lg ring-1 ring-foreground/10 backdrop-blur-md">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Previous image"
                onClick={() => api?.scrollPrev()}
                className={pillButton}
              >
                <ChevronLeftIcon aria-hidden="true" />
              </Button>
              <span
                aria-hidden="true"
                className="min-w-14 text-center text-sm tabular-nums text-foreground"
              >
                {counter}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Next image"
                onClick={() => api?.scrollNext()}
                className={pillButton}
              >
                <ChevronRightIcon aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
