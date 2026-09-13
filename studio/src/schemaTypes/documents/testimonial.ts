import {defineField, defineType} from 'sanity'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'

import {altField} from '../objects/shared'

/**
 * Testimonial — a parent's own words, promoted to a document so the same quote
 * can appear on the testimonials page and in a teaser on the homepage without
 * being retyped (build plan S3).
 *
 * Never edit these for length or tone: they are quotations. Trim only with an
 * ellipsis, as the legacy site does.
 */
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: BlockquoteIcon,
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 8,
      description: "The parent's words, verbatim. Do not paraphrase or tidy.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'authorName',
      title: 'Attribution',
      type: 'string',
      description: 'Exactly as signed on the original, e.g. "The Lewandowski Family".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'authorRole',
      title: 'Author role',
      type: 'string',
      description: 'Optional context, e.g. "Toddler program parent".',
    }),
    defineField({
      name: 'authorImage',
      title: 'Author image',
      type: 'image',
      options: {hotspot: true, aiAssist: {imageDescriptionField: 'alt'}},
      fields: [altField],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Featured testimonials are eligible for the homepage teaser.',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Ascending display order on the testimonials page.',
    }),
  ],
  orderings: [{title: 'Order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'authorName', quote: 'quote', featured: 'featured', media: 'authorImage.asset'},
    prepare({title, quote, featured, media}) {
      const snippet = (quote || '').replace(/\s+/g, ' ').slice(0, 60)
      return {title: `${featured ? '★ ' : ''}${title}`, subtitle: snippet, media}
    },
  },
})
