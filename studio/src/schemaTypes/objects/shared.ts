import {defineField} from 'sanity'

/**
 * Image `alt` field that is required whenever an asset is present.
 * Mirrors the validation pattern used on person.picture so page-builder
 * images satisfy the a11y checklist (see docs/A11Y.md).
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
 * Optional anchor for a block, so a long page can be linked into —
 * `/about#admissions`, which the legacy redirect map sends `admissions.htm` to.
 * Rendered as the `id` on the block's wrapper in `BlockRenderer.tsx`, with
 * `scroll-mt` there to clear the fixed mobile bar.
 */
export const anchorField = defineField({
  name: 'anchor',
  title: 'Anchor',
  type: 'string',
  description:
    'Optional. Lets this section be linked to directly, e.g. "admissions" makes /about#admissions jump here. Lowercase letters, numbers and hyphens only.',
  validation: (Rule) =>
    Rule.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      name: 'anchor',
      invert: false,
    }).warning('Use lowercase letters, numbers and hyphens only — e.g. "book-a-tour".'),
})

/**
 * Validator for a "pull quote" field: the value must be a verbatim excerpt of a
 * sibling long-form field. Comparison normalises whitespace, case and any
 * leading/trailing ellipsis or quotation marks, so an editor can capitalise the
 * first letter of a mid-sentence fragment without tripping the rule.
 *
 * Keeping the excerpt verbatim is what lets the frontend swap the card between
 * the pull quote and the full quote without either version reading as a
 * paraphrase (see frontend/app/components/blocks/Testimonials.tsx).
 */
const normaliseExcerpt = (value: string): string =>
  value
    .replace(/\s+/g, ' ')
    .replace(/^[\s"'“”‘’.…]+|[\s"'“”‘’.…]+$/g, '')
    .toLowerCase()

export const isExcerptOf =
  (sourceField: string) =>
  (value: unknown, context: {parent?: unknown}): true | string => {
    if (typeof value !== 'string' || !value.trim()) return true
    const source = (context.parent as Record<string, unknown> | undefined)?.[sourceField]
    if (typeof source !== 'string') return true
    return normaliseExcerpt(source).includes(normaliseExcerpt(value))
      ? true
      : 'Must appear word-for-word in the quote above — copy and paste the sentences you want to lead with.'
  }
