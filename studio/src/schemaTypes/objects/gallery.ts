import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImagesIcon} from '@sanity/icons'

import {altField, columnsField} from './shared'

/**
 * Gallery — responsive image grid with optional per-image captions.
 */
export const gallery = defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      validation: (Rule) => Rule.min(1),
      of: [
        defineArrayMember({
          type: 'image',
          name: 'galleryImage',
          options: {hotspot: true, aiAssist: {imageDescriptionField: 'alt'}},
          fields: [
            altField,
            defineField({name: 'caption', title: 'Caption', type: 'string'}),
          ],
          preview: {
            select: {media: 'asset', title: 'caption', subtitle: 'alt'},
            prepare({media, title, subtitle}) {
              return {media, title: title || subtitle || 'Image'}
            },
          },
        }),
      ],
    }),
    columnsField,
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
    }),
  ],
  preview: {
    select: {heading: 'heading', media: 'images.0.asset', count: 'images'},
    prepare({heading, media, count}) {
      const n = Array.isArray(count) ? count.length : 0
      return {title: heading || 'Gallery', subtitle: `Gallery · ${n} image${n === 1 ? '' : 's'}`, media}
    },
  },
})
