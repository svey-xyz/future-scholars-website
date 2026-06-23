import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
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
