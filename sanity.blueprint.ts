import {defineBlueprint, defineSyncTagInvalidateFunction} from '@sanity/blueprints'

/**
 * Sanity Blueprint — declares server-side resources deployed to Sanity's
 * infrastructure with `npx sanity blueprints deploy` (run from repo root).
 *
 * `invalidate-tags` is a Sync Tag Invalidate Function: Content Lake calls it
 * whenever published content changes, and it forwards the sync tags to the
 * Next.js app's /api/revalidate-tags endpoint so cached pages are expired
 * even when no visitor has a live <SanityLive> connection open.
 * Docs: https://www.sanity.io/docs/functions/sync-tag-function-quickstart
 *
 * Only ONE sync-tag-invalidate function may exist per dataset (multiple cause
 * race conditions), hence the explicit dataset scoping below.
 */
export default defineBlueprint({
  resources: [
    defineSyncTagInvalidateFunction({
      name: 'invalidate-tags',
      event: {
        resource: {
          type: 'dataset',
          // <projectId>.<dataset>
          id: 'h52u3jiw.production',
        },
      },
    }),
  ],
})
