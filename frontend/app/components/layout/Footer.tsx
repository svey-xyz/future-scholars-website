import {ArrowTopRightOnSquareIcon} from '@heroicons/react/24/outline'

import FooterContent from './FooterContent'
import Reveal from '@/app/components/motion/Reveal'
import ThemeToggle from './ThemeToggle'
import type {DynamicFetchOptions} from '@/sanity/lib/live'
import type {BuiltWithItem} from '@/sanity/lib/types'
import {getSettings} from './getSettings'

/**
 * Cached component (three-layer pattern, see docs/CACHING.md): `perspective`
 * and `stega` are resolved by the layout and passed in as plain props.
 */
export default async function Footer({perspective, stega}: DynamicFetchOptions) {
  'use cache'
  const settings = await getSettings({perspective, stega})
  const contact = settings?.contact ?? null
  const legal = settings?.legal ?? null
  const builtWith = settings?.builtWith ?? []

  return (
    <footer className="bg-muted">
      <div className="container">
        {builtWith.length > 0 && (
          <div className="flex flex-col gap-4 py-16 sm:flex-row sm:items-baseline sm:gap-6">
            <Reveal
              as="h3"
              variant="left"
              className="font-mono text-sm font-medium tracking-tight text-muted-foreground"
            >
              Built with
            </Reveal>
            <ul className="flex flex-wrap gap-2">
              {builtWith.map((item, index) => (
                // Per-chip staggered entrance — `variant="scale"` + `--reveal-i`
                // cascade so the chips pop in sequence as the footer scrolls into
                // view. Transform/opacity only (the chip box is reserved), so no
                // CLS; the whole reveal is gated behind prefers-reduced-motion in
                // globals.css, so reduced-motion users get static chips.
                <Reveal
                  as="li"
                  variant="scale"
                  i={index % 8}
                  key={item.url ?? `${item.name}-${index}`}
                >
                  <BuiltWithChip item={item} />
                </Reveal>
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
        // Micro-interaction: color + border lift with a gentle ease-out settle
        // (slow-out), echoing the card-hover feel. Transform is `motion-safe:`
        // only, so reduced-motion users keep the pure color/border change.
        className={`group ${chipBase} text-muted-foreground transition-[color,border-color,transform] duration-300 ease-out will-change-transform hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring motion-safe:hover:-translate-y-0.5`}
      >
        {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
        <span>{item.name}</span>
        <ArrowTopRightOnSquareIcon
          className="h-3.5 w-3.5 shrink-0 opacity-70 transition-transform duration-300 ease-out will-change-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
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
