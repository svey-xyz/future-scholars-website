import './globals.css'

import {SerwistProvider} from '@serwist/next/react'
import {SpeedInsights} from '@vercel/speed-insights/next'
import type {Metadata, Viewport} from 'next'
import {Inter, IBM_Plex_Mono, Outfit} from 'next/font/google'
import {draftMode} from 'next/headers'
import {toPlainText} from 'next-sanity'
import {VisualEditing} from 'next-sanity/visual-editing'
import {ThemeProvider} from '@teispace/next-themes'
import {getThemeScript} from '@teispace/next-themes/server'
import {Suspense} from 'react'

import {Toaster} from '@/components/ui/sonner'
import {BackToTop, Footer, Header} from '@/app/components/layout'
import {SiteJsonLd} from '@/app/components/seo'
import {PageTransition, RevealObserver} from '@/app/components/motion'
import {DraftModeToast} from '@/app/components/visual-editing'
import * as demo from '@/sanity/lib/demo'
import {getDynamicFetchOptions, sanityFetchMetadata, SanityLive} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import {handleError} from '@/app/client-utils'

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
  // Metadata is never stega-encoded, but perspective must still resolve so
  // Presentation Tool can preview drafts/releases in a standalone window.
  const {perspective} = await getDynamicFetchOptions()
  const {data: settings} = await sanityFetchMetadata({query: settingsQuery, perspective})
  const title = settings?.title || demo.title
  const description = settings?.description || demo.description

  const ogImage = resolveOpenGraphImage(settings?.ogImage)
  let metadataBase: URL | undefined = undefined
  try {
    metadataBase = settings?.ogImage?.metadataBase
      ? new URL(settings.ogImage.metadataBase)
      : undefined
  } catch {
    // ignore
  }
  return {
    metadataBase,
    applicationName: title,
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: toPlainText(description),
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title,
    },
    formatDetection: {telephone: false},
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  }
}

// Light-only site (D14): one theme colour, mirroring --primary in app/globals.css.
export const viewport: Viewport = {
  themeColor: '#27327C',
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

// Headings (§7.3). Loaded with next/font so it is self-hosted and preloaded —
// no Google Fonts request at runtime.
const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
})

// Static anti-FOUC theme script rendered in <head>, so it runs before any body
// pixels paint regardless of streaming order. No `initialTheme`: reading the
// theme cookie via `getTheme()` would make the whole shell dynamic under
// Cache Components — the script resolves the stored/system theme client-side
// pre-paint instead. Options must mirror the <ThemeProvider> below.
// FSMA: the site is light-only (D14). `forcedTheme` makes the provider a no-op,
// and the pre-paint script must be given the SAME options or the first paint
// disagrees with it. The dark tokens stay defined in globals.css.
const themeScript = getThemeScript({
  attribute: 'class',
  defaultTheme: 'light',
  forcedTheme: 'light',
  enableSystem: false,
})

export default async function RootLayout({children}: {children: React.ReactNode}) {
  // `draftMode()` is the one dynamic API a top-level layout may await without
  // shrinking the static shell (Next.js bypasses caching when it's enabled).
  const {isEnabled: isDraftMode} = await draftMode()

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-FOUC: apply the theme class before first paint (see above). */}
        <script dangerouslySetInnerHTML={{__html: themeScript}} />
      </head>
      <body className="bg-background text-foreground antialiased relative min-h-screen h-fit w-full overflow-x-hidden flex flex-col">
        {/* Pre-paint: opt into the JS scroll-reveal fallback ONLY on engines that
            lack CSS scroll-driven animations and when motion is allowed. Runs
            before first paint so the fallback's initial hidden state never
            flashes; supported / reduced-motion / no-JS users are untouched. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!CSS.supports('animation-timeline: view()'))document.documentElement.setAttribute('data-reveal-js','')}catch(e){}",
          }}
        />
        <SerwistProvider
          swUrl="/sw.js"
          disable={process.env.NODE_ENV === 'development'}
          // Don't force a full reload when the network returns — it would discard
          // in-progress form input / scroll. Content still refreshes live via
          // <SanityLive>, and the SW updates itself on the next navigation.
          reloadOnOnline={false}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
            noScript
          >
            <section className="min-h-screen flex flex-col grow max-w-full pt-24">
              {/* The <Toaster> component is responsible for rendering toast notifications used in /app/client-utils.ts and /app/components/DraftModeToast.tsx */}
              <Toaster />
              {isDraftMode && (
                <>
                  <DraftModeToast />
                  {/*  Enable Visual Editing, only to be rendered when Draft Mode is enabled */}
                  <VisualEditing />
                </>
              )}
              {/* The <SanityLive> component is responsible for making all sanityFetch calls in your application live, so should always be rendered.
                  `waitFor="function"` (production only): live events are held back
                  until the `invalidate-tags` Sanity Function has expired the
                  affected cache tags, so a client-triggered refresh never re-reads
                  a stale cache. See docs/CACHING.md. */}
              <SanityLive
                onError={handleError}
                includeDrafts={isDraftMode}
                waitFor={process.env.VERCEL_ENV === 'production' ? 'function' : undefined}
              />
              {/* Scroll-reveal fallback for engines without CSS scroll timelines. */}
              <RevealObserver />
              {/* Site-wide WebSite/Organization structured data (published
                  perspective always — see SiteJsonLd). Suspense-wrapped: draft
                  mode bypasses 'use cache', so under Presentation the fetch
                  runs uncached and must not block the layout shell. No
                  fallback needed — it renders a <script>, nothing visual. */}
              <Suspense>
                <SiteJsonLd />
              </Suspense>
              {/* Header/Footer are cached components (three-layer pattern, see
                  docs/CACHING.md): statically cached on the published perspective;
                  in draft mode a dynamic wrapper resolves perspective/stega from
                  the request inside a Suspense boundary. */}
              {isDraftMode ? (
                <Suspense fallback={<HeaderFallback />}>
                  <DynamicHeader />
                </Suspense>
              ) : (
                <Header perspective="published" stega={false} />
              )}
              <main className="relative flex flex-col grow max-w-full items-center justify-center overflow-x-clip">
                <PageTransition>{children}</PageTransition>
              </main>
              {isDraftMode ? (
                <Suspense>
                  <DynamicFooter />
                </Suspense>
              ) : (
                <Footer perspective="published" stega={false} />
              )}
              {/* Back-to-top affordance — fixed island, outside <main>, inside the theme provider. */}
              <BackToTop />
            </section>
          </ThemeProvider>
        </SerwistProvider>
        {/* Speed Insights only resolves on Vercel; mounting it elsewhere 404s
            `/_vercel/speed-insights/script.js` and logs a console error. */}
        {process.env.VERCEL && <SpeedInsights />}
      </body>
    </html>
  )
}

/** Draft-mode-only dynamic wrappers (layer 2): resolve request state, pass plain props. */
async function DynamicHeader() {
  const {perspective, stega} = await getDynamicFetchOptions()
  return <Header perspective={perspective} stega={stega} />
}

async function DynamicFooter() {
  const {perspective, stega} = await getDynamicFetchOptions()
  return <Footer perspective={perspective} stega={stega} />
}

/**
 * Draft-mode Suspense fallback: the same fixed, height-reserved header shell
 * (layout already reserves `pt-24`), so streaming in the real header causes no
 * layout shift.
 */
function HeaderFallback() {
  return (
    <header
      aria-hidden="true"
      className="app-header fixed inset-x-0 top-0 z-40 h-24 flex items-center bg-background/80 backdrop-blur-lg"
      style={{viewTransitionName: 'site-header'}}
    />
  )
}
