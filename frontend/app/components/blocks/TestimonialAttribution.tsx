import {stegaClean} from '@sanity/client/stega'

import Image from '@/app/components/common/SanityImage'
import {Avatar as AvatarRoot, AvatarFallback} from '@/components/ui/avatar'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

/**
 * The shape both testimonial layouts render. The image sub-type is derived
 * from the query result rather than hand-written so it stays whatever typegen
 * says it is (asset ref, hotspot, crop).
 */
type TestimonialDoc = NonNullable<
  ExtractPageBuilderType<'testimonials'>['documentTestimonials']
>[number]

export type Quote = {
  key: string
  quote: string | null
  highlight?: string | null
  authorName: string | null
  authorRole?: string | null
  authorImage?: TestimonialDoc['authorImage'] | null
}

/** Normalised for comparison only: whitespace, case and edge punctuation. */
export const normalise = (value: string): string =>
  value
    .replace(/\s+/g, ' ')
    .replace(/^[\s"'“”‘’.…]+|[\s"'“”‘’.…]+$/g, '')
    .toLowerCase()

/**
 * Fragment id for a testimonial on the letters page, e.g.
 * `#the-lewandowski-family`. Derived from the attribution so the URL reads
 * well; the card grid and the letters layout both call this, so the deep link
 * and its target can't drift. `stegaClean` first — draft-mode markers would
 * otherwise end up in the id.
 */
export const testimonialAnchor = (authorName: string | null | undefined, fallback: string) =>
  (stegaClean(authorName) ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `testimonial-${fallback}`

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
    </div>
  )
}
