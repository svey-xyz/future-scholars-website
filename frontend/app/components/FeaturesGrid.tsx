import {
  BeakerIcon,
  BoltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CloudIcon,
  CodeBracketIcon,
  CpuChipIcon,
  CursorArrowRaysIcon,
  GlobeAltIcon,
  HeartIcon,
  LockClosedIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

import ResolvedLink from '@/app/components/ResolvedLink'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'featuresGrid'>
  index: number
  pageId: string
  pageType: string
}

const icons = {
  beaker: BeakerIcon,
  bolt: BoltIcon,
  chart: ChartBarIcon,
  check: CheckCircleIcon,
  chip: CpuChipIcon,
  cloud: CloudIcon,
  code: CodeBracketIcon,
  cursor: CursorArrowRaysIcon,
  globe: GlobeAltIcon,
  heart: HeartIcon,
  lock: LockClosedIcon,
  rocket: RocketLaunchIcon,
  shield: ShieldCheckIcon,
  sparkles: SparklesIcon,
  star: StarIcon,
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
        {heading && <h2 className="text-2xl md:text-3xl lg:text-4xl">{heading}</h2>}
        {subheading && (
          <p className="mt-3 text-lg leading-8 text-muted-foreground">{subheading}</p>
        )}
      </header>

      <ul className={cn('mt-10 grid grid-cols-1 gap-8', colClass[cols])}>
        {items.map((feature) => {
          const Icon = feature.icon ? icons[feature.icon] : null
          const link = feature.link
          const hasLink = Boolean(link && (link.href || link.page || link.post))

          const body = (
            <>
              {Icon && (
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
              )}
              <h3 className="mt-4 text-lg font-medium">{feature.heading}</h3>
              {feature.text && (
                <p className="mt-2 leading-7 text-muted-foreground">{feature.text}</p>
              )}
            </>
          )

          return (
            <li key={feature._key}>
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
                      className="transition-transform motion-safe:group-hover:translate-x-0.5"
                    >
                      &rarr;
                    </span>
                  </span>
                </ResolvedLink>
              ) : (
                body
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
