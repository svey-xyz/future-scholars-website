import {at, defineMigration, set, unset} from 'sanity/migrate'

/**
 * Rename `gallery.images` → `gallery.items`.
 *
 * The `gallery` page-builder block renamed its array field from `images` to
 * `items` (and broadened membership to `[galleryImage, galleryVideo]`). The
 * existing members are unchanged — they keep their `_key` and `galleryImage`
 * `_type`; this is a pure property rename.
 *
 * Galleries live inside `page.pageBuilder[]`, so we visit every object node and
 * act on the ones typed `gallery` (handles multiple galleries per page and any
 * nesting depth). Only touches docs that still have the legacy `images` field
 * and no `items` yet, so the migration is idempotent.
 *
 * Dry run:  npx sanity migration run rename-gallery-images-to-items
 * Execute:  npx sanity migration run rename-gallery-images-to-items --no-dry-run
 *           (add `--dataset production` / a write token as needed)
 */
export default defineMigration({
  title: 'Rename gallery images → items',
  documentTypes: ['page'],

  migrate: {
    object(node, path, context) {
      const gallery = node as {_type?: string; images?: unknown; items?: unknown}
      if (gallery._type !== 'gallery') return undefined
      if (!Array.isArray(gallery.images) || gallery.items !== undefined) return undefined

      return [at('items', set(gallery.images)), at('images', unset())]
    },
  },
})
