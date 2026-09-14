import {SocialIcon, socialLabel} from '@/app/components/icons'
import type {SettingsContact} from '@/sanity/lib/types'

type Socials = NonNullable<NonNullable<SettingsContact>['socials']>

/**
 * Floating social links (S5, §7.7) — the client's explicit ask from the
 * reference sites: a fixed vertical stack on the right edge, vertically
 * centred, from `md` (768px) up. Below that the mobile drawer carries the
 * same links (`NavContact`), so nothing is lost on small screens.
 *
 * Rendered by `SideNav` (it already holds the shared `settings` fetch), so
 * this is plain RSC markup with no client JS. `z-30` keeps it under the
 * rail/top bar (`z-40`) and well under dialogs and the gallery lightbox
 * (`z-50`). The `social-rail` view-transition name pins it like the rest of
 * the fixed chrome (globals.css) so it never slides with page content.
 *
 * Renders nothing when no socials are configured (Q1 — only Facebook is
 * confirmed so far). Targets are 44×44 (AAA, SC 2.5.5) with the standard
 * focus ring, and every link announces the platform and the new-tab behaviour.
 */
export default function SocialRail({socials}: {socials: Socials | null | undefined}) {
  if (!socials || socials.length === 0) return null

  return (
    <nav
      aria-label="Social media"
      style={{viewTransitionName: 'social-rail'}}
      className="fixed top-1/2 right-0 z-30 hidden -translate-y-1/2 md:block print:hidden"
    >
      <ul className="flex flex-col gap-1 rounded-l-xl border border-r-0 border-border bg-card/95 p-1.5 shadow-md backdrop-blur">
        {socials.map((social) => (
          <li key={social._key}>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {/* Decorative by contract — the sr-only text is the accessible
                  name (docs/A11Y.md). SocialIcon stega-cleans `platform`. */}
              <SocialIcon platform={social.platform} className="h-5 w-5" />
              <span className="sr-only">
                Future Scholars on {socialLabel(social.platform) ?? social.title} (opens in new tab)
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
