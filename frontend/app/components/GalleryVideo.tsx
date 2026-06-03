'use client'

import {useState} from 'react'
import {PlayCircleIcon} from '@heroicons/react/24/solid'

import Image from '@/app/components/SanityImage'
import type {GalleryVideoItem} from '@/sanity/lib/types'
import {getVideoEmbed} from '@/app/components/gallery-utils'

type Props = {
  item: GalleryVideoItem
  sizes?: string
}

/**
 * Lazy YouTube/Vimeo facade. Renders a poster `<button>` only — no third-party
 * JS or iframe loads until the user clicks, keeping initial JS/TTFB low. On
 * click the poster is swapped for an autoplaying `<iframe>` with a proper
 * `title` (a11y) and a privacy-friendly embed host.
 *
 * Fills its (sized, `relative`) parent box. a11y: authors must enable captions
 * on the source video — see docs/A11Y.md (WCAG 1.2.2).
 */
export default function GalleryVideo({item, sizes}: Props) {
  const [active, setActive] = useState(false)
  const embed = getVideoEmbed(item.url)
  if (!embed) return null

  if (active) {
    return (
      <iframe
        src={embed.embedUrl}
        title={item.title}
        loading="lazy"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full border-0"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      aria-label={`Play video: ${item.title}`}
      className="group/vid absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {item.poster?.asset?._ref ? (
        <Image
          id={item.poster.asset._ref}
          alt={item.poster.alt || ''}
          width={1600}
          hotspot={item.poster.hotspot}
          crop={item.poster.crop}
          mode="cover"
          sizes={sizes}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : embed.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- provider thumbnail, not a Sanity asset
        <img
          src={embed.thumbnailUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-muted" />
      )}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover/vid:bg-black/30"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center text-white drop-shadow-lg transition-transform duration-300 will-change-transform motion-safe:group-hover/vid:scale-110"
      >
        <PlayCircleIcon className="size-16" />
      </span>
    </button>
  )
}
