import {PortableText, type PortableTextBlock} from 'next-sanity'
import {stegaClean} from '@sanity/client/stega'
import {ArrowRightIcon} from '@heroicons/react/24/outline'

import ResolvedLink from '@/app/components/common/ResolvedLink'
import Image from '@/app/components/common/SanityImage'
import Reveal from '@/app/components/motion/Reveal'
import SitePortableText from '@/app/components/portable-text/PortableText'
import {Card} from '@/components/ui/card'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'
import {dataAttr} from '@/sanity/lib/utils'
import FacultyBioDialog from './FacultyBioDialog'

type Props = {
  block: ExtractPageBuilderType<'facultyGrid'>
  index: number
  pageId: string
  pageType: string
  className?: string
}

const colClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/**
 * Display name with stega stripped. In draft mode each name part carries a
 * ~100-char invisible stega payload, and headings get negative `tracking-tight`
 * — letter-spacing applies to every invisible char, so a mid-line payload
 * drags the pen back several ems and the next word overprints the previous
 * one. Click-to-edit is preserved via an explicit `data-sanity` attribute
 * (see `nameAttr`) instead.
 */
function personName(person: {firstName?: string | null; lastName?: string | null}) {
  return [person.firstName, person.lastName]
    .map((part) => stegaClean(part)?.trim())
    .filter(Boolean)
    .join(' ')
}

function nameAttr(id: string) {
  return dataAttr({id, type: 'person', path: 'firstName'}).toString()
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
 *
 * Name headings track the block's own heading, for the same reason
 * `ProgramsGrid` does: this block deliberately ships headingless on /about
 * (it continues the "Directors" section), and a hard-coded `h3` would skip a
 * level the moment it is used on a page that has no `h2` above it.
 */
export default function FacultyGrid({block, className}: Props) {
  const {heading, subheading, people, columns, showBio} = block
  const cols = columns ?? 3
  const items = people ?? []
  const NameHeading = heading ? 'h3' : 'h2'

  if (items.length === 0) return null

  // `stegaClean`: enum values carry stega characters in draft mode.
  const layout = stegaClean(block.layout)
  if (layout === 'highlight') {
    return <FacultyHighlight block={block} className={className} />
  }
  if (layout === 'split') {
    return <FacultySplit block={block} className={className} />
  }

  return (
    <section className={cn('container my-12 lg:my-16', className)}>
      <header className="max-w-3xl">
        {heading && (
          <Reveal as="h2" className="text-2xl room:text-room-strong md:text-3xl lg:text-4xl">
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
          const name = personName(person)
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
                    <NameHeading
                      data-sanity={nameAttr(person._id)}
                      className="font-display text-lg"
                    >
                      {name}
                    </NameHeading>
                    {person.role && (
                      <p className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {person.role}
                      </p>
                    )}

                    {credentials.length > 0 && (
                      <ul className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
                        {credentials.map((credential, c) => (
                          // Index-keyed on purpose: credentials are a plain
                          // string array with no stable id, and two people can
                          // legitimately hold the same one.
                          <li key={`${person._id}-${c}`}>{credential}</li>
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

/**
 * Highlight layout — the homepage teaser. A single text column: intro, the
 * directors as short text entries (name, role, credentials), and a link on to
 * the About page. No cards and no portraits: the About page carries those, and
 * the homepage has enough imagery already.
 *
 * The onward link is a text link with a trailing arrow (the site's "this
 * navigates" cue, cf. the testimonial cards), not a button: the CTA block
 * further down owns the page's one primary button.
 */
function FacultyHighlight({
  block,
  className,
}: {
  block: ExtractPageBuilderType<'facultyGrid'>
  className?: string
}) {
  const {heading, subheading, button} = block
  const items = block.people ?? []
  const NameHeading = heading ? 'h3' : 'h2'

  return (
    <section className={cn('container my-12 lg:my-16', className)}>
      <div className="flex max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-3">
          {heading && (
            <Reveal as="h2" className="text-2xl room:text-room-strong md:text-3xl lg:text-4xl">
              {heading}
            </Reveal>
          )}
          {subheading && (
            <Reveal as="p" i={1} className="text-lg leading-8 text-pretty text-muted-foreground">
              {subheading}
            </Reveal>
          )}
        </header>

        <ul className="flex flex-col gap-4">
          {items.map((person, i) => {
            const name = personName(person)
            const credentials = person.credentials ?? []
            return (
              <Reveal
                as="li"
                key={person._id}
                i={i + 2}
                className="border-l-2 border-primary/30 pl-4"
              >
                <NameHeading
                  data-sanity={nameAttr(person._id)}
                  className="font-display text-lg"
                >
                  {name}
                  {person.role && (
                    <span className="font-sans text-base font-normal text-muted-foreground">
                      , {person.role}
                    </span>
                  )}
                </NameHeading>
                {credentials.length > 0 && (
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {credentials.join(' \u00b7 ')}
                  </p>
                )}
              </Reveal>
            )
          })}
        </ul>

        {button?.buttonText && button.link && (
          <Reveal i={items.length + 2}>
            <ResolvedLink
              link={button.link}
              transitionTypes={['nav-forward']}
              className="group/more -mx-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 py-1 font-sans text-sm font-semibold text-primary room:text-room-strong underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {button.buttonText}
              <ArrowRightIcon
                aria-hidden="true"
                className="size-4 transition-transform duration-200 motion-safe:group-hover/more:translate-x-0.5 motion-reduce:transition-none"
              />
            </ResolvedLink>
          </Reveal>
        )}
      </div>
    </section>
  )
}

type Person = NonNullable<ExtractPageBuilderType<'facultyGrid'>['people']>[number]

/* Portrait sizes for the round headshots: 2 / 3 / 4 per row inside the right
   column (≈55% of the content width from `lg`). */
const PORTRAIT_SIZES = '(min-width: 80rem) 10rem, (min-width: 40rem) 30vw, 45vw'

function initials(person: Person) {
  return [person.firstName, person.lastName]
    .map((part) => stegaClean(part)?.trim()?.[0])
    .filter(Boolean)
    .join('')
}

/** Round portrait, or a sky circle with initials when there's no photo. */
function Portrait({person, className}: {person: Person; className?: string}) {
  const ref = person.picture?.asset?._ref
  return (
    <span
      className={cn(
        'relative block aspect-square overflow-hidden rounded-full bg-secondary room:bg-room-tint',
        className,
      )}
    >
      {ref ? (
        // Decorative: the name is right beside it (button text / dialog title),
        // so alt text would only make screen readers say the name twice.
        <Image
          id={ref}
          alt=""
          width={320}
          height={320}
          mode="cover"
          hotspot={person.picture?.hotspot}
          crop={person.picture?.crop}
          sizes={PORTRAIT_SIZES}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center font-display text-3xl text-secondary-foreground"
        >
          {initials(person)}
        </span>
      )}
    </span>
  )
}

/**
 * Split layout (FB6, FB7) — intro on the left, teachers on the right as round
 * headshots in a grid (the client's "T-E-A-C-H-E-R" circles sketch). Each
 * card is a button that opens that teacher's bio in a dialog.
 *
 * Server component: credentials and bio are rendered here and handed to the
 * `FacultyBioDialog` island as children, so the island carries only the
 * dialog behaviour. Names live in the buttons and the dialog titles, so this
 * layout adds no per-person headings.
 */
function FacultySplit({
  block,
  className,
}: {
  block: ExtractPageBuilderType<'facultyGrid'>
  className?: string
}) {
  const {heading, subheading, intro} = block
  const items = block.people ?? []

  return (
    <section className={cn('container my-12 lg:my-16', className)}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-16">
        <header className="flex min-w-0 flex-col gap-3">
          {heading && (
            <Reveal as="h2" className="text-2xl room:text-room-strong md:text-3xl lg:text-4xl">
              {heading}
            </Reveal>
          )}
          {subheading && (
            <Reveal as="p" i={1} className="text-lg leading-8 text-pretty text-muted-foreground">
              {subheading}
            </Reveal>
          )}
          {intro?.length ? (
            <Reveal i={2} className="mt-1">
              <SitePortableText value={intro as PortableTextBlock[]} />
            </Reveal>
          ) : null}
        </header>

        <ul className="grid min-w-0 grid-cols-2 content-start gap-6 sm:grid-cols-3 sm:gap-8 xl:grid-cols-4">
          {items.map((person, i) => {
            const name = personName(person)
            const credentials = person.credentials ?? []
            return (
              <Reveal as="li" key={person._id} i={i + 2} variant="scale">
                <FacultyBioDialog
                  dataSanity={dataAttr({
                    id: person._id,
                    type: 'person',
                    path: 'picture',
                  }).toString()}
                  name={name}
                  role={person.role}
                  media={<Portrait person={person} className="w-28 shrink-0 sm:w-32" />}
                  trigger={
                    <>
                      <Portrait
                        person={person}
                        className="w-full transition-transform duration-300 motion-safe:group-hover/teacher:scale-[1.03] motion-safe:group-focus-visible/teacher:scale-[1.03]"
                      />
                      <span className="flex flex-col gap-0.5">
                        <span className="font-display text-lg leading-snug">{name}</span>
                        {person.role ? (
                          <span className="text-sm text-muted-foreground">
                            <span className="sr-only">, </span>
                            {person.role}
                          </span>
                        ) : null}
                        <span className="sr-only">: read bio</span>
                      </span>
                    </>
                  }
                >
                  {credentials.length > 0 && (
                    <ul className="flex flex-col gap-1 border-l-2 border-primary/30 pl-4 text-sm text-muted-foreground">
                      {credentials.map((credential, c) => (
                        <li key={`${person._id}-${c}`}>{credential}</li>
                      ))}
                    </ul>
                  )}
                  {person.bio?.length ? (
                    <div className="prose max-w-none leading-7 text-pretty">
                      <PortableText value={person.bio as PortableTextBlock[]} />
                    </div>
                  ) : null}
                </FacultyBioDialog>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
