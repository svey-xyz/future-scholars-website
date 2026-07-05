import {type PortableTextBlock} from 'next-sanity'
import {stegaClean} from '@sanity/client/stega'
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  SparklesIcon,
  CheckCircleIcon,
  BellAlertIcon,
  FireIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline'

import PortableText from '@/app/components/portable-text/PortableText'
import Reveal from '@/app/components/motion/Reveal'
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert'
import {cn} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'note'>
  index: number
  pageId: string
  pageType: string
}

type Tone = NonNullable<ExtractPageBuilderType<'note'>['tone']>

/**
 * Per-tone presentation. Color is conveyed **alongside** an explicit text label
 * + a distinct icon (never color alone — see docs/A11Y.md). Colors are token
 * based (no hardcoded hex): the frosted card surface stays neutral; `danger`
 * borrows the semantic `destructive` token, while `info`/`warning` use the
 * monochrome border/foreground tokens (the palette has no amber, so warning is
 * carried by its triangle icon + label, which is the a11y-correct fallback).
 * Every pairing renders `text-foreground` body copy (~20:1 / ~19:1, AAA).
 */
const tones: Record<
  Tone,
  {label: string; Icon: React.ComponentType<{className?: string}>; surface: string; accent: string}
> = {
  info: {
    label: 'Note',
    Icon: InformationCircleIcon,
    surface: 'border-border',
    accent: 'text-foreground',
  },
  warning: {
    label: 'Warning',
    Icon: ExclamationTriangleIcon,
    surface: 'border-foreground/30',
    accent: 'text-foreground',
  },
  danger: {
    label: 'Danger',
    Icon: XCircleIcon,
    surface: 'border-destructive/60',
    accent: 'text-destructive',
  },
}

/** Optional Studio `icon` override → Heroicon. Keys mirror the schema list. */
const iconOverrides = {
  information: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  question: QuestionMarkCircleIcon,
  lightbulb: LightBulbIcon,
  sparkles: SparklesIcon,
  check: CheckCircleIcon,
  bell: BellAlertIcon,
  fire: FireIcon,
  shield: ShieldExclamationIcon,
} as const

export default function Note({block}: Props) {
  // `stegaClean`: enum values arrive stega-encoded in draft mode — using them
  // raw as lookup keys returns `undefined` and crashes (tones[tone]).
  const tone = (stegaClean(block?.tone) ?? 'info') as Tone
  const iconName = stegaClean(block?.icon) as keyof typeof iconOverrides | undefined
  const {label, Icon: DefaultIcon, surface, accent} = tones[tone] ?? tones.info
  const Icon = (iconName && iconOverrides[iconName]) || DefaultIcon

  if (!block?.content?.length) return null

  return (
    <div className="container my-12">
      <Reveal variant="scale" i={0} className="max-w-3xl">
        <Alert
          role="note"
          className={cn(
            // Frosted, toned card. Surface uses translucent card + blur so an
            // optional shader background shows through; border carries the tone.
            'supports-[backdrop-filter]:bg-card/70 bg-card/90 backdrop-blur-md',
            'p-5 shadow-sm [&>svg]:left-5 [&>svg]:top-5 [&>svg~*]:pl-8',
            surface,
          )}
        >
          <Icon className={cn('h-5 w-5', accent)} aria-hidden="true" />
          {/* Tone label is real text — tone is never conveyed by color alone. */}
          <AlertTitle className={cn('text-base font-medium', accent)}>{label}</AlertTitle>
          <AlertDescription className="text-foreground">
            <PortableText
              className="prose-sm max-w-none"
              value={block.content as PortableTextBlock[]}
            />
          </AlertDescription>
        </Alert>
      </Reveal>
    </div>
  )
}
