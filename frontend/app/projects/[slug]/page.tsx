import {Suspense, ViewTransition} from 'react'
import type {Metadata, ResolvingMetadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {draftMode} from 'next/headers'
import {ArrowLongLeftIcon, InformationCircleIcon} from '@heroicons/react/24/outline'
import {type PortableTextBlock} from 'next-sanity'

import {PortableText} from '@/app/components/portable-text'
import {ProjectMeta} from '@/app/components/projects'
import {SanityImage as Image} from '@/app/components/common'
import {Skeleton} from '@/components/ui/skeleton'
import {
  getDynamicFetchOptions,
  sanityFetch,
  sanityFetchMetadata,
  sanityFetchStaticParams,
  type DynamicFetchOptions,
} from '@/sanity/lib/live'
import {archivePageSlugQuery, projectBySlugQuery, projectSlugsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{slug: string}>
}

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const {data} = await sanityFetchStaticParams({query: projectSlugsQuery})
  return data
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const [params, {perspective}] = await Promise.all([props.params, getDynamicFetchOptions()])
  const {data: project} = await sanityFetchMetadata({
    query: projectBySlugQuery,
    params,
    perspective,
  })
  const previousImages = (await parent).openGraph?.images || []
  // Prefer the dedicated OG image; fall back to the cover image.
  const ogImage = resolveOpenGraphImage(project?.ogImage ?? project?.coverImage)

  return {
    title: project?.title,
    description: project?.excerpt ?? undefined,
    openGraph: {
      type: 'article',
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

/**
 * Empty-body fallback. The `Note` page-builder component expects an
 * `ExtractPageBuilderType<'note'>` block (and wraps itself in a `container` +
 * `Reveal`), which doesn't fit inline in the article column — so this renders a
 * lightweight, a11y-equivalent toned note directly. Tone `info`: explicit text
 * label + distinct icon, color never carries meaning alone (see docs/A11Y.md).
 */
function EmptyBodyNote() {
  return (
    <div role="note" className="not-prose rounded-md border border-border bg-card/70 p-5">
      <p className="flex items-center gap-2 text-base font-medium text-foreground">
        <InformationCircleIcon className="size-5 text-foreground" aria-hidden="true" />
        Note
      </p>
      <p className="mt-2 text-foreground">This project doesn&rsquo;t have a write-up yet.</p>
    </div>
  )
}

/**
 * Layer 1 of the three-layer pattern (see docs/CACHING.md): branch on
 * `draftMode()` only.
 */
export default async function ProjectPage(props: Props) {
  const {isEnabled: isDraftMode} = await draftMode()
  if (isDraftMode) {
    return (
      <Suspense fallback={<ProjectFallback />}>
        {/* `params` stays un-awaited here so the Suspense boundary works. */}
        <DynamicProject params={props.params} />
      </Suspense>
    )
  }
  const {slug} = await props.params
  return <CachedProject slug={slug} perspective="published" stega={false} />
}

/** Layer 2 (draft mode only): resolve request-time values, pass plain props. */
async function DynamicProject({params}: Pick<Props, 'params'>) {
  const [{slug}, {perspective, stega}] = await Promise.all([params, getDynamicFetchOptions()])
  return <CachedProject slug={slug} perspective={perspective} stega={stega} />
}

/**
 * Layer 3: cached project detail (SVE-41). Rich, accessible RSC render:
 *   - single `<h1>` title + optional excerpt;
 *   - hero cover image wrapped in the shared-element morph
 *     (`project-card-${slug}`, `share="morph"`) so the listing thumbnail morphs
 *     into this hero (see docs/TRANSITIONS.md — name preserved from SVE-40);
 *   - two-column on `md`+: the Portable-Text body (`2/3`, primary) sits beside a
 *     metadata aside (`1/3`). The DOM puts the body first (reading/SR order,
 *     primary content) and the grid is *reversed* visually so the metadata reads
 *     as a sidebar — matching the original `ProjectInfoSection` layout. Single
 *     column on mobile, body on top.
 */
async function CachedProject({slug, perspective, stega}: {slug: string} & DynamicFetchOptions) {
  'use cache'
  const [{data: project}, {data: archiveSlug}] = await Promise.all([
    sanityFetch({query: projectBySlugQuery, params: {slug}, perspective, stega}),
    // Resolve the designated projects-archive page slug for the back-link +
    // taxonomy chips. `stega: false` — the value goes into hrefs, so it must not
    // carry Visual-Editing markers (see CLAUDE.md).
    sanityFetch({
      query: archivePageSlugQuery,
      params: {archive: 'projectsArchive'},
      perspective,
      stega: false,
    }),
  ])

  if (!project?._id) {
    return notFound()
  }

  // Base path of the projects listing (e.g. `/projects`). Null when no page is
  // designated the projects archive yet — back-link + chips degrade gracefully.
  const archiveBasePath = typeof archiveSlug === 'string' ? `/${archiveSlug}` : null

  // Respect the visibility toggle: a hidden project 404s for the public, but
  // stays reachable in draft/Presentation preview so editors can review it.
  // Draft state is already encoded in `perspective` (the cached render must
  // not read request state directly), so gate on the published perspective.
  if (project.hidden && perspective === 'published') {
    return notFound()
  }

  const hasBody = Boolean(project.body?.length)

  return (
    <div className="container my-12 grid gap-12 lg:my-24">
      <article>
        <header className="mb-8 grid gap-6 border-b border-border pb-8">
          {/* Back-link to the designated projects-archive page. `nav-back` plays
              the upward/back directional slide (mirror of the card's
              `nav-forward`), matching the repo convention (see docs/TRANSITIONS.md).
              The arrow's hover nudge is `motion-safe:` only, so reduced-motion
              users get a static link. Hidden when no projects archive exists. */}
          {archiveBasePath && (
            <Link
              href={archiveBasePath}
              transitionTypes={['nav-back']}
              className="group inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <ArrowLongLeftIcon
                aria-hidden="true"
                className="size-4 transition-transform duration-300 ease-out will-change-transform motion-safe:group-hover:-translate-x-1"
              />
              All projects
            </Link>
          )}
          <div className="flex max-w-3xl flex-col gap-6">
            <h1 className="text-4xl text-foreground sm:text-5xl lg:text-7xl">{project.title}</h1>
            {project.excerpt && (
              <p className="text-lg leading-8 text-muted-foreground">{project.excerpt}</p>
            )}
          </div>
        </header>

        {project.coverImage?.asset?._ref && (
          // Shared-element morph target — MUST match the card's
          // `project-card-${slug}` name (set in `ProjectCard`/`FeaturedProjectCard`)
          // so the listing thumbnail morphs into this hero. See docs/TRANSITIONS.md.
          // Reduced motion is neutralised globally in `globals.css`.
          <ViewTransition name={`project-card-${project.slug}`} share="morph">
            <Image
              id={project.coverImage.asset._ref}
              alt={project.coverImage.alt || ''}
              className="mb-12 w-full rounded-sm"
              width={1024}
              height={538}
              mode="cover"
              hotspot={project.coverImage.hotspot}
              crop={project.coverImage.crop}
            />
          </ViewTransition>
        )}

        {/*
          Two-column on `md`+: body 2/3 + metadata 1/3, reversed (generalised
          from the original `ProjectInfoSection`'s flex-row-reverse). The body is
          declared FIRST in the DOM — primary content, so SR/reading + tab order
          hit it first — but the grid places the metadata aside in the *trailing*
          column so it reads as a visual sidebar beside the write-up. On mobile
          both stack single-column with the body on top.
        */}
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          <div className="md:col-span-2 md:row-start-1 md:pr-8">
            {hasBody ? (
              <div className="prose max-w-none dark:prose-invert">
                <PortableText
                  className="max-w-2xl prose-headings:font-medium prose-headings:tracking-tight"
                  value={project.body as PortableTextBlock[]}
                />
              </div>
            ) : (
              <EmptyBodyNote />
            )}
          </div>

          <aside
            aria-label="Project details"
            className="md:col-start-3 md:row-start-1 md:border-l md:border-border md:pl-8"
          >
            <h2 className="sr-only">Project details</h2>
            <ProjectMeta project={project} archiveBasePath={archiveBasePath} />
          </aside>
        </div>
      </article>
    </div>
  )
}

/** Draft-mode streaming fallback — mirrors the project header block, no CLS. */
function ProjectFallback() {
  return (
    <div className="container my-12 grid gap-12 lg:my-24">
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-14 w-2/3" />
        <Skeleton className="h-7 w-full" />
      </div>
    </div>
  )
}
