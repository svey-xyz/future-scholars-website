import type {NextConfig} from 'next'
import {sanity} from 'next-sanity/live/cache-life'

const nextConfig: NextConfig = {
  // Cache Components: `sanityFetch` runs inside explicit `'use cache'`
  // boundaries (three-layer pattern — see docs/CACHING.md). The `sanity`
  // cacheLife preset makes on-demand revalidation (Sanity Live + the
  // invalidate-tags Function) the only invalidation path instead of the
  // default 15-minute time-based revalidation.
  cacheComponents: true,
  cacheLife: {default: sanity},
  // Emit browser source maps in production so first-party stack traces are
  // debuggable (satisfies Lighthouse's valid-source-maps best-practice).
  productionBrowserSourceMaps: true,
  // Dev-only: let the dev server serve its internal `/_next/*` chunks, HMR
  // socket, and RSC payloads to non-localhost origins — e.g. a phone hitting
  // http://<LAN-IP>:3000 on the same Wi-Fi. Next 16 blocks those cross-origin
  // dev requests with a 403 by default, so the client bundle never loads and
  // the page renders but never hydrates (no interactivity, no client-only
  // components). Wildcards match the IP as dotted segments. Covers the common
  // private IPv4 ranges; this setting has no effect on production builds.
  allowedDevOrigins: [
    // Tailscale Serve origin (stable MagicDNS host) — primary on-device test URL,
    // served over HTTPS so service workers register on the phone. The tailnet
    // wildcard also covers any other machine/serve name on this tailnet.
    'scone.cormorant-bramble.ts.net',
    '*.cormorant-bramble.ts.net',
    // LAN-IP fallback (common private ranges) for direct http://<ip>:3000 access.
    '192.168.*.*',
    '10.*.*.*',
    '172.*.*.*',
  ],
  env: {
    // Matches the behavior of `sanity dev` which sets styled-components to use the fastest way of inserting CSS rules in both dev and production. It's default behavior is to disable it in dev mode.
    SC_DISABLE_SPEEDY: 'false',
  },
  experimental: {
    // Enables React's <ViewTransition> integration so route navigations,
    // Suspense reveals, and shared-element morphs animate. See docs/TRANSITIONS.md.
    viewTransition: true,
  },
  images: {
    remotePatterns: [new URL('https://cdn.sanity.io/**')],
  },
  async headers() {
    return [
      {
        // Always revalidate the service worker so clients pick up new deployments.
        source: '/sw.js',
        headers: [
          {key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate'},
          {key: 'Content-Type', value: 'application/javascript; charset=utf-8'},
        ],
      },
    ]
  },
}

export default nextConfig
