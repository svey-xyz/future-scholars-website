import {defineArrayMember, defineField, defineType} from 'sanity'
import {NumberIcon} from '@sanity/icons/Number'

import {anchorField} from './shared'

/**
 * Key facts — a row of short figures with labels, e.g. the classroom ratios
 * (1:3 / 1:5 / 1:8), the age range, or the year the school opened. Rendered as
 * a description list, so each figure is announced with its label.
 *
 * Only publish figures the school has confirmed (build plan §0 rule 6).
 */
export const stats = defineType({
  name: 'stats',
  title: 'Key facts',
  type: 'object',
  icon: NumberIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'subheading', title: 'Subheading', type: 'string'}),
    defineField({
      name: 'items',
      title: 'Facts',
      type: 'array',
      validation: (Rule) => Rule.min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stat',
          title: 'Fact',
          fields: [
            defineField({
              name: 'value',
              title: 'Figure',
              type: 'string',
              description: 'Short, e.g. "1:3", "6 months – 6 years" or "2013".',
              validation: (Rule) => [
                Rule.required(),
                Rule.max(20).warning('Keep the figure short — it is set very large.'),
              ],
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'What the figure is, e.g. "Teacher-to-child ratio, Infants".',
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'description', title: 'Description', type: 'string'}),
          ],
          preview: {
            select: {title: 'value', subtitle: 'label'},
            prepare({title, subtitle}) {
              return {title: title || 'Fact', subtitle}
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
          {title: 'Two', value: 2},
          {title: 'Three', value: 3},
          {title: 'Four', value: 4},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    anchorField,
  ],
  preview: {
    select: {heading: 'heading', count: 'items'},
    prepare({heading, count}) {
      const n = Array.isArray(count) ? count.length : 0
      return {title: heading || 'Key facts', subtitle: `Key facts · ${n} item${n === 1 ? '' : 's'}`}
    },
  },
})
