import type {Metadata} from 'next'
import Link from 'next/link'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'
import {stegaClean} from '@sanity/client/stega'
import {Suspense} from 'react'

import {Breadcrumbs, SanityImage as Image} from '@/app/components/common'
import {Masthead, PageTitle} from '@/app/components/layout'
import {PortableText} from '@/app/components/portable-text'
import {JsonLd, breadcrumbJsonLd, type BreadcrumbItem} from '@/app/components/seo'
import {buttonVariants} from '@/components/ui/button'
import {Skeleton} from '@/components/ui/skeleton'
import {cn} from '@/lib/utils'
import {
  getDynamicFetchOptions,
  sanityFetch,
  sanityFetchMetadata,
  sanityFetchStaticParams,
  type DynamicFetchOptions,
} from '@/sanity/lib/live'
import {programQuery, programSlugsQuery, settingsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import type {ProgramQueryResult} from '@/sanity.types'

/**
 * FSMA fork (build plan S8): `/programs/[slug]` — one route for the Infants,
 * Toddlers and Casa `program` documents.
 *
 * The **index** is deliberately *not* a route here. `/programs` is an ordinary
 * `page` document served by `app/[slug]` (programs grid + music + before/after
 * care sections, all editor-arranged). An `app/programs/page.tsx` would shadow
 * it and take that page away from the editor, so this folder holds only the
 * dynamic segment.
 */

type Props = {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const {data} = await sanityFetchStaticParams({query: programSlugsQuery})
  // Cache Components rejects an empty param list; same placeholder guard as
  // the hidden template routes (plan Q20). `CachedProgram` 404s it.
  return data.length > 0 ? data : [{slug: '__placeholder__'}]
}

/** The trail rendered visually *and* as `BreadcrumbList` — one source. */
function trail(program: Pick<NonNullable<ProgramQueryResult>, 'name' | 'slug' | 'parentName'>) {
  return [
    {name: 'Home', path: '/'},
    {name: program.parentName || 'Programs', path: '/programs'},
    {name: program.name, path: `/programs/${stegaClean(program.slug)}`},
  ] satisfies BreadcrumbItem[]
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const [params, {perspective}] = await Promise.all([props.params, getDynamicFetchOptions()])
  const [{data: program}, {data: settings}] = await Promise.all([
    sanityFetchMetadata({query: programQuery, params, perspective}),
    sanityFetchMetadata({query: settingsQuery, perspective}),
  ])
  if (!program?._id) return {}

  const path = `/programs/${params.slug}`
  // Program card image first, then the site-wide share image — set explicitly
  // because Next drops the parent's `openGraph` once a child sets one (§12).
  const ogImage = resolveOpenGraphImage(program.image) ?? resolveOpenGraphImage(settings?.ogImage)

  return {
    title: program.name,
    description: program.summary,
    alternates: {canonical: path},
    openGraph: {
      title: program.name,
      description: program.summary,
      type: 'website',
      url: path,
      ...(ogImage ? {images: [ogImage]} : {}),
    },
  } satisfies Metadata
}

/** Layer 1 (docs/CACHING.md): branch on `draftMode()` only. */
export default async function ProgramPage(props: Props) {
  const {isEnabled: isDraftMode} = await draftMode()
  if (isDraftMode) {
    return (
      <Suspense fallback={<ProgramFallback />}>
        <DynamicProgram params={props.params} />
      </Suspense>
    )
  }
  const {slug} = await props.params
  return <CachedProgram slug={slug} perspective="published" stega={false} />
}

/** Layer 2 (draft mode only): resolve request-time values, pass plain props. */
async function DynamicProgram({params}: Pick<Props, 'params'>) {
  const [{slug}, {perspective, stega}] = await Promise.all([params, getDynamicFetchOptions()])
  return <CachedProgram slug={slug} perspective={perspective} stega={stega} />
}

/** Layer 3: cached program render. */
async function CachedProgram({slug, perspective, stega}: {slug: string} & DynamicFetchOptions) {
  'use cache'
  const {data: program} = await sanityFetch({
    query: programQuery,
    params: {slug},
    perspective,
    stega,
  })

  if (!program?._id) return notFound()

  // Structured data is crawler-facing: published perspective, never stega —
  // the same rule the post route follows.
  const [{data: settings}, {data: published}] = await Promise.all([
    sanityFetchMetadata({query: settingsQuery, perspective: 'published'}),
    perspective === 'published' && !stega
      ? Promise.resolve({data: program})
      : sanityFetchMetadata({query: programQuery, params: {slug}, perspective: 'published'}),
  ])
  const breadcrumbLd = published?._id ? breadcrumbJsonLd(trail(published), settings) : null

  const facts = [
    {term: 'Ages', value: program.ageRange},
    {term: 'Teacher-to-child ratio', value: program.ratio},
    {term: 'Classroom', value: program.classroomName && `${program.classroomName} room`},
    {term: 'Hours', value: program.scheduleNote},
  ].filter((f): f is {term: string; value: string} => Boolean(f.value))

  const imageRef = program.image?.asset?._ref
  const siblings = program.siblings ?? []

  return (
    <>
      {breadcrumbLd && <JsonLd data={breadcrumbLd} />}
      <div className={program.masthead ? 'mb-12 lg:mb-24' : 'my-12 lg:my-24'}>
        {/* The masthead owns the visual h1 (S5); without one, PageTitle does. */}
        {program.masthead ? (
          <Masthead
            masthead={program.masthead}
            heading={program.name}
            subheading={program.ageRange}
          />
        ) : (
          <PageTitle heading={program.name} subheading={program.ageRange} />
        )}

        <div className="container">
          <Breadcrumbs items={trail(program)} className="mt-6 lg:mt-8" />

          <div className="mt-8 grid gap-12 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
            <div className="min-w-0">
              {program.summary && (
                <p className="max-w-[65ch] text-xl leading-9 text-pretty text-foreground">
                  {program.summary}
                </p>
              )}
              {program.body?.length ? (
                <PortableText
                  className="mt-8 max-w-[65ch]"
                  value={program.body as PortableTextBlock[]}
                />
              ) : null}
            </div>

            {/* Complementary, not navigation: the facts a parent scans for. */}
            <aside aria-labelledby="program-facts" className="flex flex-col gap-6 self-start">
              {imageRef ? (
                <Image
                  id={imageRef}
                  alt={program.image?.alt || ''}
                  width={640}
                  height={427}
                  mode="cover"
                  hotspot={program.image?.hotspot}
                  crop={program.image?.crop}
                  sizes="(min-width: 1024px) 20rem, 100vw"
                  className="aspect-[3/2] w-full rounded-xl object-cover"
                />
              ) : null}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 id="program-facts" className="text-lg">
                  At a glance
                </h2>
                <dl className="mt-4 grid gap-4">
                  {facts.map((fact) => (
                    <div key={fact.term}>
                      <dt className="text-sm font-medium text-muted-foreground">{fact.term}</dt>
                      <dd className="mt-0.5 text-base text-pretty">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>

          <section
            aria-labelledby="program-tour"
            className="mt-16 rounded-xl bg-secondary px-6 py-10 text-secondary-foreground sm:px-10 lg:mt-24"
          >
            <h2 id="program-tour" className="text-2xl md:text-3xl">
              Book a tour
            </h2>
            <p className="mt-3 max-w-[60ch] text-lg leading-8">
              See the {program.classroomName ? `${program.classroomName} room` : program.name} in
              person, and ask us anything about the {program.name} program.
            </p>
            <Link
              href="/about#book-a-tour"
              transitionTypes={['nav-forward']}
              className={cn(
                buttonVariants({size: 'lg'}),
                'mt-6 min-h-11 focus-visible:ring-2 focus-visible:ring-offset-2',
              )}
            >
              How to book a tour
            </Link>
          </section>

          {siblings.length > 0 && (
            <nav aria-labelledby="program-siblings" className="mt-16 lg:mt-24">
              <h2 id="program-siblings" className="text-2xl md:text-3xl">
                Other programs
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {siblings.map((s) => (
                  <li key={s._id}>
                    <Link
                      href={`/programs/${stegaClean(s.slug)}`}
                      transitionTypes={['nav-forward']}
                      className="flex min-h-11 flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <span className="font-display text-lg text-primary">{s.name}</span>
                      <span className="text-sm text-muted-foreground">{s.ageRange}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </>
  )
}

/** Draft-mode streaming fallback — mirrors the compact masthead, no CLS. */
function ProgramFallback() {
  return <Skeleton className="h-[26vh] min-h-52 w-full rounded-none lg:h-[34vh] lg:min-h-64" />
}
