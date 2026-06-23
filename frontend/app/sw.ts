/// <reference lib="webworker" />
import {
  CacheableResponsePlugin,
  ExpirationPlugin,
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
    // App Router RSC payloads (client navigations / prefetch) — stale-while-revalidate.
    {
      matcher: ({request, url, sameOrigin}) =>
        sameOrigin && request.headers.get('RSC') === '1' && !url.pathname.startsWith('/api/'),
      handler: new StaleWhileRevalidate({
        cacheName: 'rsc',
        plugins: [
          new CacheableResponsePlugin({statuses: [0, 200]}),
          new ExpirationPlugin({maxEntries: 64, maxAgeSeconds: 1 * DAY}),
        ],
      }),
    },
    // HTML document navigations — stale-while-revalidate, falling back to /~offline.
    {
      matcher: ({request, url, sameOrigin}) =>
        sameOrigin && request.destination === 'document' && !url.pathname.startsWith('/api/'),
      handler: new StaleWhileRevalidate({
        cacheName: 'pages',
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
