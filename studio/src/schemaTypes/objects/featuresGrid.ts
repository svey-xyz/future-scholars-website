import {defineArrayMember, defineField, defineType} from 'sanity'
import {ThLargeIcon} from '@sanity/icons/ThLarge'

import {anchorField, columnsField} from './shared'

/**
 * Features Grid — icon / heading / text cards, optional per-feature link.
 * `icon` values map to Heroicons in frontend/app/components/blocks/FeaturesGrid.tsx.
 * Good for program highlights, the admissions steps and "why us" lists.
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
              description: 'Decorative only — the heading carries the meaning.',
              options: {
                list: [
                  {title: 'Graduation cap', value: 'academic'},
                  {title: 'Open book', value: 'book'},
                  {title: 'Puzzle piece (hands-on materials)', value: 'puzzle'},
                  {title: 'Paintbrush (art)', value: 'paint'},
                  {title: 'Musical note', value: 'music'},
                  {title: 'Globe (culture & geography)', value: 'globe'},
                  {title: 'Beaker (science)', value: 'science'},
                  {title: 'Calculator (mathematics)', value: 'math'},
                  {title: 'Light bulb (curiosity)', value: 'idea'},
                  {title: 'Sun (outdoor play)', value: 'outdoors'},
                  {title: 'Heart (care)', value: 'care'},
                  {title: 'Smile (wellbeing)', value: 'smile'},
                  {title: 'Raised hand (independence)', value: 'independence'},
                  {title: 'Group (families & community)', value: 'community'},
                  {title: 'House (home-like environment)', value: 'home'},
                  {title: 'Shield (safety)', value: 'safety'},
                  {title: 'Clock (hours)', value: 'schedule'},
                  {title: 'Calendar (visit / start date)', value: 'calendar'},
                  {title: 'Clipboard (application)', value: 'apply'},
                  {title: 'Document (forms)', value: 'document'},
                  {title: 'Speech bubbles (meet / talk)', value: 'talk'},
                  {title: 'Phone', value: 'phone'},
                  {title: 'Envelope (email)', value: 'email'},
                  {title: 'Map pin (location)', value: 'location'},
                  {title: 'Check', value: 'check'},
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
    anchorField,
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
