import {defineField, defineType} from 'sanity'
import {InfoOutlineIcon} from '@sanity/icons/InfoOutline'
import {anchorField} from './shared'

/**
 * Note — a frosted, toned callout card (info / warning / danger) built on
 * Portable Text. `tone` drives the icon + token-based colors in
 * frontend/app/components/Note.tsx; `icon` optionally overrides the default
 * Heroicon for that tone (values map to the same Heroicon registry).
 */
export const note = defineType({
  name: 'note',
  title: 'Note',
  type: 'object',
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: 'tone',
      title: 'Tone',
      type: 'string',
      description: 'Sets the callout intent — conveyed by text + icon, not color alone.',
      options: {
        list: [
          {title: 'Info', value: 'info'},
          {title: 'Warning', value: 'warning'},
          {title: 'Danger', value: 'danger'},
        ],
        layout: 'radio',
      },
      initialValue: 'info',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon override',
      type: 'string',
      description: 'Optional Heroicon to use instead of the tone default.',
      options: {
        list: [
          {title: 'Information', value: 'information'},
          {title: 'Warning', value: 'warning'},
          {title: 'Error', value: 'error'},
          {title: 'Question', value: 'question'},
          {title: 'Light bulb', value: 'lightbulb'},
          {title: 'Sparkles', value: 'sparkles'},
          {title: 'Check', value: 'check'},
          {title: 'Bell', value: 'bell'},
          {title: 'Fire', value: 'fire'},
          {title: 'Shield', value: 'shield'},
        ],
      },
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContentTextOnly',
      validation: (Rule) => Rule.required(),
    }),
    anchorField,
  ],
  preview: {
    select: {tone: 'tone', content: 'content'},
    prepare({tone}) {
      const label = typeof tone === 'string' ? tone : 'info'
      return {
        title: `Note (${label})`,
        subtitle: 'Note',
      }
    },
  },
})
