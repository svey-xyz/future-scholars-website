import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

/**
 * Document types a link can reference internally. Each one must have a route
 * in the frontend's `documentHref` (sanity/lib/utils.ts) and in Studio's
 * `resolveHref` (sanity.config.ts).
 */
export const linkableTypes = [{type: 'page'}, {type: 'program'}]

type LinkParent = {linkType?: string} | undefined

// Legacy values (`undefined`, and `'url'` from an old initialValue) are
// treated as URL links so existing data stays editable.
const isInternal = (parent: LinkParent) => parent?.linkType === 'page'

/**
 * Fields shared by the `link` object and the rich-text link annotations
 * (blockContent, settings.description). Kept in one place so every link in
 * the Studio accepts the same targets and validates the same way.
 */
export const linkFields = [
  defineField({
    name: 'linkType',
    title: 'Link type',
    type: 'string',
    initialValue: 'page',
    options: {
      list: [
        {title: 'Internal (page or program)', value: 'page'},
        {title: 'URL', value: 'href'},
      ],
      layout: 'radio',
    },
  }),
  defineField({
    // Field name stays `page` (not `reference`) so existing data needs no
    // migration; it may point at any of `linkableTypes`.
    name: 'page',
    title: 'Page or program',
    type: 'reference',
    to: linkableTypes,
    hidden: ({parent}) => !isInternal(parent as LinkParent),
    validation: (Rule) =>
      Rule.custom((value, context) =>
        isInternal(context.parent as LinkParent) && !value ? 'Choose a page or program' : true,
      ),
  }),
  defineField({
    name: 'anchor',
    title: 'Section',
    type: 'string',
    description:
      'Optional. Jump to a section of the page — enter the Anchor set on that block (e.g. "roses-room" links to /gallery#roses-room).',
    hidden: ({parent}) => !isInternal(parent as LinkParent),
    validation: (Rule) =>
      Rule.custom(async (value, context) => {
        const parent = context.parent as {linkType?: string; page?: {_ref?: string}} | undefined
        if (!value || !isInternal(parent) || !parent?.page?._ref) return true
        const id = parent.page._ref.replace(/^drafts\./, '')
        // Check the target's draft if there is one, else the published doc.
        const anchors = await context
          .getClient({apiVersion: '2025-09-25'})
          .fetch<string[] | null>(
            `coalesce(*[_id == "drafts." + $id][0], *[_id == $id][0]).pageBuilder[defined(anchor)].anchor`,
            {id},
          )
        if (anchors?.includes(value)) return true
        return anchors?.length
          ? `No section with that anchor on this page. Available: ${anchors.join(', ')}`
          : 'The linked page has no anchored sections — set an Anchor on the block first.'
      }),
  }),
  defineField({
    name: 'href',
    title: 'URL',
    type: 'url',
    description:
      'An external address (https://…, mailto:, tel:) or a site path such as /about#admissions. For pages and programs, use an internal link instead.',
    hidden: ({parent}) => isInternal(parent as LinkParent),
    validation: (Rule) => [
      Rule.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']}),
      Rule.custom((value, context) =>
        !isInternal(context.parent as LinkParent) && !value ? 'Enter a URL' : true,
      ),
    ],
  }),
  defineField({
    name: 'openInNewTab',
    title: 'Open in new tab',
    type: 'boolean',
    initialValue: false,
    hidden: ({parent}) => isInternal(parent as LinkParent),
  }),
]

/**
 * Link object: an internal reference (page or program) or a URL.
 * Learn more: https://www.sanity.io/docs/studio/object-type
 */
export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: linkFields,
})
