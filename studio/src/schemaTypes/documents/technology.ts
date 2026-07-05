import {defineField, defineType} from 'sanity'
import {CodeIcon} from '@sanity/icons/Code'

/**
 * Technology — a single, reusable entry in the tech taxonomy (e.g. Next.js,
 * Sanity, Tailwind CSS). Referenced from `project.tech` to describe *what a
 * project was built with*, kept separate from the topical `category` taxonomy
 * used for tagging/grouping. Intentionally minimal so it can be expanded later
 * (icon, brand colour, docs URL, grouping, etc.).
 */
export const technology = defineType({
  name: 'technology',
  title: 'Technology',
  type: 'document',
  icon: CodeIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Website',
      type: 'url',
      description: 'Optional link to the technology’s home page / docs.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'slug.current'},
    prepare({title, subtitle}) {
      return {title, subtitle: subtitle ? `/${subtitle}` : 'Technology'}
    },
  },
})
