import {defineField, defineType} from 'sanity'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'
import {anchorField} from './shared'

/**
 * Testimonials — renders `testimonial` documents, so the same quote can appear
 * on the homepage and on /testimonials without being retyped.
 */
export const testimonials = defineType({
  name: 'testimonials',
  title: 'Testimonials',
  type: 'object',
  icon: BlockquoteIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'subheading', title: 'Subheading', type: 'string'}),
    // Presentation only — both layouts read the same data.
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'cards',
      description:
        'Cards: pull quotes in a grid, full text behind \u201cRead more\u201d — for a few testimonials on a mixed page. Letters: every testimonial in full, one per row — for a dedicated testimonials page.',
      options: {
        list: [
          {title: 'Cards', value: 'cards'},
          {title: 'Letters (full page)', value: 'letters'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'featuredOnly',
      title: 'Featured only',
      type: 'boolean',
      initialValue: true,
      description: 'Limit to testimonials marked Featured.',
    }),
    defineField({
      name: 'limit',
      title: 'Maximum to show',
      type: 'number',
      initialValue: 3,
      validation: (Rule) => Rule.integer().positive().max(24),
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'number',
      initialValue: 3,
      hidden: ({parent}) => parent?.layout === 'letters',
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
    anchorField,
  ],
  preview: {
    select: {heading: 'heading', limit: 'limit', layout: 'layout', featuredOnly: 'featuredOnly'},
    prepare({heading, limit, layout, featuredOnly}) {
      const kind = layout === 'letters' ? 'Letters' : 'Cards'
      return {
        title: heading || 'Testimonials',
        subtitle: `${kind} · ${featuredOnly ? 'featured' : 'all'}${limit ? ` · up to ${limit}` : ''}`,
      }
    },
  },
})
