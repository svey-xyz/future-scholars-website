import GalleryTile from './GalleryTile'
import Reveal from '@/app/components/motion/Reveal'
import {cn} from '@/lib/utils'
import type {GalleryAspect, GalleryItem} from '@/sanity/lib/types'
import {gridColClass} from './utils'

type Props = {
  items: GalleryItem[]
  columns: number
  aspect: GalleryAspect
  enableLightbox: boolean
}

const SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

/**
 * Grid layout — fully RSC. Equal-aspect tiles, `Reveal` stagger preserved.
 * Interactivity (lightbox trigger / video facade) lives in client islands
 * inside `GalleryTile`.
 */
export default function GalleryGrid({items, columns, aspect, enableLightbox}: Props) {
  return (
    <ul className={cn('grid grid-cols-1 gap-4', gridColClass[columns])}>
      {items.map((item, i) => (
        <Reveal as="li" key={item._key} i={i} variant="scale">
          <GalleryTile
            item={item}
            index={i}
            galleryAspect={aspect}
            enableLightbox={enableLightbox}
            sizes={SIZES}
          />
        </Reveal>
      ))}
    </ul>
  )
}
