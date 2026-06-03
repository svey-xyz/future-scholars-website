import type {GalleryAspect, GalleryItem, GalleryVideoItem} from '@/sanity/lib/types'

/**
 * Shared, framework-agnostic gallery helpers. No React, no 'use client' — safe
 * to import from both Server and Client gallery components.
 */

/** Tailwind aspect-ratio utility per gallery `aspect` value. `auto` is sized inline. */
export const aspectClass: Record<GalleryAspect, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  auto: '',
}

/** Responsive column counts for the grid layout. */
export const gridColClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
}

/** Responsive CSS multi-column counts for the masonry layout. */
export const masonryColClass: Record<number, string> = {
  2: 'sm:columns-2',
  3: 'sm:columns-2 lg:columns-3',
  4: 'columns-2 lg:columns-4',
}

export type ResolvedAspect = {
  /** Effective aspect token after per-video override. */
  aspect: GalleryAspect
  /** True for square/video (fixed box); false for `auto` (intrinsic sizing). */
  fixed: boolean
  /** CSS `aspect-ratio` value for the tile box (kills CLS). Null when unknown. */
  ratio: number | null
}

/**
 * Resolve the box sizing for an item. Videos may override the gallery aspect;
 * `auto` falls back to the asset's intrinsic ratio (from `asset->metadata`).
 */
export function resolveAspect(item: GalleryItem, galleryAspect: GalleryAspect): ResolvedAspect {
  const override = item._type === 'galleryVideo' ? item.aspect : undefined
  const aspect: GalleryAspect = override ?? galleryAspect
  const fixed = aspect !== 'auto'
  if (fixed) {
    return {aspect, fixed, ratio: aspect === 'video' ? 16 / 9 : 1}
  }
  const intrinsic =
    item._type === 'galleryImage' ? item.aspectRatio : (item.poster?.aspectRatio ?? null)
  return {aspect, fixed, ratio: intrinsic ?? null}
}

/** Accessible label for a tile / lightbox trigger. */
export function itemLabel(item: GalleryItem, index: number): string {
  if (item._type === 'galleryVideo') return `Play video: ${item.title}`
  const text = item.alt || item.caption
  return text ? `View image: ${text}` : `View image ${index + 1}`
}

/** Caption shown under a tile (images + videos both expose `caption`). */
export function itemCaption(item: GalleryItem): string | undefined {
  return item.caption || undefined
}

export type VideoEmbed = {
  provider: 'youtube' | 'vimeo'
  id: string
  /** Privacy-friendly embed URL with autoplay (only mounted on user click). */
  embedUrl: string
  /** Provider thumbnail when statically derivable (YouTube only); else null. */
  thumbnailUrl: string | null
}

/**
 * Parse a YouTube/Vimeo URL into an embed descriptor. Returns null for
 * unrecognised URLs (schema validation should prevent this, but stay safe).
 */
export function getVideoEmbed(url: string | undefined): VideoEmbed | null {
  if (!url) return null

  const yt = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([\w-]{6,})/i,
  )
  if (yt) {
    const id = yt[1]
    return {
      provider: 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    }
  }

  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  if (vm) {
    const id = vm[1]
    return {
      provider: 'vimeo',
      id,
      embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1`,
      thumbnailUrl: null,
    }
  }

  return null
}

/** Poster `<img>` src for a video facade: Sanity poster handled separately; this is the provider fallback. */
export function videoFallbackThumb(item: GalleryVideoItem): string | null {
  return getVideoEmbed(item.url)?.thumbnailUrl ?? null
}
