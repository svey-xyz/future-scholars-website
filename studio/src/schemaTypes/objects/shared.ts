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
