import Link from 'next/link'
import {ArrowTopRightOnSquareIcon, CodeBracketIcon} from '@heroicons/react/24/outline'

import DateComponent from '@/app/components/Date'
import {Badge, badgeVariants} from '@/components/ui/badge'
import {cn} from '@/lib/utils'
import type {ProjectBySlugQueryResult} from '@/sanity.types'

type Project = NonNullable<ProjectBySlugQueryResult>

/**
 * One `<dt>`/`<dd>` pair in the metadata description list. **Auto-hides when
 * empty** — generalised from the old `ProjectInfoSection`, which returned `null`
 * when it had nothing to render. A row only emits markup when it has children;
 * an empty/falsy child collapses the whole row to `null` so the `<dl>` never
 * carries dangling labels (e.g. no "Repository" `<dt>` when `repo` is unset).
 */
function ProjectMetaRow({label, children}: {label: string; children?: React.ReactNode}) {
  // `children` is intentionally checked for emptiness: callers pass the resolved
  // value (or a falsy value when absent). React renders `false`/`null`/`undefined`
  // as nothing, but we want the *label* gone too — so we gate on truthiness here.
  if (children === null || children === undefined || children === false) return null
  // Empty arrays (e.g. an empty `tech` list) shouldn't render a row either.
  if (Array.isArray(children) && children.length === 0) return null

  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  )
}

/**
 * Strip the scheme + leading `www.` (and any trailing slash) for a clean,
 * scannable link label, while the full URL is preserved in `href`.
 * `https://www.example.com/` → `example.com`.
 */
function prettyUrl(url: string): string {
  return url
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '')
}

/**
 * External link with the repo `/CLAUDE.md` + `docs/A11Y.md` contract:
 * `target="_blank"` always paired with `rel="noopener noreferrer"`, a leading
 * (decorative, `aria-hidden`) icon, the pretty display label, and a
 * visually-hidden "(opens in new tab)" cue so the new-tab behaviour isn't
 * conveyed by icon alone.
 */
function ExternalMetaLink({
  href,
  label,
  Icon,
}: {
  href: string
  label: string
  Icon: React.ComponentType<{className?: string}>
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 break-all text-foreground underline decoration-foreground/40 underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span>{prettyUrl(label)}</span>
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  )
}

/**
 * A taxonomy chip (tag / tech) that deep-links to the filtered projects archive:
 * `{archiveBasePath}?{param}={slug}` opens the archive page's `ProjectsList`
 * pre-filtered to that term. Falls back to a non-interactive `<Badge>` when the
 * term has no slug or no projects-archive page is designated (nothing to link
 * to). `nav-back` plays the listing-ward directional View Transition, mirroring
 * the header "All projects" link (see docs/TRANSITIONS.md).
 */
function TaxonChip({
  param,
  slug,
  title,
  variant,
  className,
  archiveBasePath,
}: {
  param: 'tag' | 'tech'
  slug: string | null
  title: string | null
  variant: 'outline' | 'secondary'
  className?: string
  archiveBasePath?: string | null
}) {
  if (!slug || !archiveBasePath) {
    return (
      <Badge variant={variant} className={className}>
        {title}
      </Badge>
    )
  }
  return (
    <Link
      href={`${archiveBasePath}?${param}=${encodeURIComponent(slug)}`}
      transitionTypes={['nav-back']}
      aria-label={`Filter projects by ${title ?? slug}`}
      className={cn(
        badgeVariants({variant}),
        'transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        className,
      )}
    >
      {title}
    </Link>
  )
}

/**
 * Project metadata aside — a description list (`<dl>` of `<dt>`/`<dd>` pairs)
 * surfacing created/updated dates, the tech stack as chips, and the live-site /
 * repository links. Each row auto-hides when its source value is empty
 * (`ProjectMetaRow`), so a sparse project degrades gracefully to whatever it has.
 *
 * RSC — no client JS. Heroicons only: the repo link uses `CodeBracketIcon`
 * because Heroicons ships no brand GitHub mark and lucide is not installed; the
 * live-site link reuses `ArrowTopRightOnSquareIcon` (the existing "external"
 * affordance, mirrored from `ProjectCard`).
 */
export default function ProjectMeta({
  project,
  className,
  archiveBasePath,
}: {
  project: Pick<Project, 'publishedAt' | 'updatedAt' | 'categories' | 'tech' | 'website' | 'repo'>
  className?: string
  /** Base path of the designated projects-archive page (e.g. `/projects`). When
   *  absent, taxonomy chips render as static badges (no listing to link to). */
  archiveBasePath?: string | null
}) {
  const {publishedAt, updatedAt, categories, tech, website, repo} = project
  const hasCategories = Array.isArray(categories) && categories.length > 0
  const hasTech = Array.isArray(tech) && tech.length > 0
  // The dates coalesce to system timestamps in GROQ, but treat them defensively.
  const showUpdated = updatedAt && updatedAt !== publishedAt

  return (
    <dl className={cn('text-sm', className)}>
      <ProjectMetaRow label="Created">
        {publishedAt ? <DateComponent dateString={publishedAt} /> : null}
      </ProjectMetaRow>

      <ProjectMetaRow label="Updated">
        {showUpdated ? <DateComponent dateString={updatedAt} /> : null}
      </ProjectMetaRow>

      <ProjectMetaRow label="Tags">
        {hasCategories ? (
          <ul className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <li key={c._id}>
                <TaxonChip
                  param="tag"
                  slug={c.slug}
                  title={c.title}
                  variant="outline"
                  className="text-[0.7rem]"
                  archiveBasePath={archiveBasePath}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </ProjectMetaRow>

      <ProjectMetaRow label="Tech">
        {hasTech ? (
          <ul className="flex flex-wrap gap-1.5">
            {tech.map((t) => (
              <li key={t._id}>
                <TaxonChip
                  param="tech"
                  slug={t.slug}
                  title={t.title}
                  variant="secondary"
                  className="font-mono text-[0.65rem] uppercase tracking-tight"
                  archiveBasePath={archiveBasePath}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </ProjectMetaRow>

      <ProjectMetaRow label="Live site">
        {website ? (
          <ExternalMetaLink href={website} label={website} Icon={ArrowTopRightOnSquareIcon} />
        ) : null}
      </ProjectMetaRow>

      <ProjectMetaRow label="Repository">
        {repo ? <ExternalMetaLink href={repo} label={repo} Icon={CodeBracketIcon} /> : null}
      </ProjectMetaRow>
    </dl>
  )
}
