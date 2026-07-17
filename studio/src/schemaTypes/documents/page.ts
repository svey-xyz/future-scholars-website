import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons/Document'

import {archiveField, archiveTitle, backgroundField, isArchiveBlockType} from '../objects/shared'

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
        'How the heading & subheading render at the top of the page. Defaults to Plain — and is hidden automatically when a Hero block leads the page (the hero owns the headline; the heading stays screen-reader-only). Pick an option to override.',
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
    archiveField,
    backgroundField,
    defineField({
      name: 'pageBuilder',
      title: 'Page builder',
      type: 'array',
      of: [
        {type: 'hero'},
        {type: 'callToAction'},
        {type: 'infoSection'},
        {type: 'featuresGrid'},
        {type: 'stats'},
        {type: 'scores'},
        {type: 'testimonials'},
        {type: 'gallery'},
        {type: 'faq'},
        {type: 'note'},
        {type: 'postsArchive'},
        {type: 'projectsArchive'},
        {type: 'authorsArchive'},
      ],
      // When this page is designated an archive (`archive` field), it must carry
      // exactly one matching archive block and no other archive blocks. Archive
      // blocks remain freely usable on non-archive pages (no constraint there).
      // The array `of` is static, so this is enforced here rather than by hiding
      // insert-menu options per-document.
      validation: (Rule) =>
        Rule.custom((blocks, context) => {
          const archive = (context.document as {archive?: string} | undefined)?.archive
          if (!archive) return true

          const items = (blocks as {_type: string; _key: string}[] | undefined) ?? []
          const archiveBlocks = items.filter((b) => isArchiveBlockType(b._type))
          const matching = archiveBlocks.filter((b) => b._type === archive)
          const others = archiveBlocks.filter((b) => b._type !== archive)
          const label = archiveTitle(archive)

          if (matching.length === 0) {
            return `This page is the ${label} archive — add one “${label} Archive” block to the page builder.`
          }
          if (matching.length > 1) {
            return {
              message: `Only one “${label} Archive” block is allowed on the ${label} archive page.`,
              paths: matching.slice(1).map((b) => [{_key: b._key}]),
            }
          }
          if (others.length > 0) {
            return {
              message: `The ${label} archive page may only contain the “${label} Archive” block. Remove the other archive block(s).`,
              paths: others.map((b) => [{_key: b._key}]),
            }
          }
          return true
        }),
      options: {
        insertMenu: {
          // Configure the "Add Item" menu to display a thumbnail preview of the content type. https://www.sanity.io/docs/studio/array-type#efb1fe03459d
          views: [
            {
              name: 'grid',
              previewImageUrl: (schemaTypeName) =>
                `/static/page-builder-thumbnails/${schemaTypeName}.webp`,
            },
          ],
        },
      },
    }),
  ],
})
