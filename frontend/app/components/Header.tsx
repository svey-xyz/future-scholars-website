import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import {Button} from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import {Separator} from '@/components/ui/separator'
import GithubIcon from '@/app/components/icons/GithubIcon'
import MobileMenu from '@/app/components/MobileMenu'
import ModeToggle from '@/app/components/ModeToggle'

const navLinks = [{href: '/about', label: 'About'}] as const
const githubHref = 'https://github.com/sanity-io/sanity-template-nextjs-clean'

export default async function Header() {
  const {data: settings} = await sanityFetch({query: settingsQuery})

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 h-24 flex items-center bg-background/80 backdrop-blur-lg"
      // Anchors the fixed header so it stays put during directional content
      // slides (CSS disables its snapshot animation in globals.css).
      style={{viewTransitionName: 'site-header'}}
    >
      <div className="container px-2 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-5">
          <Link className="flex items-center gap-2" href="/" transitionTypes={['nav-back']}>
            <span className="pl-2 text-lg sm:text-2xl font-semibold">
              {settings?.title || 'Sanity + Next.js'}
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop nav */}
            <NavigationMenu className="hidden sm:flex">
              <NavigationMenuList>
                {navLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={link.href}
                        transitionTypes={['nav-forward']}
                        className="px-3 py-2 text-sm font-medium hover:underline underline-offset-4"
                      >
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            <Separator orientation="vertical" className="hidden sm:block h-6" />

            <ModeToggle />

            <Button asChild size="lg" className="hidden sm:inline-flex rounded-full">
              <a href={githubHref} target="_blank" rel="noopener noreferrer">
                <span className="whitespace-nowrap">View on GitHub</span>
                <GithubIcon className="h-5 w-5" />
              </a>
            </Button>

            <MobileMenu navLinks={navLinks} githubHref={githubHref} />
          </div>
        </div>
      </div>
    </header>
  )
}
