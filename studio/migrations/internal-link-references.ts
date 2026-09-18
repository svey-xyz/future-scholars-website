import {at, defineMigration, set, unset} from 'sanity/migrate'

/**
 * Converts links authored as hard-coded site paths into internal references,
 * now that `link.page` accepts `program` as well as `page` documents:
 *
 * - `/programs/<slug>` → reference to that `program`
 * - `/<slug>`          → reference to that `page`
 * - a trailing `#fragment` (e.g. `/about#admissions`) → the link's `anchor`
 *
 * Paths with a query string, or with no matching document, are left as URL
 * links — relative URLs are valid now.
 * Also normalises the stray `linkType: "url"` left by the old initialValue
 * to `"href"`.
 *
 * Covers every `link` object and rich-text link annotation (both `_type: "link"`)
 * in settings, pages and programs, drafts included.
 *
 *   cd studio
 *   npx sanity migration run internal-link-references                 # dry run
 *   npx sanity migration run internal-link-references --no-dry-run
 */

type LinkNode = {_type?: string; linkType?: string; href?: string; page?: unknown}

const PATH = /^\/(?:(programs)\/)?([a-z0-9][a-z0-9-]*)\/?(?:#([a-z0-9-]+))?$/i

export default defineMigration({
  title: 'Convert site-path links to internal references',
  documentTypes: ['settings', 'page', 'program'],

  migrate: {
    async object(node, _path, {client}) {
      const link = node as LinkNode
      if (link._type !== 'link') return

      const match = typeof link.href === 'string' ? PATH.exec(link.href) : null
      // Skip links that already hold a reference.
      if (match && !(link.linkType === 'page' && link.page)) {
        const [, programs, slug, anchor] = match
        const type = programs ? 'program' : 'page'
        const id = await client.fetch<string | null>(
          `*[_type == $type && slug.current == $slug && !(_id in path("drafts.**"))][0]._id`,
          {type, slug},
        )
        if (id) {
          return [
            at('linkType', set('page')),
            at('page', set({_type: 'reference', _ref: id})),
            ...(anchor ? [at('anchor', set(anchor))] : []),
            at('href', unset()),
            at('openInNewTab', unset()),
          ]
        }
      }

      if (link.linkType === 'url') return at('linkType', set('href'))
    },
  },
})
