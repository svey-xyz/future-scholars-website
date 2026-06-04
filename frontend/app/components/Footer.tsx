import {Button} from '@/components/ui/button'
import {Separator} from '@/components/ui/separator'
import FooterContent from '@/app/components/FooterContent'
import {sanityFetch} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'

export default async function Footer() {
  const {data: settings} = await sanityFetch({query: settingsQuery})
  const contact = settings?.contact ?? null
  const legal = settings?.legal ?? null

  return (
    <footer className="bg-muted">
      <div className="container">
        <div className="flex flex-col items-center py-28 lg:flex-row">
          <h3 className="mb-10 text-center text-4xl font-mono leading-tight tracking-tighter lg:mb-0 lg:w-1/2 lg:pr-4 lg:text-left lg:text-2xl">
            Built with Sanity + Next.js.
          </h3>
          <Separator orientation="vertical" className="hidden lg:block h-12 mx-4" />
          <div className="flex flex-col gap-3 items-center justify-center lg:w-1/2 lg:flex-row lg:pl-4">
            <Button asChild size="lg" className="rounded-full">
              <a
                href="https://github.com/sanity-io/sanity-template-nextjs-clean"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </Button>
            <Button asChild variant="link">
              <a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">
                Read Next.js Documentation
              </a>
            </Button>
          </div>
        </div>

        {/* Shared footer content (socials + legal) — same component the mobile
            Sheet renders, so the two never drift. Renders null when empty. */}
        <FooterContent
          contact={contact}
          legal={legal}
          className="border-t border-border pb-12 pt-8"
        />
      </div>
    </footer>
  )
}
