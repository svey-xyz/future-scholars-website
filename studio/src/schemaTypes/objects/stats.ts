import {defineArrayMember, defineField, defineType} from 'sanity'
import {TrendUpwardIcon} from '@sanity/icons/TrendUpward'

/**
 * Stats — row of big-number metrics with labels and optional descriptions.
 */
export const stats = defineType({
  name: 'stats',
  title: 'Stats',
  type: 'object',
  icon: TrendUpwardIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'subheading', title: 'Subheading', type: 'string'}),
    defineField({
      name: 'items',
      title: 'Stats',
      type: 'array',
      validation: (Rule) => Rule.min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stat',
          fields: [
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              description: 'e.g. "10k+", "99.9%", "$2.4M"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'description', title: 'Description', type: 'string'}),
          ],
          preview: {
            select: {title: 'value', subtitle: 'label'},
            prepare({title, subtitle}) {
              return {title: title || 'Stat', subtitle}
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'number',
      initialValue: 4,
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
  ],
  preview: {
    select: {heading: 'heading', count: 'items'},
    prepare({heading, count}) {
      const n = Array.isArray(count) ? count.length : 0
      return {title: heading || 'Stats', subtitle: `Stats · ${n} metric${n === 1 ? '' : 's'}`}
    },
  },
})
