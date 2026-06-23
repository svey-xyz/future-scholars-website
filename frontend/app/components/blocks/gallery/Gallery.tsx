import {stegaClean} from '@sanity/client/stega'

import GalleryCarousel from './GalleryCarousel'
import GalleryGrid from './GalleryGrid'
import GalleryLightbox from './GalleryLightbox'
import GalleryMasonry from './GalleryMasonry'
import LightboxProvider from './LightboxProvider'
import Reveal from '@/app/components/motion/Reveal'
import {getVideoEmbed} from './utils'
import type {ExtractPageBuilderType, GalleryAspect, GalleryItem} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'gallery'>
  index: number
  pageId: string
  pageType: string
}

/** Drop items that can't render: images without an asset, videos without a parseable URL. */
function isRenderable(item: GalleryItem): boolean {
  if (item._type === 'galleryImage') return Boolean(item.asset?._ref)
  if (item._type === 'galleryVideo') return Boolean(getVideoEmbed(item.url))
  return false
}

/**
 * Gallery dispatcher (RSC). Normalises items, branches on `layout`
 * (grid / masonry / carousel), and wraps the layout + lightbox in
 * `LightboxProvider` when `enableLightbox`. Grid and masonry stay fully RSC;
 * only the carousel, video facade and lightbox are client islands.
 *
 * `layout`/`aspect` are stega-cleaned because they drive control flow; `heading`
 * keeps its stega markers so it stays click-to-edit in Presentation.
 */
export default function Gallery({block}: Props) {
  const {heading} = block
  const layout = stegaClean(block.layout) || 'grid'
  const aspect = (stegaClean(block.aspect) || 'square') as GalleryAspect
  const columns = block.columns ?? 3
  // The carousel already is the expanded one-at-a-time view, so the lightbox is
  // redundant there — force it off regardless of the (hidden) schema toggle.
  const enableLightbox = layout !== 'carousel' && (block.enableLightbox ?? true)
  const items = (block.items ?? []).filter(isRenderable)

  const headingEl = heading ? (
    <Reveal as="h2" className="mb-8 text-2xl md:text-3xl lg:text-4xl">
      {heading}
    </Reveal>
  ) : null

  if (items.length === 0) {
    return headingEl ? <section className="container my-12 lg:my-16">{headingEl}</section> : null
  }

  const layoutEl =
    layout === 'carousel' ? (
      <GalleryCarousel items={items} aspect={aspect} enableLightbox={enableLightbox} />
    ) : layout === 'masonry' ? (
      <GalleryMasonry items={items} columns={columns} aspect={aspect} enableLightbox={enableLightbox} />
    ) : (
      <GalleryGrid items={items} columns={columns} aspect={aspect} enableLightbox={enableLightbox} />
    )

  return (
    <section className="container my-12 lg:my-16">
      {enableLightbox ? (
        <LightboxProvider>
          {headingEl}
          {layoutEl}
          <GalleryLightbox items={items} heading={heading} />
        </LightboxProvider>
      ) : (
        <>
          {headingEl}
          {layoutEl}
        </>
      )}
    </section>
  )
}
