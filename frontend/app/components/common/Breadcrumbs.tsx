import Link from 'next/link'
import {ChevronRightIcon} from '@heroicons/react/20/solid'

import type {BreadcrumbItem} from '@/app/components/seo'
import {cn} from '@/lib/utils'

/**
 * Visual breadcrumb trail (build plan S8). RSC, no client JS.
 *
 * WAI-ARIA breadcrumb pattern: a `nav` landmark labelled "Breadcrumb", an
 * ordered list, and `aria-current="page"` on the last item — which is plain
 * text, not a link to the page you are already on. Separators are decorative
 * icons hidden from assistive tech, so the list reads as "Home, Programs,
 * Infants" rather than "Home, chevron, Programs…".
 *
 * Links up the trail are tagged `nav-back`, so the app-wide directional
 * transition slides the way the user expects (docs/TRANSITIONS.md).
 *
 * Pair with `breadcrumbJsonLd` from `@/app/components/seo`, fed the same
 * `items`, so the visible trail and the structured data cannot drift.
 */
export default function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[]
  className?: string
}) {
  if (items.length < 2) return null
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-muted-foreground">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={item.path} className="flex items-center gap-x-1.5">
              {i > 0 && (
                <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0 opacity-70" />
              )}
              {isLast ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  transitionTypes={['nav-back']}
                  // 24×24 minimum target (WCAG 2.5.8) via vertical padding;
                  // underline on hover/focus so the link is not colour-only.
                  className="inline-flex min-h-6 items-center rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
