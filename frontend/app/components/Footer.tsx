import {ArrowTopRightOnSquareIcon} from '@heroicons/react/24/outline'

import FooterContent from '@/app/components/FooterContent'
import ThemeToggle from '@/app/components/ThemeToggle'
import {sanityFetch} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import type {BuiltWithItem} from '@/sanity/lib/types'

export default async function Footer() {
  const {data: settings} = await sanityFetch({query: settingsQuery})
  const contact = settings?.contact ?? null
  const legal = settings?.legal ?? null
  const builtWith = settings?.builtWith ?? []

  return (
    <footer className="bg-muted">
      <div className="container">
        {builtWith.length > 0 && (
          <div className="flex flex-col gap-4 py-16 sm:flex-row sm:items-baseline sm:gap-6">
            <h3 className="font-mono text-sm font-medium tracking-tight text-muted-foreground">
              Built with
            </h3>
            <ul className="flex flex-wrap gap-2">
              {builtWith.map((item, index) => (
                <li key={item.url ?? `${item.name}-${index}`}>
                  <BuiltWithChip item={item} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Meta bar: shared socials/legal (the same component the mobile Sheet
            renders, so the two never drift; renders null when empty) plus the
            single light↔dark theme toggle, pinned to the end. */}
        <div className="flex flex-col gap-4 border-t border-border pb-12 pt-8 sm:flex-row sm:items-center">
          <FooterContent contact={contact} legal={legal} className="sm:flex-1" />
          <ThemeToggle className="self-end sm:ml-auto sm:self-auto" />
        </div>
      </div>
    </footer>
  )
}

/**
 * A single "built with" entry. Items with a `url` render as external-safe
 * links (new tab + the sr-only "(opens in new tab)" cue, mirroring
 * FooterContent); name-only items render as plain, non-interactive labels.
 */
function BuiltWithChip({item}: {item: BuiltWithItem}) {
  const chipBase =
    'inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm font-medium'

  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group ${chipBase} text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`}
      >
        {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
        <span>{item.name}</span>
        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
        <span className="sr-only">(opens in new tab)</span>
      </a>
    )
  }

  return (
    <span className={`${chipBase} text-muted-foreground`}>
      {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
      <span>{item.name}</span>
    </span>
  )
}
