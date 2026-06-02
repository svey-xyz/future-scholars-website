import {defineArrayMember, defineField, defineType} from 'sanity'
import {UsersIcon} from '@sanity/icons'

import {columnsField} from './shared'

/**
 * Authors Archive — grid of people with avatar, name and published-post count.
 * Source: `all` (alphabetical, limited) or `picked` (explicit list).
 * Resolved in `getPageQuery`.
 */
export const authorsArchive = defineType({
  name: 'authorsArchive',
  title: 'Authors Archive',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'subheading', title: 'Subheading', type: 'string'}),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      initialValue: 'all',
      options: {
        list: [
          {title: 'All authors', value: 'all'},
          {title: 'Hand-picked', value: 'picked'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'limit',
      title: 'Number of authors',
      type: 'number',
      initialValue: 12,
      validation: (Rule) => Rule.min(1).max(48).integer(),
      hidden: ({parent}) => parent?.source === 'picked',
    }),
    defineField({
      name: 'authors',
      title: 'Authors',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'person'}]})],
      hidden: ({parent}) => parent?.source !== 'picked',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {source?: string}
          if (parent?.source === 'picked' && (!value || value.length === 0)) {
            return 'Pick at least one author'
          }
          return true
        }),
    }),
    columnsField,
  ],
  preview: {
    select: {heading: 'heading', source: 'source'},
    prepare({heading, source}) {
      return {title: heading || 'Authors Archive', subtitle: `Authors Archive · ${source || 'all'}`}
    },
  },
})
