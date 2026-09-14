import {PortableText, type PortableTextBlock} from 'next-sanity'

import Image from '@/app/components/common/SanityImage'
import Reveal from '@/app/components/motion/Reveal'
import {Card} from '@/components/ui/card'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'facultyGrid'>
  index: number
  pageId: string
  pageType: string
}

const colClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/**
 * Faculty grid (build plan S7) — `person` documents as staff cards.
 *
 * Each card is a `<figure>`: the portrait is the figure's image and the name,
 * role, credentials and bio are its caption, which is what the relationship
 * actually is. Nothing here is a link — a staff member has no page to link to,
 * and a card that looks clickable but isn't is worse than a plain one.
 *
 * Portraits are the legacy 156×192 originals (see IMAGE-MANIFEST.md), so they
 * are rendered small and square-cropped; asking the CDN for more would upscale.
 */
export default function FacultyGrid({block}: Props) {
  const {heading, subheading, people, columns, showBio} = block
  const cols = columns ?? 3
  const items = people ?? []

  if (items.length === 0) return null

  return (
    <section className="container my-12 lg:my-16">
      <header className="max-w-3xl">
        {heading && (
          <Reveal as="h2" className="text-2xl md:text-3xl lg:text-4xl">
            {heading}
          </Reveal>
        )}
        {subheading && (
          <Reveal as="p" i={1} className="mt-3 text-lg leading-8 text-muted-foreground">
            {subheading}
          </Reveal>
        )}
      </header>

      <ul className={cn('mt-10 grid grid-cols-1 gap-6', colClass[cols])}>
        {items.map((person, i) => {
          const ref = person.picture?.asset?._ref
          const name = [person.firstName, person.lastName].filter(Boolean).join(' ')
          const credentials = person.credentials ?? []

          return (
            <Reveal as="li" key={person._id} i={i} variant="scale">
              <Card className="h-full p-6">
                <figure className="flex h-full flex-col gap-4">
                  {ref ? (
                    <Image
                      id={ref}
                      alt={person.picture?.alt || name}
                      width={160}
                      height={160}
                      hotspot={person.picture?.hotspot}
                      crop={person.picture?.crop}
                      mode="cover"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : null}

                  <figcaption className="flex flex-1 flex-col gap-2">
                    <h3 className="font-display text-lg">{name}</h3>
                    {person.role && (
                      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                        {person.role}
                      </p>
                    )}

                    {credentials.length > 0 && (
                      <ul className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
                        {credentials.map((credential) => (
                          <li key={credential}>{credential}</li>
                        ))}
                      </ul>
                    )}

                    {showBio !== false && person.bio && (
                      <div className="prose prose-sm mt-2 max-w-none leading-7 text-pretty">
                        <PortableText value={person.bio as PortableTextBlock[]} />
                      </div>
                    )}
                  </figcaption>
                </figure>
              </Card>
            </Reveal>
          )
        })}
      </ul>
    </section>
  )
}
