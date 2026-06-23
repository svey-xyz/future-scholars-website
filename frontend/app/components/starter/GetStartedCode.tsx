'use client'

import {ClipboardIcon} from '@heroicons/react/24/outline'
import {toast} from 'sonner'

import {Button} from '@/components/ui/button'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip'

const SNIPPET = 'npm create sanity@latest -- --template sanity-io/sanity-template-nextjs-clean'

export default function GetStartedCode() {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Copy failed')
    }
  }

  return (
    <div className="mt-6 flex flex-col md:inline-flex md:flex-row items-center gap-4 rounded-xl md:rounded-full bg-muted text-foreground text-sm lg:text-base font-mono shadow-sm p-4 md:py-2 md:pl-6 md:pr-2 text-center md:whitespace-nowrap">
      <span>{SNIPPET}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              onClick={handleCopy}
              aria-label="Copy to clipboard"
              className="rounded-xl md:rounded-full"
            >
              <ClipboardIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy snippet</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
