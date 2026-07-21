import type {CSSProperties} from 'react'

import GalleryTile from './GalleryTile'
import Reveal from '@/app/components/motion/Reveal'
import {cn} from '@/lib/utils'
import type {GalleryItem} from '@/sanity/lib/types'

/**
 * Drift collage layout (issue #18, ported from murphy-website) — a full-width
 * scattered composition. Fully RSC: placement is a deterministic 10-slot
 * pattern of grid spans / flow offsets / rotations / parallax speeds keyed off
 * the item index, so the same content always renders the same collage (no
 * randomness, no hydration drift).
 *
 * Motion model (all progressive enhancement; see the "Gallery drift collage"
 * block in globals.css):
 *  - `.parallax-drift` + per-cell `--drift` → cells ride the scroll at
 *    different speeds/directions (CSS scroll-driven; no-op without support).
 *  - `.gal-collage-tile` → rests at `--rot`, straightens + lifts on
 *    hover/keyboard focus (motion-gated).
 *  - `Reveal` handles entry, same two-path system as every other block.
 * Reduced-motion / unsupported engines get the static scattered collage.
 *
 * Tiles keep intrinsic aspect ratios (`galleryAspect="auto"`, ratio inlined
 * from asset metadata → no CLS) and reuse `GalleryTile` untouched, so lightbox
 * triggers, focus rings and accessible labels match the other layouts.
 */

type Slot = {
  /** Grid placement + flow offsets (mobile 6-col, md+ 12-col). */
  className: string
  /** Rest rotation in degrees. */
  rot: number
  /** Parallax ride in px — positive rises against scroll, negative sinks. */
  drift: number
  /** Base stacking order where cells overlap. */
  z: number
  /** `next/image` sizes hint matched to the slot's span. */
  sizes: string
}

const SIZES_SM = '(min-width: 768px) 25vw, 40vw'
const SIZES_MD = '(min-width: 768px) 38vw, 66vw'
const SIZES_LG = '(min-width: 768px) 50vw, 90vw'

const SLOTS: Slot[] = [
  {className: 'col-span-4 md:col-span-5 md:col-start-1', rot: -2.2, drift: 18, z: 10, sizes: SIZES_MD},
  {className: 'col-span-2 col-start-5 mt-12 md:col-span-3 md:col-start-8 md:mt-28', rot: 1.8, drift: 52, z: 20, sizes: SIZES_SM},
  {className: 'col-span-4 col-start-2 -mt-6 md:col-span-4 md:col-start-4 md:-mt-12', rot: 0.9, drift: -36, z: 30, sizes: SIZES_MD},
  {className: 'col-span-3 col-start-4 mt-10 md:col-span-3 md:col-start-10 md:mt-16', rot: -1.7, drift: 60, z: 10, sizes: SIZES_SM},
  {className: 'col-span-5 md:col-span-6 md:col-start-2 md:-mt-8', rot: 1.3, drift: 12, z: 20, sizes: SIZES_LG},
  {className: 'col-span-3 col-start-4 -mt-8 md:col-span-3 md:col-start-9 md:-mt-24', rot: -2.6, drift: 44, z: 30, sizes: SIZES_SM},
  {className: 'col-span-4 col-start-2 mt-6 md:col-span-4 md:col-start-2 md:mt-14', rot: 2.1, drift: 26, z: 10, sizes: SIZES_MD},
  {className: 'col-span-3 mt-4 md:col-span-3 md:col-start-7 md:-mt-10', rot: -1.1, drift: -48, z: 20, sizes: SIZES_SM},
  {className: 'col-span-4 col-start-3 md:col-span-5 md:col-start-8 md:mt-20', rot: 1.6, drift: 22, z: 30, sizes: SIZES_MD},
  {className: 'col-span-4 -mt-8 md:col-span-4 md:col-start-3 md:-mt-16', rot: -2, drift: -20, z: 10, sizes: SIZES_MD},
]

type Props = {
  items: GalleryItem[]
  enableLightbox: boolean
}

export default function GalleryCollage({items, enableLightbox}: Props) {
  return (
    // `isolate` scopes the cells' z-indexes to this grid so a hovered tile
    // never rises above the fixed header (z-40) in the root stacking context.
    <ul className="isolate mx-auto grid max-w-[100rem] grid-cols-6 gap-x-3 gap-y-8 px-4 sm:px-6 md:grid-cols-12 md:gap-x-6 md:gap-y-12 lg:px-10">
      {items.map((item, i) => {
        const slot = SLOTS[i % SLOTS.length]
        return (
          <li
            key={item._key}
            className={cn('gal-collage-cell parallax-drift', slot.className)}
            // Base stacking via --z (not inline z-index, which would beat the
            // CSS hover/focus-within z-bump in globals.css).
            style={{'--drift': `${slot.drift}px`, '--z': slot.z} as CSSProperties}
          >
            <div className="gal-collage-tile" style={{'--rot': `${slot.rot}deg`} as CSSProperties}>
              <Reveal variant="scale" i={i % 4}>
                <GalleryTile
                  item={item}
                  index={i}
                  galleryAspect="auto"
                  enableLightbox={enableLightbox}
                  sizes={slot.sizes}
                />
              </Reveal>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
