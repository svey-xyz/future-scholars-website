import {CogIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import type {Link, Settings} from '../../../sanity.types'

import * as demo from '../../lib/initialValues'
import { mediaAssetSource } from 'sanity-plugin-media'

/**
 * Settings schema Singleton.  Singletons are single documents that are displayed not in a collection, handy for things like site settings and other global configurations.
 * Learn more: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
 */

export const settings = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'title',
      description: 'This field is the title of your blog.',
      title: 'Title',
      type: 'string',
      initialValue: demo.title,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      description: 'Used on the Homepage',
      title: 'Description',
      type: 'array',
      initialValue: demo.description,
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
                        {title: 'Post', value: 'post'},
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
                    name: 'post',
                    title: 'Post',
                    type: 'reference',
                    to: [{type: 'post'}],
                    hidden: ({parent}) => parent?.linkType !== 'post',
                    validation: (Rule) =>
                      Rule.custom((value, context) => {
                        const parent = context.parent as Link
                        if (parent?.linkType === 'post' && !value) {
                          return 'Post reference is required when Link Type is Post'
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
			title: 'Logo',
			name: 'logo',
			type: 'file',
			description: 'Site logo. Upload an SVG — it will be served as-is for crisp scaling at any size.',
			options: {
				accept: 'image/svg+xml',
			},
			validation: Rule =>
				Rule.custom((value: any) => {
					if (!value?.asset) return true
					const mt: string | undefined = value?.asset?.mimeType ?? value?.asset?._ref
					// asset._ref looks like `file-<hash>-svg`; check both mimeType (deref) and ref suffix
					if (typeof mt === 'string' && (mt === 'image/svg+xml' || mt.endsWith('-svg'))) return true
					return 'Logo must be an SVG (image/svg+xml).'
				}),
		}),
		defineField({
			title: 'Favicon',
			name: 'favicon',
			description: 'Browser tab icon. Should be square (e.g. 512×512 PNG). Served via Next.js metadata; no rebuild required.',
			type: 'image',
			options: {
				sources: [mediaAssetSource],
				hotspot: true,
				metadata: ['lqip', 'palette', 'exif', 'location'],
			},
			fields: [
				defineField({
					name: 'alt',
					title: 'Alternative text',
					type: 'string',
					description: 'Context-specific alt text. Falls back to the asset-level description when empty.',
				}),
			],
			preview: {
				select: {
					asset: 'asset',
					title: 'asset.title',
					description: 'asset.description'

				},
				prepare(value: any) {
					return {
						title: value.title ? value.title : 'Untitled Image',
						subtitle: value.description,
						media: value.asset
					}
				}
			},
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
			description: 'Concise description of the site, used primarily for SEO and metadata.',
		}),
		defineField({
			title: 'Contact',
			name: 'contact',
			type: 'contact',
		}),
		defineField({
			title: 'Navigation',
			name: 'navigation',
			type: 'array',
			description:
				'Header navigation. Add top-level links, or dropdowns that group several links under a disclosure label.',
			of: [
				defineArrayMember({type: 'navLink'}),
				defineArrayMember({type: 'navDropdown'}),
			],
		}),
		defineField({
			title: 'Mobile Navigation',
			name: 'mobileNav',
			type: 'object',
			fields: [
				defineField({
					title: 'Show footer content',
					name: 'showFooterContent',
					type: 'boolean',
					description: 'Show footer content (socials, legal) inside the mobile menu',
					initialValue: true,
				}),
			],
		}),
		defineField({
			title: 'Legal',
			name: 'legal',
			type: 'string',
			description: 'Short legal disclaimer shown in the footer / mobile menu',
		}),
		defineField({
			name: 'homepage',
			title: 'Homepage',
			type: 'reference',
			to: [{ type: 'page' }],
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
