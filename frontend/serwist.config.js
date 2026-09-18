// @ts-check
import {spawnSync} from 'node:child_process'

import {serwist} from '@serwist/next/config'

/**
 * Configurator mode (Serwist 9.4+): the service worker is built by `@serwist/cli`
 * AFTER `next build` finishes, so it is bundler-agnostic and works with Next.js 16's
 * default Turbopack build — no `--webpack` fallback required. It also lets Serwist
 * precache every prerendered route automatically.
 *
 * A revision versions the precached offline fallback so a stale copy is replaced on
 * each redeploy. `git rev-parse` may be unavailable in some CI checkouts, so fall back
 * to a random id.
 */
const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf-8'}).stdout?.trim() || crypto.randomUUID()

export default serwist({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  // Never precache prerendered HTML. Precache routes are matched BEFORE
  // `runtimeCaching`, so a precached `/` is served cache-first and the
  // NetworkFirst document rule in `app/sw.ts` never runs. That pins visitors to
  // the build's HTML (stale Sanity content until the SW updates) and, on
  // localhost, serves an old production shell to `next dev` — whose chunks and
  // build ID don't match the dev server, so the router hard-reloads, the SW
  // serves the same shell again, and the page loops. Documents go through the
  // NetworkFirst rule instead; `/~offline` is the only precached page.
  precachePrerendered: false,
  additionalPrecacheEntries: [{url: '/~offline', revision}],
})
