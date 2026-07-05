import {sanityFetch, type DynamicFetchOptions} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'

/**
 * Shared cached settings fetch. Header, Footer, and the home page all need
 * the `settings` singleton — a single `'use cache'` helper means they share
 * one cache entry (per perspective/stega pair) instead of fetching
 * independently. Request-time state must be resolved by the caller (via
 * `getDynamicFetchOptions`) and passed in — see docs/CACHING.md.
 */
export async function getSettings({perspective, stega}: DynamicFetchOptions) {
  'use cache'
  const {data} = await sanityFetch({query: settingsQuery, perspective, stega})
  return data
}
