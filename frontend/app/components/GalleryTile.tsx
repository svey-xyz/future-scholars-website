import GalleryMedia from '@/app/components/GalleryMedia'
import GalleryVideo from '@/app/components/GalleryVideo'
import {LightboxTrigger} from '@/app/components/LightboxProvider'
import {cn} from '@/lib/utils'
import type {GalleryAspect, GalleryItem} from '@/sanity/lib/types'
import {itemCaption, itemLabel, resolveAspect} from '@/app/components/gallery-utils'

type Props = {
  item: GalleryItem
  index: number
  galleryAspect: GalleryAspect
  enableLightbox: boolean
  sizes?: string
}

/**
 * One gallery cell — image or video — shared by grid, masonry and carousel
 * (universal: no 'use client'). The aspect box always carries a defined ratio
 * (utility class or inline `aspect-ratio` from asset metadata) so nothing
 * shifts as media loads.
 *
 * Click behaviour:
 *  - lightbox on  → media + scrim, with a transparent labelled overlay button
 *    (`LightboxTrigger`) on top. Videos show a static poster here; they play
 *    inside the lightbox (avoids an invalid button-in-button).
 *  - lightbox off → images are static; videos use the inline `GalleryVideo`
 *    facade so they stay playable in place.
 */
export default function GalleryTile({item, index, galleryAspect, enableLightbox, sizes}: Props) {
  const {aspect, fixed, ratio} = resolveAspect(item, galleryAspect)
  const caption = itemCaption(item)
  const isVideo = item._type === 'galleryVideo'

  const boxClass = fixed
    ? aspect === 'video'
      ? 'aspect-video'
      : 'aspect-square'
    : ratio
      ? ''
      : 'aspect-square'
  const boxStyle = !fixed && ratio ? {aspectRatio: String(ratio)} : undefined

  return (
    <figure className="group/gal">
      <div
        className={cn('relative overflow-hidden rounded-lg bg-muted', boxClass)}
        style={boxStyle}
      >
        {enableLightbox ? (
          <>
            <GalleryMedia item={item} sizes={sizes} />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/gal:opacity-100"
            />
            <LightboxTrigger index={index} label={itemLabel(item, index)} />
          </>
        ) : isVideo ? (
          <GalleryVideo item={item} sizes={sizes} />
        ) : (
          <>
            <GalleryMedia item={item} sizes={sizes} />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/gal:opacity-100"
            />
          </>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground transition-colors duration-300 group-hover/gal:text-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
