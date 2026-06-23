import GalleryTile from './GalleryTile'
import Reveal from '@/app/components/motion/Reveal'
import {cn} from '@/lib/utils'
import type {GalleryAspect, GalleryItem} from '@/sanity/lib/types'
import {masonryColClass} from './utils'

type Props = {
  items: GalleryItem[]
  columns: number
  aspect: GalleryAspect
  enableLightbox: boolean
}

const SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

/**
 * Masonry layout — zero-JS, zero-dep CSS multi-column. Looks best with the
 * `auto` aspect (tiles keep their intrinsic ratio).
 *
 * ⚠️ Reading-order caveat: CSS columns flow **top-to-bottom, then across**, so
 * the visual order differs from DOM/source order. DOM order (which is what
 * screen readers and keyboard tab follow) stays correct. If strict
 * left-to-right visual order is required, use the grid layout instead.
 */
export default function GalleryMasonry({items, columns, aspect, enableLightbox}: Props) {
  return (
    <div className={cn('columns-1 [column-gap:1rem]', masonryColClass[columns])}>
      {items.map((item, i) => (
        <Reveal key={item._key} i={i} variant="scale" className="mb-4 break-inside-avoid">
          <GalleryTile
            item={item}
            index={i}
            galleryAspect={aspect}
            enableLightbox={enableLightbox}
            sizes={SIZES}
          />
        </Reveal>
      ))}
    </div>
  )
}
