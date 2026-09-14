import {defineArrayMember, defineField, defineType} from 'sanity'
import {ThLargeIcon} from '@sanity/icons/ThLarge'

import {anchorField, columnsField} from './shared'

/**
 * Programs grid — cards for the FSMA programs, either all of them in age order
 * or a hand-picked selection (build plan S3).
 */
export const programsGrid = defineType({
  name: 'programsGrid',
  title: 'Programs Grid',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'subheading', title: 'Subheading', type: 'string'}),
    defineField({
      name: 'mode',
      title: 'Which programs',
      type: 'string',
      initialValue: 'all',
      options: {
        list: [
          {title: 'All, youngest first', value: 'all'},
          {title: 'Hand-picked', value: 'selected'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'programs',
      title: 'Programs',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'program'}]})],
      hidden: ({parent}) => parent?.mode !== 'selected',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const mode = (context.parent as {mode?: string} | undefined)?.mode
          if (mode === 'selected' && (!value || value.length === 0)) {
            return 'Pick at least one program, or switch to "All".'
          }
          return true
        }),
    }),
    columnsField,
    anchorField,
  ],
  preview: {
    select: {heading: 'heading', mode: 'mode'},
    prepare({heading, mode}) {
      return {
        title: heading || 'Programs Grid',
        subtitle: mode === 'selected' ? 'Programs · hand-picked' : 'Programs · all',
      }
    },
  },
})
