import {at, defineMigration, set} from 'sanity/migrate'

/**
 * `program.accent` moved from a room enum to a picked hex colour (FB5 v2).
 * Rewrites the three enum values to the colours they rendered as; hex values
 * are left alone. The frontend and the Studio input both read the old values
 * until this has run, so order doesn't matter.
 *
 *   cd studio
 *   npx sanity migration run accent-to-hex                 # dry run
 *   npx sanity migration run accent-to-hex --no-dry-run
 */

const HEX: Record<string, string> = {
  roses: '#bd000d',
  shamrock: '#55ba0d',
  violet: '#2222d8',
}

export default defineMigration({
  title: 'Program accent: room enum → hex colour',
  documentTypes: ['program'],

  migrate: {
    document(doc) {
      const accent = typeof doc.accent === 'string' ? HEX[doc.accent] : undefined
      return accent ? at('accent', set(accent)) : undefined
    },
  },
})
