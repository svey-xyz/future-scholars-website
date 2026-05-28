import Link from 'next/link'
import {Bars3Icon} from '@heroicons/react/24/outline'

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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import GithubIcon from '@/app/components/icons/GithubIcon'
import ModeToggle from '@/app/components/ModeToggle'

const navLinks = [{href: '/about', label: 'About'}]
const githubHref = 'https://github.com/sanity-io/sanity-template-nextjs-clean'

export default async function Header() {
  const {data: settings} = await sanityFetch({query: settingsQuery})

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-24 flex items-center bg-background/80 backdrop-blur-lg">
      <div className="container px-2 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-5">
          <Link className="flex items-center gap-2" href="/">
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

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  aria-label="Open menu"
                >
                  <Bars3Icon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col gap-6">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <Separator />
                <Button asChild size="lg" className="rounded-full">
                  <a href={githubHref} target="_blank" rel="noopener noreferrer">
                    <span>View on GitHub</span>
                    <GithubIcon className="h-5 w-5" />
                  </a>
                </Button>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
