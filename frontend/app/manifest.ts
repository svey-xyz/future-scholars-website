import type {MetadataRoute} from 'next'
import {toPlainText} from 'next-sanity'

import * as demo from '@/sanity/lib/demo'
import {sanityFetchMetadata} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'

// Mirrors --primary-accent (hsl(20 100% 50%)) declared in app/globals.css.
const THEME_COLOR = '#ff5500'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // Metadata-route fetch ('use cache' lives in the helper): the installed-PWA
  // manifest is always published content, never stega.
  const {data: settings} = await sanityFetchMetadata({
    query: settingsQuery,
    perspective: 'published',
  })

  const name = settings?.title || demo.title
  const description = toPlainText(settings?.description || demo.description)

  return {
    // Stable identity + scope so the installed app stays the same PWA across
    // deploys and the service worker controls every in-app navigation.
    id: '/',
    scope: '/',
    name,
    short_name: name,
    description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
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
