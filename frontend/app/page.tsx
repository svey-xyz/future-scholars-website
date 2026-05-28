import {Suspense} from 'react'
import Link from 'next/link'
import {PortableText} from '@portabletext/react'
import {ArrowTopRightOnSquareIcon} from '@heroicons/react/24/outline'

import {AllPosts} from '@/app/components/Posts'
import GetStartedCode from '@/app/components/GetStartedCode'
import SideBySideIcons from '@/app/components/SideBySideIcons'
import {Button} from '@/components/ui/button'
import {Skeleton} from '@/components/ui/skeleton'
import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {dataAttr} from '@/sanity/lib/utils'

function PostsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-5 w-80 max-w-full" />
      <div className="space-y-6 pt-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  )
}

export default async function Page() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  return (
    <>
      <section className="bg-background">
        <div className="container">
          <div className="relative mx-auto flex min-h-[40vh] max-w-2xl flex-col items-center justify-center space-y-6 pt-10 pb-30 lg:max-w-4xl lg:px-12 xl:pt-20">
            <div className="flex flex-col items-center gap-4">
              <div className="text-md prose bg-muted text-muted-foreground font-mono leading-6 uppercase italic px-3 py-1">
                A starter template for
              </div>
              <h1 className="text-5xl font-bold tracking-tighter text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
                <Link
                  className="underline decoration-foreground underline-offset-8 transition-all ease-out hover:text-foreground/80 hover:underline-offset-4"
                  href="https://sanity.io/"
                >
                  Sanity
                </Link>
                +
                <Link
                  className="underline decoration-foreground underline-offset-8 transition-all ease-out hover:text-foreground/80 hover:underline-offset-4"
                  href="https://nextjs.org/"
                >
                  Next.js
                </Link>
              </h1>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <SideBySideIcons />
          <div className="container relative mx-auto flex max-w-2xl flex-col items-center space-y-6 pt-10 pb-20 lg:max-w-4xl lg:px-12">
            <div className="prose sm:prose-lg md:prose-xl xl:prose-2xl text-foreground prose-a:text-foreground font-light text-center dark:prose-invert">
              {settings?.description && (
                <div
                  data-sanity={dataAttr({
                    id: settings._id,
                    type: 'settings',
                    path: 'description',
                  }).toString()}
                >
                  <PortableText value={settings.description} />
                </div>
              )}
              <div className="flex flex-col items-center gap-4">
                <GetStartedCode />
                <Button asChild variant="link" size="sm">
                  <a
                    href="https://www.sanity.io/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Sanity Documentation
                    <ArrowTopRightOnSquareIcon aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-border bg-muted/40">
        <div className="container">
          <aside className="py-12 sm:py-20">
            <Suspense fallback={<PostsSkeleton />}>
              <AllPosts />
            </Suspense>
          </aside>
        </div>
      </section>
    </>
  )
}
