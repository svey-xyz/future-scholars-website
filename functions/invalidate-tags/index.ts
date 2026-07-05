import {syncTagInvalidateEventHandler} from '@sanity/functions'

/**
 * Sync Tag Invalidate Function (runs on Sanity's infrastructure, Node 24).
 *
 * Fires whenever published content changes in the dataset and forwards the
 * invalidated sync tags to the Next.js app's /api/revalidate-tags route, which
 * expires the matching cache entries with `revalidateTag('sanity:<tag>', {expire: 0})`.
 * This guarantees published visitors see changes within seconds even when no
 * browser holds a live <SanityLive> connection at publish time.
 *
 * Required function env vars (set once per deployed stack):
 *   npx sanity functions env add invalidate-tags REVALIDATE_TAGS_URL https://<prod-domain>/api/revalidate-tags
 *   npx sanity functions env add invalidate-tags SANITY_REVALIDATE_TAGS_SECRET <same secret as the Next.js app>
 *
 * The `done` callback MUST complete: <SanityLive waitFor="function"> clients
 * only receive the live event after Sanity is notified the invalidation
 * finished. `done` is therefore called even when the revalidate request fails —
 * a stale-but-live page beats a page that never updates.
 */
export const handler = syncTagInvalidateEventHandler(async ({event, done}) => {
  const {syncTags} = event.data

  const url = process.env.REVALIDATE_TAGS_URL
  const secret = process.env.SANITY_REVALIDATE_TAGS_SECRET

  if (url && secret) {
    try {
      const res = await fetch(`${url}?secret=${encodeURIComponent(secret)}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({tags: syncTags}),
      })
      console.log(`Revalidated ${syncTags.length} tags, HTTP ${res.status}`)
    } catch (err) {
      console.error('Failed to call the revalidate-tags endpoint', err)
    }
  } else {
    console.warn(
      'REVALIDATE_TAGS_URL / SANITY_REVALIDATE_TAGS_SECRET not set — skipping revalidation call',
    )
  }

  try {
    // Notify Sanity that invalidation is complete — releases the event to
    // Live Content API subscribers using waitFor="function".
    const response = await done(syncTags)
    console.log('Invalidation complete, Sanity responded with HTTP', response.status)
  } catch (err) {
    console.error('Error invoking the Sanity invalidation done endpoint!', err)
  }
})
