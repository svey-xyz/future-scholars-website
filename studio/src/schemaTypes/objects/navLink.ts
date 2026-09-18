import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

/**
 * A single navigation link. Reuses the shared `link` object so it can point at a
 * page or a URL. The optional `title` overrides the linked
 * document's own title when shown in the nav.
 * Learn more: https://www.sanity.io/docs/studio/object-type
 */

export const navLink = defineType({
  name: 'navLink',
  title: 'Nav Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: "Overrides the linked page's title in the nav",
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'link',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      linkType: 'link.linkType',
      href: 'link.href',
      page: 'link.page.name',
    },
    prepare({title, href, page}) {
      return {
        title: title || page || href || 'Nav Link',
        subtitle: 'Nav Link',
      }
    },
  },
})
