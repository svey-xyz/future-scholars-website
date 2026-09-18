import {defineArrayMember, defineField, defineType} from 'sanity'
import {UsersIcon} from '@sanity/icons/Users'

import {anchorField, columnsField} from './shared'

/**
 * Faculty grid (build plan S7) — `person` documents rendered as staff cards.
 *
 * `person` is the template's own document type, widened in S3 with `role`,
 * `credentials`, `bio` and `order`. Referencing it rather than re-typing names
 * into a block means the directors' bios exist once and can also feed the
 * JSON-LD in S11.
 */
export const facultyGrid = defineType({
  name: 'facultyGrid',
  title: 'Faculty Grid',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'subheading', title: 'Subheading', type: 'string'}),
    defineField({
      name: 'mode',
      title: 'Which people',
      type: 'string',
      initialValue: 'all',
      options: {
        list: [
          {title: 'Everyone, in order', value: 'all'},
          {title: 'Hand-picked', value: 'selected'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'people',
      title: 'People',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'person'}]})],
      hidden: ({parent}) => parent?.mode !== 'selected',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const mode = (context.parent as {mode?: string} | undefined)?.mode
          if (mode === 'selected' && (!value || value.length === 0)) {
            return 'Pick at least one person, or switch to "Everyone".'
          }
          return true
        }),
    }),
    defineField({
      name: 'showBio',
      title: 'Show biographies',
      type: 'boolean',
      initialValue: true,
      description: 'Off shows name, role and credentials only — useful for a large staff list.',
    }),
    columnsField,
    anchorField,
  ],
  preview: {
    select: {heading: 'heading', mode: 'mode'},
    prepare({heading, mode}) {
      return {
        title: heading || 'Faculty Grid',
        subtitle: mode === 'selected' ? 'Faculty · hand-picked' : 'Faculty · everyone',
      }
    },
  },
})
