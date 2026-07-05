import {defineArrayMember, defineField, defineType} from 'sanity'
import {ThLargeIcon} from '@sanity/icons/ThLarge'

import {columnsField} from './shared'

/**
 * Features Grid — icon / heading / text cards, optional per-feature link.
 * `icon` values map to Heroicons in frontend/app/components/FeaturesGrid.tsx.
 */
export const featuresGrid = defineType({
  name: 'featuresGrid',
  title: 'Features Grid',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'subheading', title: 'Subheading', type: 'string'}),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      validation: (Rule) => Rule.min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'feature',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {
                list: [
                  {title: 'Sparkles', value: 'sparkles'},
                  {title: 'Bolt', value: 'bolt'},
                  {title: 'Shield', value: 'shield'},
                  {title: 'Rocket', value: 'rocket'},
                  {title: 'Chip', value: 'chip'},
                  {title: 'Cloud', value: 'cloud'},
                  {title: 'Code', value: 'code'},
                  {title: 'Chart', value: 'chart'},
                  {title: 'Cursor', value: 'cursor'},
                  {title: 'Globe', value: 'globe'},
                  {title: 'Lock', value: 'lock'},
                  {title: 'Heart', value: 'heart'},
                  {title: 'Star', value: 'star'},
                  {title: 'Check', value: 'check'},
                  {title: 'Beaker', value: 'beaker'},
                ],
              },
            }),
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'text', title: 'Text', type: 'text', rows: 3}),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'link',
              options: {collapsible: true, collapsed: true},
            }),
          ],
          preview: {
            select: {title: 'heading', subtitle: 'icon'},
            prepare({title, subtitle}) {
              return {title: title || 'Feature', subtitle: subtitle || undefined}
            },
          },
        }),
      ],
    }),
    columnsField,
  ],
  preview: {
    select: {heading: 'heading', count: 'features'},
    prepare({heading, count}) {
      const n = Array.isArray(count) ? count.length : 0
      return {
        title: heading || 'Features Grid',
        subtitle: `Features Grid · ${n} item${n === 1 ? '' : 's'}`,
      }
    },
  },
})
