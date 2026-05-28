import {Button} from '@/components/ui/button'
import {Separator} from '@/components/ui/separator'

export default function Footer() {
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
      </div>
    </footer>
  )
}
