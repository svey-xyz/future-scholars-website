import Image from 'next/image'

import {cn} from '@/lib/utils'

type BrandMarkProps = {
  /** `full` = the horizontal lockup (920×300); `mark` = cap + FSMA (300×272). */
  variant?: 'full' | 'mark'
  /** Reversed (white) artwork, for dark/photographic grounds. */
  reversed?: boolean
  /** Hide from the a11y tree when an ancestor (the home link) carries the name. */
  decorative?: boolean
  className?: string
  priority?: boolean
}

const ART = {
  full: {src: '/brand/logo-full.svg', reversed: '/brand/logo-reversed.svg', w: 920, h: 300},
  mark: {src: '/brand/logo-mark.svg', reversed: '/brand/logo-mark-reversed.svg', w: 300, h: 272},
} as const

/**
 * The FSMA logo as a static asset (S1, `frontend/public/brand/`). RSC — no
 * client JS, and the wordmark is already outlined in the SVG, so nothing here
 * depends on a font loading.
 *
 * `unoptimized`: these are vectors. Running them through the image optimizer
 * would rasterise them and cost a round trip for no benefit.
 */
export default function BrandMark({
  variant = 'full',
  reversed = false,
  decorative = false,
  className,
  priority = false,
}: BrandMarkProps) {
  const art = ART[variant]

  return (
    <Image
      src={reversed ? art.reversed : art.src}
      width={art.w}
      height={art.h}
      alt={decorative ? '' : 'Future Scholars Montessori Academy'}
      aria-hidden={decorative || undefined}
      unoptimized
      priority={priority}
      className={cn('h-auto w-full', className)}
    />
  )
}
