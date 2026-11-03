import {defineArrayMember, defineField, defineType} from 'sanity'
import {UsersIcon} from '@sanity/icons/Users'

import {anchorField, columnsField} from './shared'

/**
 * Faculty grid — `person` documents rendered as staff cards.
 *
 * Referencing `person` rather than re-typing names into a block means the
 * directors' bios exist once and can also feed the JSON-LD.
 */
export const facultyGrid = defineType({
  name: 'facultyGrid',
  title: 'Faculty Grid',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'subheading', title: 'Subheading', type: 'string'}),
    // Presentation only — both layouts read the same people.
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'cards',
      description:
        "Cards: full staff cards with portraits and biographies. Highlight: a single text column with names, roles and credentials, plus a link onward (homepage teaser). Intro left, teachers right: an introduction beside a grid of round portraits; each opens that teacher's bio (About page).",
      options: {
        list: [
          {title: 'Cards', value: 'cards'},
          {title: 'Highlight', value: 'highlight'},
          {title: 'Intro left, teachers right', value: 'split'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    // FB6/FB7: the text that sits beside the portrait grid.
    defineField({
      name: 'intro',
      title: 'Introduction',
      type: 'blockContentTextOnly',
      description: 'Shown to the left of the portraits (above them on phones).',
      hidden: ({parent}) => parent?.layout !== 'split',
    }),
    defineField({
      name: 'mode',
      title: 'Which people',
      type: 'string',
      initialValue: 'all',
      options: {
        list: [
          {title: 'Everyone, in order', value: 'all'},
          {title: 'Hand-picked', value: 'selected'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'people',
      title: 'People',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'person'}]})],
      hidden: ({parent}) => parent?.mode !== 'selected',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const mode = (context.parent as {mode?: string} | undefined)?.mode
          if (mode === 'selected' && (!value || value.length === 0)) {
            return 'Pick at least one person, or switch to "Everyone".'
          }
          return true
        }),
    }),
    defineField({
      name: 'showBio',
      title: 'Show biographies',
      type: 'boolean',
      initialValue: true,
      description: 'Off shows name, role and credentials only — useful for a large staff list.',
      // Split always puts the bio in the dialog; highlight never shows one.
      hidden: ({parent}) => parent?.layout === 'highlight' || parent?.layout === 'split',
    }),
    defineField({
      name: 'button',
      title: 'Link onward',
      type: 'button',
      description: 'Highlight layout only, e.g. "Meet our directors" → About › Directors.',
      hidden: ({parent}) => parent?.layout !== 'highlight',
    }),
    {
      ...columnsField,
      // Highlight is one column; split has its own fixed portrait grid.
      hidden: ({parent}: {parent?: {layout?: string}}) =>
        parent?.layout === 'highlight' || parent?.layout === 'split',
    },
    anchorField,
  ],
  preview: {
    select: {heading: 'heading', mode: 'mode', layout: 'layout'},
    prepare({heading, mode, layout}) {
      const kind =
        layout === 'highlight' ? 'Highlight' : layout === 'split' ? 'Intro + portraits' : 'Cards'
      return {
        title: heading || 'Faculty Grid',
        subtitle: `${kind} · ${mode === 'selected' ? 'hand-picked' : 'everyone'}`,
      }
    },
  },
})
