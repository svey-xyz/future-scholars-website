import {defineField, defineType} from 'sanity'
import {BlockElementIcon} from '@sanity/icons/BlockElement'

import {altField} from '../objects/shared'
import {ColourInput, normaliseHex} from '../../components/ColourInput'

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
    // FB5: one picked colour per program. The frontend derives the text and
    // tint tones from it (frontend/lib/room.ts), so any pick stays AAA — the
    // editor never chooses a text colour. Decorative everywhere: the room
    // name is always in text.
    defineField({
      name: 'accent',
      title: 'Room colour',
      type: 'string',
      description:
        'Themes the program: banner, headings, "At a glance" card, tour panel, program card and the dot beside it in the menu. Text uses an automatically darkened shade, so any colour stays readable.',
      components: {input: ColourInput},
      validation: (Rule) => [
        Rule.required().custom((value) =>
          !value || normaliseHex(value) ? true : 'Use a hex colour, e.g. #2222d8',
        ),
        Rule.custom((value) => {
          const hex = normaliseHex(value)
          return hex && contrastOnWhite(hex) < 1.5
            ? 'Very light — the coloured rules and menu dot will be hard to see. Text stays readable.'
            : true
        }).warning(),
      ],
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
      description:
        "Program-specific schedule note. Don't put hours here; they come from Settings → Contact → Hours.",
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

/** WCAG contrast of `hex` against white — only used for the "too light" warning. */
function contrastOnWhite(hex: string): number {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [n >> 16, n >> 8, n].map((c) => {
    const v = (c & 255) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 1.05 / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05)
}
