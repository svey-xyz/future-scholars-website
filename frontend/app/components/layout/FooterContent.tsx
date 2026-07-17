import {SocialIcon} from '@/app/components/icons'
import {cn} from '@/lib/utils'
import type {SettingsContact, SettingsLegal} from '@/sanity/lib/types'

type FooterContentProps = {
  contact: SettingsContact
  legal: SettingsLegal
  /** Tighter, single-column layout for the mobile Sheet. */
  compact?: boolean
  className?: string
}

/**
 * Shared footer body — rendered by both the site <Footer> and (optionally) the
 * mobile nav <Sheet>, so the two never drift. Pure RSC: no client JS.
 * Lists `contact.socials` as external-safe links + the `legal` disclaimer.
 */
export default function FooterContent({
  contact,
  legal,
  compact = false,
  className,
}: FooterContentProps) {
  const socials = contact?.socials ?? []
  const hasSocials = socials.length > 0

  if (!hasSocials && !legal) return null

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        !compact && 'sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      {hasSocials && (
        <ul className={cn('flex flex-wrap gap-x-5 gap-y-2', compact && 'flex-col gap-y-1')}>
          {socials.map((social) => (
            <li key={social._key}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {/* SocialIcon stega-cleans the platform internally and falls
                    back to a generic external-link mark for unknown values. */}
                <SocialIcon platform={social.platform} className="h-4 w-4 shrink-0" />
                <span>{social.title}</span>
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {legal && <p className={cn('text-sm text-muted-foreground', compact && 'mt-1')}>{legal}</p>}
    </div>
  )
}
