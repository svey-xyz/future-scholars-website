import {defineField, defineType} from 'sanity'
import {SearchIcon} from '@sanity/icons/Search'

import {altField} from './shared'

/**
 * SEO overrides for a document.
 *
 * Every field is optional: left empty, the route falls back to the document's
 * own `name` / `heading` and the site-level Open Graph image, so a page is
 * never worse off for ignoring this. Only fill it in when the search-result
 * wording should differ from the on-page wording.
 */
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: SearchIcon,
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      description:
        'Overrides the browser-tab and search-result title. Aim for under 60 characters — the site name is appended automatically.',
      validation: (Rule) => Rule.max(60).warning('Titles over 60 characters get truncated.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description:
        'The snippet under the search result. Aim for 120–160 characters, written for a parent scanning results.',
      validation: (Rule) =>
        Rule.max(160).warning('Descriptions over 160 characters get truncated.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      description:
        'Shown when the page is shared. 1200×630 or wider. Falls back to the site-wide image in Settings.',
      options: {hotspot: true, aiAssist: {imageDescriptionField: 'alt'}},
      fields: [altField],
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      initialValue: false,
      description:
        'Adds noindex. The page stays publicly reachable — this only asks search engines not to list it.',
    }),
  ],
})
