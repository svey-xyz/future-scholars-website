import {stegaClean} from '@sanity/client/stega'

import {Link} from '@/sanity.types'
import {dataset, projectId, studioUrl} from '@/sanity/lib/api'
import {
  createDataAttribute,
  CreateDataAttributeProps,
  toPlainText,
  type PortableTextBlock,
} from 'next-sanity'
import {createImageUrlBuilder, type SanityImageSource} from '@sanity/image-url'
import {DereferencedLink} from '@/sanity/lib/types'

const builder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

// Create an image URL builder using the client
// Export a function that can be used to get image URLs
function urlForImage(source: SanityImageSource) {
  return builder.image(source)
}

export function resolveOpenGraphImage(
  image?: SanityImageSource | null,
  width = 1200,
  height = 627,
) {
  if (!image) return
  const url = urlForImage(image)?.width(1200).height(627).fit('crop').url()
  if (!url) return
  return {url, alt: (image as {alt?: string})?.alt || '', width, height}
}

/**
 * Route for a linkable document. The single frontend source of truth for
 * document → URL; mirror changes in Studio's `resolveHref` (sanity.config.ts)
 * and `linkableTypes` (studio objects/link.ts).
 */
export function documentHref(type: string | null | undefined, slug: string): string | null {
  const cleanSlug = stegaClean(slug)
  // Unset type = legacy projection that only dereferenced `page` documents.
  switch (stegaClean(type) ?? 'page') {
    case 'page':
      return `/${cleanSlug}`
    case 'program':
      return `/programs/${cleanSlug}`
    default:
      return null
  }
}

// Resolve a link to its href: an internal page path or the raw URL. Otherwise null.
export function linkResolver(link: Link | DereferencedLink | undefined) {
  if (!link) return null

  // `stegaClean`: in draft mode enum values carry stega characters — a raw
  // switch would fall through to `default` and null every nav link.
  // If linkType is not set but href is, treat it as "href". This comes into
  // play when pasting links into the portable text editor because a link type
  // is not assumed.
  const linkType = stegaClean(link.linkType) ?? (link.href ? 'href' : undefined)

  switch (linkType) {
    case 'href':
      return link.href || null
    case 'page':
      if (link?.page && typeof link.page === 'string') {
        const path = documentHref('pageType' in link ? link.pageType : 'page', link.page)
        // Optional deep link to a block's `anchor` (rendered as its wrapper id).
        const anchor = 'anchor' in link ? stegaClean(link.anchor)?.trim() : undefined
        return path && anchor ? `${path}#${anchor}` : path
      }
      return null
    default:
      return null
  }
}

/**
 * Drop leading empty text blocks from a Portable Text array so the first
 * rendered line is always content. Empty `block`s otherwise render as
 * `min-h-[1em]` paragraphs (see `CustomPortableText`) and push the copy out
 * of line with adjacent content. Non-`block` types (images, embeds) are
 * never treated as empty. `stegaClean` first — in draft mode spans carry
 * invisible stega characters that `trim()` won't remove.
 */
export function trimLeadingEmptyBlocks<T extends {_type: string}>(
  blocks: T[] | null | undefined,
): T[] {
  if (!blocks?.length) return []
  const isEmptyTextBlock = (block: T) =>
    block._type === 'block' &&
    stegaClean(toPlainText([block as unknown as PortableTextBlock])).trim() === ''
  const start = blocks.findIndex((block) => !isEmptyTextBlock(block))
  return start === -1 ? [] : start === 0 ? blocks : blocks.slice(start)
}

type DataAttributeConfig = CreateDataAttributeProps &
  Required<Pick<CreateDataAttributeProps, 'id' | 'type' | 'path'>>

export function dataAttr(config: DataAttributeConfig) {
  return createDataAttribute({
    projectId,
    dataset,
    baseUrl: studioUrl,
  }).combine(config)
}
