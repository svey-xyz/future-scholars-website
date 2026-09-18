import {defineField, defineType} from 'sanity'
import {TextIcon} from '@sanity/icons/Text'

import {anchorField} from './shared'

export const infoSection = defineType({
  name: 'infoSection',
  title: 'Info Section',
  type: 'object',
  icon: TextIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
    }),
    anchorField,
  ],
  preview: {
    select: {
      title: 'heading',
      subtitle: 'subheading',
    },
    prepare({title}) {
      return {
        title: title || 'Untitled Info Section',
        subtitle: 'Info Section',
      }
    },
  },
})
