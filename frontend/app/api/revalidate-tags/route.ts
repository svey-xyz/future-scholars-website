import {revalidateTag} from 'next/cache'
import {timingSafeEqual} from 'node:crypto'

/**
 * On-demand cache invalidation endpoint, called by the `invalidate-tags`
 * Sanity Function (see /functions/invalidate-tags) whenever published content
 * changes. Expires every affected cache entry immediately (`{expire: 0}`), so
 * published visitors get fresh content on their next request — with
 * <SanityLive waitFor="function"> they are also pushed a refresh as soon as
 * this endpoint has run.
 *
 * Auth: shared secret in the `?secret=` query param, compared in constant
 * time. Set SANITY_REVALIDATE_TAGS_SECRET here (Vercel env) and on the
 * deployed function (`npx sanity functions env add …`).
 */
export async function POST(request: Request) {
  const expectedSecret = process.env.SANITY_REVALIDATE_TAGS_SECRET
  const secret = new URL(request.url).searchParams.get('secret')

  if (!expectedSecret) {
    return Response.json({error: 'Server configuration error'}, {status: 500})
  }

  const expectedSecretBuffer = Buffer.from(expectedSecret)
  const secretBuffer = Buffer.from(secret ?? '')

  if (
    expectedSecretBuffer.length !== secretBuffer.length ||
    !timingSafeEqual(expectedSecretBuffer, secretBuffer)
  ) {
    return Response.json({error: 'Unauthorized'}, {status: 401})
  }

  const {tags} = (await request.json()) as {tags?: string[]}

  if (!Array.isArray(tags) || !tags.every((tag) => typeof tag === 'string')) {
    return Response.json({error: '`tags` must be an array of strings'}, {status: 400})
  }

  for (const tag of tags) {
    // `sanityFetch` from `next-sanity/live` prefixes its cache tags with
    // `sanity:`, so the same prefix is required here.
    revalidateTag(`sanity:${tag}`, {expire: 0})
  }

  return Response.json({revalidated: tags})
}
