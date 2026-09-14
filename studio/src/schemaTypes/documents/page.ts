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
    defineField({
      name: 'masthead',
      title: 'Masthead',
      type: 'masthead',
      description:
        'Full-bleed image + logo lockup at the top of the page. Every FSMA page opens with one (build plan D12); vary the image, height and overlay so no two pages look alike.',
    }),
    // FSMA fork: the archive blocks are not offered on this site (build plan
    // D13/S2), so the designation field has nothing to point at. Hidden rather
    // than removed, and spread rather than edited in `shared.ts`, so the
    // template's definition stays the single source of truth on merge.
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      description:
        'Optional. Overrides the title, description and share image search engines and social apps use for this page.',
    }),
    {...archiveField, hidden: true},
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
        {type: 'programsGrid'},
        {type: 'facultyGrid'},
        {type: 'contactDetails'},
        {type: 'gallery'},
        {type: 'faq'},
        {type: 'note'},
        // FSMA fork: the archive blocks stay in this union deliberately. Removing
        // them here cascades into `frontend/sanity/lib/types.ts` and the three
        // template archive components (they derive their props from the page
        // query's block union), which is exactly the divergence D13 avoids.
        // They are rejected by the validation below instead, and the `archive`
        // designation field is hidden.
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
          const items = (blocks as {_type: string; _key: string}[] | undefined) ?? []

          // FSMA fork: this site has no blog or portfolio, so no page may carry
          // an archive block. Delete this guard (and unhide `archive`) to
          // restore the template's archive behaviour.
          const unused = items.filter((b) => isArchiveBlockType(b._type))
          if (unused.length > 0) {
            return {
              message:
                'Archive blocks (Posts, Projects, Authors) are not used on this site — remove this block.',
              paths: unused.map((b) => [{_key: b._key}]),
            }
          }

          const archive = (context.document as {archive?: string} | undefined)?.archive
          if (!archive) return true

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
