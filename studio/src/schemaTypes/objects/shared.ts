import {defineField} from 'sanity'

/**
 * Image `alt` field that is required whenever an asset is present.
 * Mirrors the validation pattern used on post.coverImage / person.picture so
 * page-builder images satisfy the a11y checklist (see frontend/docs/A11Y.md).
 */
export const altField = defineField({
  name: 'alt',
  type: 'string',
  title: 'Alternative text',
  description: 'Important for SEO and accessibility. Describe the image for screen readers.',
  validation: (Rule) =>
    Rule.custom((alt, context) => {
      const parent = context.parent as {asset?: {_ref?: string}} | undefined
      if (parent?.asset?._ref && !alt) return 'Required when an image is set'
      return true
    }),
})

/**
 * Column-count field used by grid-style blocks. `initialValue` is set per usage.
 */
export const columnsField = defineField({
  name: 'columns',
  title: 'Columns',
  type: 'number',
  options: {
    list: [
      {title: 'Two', value: 2},
      {title: 'Three', value: 3},
      {title: 'Four', value: 4},
    ],
    layout: 'radio',
    direction: 'horizontal',
  },
  initialValue: 3,
})

/**
 * Optional animated `background` object, spread into page-builder blocks (and
 * the `page` document) so any block/page can opt into a shader background
 * without duplicating the field. Rendered by `BlockRenderer.tsx` (per block) and
 * the page route (page-level). Keep in sync with `./background.ts` and the
 * frontend shader registry (`frontend/app/components/shader/registry.ts`).
 */
export const backgroundField = defineField({
  name: 'background',
  title: 'Background',
  type: 'background',
  description: 'Optional animated background rendered behind this content.',
})

/**
 * Archive page-builder block `_type`s and the document type each one lists.
 * Single source of truth for the `page.archive` designation (`archiveField`
 * below) and the per-page validation in `documents/page.ts`. The stored
 * `archive` value IS the matching block `_type`, so the frontend resolves the
 * canonical listing page with a one-liner (`archive == "projectsArchive"`).
 *
 * Adding a new archive block? Add it here and the designation, validation and
 * frontend lookup all follow automatically.
 */
export const ARCHIVE_BLOCK_TYPES = ['postsArchive', 'projectsArchive', 'authorsArchive'] as const
export type ArchiveBlockType = (typeof ARCHIVE_BLOCK_TYPES)[number]

export const ARCHIVE_OPTIONS: {value: ArchiveBlockType; title: string}[] = [
  {value: 'postsArchive', title: 'Posts'},
  {value: 'projectsArchive', title: 'Projects'},
  {value: 'authorsArchive', title: 'Authors'},
]

export const isArchiveBlockType = (type: string): type is ArchiveBlockType =>
  (ARCHIVE_BLOCK_TYPES as readonly string[]).includes(type)

export const archiveTitle = (value: string): string =>
  ARCHIVE_OPTIONS.find((o) => o.value === value)?.title ?? value

/**
 * Designates a `page` as the canonical listing for a content type. When set,
 * the page must contain exactly one matching archive block and no other archive
 * block types (enforced on `page.pageBuilder` in `documents/page.ts`), and each
 * archive can be assigned to only one page (the async uniqueness check here).
 * Leave unset for ordinary pages — archive blocks may still be used freely on
 * non-archive pages.
 */
export const archiveField = defineField({
  name: 'archive',
  title: 'Document archive',
  type: 'string',
  description:
    'Make this page the canonical listing for a content type. The page must then contain exactly one matching archive block. Each archive can be assigned to only one page.',
  options: {
    list: ARCHIVE_OPTIONS,
    layout: 'dropdown',
  },
  validation: (Rule) =>
    Rule.custom(async (value, context) => {
      if (!value) return true
      const client = context.getClient({apiVersion: '2025-09-25'})
      const baseId = (context.document?._id || '').replace(/^drafts\./, '')
      const duplicates = await client.fetch<number>(
        `count(*[_type == "page" && archive == $archive && !(_id in $self)])`,
        {archive: value, self: [baseId, `drafts.${baseId}`]},
      )
      return duplicates > 0
        ? `The ${archiveTitle(value)} archive is already assigned to another page. Each archive can be assigned to only one page.`
        : true
    }),
})
