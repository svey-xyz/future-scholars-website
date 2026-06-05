import {defineArrayMember, defineField, defineType} from 'sanity'
import {Progress75Icon} from '@sanity/icons'

import {backgroundField} from './shared'

/**
 * Scores — Lighthouse-style radial-progress metrics. Each item renders a circular
 * arc that animates 0→`value` with a center number that counts up, driven by
 * `frontend/app/components/Scores.tsx`. Distinct from the `stats` block (plain
 * big-number row): Scores is the animated radial count-up variant.
 *
 * `value` / `max` define the arc fill (`value / (max ?? 100)`). Keep `max`
 * unset for percentage-style 0–100 scores; set it for "37 / 50" style ratios.
 */
export const scores = defineType({
  name: 'scores',
  title: 'Scores',
  type: 'object',
  icon: Progress75Icon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'blockContentTextOnly',
      description: 'Optional supporting copy shown under the heading.',
    }),
    defineField({
      name: 'items',
      title: 'Scores',
      type: 'array',
      validation: (Rule) => Rule.min(1).error('Add at least one score.'),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'score',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'value',
              title: 'Value',
              type: 'number',
              description: 'The score to display. 0–100 unless a Max is set.',
              validation: (Rule) => Rule.required().min(0).max(100),
            }),
            defineField({
              name: 'max',
              title: 'Max',
              type: 'number',
              description: 'Optional denominator for the arc. Defaults to 100.',
              validation: (Rule) => Rule.min(1),
            }),
          ],
          preview: {
            select: {label: 'label', value: 'value', max: 'max'},
            prepare({label, value, max}) {
              const denom = typeof max === 'number' ? ` / ${max}` : ''
              const score = typeof value === 'number' ? `${value}${denom}` : 'No value'
              return {title: label || 'Score', subtitle: score}
            },
          },
        }),
      ],
    }),
    backgroundField,
  ],
  preview: {
    select: {heading: 'heading', count: 'items'},
    prepare({heading, count}) {
      const n = Array.isArray(count) ? count.length : 0
      return {title: heading || 'Scores', subtitle: `Scores · ${n} metric${n === 1 ? '' : 's'}`}
    },
  },
})
