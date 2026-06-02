import './globals.css'

import {SpeedInsights} from '@vercel/speed-insights/next'
import type {Metadata} from 'next'
import {Inter, IBM_Plex_Mono} from 'next/font/google'
import {draftMode} from 'next/headers'
import {toPlainText} from 'next-sanity'
import {VisualEditing} from 'next-sanity/visual-editing'
import {ThemeProvider} from '@teispace/next-themes'
import {getTheme} from '@teispace/next-themes/server'

import {Toaster} from '@/components/ui/sonner'
import DraftModeToast from '@/app/components/DraftModeToast'
import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'
import PageTransition from '@/app/components/PageTransition'
import RevealObserver from '@/app/components/RevealObserver'
import * as demo from '@/sanity/lib/demo'
import {sanityFetch, SanityLive} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import {handleError} from '@/app/client-utils'

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
    // Metadata should never contain stega
    stega: false,
  })
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
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: toPlainText(description),
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  }
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
})

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {isEnabled: isDraftMode} = await draftMode()
  const initialTheme = (await getTheme()) ?? undefined

  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          initialTheme={initialTheme}
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
            {/* The <SanityLive> component is responsible for making all sanityFetch calls in your application live, so should always be rendered. */}
            <SanityLive onError={handleError} />
            {/* Scroll-reveal fallback for engines without CSS scroll timelines. */}
            <RevealObserver />
            <Header />
						<main className="relative flex flex-col grow max-w-full items-center justify-center">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </section>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
