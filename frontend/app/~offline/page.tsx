import type {Metadata} from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Offline',
  robots: {index: false, follow: false},
}

/**
 * Offline fallback. Precached via `additionalPrecacheEntries` in serwist.config.mjs
 * and served by the service worker when a document navigation fails with no cached
 * copy. Keep it self-contained — it must render without a network connection.
 */
export default function OfflinePage() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center text-foreground">
      <p
        className="font-mono text-sm uppercase tracking-widest"
        style={{color: 'hsl(var(--primary-accent))'}}
      >
        Offline
      </p>
      <h1 className="text-3xl font-semibold text-balance">You&rsquo;re offline</h1>
      <p className="max-w-prose text-pretty opacity-70">
        This page isn&rsquo;t available without a connection. Pages you&rsquo;ve already visited are
        cached and will still load — reconnect to see the latest content.
      </p>
      <Link
        href="/"
        className="underline underline-offset-4"
        style={{color: 'hsl(var(--primary-accent))'}}
      >
        Return home
      </Link>
    </div>
  )
}
