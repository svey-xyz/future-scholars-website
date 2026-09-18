import {CogIcon} from '@sanity/icons/Cog'
import {defineArrayMember, defineField, defineType} from 'sanity'
import type {Link, Settings} from '../../../sanity.types'

/**
 * Site settings singleton (`_id: "settings"`): identity, contact, navigation,
 * homepage and the site-wide share image.
 */

export const settings = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  fieldsets: [
    {
      name: 'schoolInfo',
      title: 'School identity (structured data)',
      description:
        'Facts about the organisation itself. These feed the JSON-LD emitted site-wide — they are not rendered as page copy.',
      options: {collapsible: true, collapsed: true},
    },
  ],
  fields: [
    defineField({
      name: 'title',
      description: 'The school name. Used in page titles, the logo alt text and structured data.',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      description:
        'About the school in a sentence or two. Used as the Organization description in structured data, and as the meta description when Blurb is empty.',
      title: 'Description',
      type: 'array',
      of: [
        // Define a minified block content field for the description. https://www.sanity.io/docs/block-content
        defineArrayMember({
          type: 'block',
          options: {},
          styles: [],
          lists: [],
          marks: {
            decorators: [],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'linkType',
                    title: 'Link Type',
                    type: 'string',
                    initialValue: 'href',
                    options: {
                      list: [
                        {title: 'URL', value: 'href'},
                        {title: 'Page', value: 'page'},
                      ],
                      layout: 'radio',
                    },
                  }),
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    hidden: ({parent}) => parent?.linkType !== 'href' && parent?.linkType != null,
                    validation: (Rule) =>
                      Rule.custom((value, context) => {
                        const parent = context.parent as Link
                        if (parent?.linkType === 'href' && !value) {
                          return 'URL is required when Link Type is URL'
                        }
                        return true
                      }),
                  }),
                  defineField({
                    name: 'page',
                    title: 'Page',
                    type: 'reference',
                    to: [{type: 'page'}],
                    hidden: ({parent}) => parent?.linkType !== 'page',
                    validation: (Rule) =>
                      Rule.custom((value, context) => {
                        const parent = context.parent as Link
                        if (parent?.linkType === 'page' && !value) {
                          return 'Page reference is required when Link Type is Page'
                        }
                        return true
                      }),
                  }),
                  defineField({
                    name: 'openInNewTab',
                    title: 'Open in new tab',
                    type: 'boolean',
                    initialValue: false,
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Displayed on social cards and search engine results.',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        defineField({
          name: 'alt',
          description: 'Important for accessibility and SEO.',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => {
            return rule.custom((alt, context) => {
              const document = context.document as Settings
              if (document?.ogImage?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        }),
        defineField({
          name: 'metadataBase',
          type: 'url',
        }),
      ],
    }),
    defineField({
      title: 'Blurb',
      name: 'blurb',
      type: 'string',
      description:
        'Default meta description (what search results show) for any page without its own. Aim for about 150 characters.',
      validation: (Rule) =>
        Rule.max(160).warning('Search engines truncate after about 160 characters.'),
    }),
    defineField({
      title: 'Contact',
      name: 'contact',
      type: 'contact',
    }),
    defineField({
      title: 'Founded',
      name: 'foundingDate',
      type: 'date',
      description: 'Year the school opened. Used in the Organization JSON-LD (`foundingDate`).',
      options: {dateFormat: 'YYYY-MM-DD'},
      fieldset: 'schoolInfo',
    }),
    defineField({
      title: 'Area served',
      name: 'areaServed',
      type: 'array',
      description:
        'Neighbourhoods / municipalities the school draws from, e.g. "Ottawa", "Barrhaven". Used in JSON-LD (`areaServed`).',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
      fieldset: 'schoolInfo',
    }),
    defineField({
      title: 'Price range',
      name: 'priceRange',
      type: 'string',
      description:
        'Coarse price indicator for JSON-LD (`priceRange`), e.g. "$$". Not a published fee schedule.',
      fieldset: 'schoolInfo',
    }),
    defineField({
      title: 'Coordinates',
      name: 'geo',
      type: 'object',
      description: 'Latitude / longitude of the school, used in JSON-LD (`geo`).',
      options: {columns: 2},
      fields: [
        defineField({
          name: 'lat',
          title: 'Latitude',
          type: 'number',
          validation: (Rule) => Rule.min(-90).max(90),
        }),
        defineField({
          name: 'lng',
          title: 'Longitude',
          type: 'number',
          validation: (Rule) => Rule.min(-180).max(180),
        }),
      ],
      fieldset: 'schoolInfo',
    }),
    defineField({
      title: 'Navigation',
      name: 'navigation',
      type: 'array',
      description:
        'Side menu. Add top-level links, or groups that nest several links under a disclosure (e.g. Programs).',
      of: [defineArrayMember({type: 'navLink'}), defineArrayMember({type: 'navDropdown'})],
    }),
    defineField({
      title: 'Legal',
      name: 'legal',
      type: 'string',
      description: 'Short line shown in the footer, e.g. "© Future Scholars Montessori Academy".',
    }),
    defineField({
      name: 'homepage',
      title: 'Homepage',
      type: 'reference',
      to: [{type: 'page'}],
      options: {
        disableNew: true,
      },
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Settings',
      }
    },
  },
})
