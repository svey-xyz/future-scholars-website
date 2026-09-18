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
    // Tailscale Serve origin (stable MagicDNS host) — primary on-device test URL.
    // The tailnet wildcard also covers any other machine/serve name on it.
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
  // Legacy URL map (build plan §6). The site it replaces is a ~2010 static
  // site with `.htm` extensions, and those URLs are what the web has indexed
  // and linked for fifteen years — every one of them has to land on its
  // successor rather than a 404, in one hop, permanently.
  //
  // `/home` is not a legacy URL: `settings.homepage` designates the `page`
  // document with that slug, so `app/[slug]` served the homepage a second
  // time at `/home`. Two URLs for one page splits ranking signals and is the
  // kind of thing that quietly survives to launch, so it is redirected here
  // and excluded from `generateStaticParams`/`sitemap` in the GROQ
  // (`pagesSlugs`, `sitemapData`).
  async redirects() {
    const legacy: {from: string; to: string}[] = [
      {from: '/index.html', to: '/'},
      {from: '/index.htm', to: '/'},
      {from: '/maria.htm', to: '/montessori'},
      {from: '/programs.htm', to: '/programs'},
      {from: '/infant-class.htm', to: '/programs/infants'},
      {from: '/toddler-class.htm', to: '/programs/toddlers'},
      {from: '/casa-class.htm', to: '/programs/casa'},
      {from: '/testamonials.htm', to: '/testimonials'}, // legacy spelling, sic
      {from: '/pictures.htm', to: '/gallery'},
      {from: '/about.htm', to: '/about'},
      {from: '/admissions.htm', to: '/about#admissions'},
      {from: '/contact.htm', to: '/about#contact'},
      {from: '/parents.htm', to: '/about'},
      {from: '/links.htm', to: '/'},
    ]

    // `statusCode: 301` rather than `permanent: true`, which emits **308**.
    // Modern crawlers treat the two alike, but these URLs have been indexed
    // and bookmarked since ~2010 and the long tail pointing at them — old
    // directory listings, link checkers, feed readers — predates 308 (RFC
    // 7538, 2015). 301 is what every one of them understands, and it is what
    // build plan D3 specifies.
    return [
      ...legacy.map(({from, to}) => ({source: from, destination: to, statusCode: 301})),
      {source: '/home', destination: '/', statusCode: 301},
    ]
  },
}

export default nextConfig
