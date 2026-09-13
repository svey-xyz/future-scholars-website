import {defineField, defineType} from 'sanity'
import {BlockElementIcon} from '@sanity/icons/BlockElement'

import {altField} from '../objects/shared'

/**
 * Program — one of FSMA's age-banded Montessori programs (Infants, Toddlers,
 * Casa). Its own document type rather than a page, so the same program can be
 * referenced from a programs grid, the nav and the detail route without the
 * copy being duplicated (build plan S3).
 */
export const program = defineType({
  name: 'program',
  title: 'Program',
  type: 'document',
  icon: BlockElementIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      description: 'Resolves under /programs/ — e.g. "infants" becomes /programs/infants.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ageRange',
      title: 'Age range',
      type: 'string',
      description: 'As shown to parents, e.g. "6 months – 18 months".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ratio',
      title: 'Teacher-to-child ratio',
      type: 'string',
      description: 'e.g. "1:3". Shown on the card and the detail page.',
    }),
    defineField({
      name: 'classroomName',
      title: 'Classroom name',
      type: 'string',
      description: 'FSMA names its rooms — Roses, Shamrock, Violet.',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'One or two sentences for the programs grid and meta description.',
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
    defineField({
      name: 'image',
      title: 'Card image',
      type: 'image',
      description: 'Used on the programs grid. The masthead below is a separate, larger image.',
      options: {hotspot: true, aiAssist: {imageDescriptionField: 'alt'}},
      fields: [altField],
    }),
    defineField({
      name: 'scheduleNote',
      title: 'Schedule note',
      type: 'string',
      description: 'Optional hours note specific to this program.',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Ascending. Programs are listed youngest-first, so Infants = 1.',
      validation: (Rule) => Rule.required().integer().positive(),
    }),
    defineField({
      name: 'masthead',
      title: 'Masthead',
      type: 'masthead',
      description: 'Opens the program detail page. Give each program a distinct image (§7.1).',
    }),
  ],
  orderings: [{title: 'Age', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', ageRange: 'ageRange', ratio: 'ratio', media: 'image.asset'},
    prepare({title, ageRange, ratio, media}) {
      return {
        title,
        subtitle: [ageRange, ratio && `Ratio ${ratio}`].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
