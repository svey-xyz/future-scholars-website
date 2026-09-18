import type {CSSProperties, ReactNode} from 'react'
import {EnvelopeIcon, PhoneIcon} from '@heroicons/react/24/outline'
import {stegaClean} from '@sanity/client/stega'

import {SocialIcon, socialLabel} from '@/app/components/icons'
import {cn, telHref} from '@/lib/utils'
import type {SettingsContact} from '@/sanity/lib/types'

type HubItem = {
  key: string
  href: string
  /** Revealed by the hover/focus expansion (floating) or always shown (stacked). */
  label: string
  /** Appended to the accessible name: the literal address/number, or the new-tab cue. */
  detail?: string
  icon: ReactNode
  external?: boolean
}

type ContactHubProps = {
  contact: SettingsContact
  /**
   * `floating` — the fixed right-edge hub, `lg` and up (§7.7).
   * `stacked`  — the same hub collapsed into the foot of the mobile drawer.
   */
  variant?: 'floating' | 'stacked'
  className?: string
}

// Per-item entrance delay for the floating stack (`.contact-hub-item`, globals.css).
const reveal = (i: number) => ({'--reveal-i': i}) as CSSProperties

/**
 * The floating contact hub (S5, §7.7): phone, email and the social profiles in
 * one fixed cluster on the right edge, replacing the old `SocialRail` +
 * rail-footer `NavContact` split. D6 — the site has no forms, so `tel:` and
 * `mailto:` *are* the contact mechanism and belong in persistent chrome.
 *
 * Plain RSC markup, zero client JS: the hover/focus reveal is a CSS grid
 * `0fr → 1fr` column transition, which animates where `width: auto` cannot.
 * A Radix `Tooltip` would have produced the same affordance at the cost of a
 * provider, a portal and a client boundary around persistent chrome — not worth
 * it for a four-item list (perf-first, CLAUDE.md §Priorities).
 *
 * Breakpoint contract: the floating variant is `lg` and up — the same threshold
 * as the desktop rail — so it can never coexist with the drawer copy. (The
 * previous `md:block` overlapped the 768–1023px drawer, which duplicated every
 * link for assistive tech whenever the drawer was open.)
 *
 * a11y (docs/A11Y.md): 44×44 targets (SC 2.5.5, AAA), icons decorative with the
 * accessible name on the link, `rel="noopener noreferrer"` + an explicit
 * new-tab cue on externals, and every transition carrying `motion-reduce`.
 * Hover/focus fill is `--brand-accent` under `--brand-accent-foreground`, the
 * one pairing in §12 where the sunflower is safe to carry text.
 */
export default function ContactHub({contact, variant = 'floating', className}: ContactHubProps) {
  // Stega discipline (CLAUDE.md): these strings end up in `href`, not on screen.
  // In draft mode the raw values carry invisible markers that corrupt the URL.
  const phone = stegaClean(contact?.phone ?? undefined)
  const email = stegaClean(contact?.email ?? undefined)
  const socials = contact?.socials ?? []

  const items: HubItem[] = []

  if (phone) {
    // `formatDetection: {telephone: false}` in the root layout stops iOS
    // auto-linking numbers, so this explicit tel: link is the only one.
    items.push({
      key: 'phone',
      href: `tel:${telHref(phone)}`,
      label: phone,
      icon: <PhoneIcon className="h-5 w-5" aria-hidden="true" />,
    })
  }

  if (email) {
    items.push({
      key: 'email',
      href: `mailto:${email}`,
      label: 'Email us',
      detail: email,
      icon: <EnvelopeIcon className="h-5 w-5" aria-hidden="true" />,
    })
  }

  for (const social of socials) {
    const url = stegaClean(social.url ?? undefined)
    if (!url) continue
    items.push({
      key: social._key,
      href: url,
      label: socialLabel(social.platform) ?? social.title ?? 'Social',
      detail: 'opens in new tab',
      external: true,
      // SocialIcon stega-cleans `platform` and falls back to a generic mark.
      icon: <SocialIcon platform={social.platform} className="h-5 w-5" />,
    })
  }

  if (items.length === 0) return null

  if (variant === 'stacked') {
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <h2 className="sr-only">Contact Future Scholars</h2>
        {items.map((item) => (
          <HubLink key={item.key} item={item} variant="stacked" />
        ))}
      </div>
    )
  }

  return (
    <nav
      aria-label="Contact and social links"
      // `contact-hub` pins the cluster during directional content slides, the
      // same treatment as the rail and top bar (globals.css).
      style={{viewTransitionName: 'contact-hub'}}
      className="fixed top-1/2 right-3 z-30 hidden -translate-y-1/2 lg:block print:hidden"
    >
      <ul className="flex flex-col items-end gap-2">
        {items.map((item, i) => (
          <li key={item.key} className="contact-hub-item" style={reveal(i)}>
            <HubLink item={item} variant="floating" />
          </li>
        ))}
      </ul>
    </nav>
  )
}

const BASE =
  'group flex items-center rounded-full border border-border bg-card text-muted-foreground ' +
  'shadow-md transition-colors duration-300 motion-reduce:transition-none ' +
  'hover:border-brand-accent hover:bg-brand-accent hover:text-brand-accent-foreground ' +
  'focus-visible:border-brand-accent focus-visible:bg-brand-accent focus-visible:text-brand-accent-foreground ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background'

function HubLink({item, variant}: {item: HubItem; variant: 'floating' | 'stacked'}) {
  const floating = variant === 'floating'

  return (
    <a
      href={item.href}
      {...(item.external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
      className={cn(
        BASE,
        floating
          ? // Right-anchored, so the label expansion grows the pill leftward.
            'justify-end pr-0 backdrop-blur-sm'
          : 'min-h-11 gap-2.5 px-3',
      )}
    >
      {floating ? (
        // `grid-template-columns: 0fr → 1fr` is the animatable stand-in for
        // `width: auto`; the inner span owns the clip so the text never wraps
        // mid-transition. Driven by `group-hover` / `group-focus-visible`, so
        // keyboard users get the identical reveal.
        <span
          className={cn(
            'grid grid-cols-[0fr] transition-[grid-template-columns] duration-300',
            'ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
            'group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]',
          )}
        >
          <span className="overflow-hidden">
            <span className="block pl-4 text-sm font-medium whitespace-nowrap">{item.label}</span>
          </span>
        </span>
      ) : null}

      <span
        className={cn(
          'flex shrink-0 items-center justify-center',
          floating ? 'h-11 w-11' : 'h-5 w-5',
        )}
      >
        {item.icon}
      </span>

      {floating ? null : <span className="text-sm font-medium">{item.label}</span>}

      {/* The visible label is the accessible name; `detail` adds the literal
          address or the new-tab cue that the icon alone can't convey. */}
      {item.detail ? <span className="sr-only"> — {item.detail}</span> : null}
    </a>
  )
}
