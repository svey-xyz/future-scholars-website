import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons/Document'

/**
 * Page schema.  Define and edit the fields for the 'page' content type.
 * Learn more: https://www.sanity.io/docs/studio/schema-types
 */

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
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
      validation: (Rule) => Rule.required(),
      options: {
        source: 'name',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
    }),
    defineField({
      name: 'titleDisplay',
      title: 'Title display',
      type: 'string',
      description:
        'How the heading & subheading render at the top of the page when there is no masthead. Defaults to Plain. With a masthead, None keeps the heading screen-reader-only.',
      options: {
        list: [
          {title: 'Plain', value: 'plain'},
          {title: 'Highlighted', value: 'highlighted'},
          {title: 'None', value: 'none'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'masthead',
      title: 'Masthead',
      type: 'masthead',
      description:
        'Full-bleed image + logo lockup at the top of the page. Every page opens with one; vary the image, height and overlay so no two pages look alike.',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      description:
        'Optional. Overrides the title, description and share image search engines and social apps use for this page.',
    }),
    defineField({
      name: 'pageBuilder',
      title: 'Page builder',
      type: 'array',
      of: [
        {type: 'callToAction'},
        {type: 'infoSection'},
        {type: 'featuresGrid'},
        {type: 'stats'},
        {type: 'testimonials'},
        {type: 'programsGrid'},
        {type: 'facultyGrid'},
        {type: 'contactDetails'},
        {type: 'gallery'},
        {type: 'faq'},
        {type: 'note'},
        {type: 'pullQuote'},
      ],
    }),
  ],
})
