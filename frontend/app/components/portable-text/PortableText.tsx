/**
 * Renders rich-text (`blockContent`) fields: info sections, program bodies, FAQ answers.
 *
 * You can learn more about Portable Text on:
 * https://www.sanity.io/docs/block-content
 * https://github.com/portabletext/react-portabletext
 * https://portabletext.org/
 *
 */

import {PortableText, type PortableTextComponents, type PortableTextBlock} from 'next-sanity'
import {LinkIcon} from '@heroicons/react/24/outline'

import ResolvedLink from '@/app/components/common/ResolvedLink'
import Image from '@/app/components/common/SanityImage'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'

export default function CustomPortableText({
  className,
  value,
}: {
  className?: string
  value: PortableTextBlock[]
}) {
  const HeadingAnchor = ({href}: {href: string}) => (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="absolute left-0 top-1/2 -translate-y-1/2 -ml-10 h-7 w-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
    >
      <a href={href} aria-label="Link to section">
        <LinkIcon className="h-4 w-4" />
      </a>
    </Button>
  )

  const components: PortableTextComponents = {
    types: {
      image: ({value}) => {
        if (!value?.asset?._ref) {
          return null
        }

        return (
          <figure className="my-8">
            <Image
              id={value.asset._ref}
              alt={value.alt || ''}
              width={672}
              crop={value.crop}
              mode="cover"
              className="rounded-sm"
            />
          </figure>
        )
      },
    },
    block: {
      h1: ({children, value}) => (
        <h1 className="group relative">
          {children}
          <HeadingAnchor href={`#${value?._key}`} />
        </h1>
      ),
      h2: ({children, value}) => (
        <h2 className="group relative">
          {children}
          <HeadingAnchor href={`#${value?._key}`} />
        </h2>
      ),
    },
    marks: {
      link: ({children, value: link}) => {
        return <ResolvedLink link={link}>{children}</ResolvedLink>
      },
    },
  }

  return (
    <div
      className={cn(
        'prose prose-a:text-foreground prose-a:underline prose-a:underline-offset-4 prose-a:decoration-foreground/40',
        className,
      )}
    >
      <PortableText components={components} value={value} />
    </div>
  )
}
