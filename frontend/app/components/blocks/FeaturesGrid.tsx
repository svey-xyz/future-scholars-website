import {
  AcademicCapIcon,
  BeakerIcon,
  BookOpenIcon,
  CalculatorIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  FaceSmileIcon,
  GlobeAmericasIcon,
  HandRaisedIcon,
  HeartIcon,
  HomeIcon,
  LightBulbIcon,
  MapPinIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  PhoneIcon,
  PuzzlePieceIcon,
  ShieldCheckIcon,
  SunIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

import {stegaClean} from '@sanity/client/stega'

import ResolvedLink from '@/app/components/common/ResolvedLink'
import Reveal from '@/app/components/motion/Reveal'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'featuresGrid'>
  index: number
  pageId: string
  pageType: string
}

// Keys mirror the `icon` options list in studio/src/schemaTypes/objects/featuresGrid.ts.
const icons = {
  academic: AcademicCapIcon,
  book: BookOpenIcon,
  puzzle: PuzzlePieceIcon,
  paint: PaintBrushIcon,
  music: MusicalNoteIcon,
  globe: GlobeAmericasIcon,
  science: BeakerIcon,
  math: CalculatorIcon,
  idea: LightBulbIcon,
  outdoors: SunIcon,
  care: HeartIcon,
  smile: FaceSmileIcon,
  independence: HandRaisedIcon,
  community: UserGroupIcon,
  home: HomeIcon,
  safety: ShieldCheckIcon,
  schedule: ClockIcon,
  calendar: CalendarDaysIcon,
  apply: ClipboardDocumentCheckIcon,
  document: DocumentTextIcon,
  talk: ChatBubbleLeftRightIcon,
  phone: PhoneIcon,
  email: EnvelopeIcon,
  location: MapPinIcon,
  check: CheckCircleIcon,
} as const

const colClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

export default function FeaturesGrid({block}: Props) {
  const {heading, subheading, features, columns} = block
  const cols = columns ?? 3
  const items = features ?? []

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

      <ul className={cn('mt-10 grid grid-cols-1 gap-8', colClass[cols])}>
        {items.map((feature, i) => {
          // `stegaClean`: enum arrives stega-encoded in draft mode; raw value
          // would miss the lookup and silently drop the icon.
          const iconName = stegaClean(feature.icon)
          const Icon = iconName ? icons[iconName] : null
          const link = feature.link
          const hasLink = Boolean(link && (link.href || link.page))

          const iconEl = Icon && (
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors duration-300 group-hover/feat:bg-primary group-hover/feat:text-primary-foreground">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
          )

          const body = (
            <>
              {iconEl}
              <h3 className="mt-4 text-lg font-medium">{feature.heading}</h3>
              {feature.text && (
                <p className="mt-2 leading-7 text-muted-foreground">{feature.text}</p>
              )}
            </>
          )

          return (
            <Reveal
              as="li"
              key={feature._key}
              i={i}
              className={cn(
                'group/feat rounded-xl',
                hasLink &&
                  'transition-transform duration-300 will-change-transform motion-safe:hover:-translate-y-1',
              )}
            >
              {hasLink && link ? (
                <ResolvedLink
                  link={link}
                  className="group block rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {body}
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                    Learn more
                    <span
                      aria-hidden="true"
                      className="transition-transform motion-safe:group-hover:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </span>
                </ResolvedLink>
              ) : (
                body
              )}
            </Reveal>
          )
        })}
      </ul>
    </section>
  )
}
