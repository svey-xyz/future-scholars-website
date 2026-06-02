import {defineArrayMember, defineField, defineType} from 'sanity'
import {RocketIcon, ComposeSparklesIcon, ImageIcon, LinkIcon, ControlsIcon} from '@sanity/icons'

import {altField} from './shared'

/**
 * Hero — prominent top-of-page section with eyebrow, heading, lede, up to two
 * buttons and an optional image. Renders an <h2> (the page's <h1> is the page
 * heading — see frontend/docs/A11Y.md).
 */
export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  icon: RocketIcon,
  groups: [
    {name: 'contents', icon: ComposeSparklesIcon, default: true},
    {name: 'media', icon: ImageIcon},
    {name: 'buttons', icon: LinkIcon},
    {name: 'designSystem', icon: ControlsIcon},
  ],
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', group: 'contents'}),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'contents',
    }),
    defineField({
      name: 'lede',
      title: 'Lede',
      type: 'text',
      rows: 3,
      description: 'Short supporting paragraph shown under the heading.',
      group: 'contents',
    }),
    defineField({
      name: 'buttons',
      title: 'Buttons',
      type: 'array',
      of: [defineArrayMember({type: 'button'})],
      validation: (Rule) => Rule.max(2),
      group: 'buttons',
    }),
    defineField({
      name: 'image',
      type: 'image',
      group: 'media',
      options: {hotspot: true, aiAssist: {imageDescriptionField: 'alt'}},
      fields: [altField],
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'center',
      options: {
        list: [
          {title: 'Centered', value: 'center'},
          {title: 'Split (text + image)', value: 'split'},
        ],
        layout: 'radio',
      },
      group: 'designSystem',
    }),
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'string',
      initialValue: 'light',
      description: 'Dark uses the inverted background.',
      options: {
        list: [
          {title: 'Light', value: 'light'},
          {title: 'Dark', value: 'dark'},
        ],
        layout: 'radio',
      },
      group: 'designSystem',
    }),
  ],
  preview: {
    select: {title: 'heading', subtitle: 'eyebrow', media: 'image.asset'},
    prepare({title, subtitle, media}) {
      return {title: title || 'Hero', subtitle: subtitle ? `Hero · ${subtitle}` : 'Hero', media}
    },
  },
})
