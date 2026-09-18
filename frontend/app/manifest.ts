import type {MetadataRoute} from 'next'
import {toPlainText} from 'next-sanity'

import {SITE_NAME} from '@/app/components/seo'
import {sanityFetchMetadata} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'

// Mirrors --primary (hsl(232 52% 32%)) in app/globals.css and the `themeColor`
// in app/layout.tsx — keep the three in step.
const THEME_COLOR = '#27327C'
// --background (hsl(38 40% 97%)), so the splash screen matches the page.
const BACKGROUND_COLOR = '#FAF8F4'
const SHORT_NAME = 'Future Scholars'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // Metadata-route fetch ('use cache' lives in the helper): always published
  // content, never stega.
  const {data: settings} = await sanityFetchMetadata({
    query: settingsQuery,
    perspective: 'published',
  })

  const name = settings?.title || SITE_NAME
  const description = settings?.description ? toPlainText(settings.description) : undefined

  return {
    // Plain web manifest (home-screen icon + name). No service worker: this is
    // a static marketing site, so it opens in the browser rather than standalone.
    name,
    short_name: SHORT_NAME,
    description,
    start_url: '/',
    display: 'browser',
    background_color: BACKGROUND_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      {src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
      {src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
      {
        src: '/icons/maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
