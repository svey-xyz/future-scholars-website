import type {Metadata} from 'next'
import type {CSSProperties} from 'react'
import Link from 'next/link'
import {ArrowLeftIcon} from '@heroicons/react/24/outline'

import {Button} from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you were looking for could not be found.',
}

/**
 * Site-wide 404 (plan S12). Renders inside the root layout, so the rail,
 * ContactHub and footer stay in place and the visitor can navigate straight on.
 *
 * Static RSC — no Sanity fetch, so it is part of the prerendered shell and
 * costs no round trip. The two internal paths are stable by design: `/programs`
 * is fixed by D17 and `/about#contact` is a redirect target (next.config.ts).
 *
 * The illustration is a Montessori "pink tower" in academy blue with its
 * smallest cube hopped off to the side. It is decorative (`aria-hidden`); the
 * hop is a one-shot entrance gated on `prefers-reduced-motion` in globals.css,
 * and the resting pose is static, so reduced-motion users see the same picture.
 */
export default function NotFound() {
  return (
    <section className="container flex grow items-center py-16 lg:py-24">
      <div className="grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
        <div className="max-w-xl">
          <p className="enter text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Error 404 · Page not found
          </p>
          <h1
            className="enter mt-4 text-4xl text-balance text-primary sm:text-5xl"
            style={{'--enter-d': '90ms'} as CSSProperties}
          >
            This page has wandered off
          </h1>
          <div
            className="enter mt-6 space-y-4 text-lg leading-8 text-muted-foreground"
            style={{'--enter-d': '180ms'} as CSSProperties}
          >
            <p>
              Even the best explorers take a wrong turn. The page may have moved when we rebuilt our
              website, or the address may have a typo.
            </p>
            <p>Try one of these instead, or use the menu.</p>
          </div>
          <div
            className="enter mt-8 flex flex-wrap items-center gap-3"
            style={{'--enter-d': '260ms'} as CSSProperties}
          >
            <Button asChild size="lg" className="h-11 rounded-full px-6">
              <Link href="/" transitionTypes={['nav-back']}>
                <ArrowLeftIcon aria-hidden="true" />
                Home page
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 rounded-full px-6">
              <Link href="/programs" transitionTypes={['nav-forward']}>
                Our programs
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 rounded-full px-6">
              <Link href="/about#contact" transitionTypes={['nav-forward']}>
                Contact us
              </Link>
            </Button>
          </div>
        </div>

        <WanderingTower className="mx-auto w-52 sm:w-64 lg:mr-16 lg:w-72 xl:mr-24 xl:w-80" />
      </div>
    </section>
  )
}

/** Decorative: a stacked tower with its top cube resting on the floor beside it. */
function WanderingTower({className}: {className?: string}) {
  // Cubes, bottom → top: [x, y, size]. Centred on x = 130, floor at y = 280.
  const cubes: Array<[number, number, number]> = [
    [88, 196, 84],
    [96, 128, 68],
    [103, 74, 54],
    [109, 32, 42],
  ]

  return (
    <svg
      viewBox="0 0 340 300"
      className={className}
      overflow="visible"
      aria-hidden="true"
      focusable="false"
    >
      {/* Floor */}
      <line
        x1="16"
        y1="280.5"
        x2="324"
        y2="280.5"
        className="stroke-input"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Tower */}
      {cubes.map(([x, y, s], i) => (
        <g key={i}>
          <rect x={x} y={y} width={s} height={s} rx="4" className="fill-primary" />
          {/* Top-edge highlight gives the stack some depth without a 3D face. */}
          <rect
            x={x + 4}
            y={y + 4}
            width={s - 8}
            height="4"
            rx="2"
            className="fill-primary-foreground/20"
          />
        </g>
      ))}
      {/* Where the missing cube belongs */}
      <rect
        x="115"
        y="2"
        width="30"
        height="30"
        rx="4"
        fill="none"
        className="stroke-brand-accent-strong"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      {/* Its path to the floor */}
      <path
        d="M146 12 Q 240 -8 262 236"
        fill="none"
        className="stroke-brand-accent-strong"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 7"
      />
      {/* The wanderer: the outer group carries the one-shot hop, the inner
          group its static resting tilt. */}
      <g className="nf-hop">
        <g transform="rotate(14 265 262)">
          <rect
            x="250"
            y="247"
            width="30"
            height="30"
            rx="4"
            className="fill-brand-accent stroke-primary"
            strokeWidth="2"
          />
        </g>
      </g>
    </svg>
  )
}
