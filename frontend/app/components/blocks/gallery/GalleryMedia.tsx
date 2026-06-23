import {PlayCircleIcon} from '@heroicons/react/24/solid'

import Image from '@/app/components/common/SanityImage'
import {cn} from '@/lib/utils'
import type {GalleryItem} from '@/sanity/lib/types'
import {videoFallbackThumb} from './utils'

type Props = {
  item: GalleryItem
  /** Cover-fill the (sized) parent box — true for tiles, false for the contained lightbox image. */
  fill?: boolean
	animate?: boolean
  sizes?: string
  loading?: 'lazy' | 'eager'
  className?: string
}

/**
 * Shared media renderer — dispatches image vs. video *poster*. Universal (no
 * 'use client'): rendered server-side in grid/masonry and client-side in the
 * carousel. The interactive video facade is `GalleryVideo`; here a video shows
 * a static poster + play badge (used inside lightbox triggers, where a nested
 * button would be invalid).
 *
 * The hover-scale is scoped to `group/gal`, so it only animates on tiles, never
 * in the lightbox.
 */
export default function GalleryMedia({item, fill = true, animate = true, sizes, loading = 'lazy', className}: Props) {
  const scale = 'transition-transform duration-[900ms] ease-out will-change-transform motion-safe:group-hover/gal:scale-105'

  if (item._type === 'galleryImage') {
    if (!item.asset?._ref) return null
    return (
      <Image
        id={item.asset._ref}
        alt={item.alt || ''}
        width={fill ? 1200 : 2000}
        hotspot={item.hotspot}
        crop={item.crop}
        mode={fill ? 'cover' : 'contain'}
        sizes={sizes}
        loading={loading}
        className={cn(
          fill
            ? 'absolute inset-0 h-full w-full object-cover'
            : 'h-auto max-h-[85vh] w-auto max-w-full object-contain',
          animate ? scale : '',
          className,
        )}
      />
    )
  }

  // Video poster (static). Sanity poster → SanityImage; else provider thumbnail; else neutral fill.
  const thumb = videoFallbackThumb(item)
  return (
    <>
      {item.poster?.asset?._ref ? (
        <Image
          id={item.poster.asset._ref}
          alt={item.poster.alt || ''}
          width={1200}
          hotspot={item.poster.hotspot}
          crop={item.poster.crop}
          mode="cover"
          sizes={sizes}
          loading={loading}
          className={cn('absolute inset-0 h-full w-full object-cover', scale, className)}
        />
      ) : thumb ? (
        // eslint-disable-next-line @next/next/no-img-element -- provider thumbnail, not a Sanity asset
        <img
          src={thumb}
          alt=""
          loading={loading}
          className={cn('absolute inset-0 h-full w-full object-cover', scale, className)}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-muted" />
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid place-items-center text-white/90 drop-shadow-lg transition-transform duration-300 motion-safe:group-hover/gal:scale-110"
      >
        <PlayCircleIcon className="size-14" />
      </span>
    </>
  )
}
