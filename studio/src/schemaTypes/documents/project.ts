import {RocketIcon} from '@sanity/icons'
import {format, parseISO} from 'date-fns'
import {defineArrayMember, defineField, defineType} from 'sanity'
import type {Project} from '../../../sanity.types'

/**
 * Project schema. Routable document (`/projects/:slug`) for portfolio-style
 * work. Mirrors `post` for the editorial bits (slug, cover image, body) and
 * adds project-specific metadata (website / repo links, tech taxonomy,
 * featured flag). The `tech` field references the shared `category` document
 * so the listing (SVE-40) can filter / sort on structured taxonomy.
 * Learn more: https://www.sanity.io/docs/schema-types
 */

export const project = defineType({
  name: 'project',
  title: 'Project',
  icon: RocketIcon,
  type: 'document',
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
      description: 'A slug is required for the project to show up in the preview',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short summary used in listings and as the meta description.',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
          validation: (rule) => {
            // Custom validation to ensure alt text is provided if the image is present. https://www.sanity.io/docs/validation
            return rule.custom((alt, context) => {
              const document = context.document as Project
              if (document?.coverImage?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        },
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated at',
      type: 'datetime',
      description: 'When the project itself was last meaningfully updated.',
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      description: 'Live URL for the project, if any.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'repo',
      title: 'Repository',
      type: 'url',
      description: 'Source repository URL, if any.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'tech',
      title: 'Tech',
      type: 'array',
      description: 'Technologies / tags used. References the shared Category taxonomy.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Highlight this project in featured listings.',
      initialValue: false,
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph image',
      type: 'image',
      description: 'Optional social-share image. Falls back to the cover image if unset.',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
        },
      ],
    }),
  ],
  // List preview configuration. https://www.sanity.io/docs/previews-list-views
  preview: {
    select: {
      title: 'title',
      featured: 'featured',
      publishedAt: 'publishedAt',
      media: 'coverImage',
    },
    prepare({title, media, featured, publishedAt}) {
      const subtitles = [
        featured && 'Featured',
        publishedAt && format(parseISO(publishedAt), 'LLL d, yyyy'),
      ].filter(Boolean)

      return {title, media, subtitle: subtitles.join(' · ')}
    },
  },
})
