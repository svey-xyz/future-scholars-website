/// <reference lib="webworker" />
import {
  CacheableResponsePlugin,
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  Serwist,
  StaleWhileRevalidate,
  type PrecacheEntry,
  type SerwistGlobalConfig,
} from 'serwist'

// `injectionPoint` placeholder — replaced at build time with the precache manifest
// (build assets + prerendered routes + `additionalPrecacheEntries`).
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const DAY = 60 * 60 * 24

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  // SWR ignores the navigation preload response, so don't pay for it.
  navigationPreload: false,
  runtimeCaching: [
    // Sanity image CDN + Next.js image optimizer — stale-while-revalidate.
    {
      matcher: ({url, sameOrigin}) =>
        url.hostname === 'cdn.sanity.io' || (sameOrigin && url.pathname.startsWith('/_next/image')),
      handler: new StaleWhileRevalidate({
        cacheName: 'sanity-images',
        plugins: [
          new CacheableResponsePlugin({statuses: [0, 200]}),
          new ExpirationPlugin({maxEntries: 128, maxAgeSeconds: 30 * DAY}),
        ],
      }),
    },
    // Same-origin static assets NOT covered by the immutable `/_next/static`
    // precache — e.g. PWA icons in `/public/icons`, and any other public
    // images/fonts. CacheFirst so they resolve instantly and remain available
    // fully offline. (`/_next/*` is excluded: build chunks are precached and
    // `/_next/image` is handled by the image rule above.)
    {
      matcher: ({url, sameOrigin, request}) =>
        sameOrigin &&
        request.method === 'GET' &&
        !url.pathname.startsWith('/_next/') &&
        /\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?)$/i.test(url.pathname),
      handler: new CacheFirst({
        cacheName: 'static-assets',
        plugins: [
          new CacheableResponsePlugin({statuses: [0, 200]}),
          new ExpirationPlugin({maxEntries: 64, maxAgeSeconds: 30 * DAY}),
        ],
      }),
    },
    // App Router RSC payloads (client navigations / prefetch) — network-first.
    // RSC output is build-coupled (its module graph must match the live client
    // chunks). StaleWhileRevalidate would hand a freshly-deployed client a stale
    // RSC payload referencing chunk hashes that no longer exist → failed flight
    // fetch / nav. NetworkFirst keeps online navigations on the current build;
    // the cache is consulted only as an offline fallback.
    {
      matcher: ({request, url, sameOrigin}) =>
        sameOrigin && request.headers.get('RSC') === '1' && !url.pathname.startsWith('/api/'),
      handler: new NetworkFirst({
        cacheName: 'rsc-v2',
        networkTimeoutSeconds: 5,
        plugins: [
          new CacheableResponsePlugin({statuses: [0, 200]}),
          new ExpirationPlugin({maxEntries: 64, maxAgeSeconds: 1 * DAY}),
        ],
      }),
    },
    // HTML document navigations — network-first, falling back to cache → /~offline.
    // CRITICAL: a cached document references content-hashed JS chunks. Serving a
    // stale document after a redeploy (chunks re-hashed, old ones purged from the
    // CDN) makes those chunks 404, so React never hydrates — the page paints but
    // all client interactivity is dead. iOS Safari keeps the SW + caches alive
    // aggressively, so it's the worst hit. NetworkFirst guarantees an online
    // visitor always gets the current build's HTML matched to its live chunks.
    {
      matcher: ({request, url, sameOrigin}) =>
        sameOrigin && request.destination === 'document' && !url.pathname.startsWith('/api/'),
      handler: new NetworkFirst({
        cacheName: 'pages-v2',
        networkTimeoutSeconds: 5,
        plugins: [
          new CacheableResponsePlugin({statuses: [0, 200]}),
          new ExpirationPlugin({maxEntries: 64, maxAgeSeconds: 1 * DAY}),
        ],
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher: ({request}) => request.destination === 'document',
      },
    ],
  },
})

serwist.addEventListeners()
