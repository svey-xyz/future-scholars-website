import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentsIcon} from '@sanity/icons/Documents'

import {sortFields} from './shared'

/**
 * Posts Archive — renders a grid of posts. Source modes:
 *  - `latest`  newest N (limit), optionally filtered by category
 *  - `all`     every post, optionally filtered by category
 *  - `picked`  an explicit, ordered list of posts
 * Content is resolved in `getPageQuery` (the page builder renders client-side
 * for Visual Editing, so blocks can't fetch on their own).
 */
export const postsArchive = defineType({
  name: 'postsArchive',
  title: 'Posts Archive',
  type: 'object',
  icon: DocumentsIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'subheading', title: 'Subheading', type: 'string'}),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      initialValue: 'latest',
      options: {
        list: [
          {title: 'Latest posts', value: 'latest'},
          {title: 'All posts', value: 'all'},
          {title: 'Hand-picked', value: 'picked'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'limit',
      title: 'Number of posts',
      type: 'number',
      initialValue: 6,
      validation: (Rule) => Rule.min(1).max(24).integer(),
      hidden: ({parent}) => parent?.source !== 'latest',
    }),
    defineField({
      name: 'category',
      title: 'Filter by category',
      type: 'reference',
      to: [{type: 'category'}],
      description: 'Optional. Only applies to Latest / All.',
      hidden: ({parent}) => parent?.source === 'picked',
    }),
    defineField({
      name: 'posts',
      title: 'Posts',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'post'}]})],
      hidden: ({parent}) => parent?.source !== 'picked',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {source?: string}
          if (parent?.source === 'picked' && (!value || value.length === 0)) {
            return 'Pick at least one post'
          }
          return true
        }),
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
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    ...sortFields({
      fields: [
        {title: 'Published date', value: 'date'},
        {title: 'Title', value: 'title'},
      ],
      initialField: 'date',
    }),
  ],
  preview: {
    select: {heading: 'heading', source: 'source'},
    prepare({heading, source}) {
      return {title: heading || 'Posts Archive', subtitle: `Posts Archive · ${source || 'latest'}`}
    },
  },
})
