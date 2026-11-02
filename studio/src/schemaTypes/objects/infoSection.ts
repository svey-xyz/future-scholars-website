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
    // FB11: an embedded map beside the copy. It reads the address from
    // Settings → Contact, so the address is never stored twice (D16).
    defineField({
      name: 'aside',
      title: 'Beside the text',
      type: 'string',
      initialValue: 'none',
      description:
        'Map shows the school address from Settings → Contact on a map next to the text (below it on phones).',
      options: {
        list: [
          {title: 'Nothing', value: 'none'},
          {title: 'Map', value: 'map'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    anchorField,
  ],
  preview: {
    select: {
      title: 'heading',
      subtitle: 'subheading',
      aside: 'aside',
    },
    prepare({title, aside}) {
      return {
        title: title || 'Untitled Info Section',
        subtitle: aside === 'map' ? 'Info Section · with map' : 'Info Section',
      }
    },
  },
})
