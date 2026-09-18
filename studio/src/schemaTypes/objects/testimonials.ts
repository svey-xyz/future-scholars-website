import {defineArrayMember, defineField, defineType} from 'sanity'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'

import {altField, isExcerptOf} from './shared'

/**
 * Testimonials — quote cards with author name, role and optional avatar.
 */
export const testimonials = defineType({
  name: 'testimonials',
  title: 'Testimonials',
  type: 'object',
  icon: BlockquoteIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'subheading', title: 'Subheading', type: 'string'}),
    // FSMA fork: presentation only — both layouts read the same data, so an
    // editor can flip a block between them without re-entering anything.
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'cards',
      description:
        'Cards: pull quotes in a grid, full text behind \u201cRead more\u201d — for a few testimonials on a mixed page. Letters: every testimonial in full, one per row — for a dedicated testimonials page.',
      options: {
        list: [
          {title: 'Cards', value: 'cards'},
          {title: 'Letters (full page)', value: 'letters'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    // FSMA fork (build plan S3): testimonials are also documents, so the same
    // quote can appear here and on /testimonials without being retyped. The
    // template's inline array stays for back-compat — `source` picks between
    // them. Logged in the FORK-SYNC divergence registry.
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      initialValue: 'manual',
      options: {
        list: [
          {title: 'Written here', value: 'manual'},
          {title: 'From testimonial documents', value: 'documents'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'featuredOnly',
      title: 'Featured only',
      type: 'boolean',
      initialValue: true,
      description: 'Limit to testimonials marked Featured.',
      hidden: ({parent}) => parent?.source !== 'documents',
    }),
    defineField({
      name: 'limit',
      title: 'Maximum to show',
      type: 'number',
      initialValue: 3,
      validation: (Rule) => Rule.integer().positive().max(24),
      hidden: ({parent}) => parent?.source !== 'documents',
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      hidden: ({parent}) => parent?.source === 'documents',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const source = (context.parent as {source?: string} | undefined)?.source
          if (source === 'documents') return true
          if (!value || value.length === 0) return 'Add at least one testimonial.'
          return true
        }),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'testimonial',
          fields: [
            defineField({
              name: 'quote',
              title: 'Quote',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'highlight',
              title: 'Pull quote',
              type: 'text',
              rows: 3,
              description:
                'The strongest sentence or two, copied verbatim from the quote. This is what the card shows; the full quote sits behind \u201cRead more\u201d. Leave empty to fall back to the opening sentence.',
              validation: (Rule) => Rule.max(240).custom(isExcerptOf('quote')),
            }),
            defineField({
              name: 'authorName',
              title: 'Author name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'authorRole', title: 'Author role / company', type: 'string'}),
            defineField({
              name: 'sourceUrl',
              title: 'Source link',
              type: 'url',
              description: 'Optional link to the original article or review',
              validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
            }),
            defineField({
              name: 'authorImage',
              title: 'Author image',
              type: 'image',
              options: {hotspot: true, aiAssist: {imageDescriptionField: 'alt'}},
              fields: [altField],
            }),
          ],
          preview: {
            select: {title: 'authorName', subtitle: 'authorRole', media: 'authorImage.asset'},
            prepare({title, subtitle, media}) {
              return {title: title || 'Testimonial', subtitle, media}
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'number',
      initialValue: 3,
      hidden: ({parent}) => parent?.layout === 'letters',
      options: {
        list: [
          {title: 'One', value: 1},
          {title: 'Two', value: 2},
          {title: 'Three', value: 3},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      count: 'testimonials',
      source: 'source',
      limit: 'limit',
      layout: 'layout',
    },
    prepare({heading, count, source, limit, layout}) {
      const n = Array.isArray(count) ? count.length : 0
      const kind = layout === 'letters' ? 'Testimonials (letters)' : 'Testimonials'
      return {
        title: heading || 'Testimonials',
        subtitle:
          source === 'documents'
            ? `${kind} · from documents${limit ? ` · up to ${limit}` : ''}`
            : `${kind} · ${n} item${n === 1 ? '' : 's'}`,
      }
    },
  },
})
