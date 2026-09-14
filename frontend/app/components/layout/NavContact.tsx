import {EnvelopeIcon, PhoneIcon} from '@heroicons/react/24/outline'

import {SocialIcon, socialLabel} from '@/app/components/icons'
import {cn} from '@/lib/utils'
import type {SettingsContact} from '@/sanity/lib/types'

type NavContactProps = {
  contact: SettingsContact
  className?: string
  /**
   * Desktop rail passes false (S5): the floating `SocialRail` already carries
   * socials at ≥768px, and rendering them in the rail footer too would show
   * the same links twice on one screen (§12). The mobile drawer keeps them —
   * below 768px the floating rail is hidden and the drawer is the only carrier.
   */
  showSocials?: boolean
}

/**
 * Rail / drawer footer (§6.2): phone, email, socials. No client JS — plain
 * markup, rendered by the RSC rail and bundled into the mobile drawer.
 *
 * D6: the site has no forms, so `tel:` and `mailto:` are the entire contact
 * mechanism and they belong in persistent chrome rather than only on /about.
 *
 * Targets are ≥44px tall (AAA, SC 2.5.5) as §7.5 requires for the rail.
 */
export default function NavContact({contact, className, showSocials = true}: NavContactProps) {
  const phone = contact?.phone
  const email = contact?.email
  const socials = showSocials ? (contact?.socials ?? []) : []

  if (!phone && !email && socials.length === 0) return null

  const row =
    'flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-muted-foreground ' +
    'transition-colors hover:bg-secondary hover:text-secondary-foreground ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-1 focus-visible:ring-offset-background'

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      {phone && (
        // `formatDetection: {telephone: false}` in the root layout stops iOS
        // auto-linking numbers, so the explicit tel: link is the only one.
        <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className={row}>
          <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{phone}</span>
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className={cn(row, 'break-all')}>
          <EnvelopeIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Email us</span>
          <span className="sr-only">— {email}</span>
        </a>
      )}
      {socials.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-1">
          {socials.map((social) => (
            <li key={social._key}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(row, 'w-11 justify-center px-0')}
              >
                {/* SocialIcon stega-cleans `platform` and falls back to a
                    generic external mark for unknown values. */}
                <SocialIcon platform={social.platform} className="h-5 w-5 shrink-0" />
                <span className="sr-only">
                  Future Scholars on {socialLabel(social.platform) ?? social.title} (opens in new
                  tab)
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
