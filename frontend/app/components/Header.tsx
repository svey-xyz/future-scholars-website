import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import {Button} from '@/components/ui/button'
import {Separator} from '@/components/ui/separator'
import GithubIcon from '@/app/components/icons/GithubIcon'
import HeaderNav from '@/app/components/HeaderNav'
import ModeToggle from '@/app/components/ModeToggle'

const githubHref = 'https://github.com/sanity-io/sanity-template-nextjs-clean'

export default async function Header() {
  const {data: settings} = await sanityFetch({query: settingsQuery})

  // CMS-driven nav (Phase 4–6). Falls back to an empty list so the header still
  // renders its chrome when `navigation` is unset.
  const navigation = settings?.navigation ?? []
  const mobileNav = settings?.mobileNav ?? null
  const contact = settings?.contact ?? null
  const legal = settings?.legal ?? null

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 h-24 flex items-center bg-background/80 backdrop-blur-lg"
      // Anchors the fixed header so it stays put during directional content
      // slides (CSS disables its snapshot animation in globals.css).
      style={{viewTransitionName: 'site-header'}}
    >
      <div className="container px-2 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-5">
          <Link
            className="flex shrink-0 items-center gap-2"
            href="/"
            transitionTypes={['nav-back']}
          >
            <span className="pl-2 text-lg sm:text-2xl font-semibold">
              {settings?.title || 'Sanity + Next.js'}
            </span>
          </Link>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4">
            {/* CMS-driven nav — desktop-inline collapses to a hamburger by
                available space (HeaderNav owns the decision). */}
            <HeaderNav
              navigation={navigation}
              mobileNav={mobileNav}
              contact={contact}
              legal={legal}
            />

            <Separator orientation="vertical" className="hidden sm:block h-6" />

            <ModeToggle />

            <Button asChild size="lg" className="hidden sm:inline-flex rounded-full">
              <a href={githubHref} target="_blank" rel="noopener noreferrer">
                <span className="whitespace-nowrap">View on GitHub</span>
                <GithubIcon className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
