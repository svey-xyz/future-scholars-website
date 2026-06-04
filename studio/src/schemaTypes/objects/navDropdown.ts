import {defineArrayMember, defineField, defineType} from 'sanity'
import {ChevronDownIcon} from '@sanity/icons'

/**
 * A navigation dropdown: a labelled disclosure that groups several nav links.
 * The `title` is the disclosure trigger label, NOT a link itself.
 * Learn more: https://www.sanity.io/docs/studio/object-type
 */

export const navDropdown = defineType({
  name: 'navDropdown',
  title: 'Nav Dropdown',
  type: 'object',
  icon: ChevronDownIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Heading for this dropdown. This label is a disclosure trigger, NOT a link.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [defineArrayMember({type: 'navLink'})],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      links: 'links',
    },
    prepare({title, links}) {
      const count = Array.isArray(links) ? links.length : 0
      return {
        title: title || 'Nav Dropdown',
        subtitle: `Dropdown · ${count} link${count === 1 ? '' : 's'}`,
      }
    },
  },
})
