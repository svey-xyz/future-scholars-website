import {ArrowTopRightOnSquareIcon} from '@heroicons/react/24/outline'

import Image from '@/app/components/common/SanityImage'
import {Avatar as AvatarRoot, AvatarFallback} from '@/components/ui/avatar'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

/**
 * The shape both testimonial layouts render, whichever source the block draws
 * from. The image sub-type is derived from the inline member rather than
 * hand-written so it stays whatever typegen says it is (asset ref, hotspot,
 * crop).
 */
type InlineTestimonial = NonNullable<ExtractPageBuilderType<'testimonials'>['testimonials']>[number]

export type Quote = {
  key: string
  quote: string | null
  highlight?: string | null
  authorName: string | null
  authorRole?: string | null
  sourceUrl?: string | null
  authorImage?: InlineTestimonial['authorImage'] | null
}

/** Normalised for comparison only: whitespace, case and edge punctuation. */
export const normalise = (value: string): string =>
  value
    .replace(/\s+/g, ' ')
    .replace(/^[\s"'“”‘’.…]+|[\s"'“”‘’.…]+$/g, '')
    .toLowerCase()

type Props = {
  t: Quote
  /** `span` in the card grid; a real heading in the letters layout. */
  nameAs?: 'span' | 'h2' | 'h3'
  nameId?: string
  size?: 'sm' | 'lg'
  className?: string
  avatarClassName?: string
}

/**
 * Avatar + name + role + optional source link. Shared by the card grid and
 * the letters layout so the two never drift in how a family is credited.
 */
export default function TestimonialAttribution({
  t,
  nameAs: Name = 'span',
  nameId,
  size = 'sm',
  className,
  avatarClassName,
}: Props) {
  const ref = t.authorImage?.asset?._ref
  const px = size === 'lg' ? 56 : 40
  const initials =
    t.authorName
      ?.split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <AvatarRoot className={cn(size === 'lg' ? 'size-14' : 'size-10', avatarClassName)}>
        {ref ? (
          <Image
            id={ref}
            alt={t.authorImage?.alt || t.authorName || ''}
            width={px}
            height={px}
            hotspot={t.authorImage?.hotspot}
            crop={t.authorImage?.crop}
            mode="cover"
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <AvatarFallback className={size === 'lg' ? 'text-sm' : 'text-xs'}>
            {initials}
          </AvatarFallback>
        )}
      </AvatarRoot>
      <span className="flex min-w-0 flex-col">
        <Name
          id={nameId}
          className={cn('font-medium', size === 'lg' && 'font-sans text-base text-foreground')}
        >
          {t.authorName}
        </Name>
        {t.authorRole && <span className="text-sm text-muted-foreground">{t.authorRole}</span>}
      </span>
      {t.sourceUrl && (
        <a
          href={t.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex min-h-11 items-center gap-1 rounded-md font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Source
          <ArrowTopRightOnSquareIcon aria-hidden="true" className="size-3.5" />
          <span className="sr-only">
            : original article for {t.authorName}&rsquo;s quote (opens in new tab)
          </span>
        </a>
      )}
    </div>
  )
}
