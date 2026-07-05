import {defineArrayMember, defineField, defineType} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'

/**
 * FAQ — accessible question/answer list. Rendered with native <details>/<summary>
 * (zero client JS) in frontend/app/components/Faq.tsx.
 */
export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'subheading', title: 'Subheading', type: 'string'}),
    defineField({
      name: 'items',
      title: 'Questions',
      type: 'array',
      validation: (Rule) => Rule.min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'answer', title: 'Answer', type: 'blockContentTextOnly'}),
          ],
          preview: {
            select: {title: 'question'},
            prepare({title}) {
              return {title: title || 'Question'}
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {heading: 'heading', count: 'items'},
    prepare({heading, count}) {
      const n = Array.isArray(count) ? count.length : 0
      return {title: heading || 'FAQ', subtitle: `FAQ · ${n} question${n === 1 ? '' : 's'}`}
    },
  },
})
