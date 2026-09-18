import {at, defineMigration, set, unset} from 'sanity/migrate'

/**
 * Removes values left behind by fields that were deleted with the template
 * leftovers (see the "Drop template" entry in docs/FSMA-BUILD-PLAN.md §11).
 * Without it, Studio shows them as "unknown fields".
 *
 * - settings: `mobileNav`, `builtWith`, `favicon`, `logo`
 * - page: `archive`, `background`
 * - testimonials blocks: `source` (the block now always reads testimonial documents)
 * - callToAction blocks: `theme: "dark"` → `"brand"`, and any per-block `background`
 *
 * Run AFTER the matching frontend is deployed — the previous frontend still
 * reads `testimonials.source`.
 *
 *   cd studio
 *   npx sanity migration run drop-template-fields                 # dry run
 *   npx sanity migration run drop-template-fields --no-dry-run
 */
export default defineMigration({
  title: 'Drop template-only fields',
  documentTypes: ['settings', 'page'],

  migrate: {
    document(doc) {
      if (doc._type === 'settings') {
        return ['mobileNav', 'builtWith', 'favicon', 'logo']
          .filter((field) => field in doc)
          .map((field) => at(field, unset()))
      }
      return ['archive', 'background']
        .filter((field) => field in doc)
        .map((field) => at(field, unset()))
    },
    object(node, path) {
      if (path[0] !== 'pageBuilder' || path.length !== 2) return
      const block = node as {
        _type?: string
        source?: unknown
        theme?: unknown
        background?: unknown
      }
      const ops = []
      if (block._type === 'testimonials' && 'source' in block) ops.push(at('source', unset()))
      if (block._type === 'callToAction' && block.theme === 'dark')
        ops.push(at('theme', set('brand')))
      if ('background' in block) ops.push(at('background', unset()))
      return ops
    },
  },
})
