import {defineArrayMember, defineField, defineType} from 'sanity'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'

import {altField} from './shared'

/**
 * Testimonials — quote cards with author name, role and optional avatar.
 */
export const testimonials = defineType({
  name: 'testimonials',
  title: 'Testimonials',
  type: 'object',
  icon: BlockquoteIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'subheading', title: 'Subheading', type: 'string'}),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      validation: (Rule) => Rule.min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'testimonial',
          fields: [
            defineField({
              name: 'quote',
              title: 'Quote',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'authorName',
              title: 'Author name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'authorRole', title: 'Author role / company', type: 'string'}),
            defineField({
              name: 'sourceUrl',
              title: 'Source link',
              type: 'url',
              description: 'Optional link to the original article or review',
              validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
            }),
            defineField({
              name: 'authorImage',
              title: 'Author image',
              type: 'image',
              options: {hotspot: true, aiAssist: {imageDescriptionField: 'alt'}},
              fields: [altField],
            }),
          ],
          preview: {
            select: {title: 'authorName', subtitle: 'authorRole', media: 'authorImage.asset'},
            prepare({title, subtitle, media}) {
              return {title: title || 'Testimonial', subtitle, media}
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'number',
      initialValue: 3,
      options: {
        list: [
          {title: 'One', value: 1},
          {title: 'Two', value: 2},
          {title: 'Three', value: 3},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
  ],
  preview: {
    select: {heading: 'heading', count: 'testimonials'},
    prepare({heading, count}) {
      const n = Array.isArray(count) ? count.length : 0
      return {
        title: heading || 'Testimonials',
        subtitle: `Testimonials · ${n} item${n === 1 ? '' : 's'}`,
      }
    },
  },
})
