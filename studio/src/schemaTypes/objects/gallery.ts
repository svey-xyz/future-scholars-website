import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImagesIcon} from '@sanity/icons/Images'

import {altField, columnsField, anchorField} from './shared'

/**
 * Gallery — layout-switchable media gallery (grid / masonry / carousel) of
 * image and video items, with an optional fullscreen lightbox.
 */
export const gallery = defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      validation: (Rule) => Rule.min(1),
      of: [
        defineArrayMember({
          type: 'image',
          name: 'galleryImage',
          title: 'Image',
          options: {hotspot: true, aiAssist: {imageDescriptionField: 'alt'}},
          fields: [altField, defineField({name: 'caption', title: 'Caption', type: 'string'})],
          preview: {
            select: {media: 'asset', title: 'caption', subtitle: 'alt'},
            prepare({media, title, subtitle}) {
              return {media, title: title || subtitle || 'Image'}
            },
          },
        }),
        defineArrayMember({type: 'galleryVideo'}),
      ],
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'grid',
      options: {
        list: [
          {title: 'Grid', value: 'grid'},
          {title: 'Masonry', value: 'masonry'},
          {title: 'Carousel', value: 'carousel'},
          {title: 'Collage', value: 'collage'},
        ],
        layout: 'radio',
      },
    }),
    // Collage composes its own scattered slots — columns/aspect don't apply.
    {...columnsField, hidden: ({parent}) => (parent as {layout?: string})?.layout === 'collage'},
    defineField({
      name: 'aspect',
      title: 'Image aspect ratio',
      type: 'string',
      initialValue: 'square',
      options: {
        list: [
          {title: 'Square (1:1)', value: 'square'},
          {title: 'Landscape (16:9)', value: 'video'},
          {title: 'Original', value: 'auto'},
        ],
        layout: 'radio',
      },
      // Collage always uses intrinsic ratios (`auto`).
      hidden: ({parent}) => (parent as {layout?: string})?.layout === 'collage',
    }),
    defineField({
      name: 'enableLightbox',
      title: 'Enable fullscreen lightbox',
      type: 'boolean',
      initialValue: true,
      description: 'Click any item to open it fullscreen. Available for grid and masonry.',
      // The carousel is already an expanded one-at-a-time view, so a lightbox is
      // redundant — hide the toggle there (the frontend also forces it off).
      hidden: ({parent}) => (parent as {layout?: string})?.layout === 'carousel',
    }),
    anchorField,
  ],
  preview: {
    select: {heading: 'heading', items: 'items'},
    prepare({heading, items}) {
      const arr = Array.isArray(items) ? items : []
      const n = arr.length
      const firstImage = arr.find(
        (it) => it?._type === 'galleryImage' && (it as {asset?: unknown}).asset,
      ) as {asset?: unknown} | undefined
      return {
        title: heading || 'Gallery',
        subtitle: `Gallery · ${n} item${n === 1 ? '' : 's'}`,
        media: firstImage?.asset as never,
      }
    },
  },
})
