import {defineField, defineType} from 'sanity'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'

import {anchorField} from './shared'

/**
 * Pull quote — one short quotation set large between sections, to break up
 * long reading pages (Montessori). Rendered as <figure><blockquote> with the
 * attribution in <figcaption>, so the source is tied to the quote semantically.
 *
 * `repeatsText`: a pull quote that lifts a sentence from the surrounding copy
 * is hidden from screen readers, which would otherwise read it twice. A quote
 * that appears only here (e.g. a quotation from Maria Montessori) must leave it off.
 */
export const pullQuote = defineType({
  name: 'pullQuote',
  title: 'Pull quote',
  type: 'object',
  icon: BlockquoteIcon,
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 3,
      description: 'Without quotation marks — they are added by the design.',
      validation: (Rule) => [
        Rule.required(),
        Rule.max(240).warning('Pull quotes read best under ~240 characters.'),
      ],
    }),
    defineField({
      name: 'attribution',
      title: 'Attribution',
      type: 'string',
      description:
        'Who said it, e.g. "Dr. Maria Montessori". Leave empty for an excerpt of the page.',
    }),
    defineField({
      name: 'repeatsText',
      title: 'Repeats text from this page',
      type: 'boolean',
      initialValue: false,
      description:
        'Turn on when the quote is copied from the page’s own text. Screen readers then skip it so it isn’t read twice.',
    }),
    defineField({
      name: 'tone',
      title: 'Tone',
      type: 'string',
      initialValue: 'plain',
      options: {
        list: [
          {title: 'Plain', value: 'plain'},
          {title: 'Soft sky panel', value: 'panel'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    anchorField,
  ],
  preview: {
    select: {quote: 'quote', attribution: 'attribution'},
    prepare({quote, attribution}) {
      return {
        title: quote ? `“${quote}”` : 'Pull quote',
        subtitle: attribution ? `Pull quote · ${attribution}` : 'Pull quote',
      }
    },
  },
})
