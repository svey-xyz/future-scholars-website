'use client'

import * as React from 'react'

import {cn} from '@/lib/utils'

type LightboxContextValue = {
  open: boolean
  index: number
  openAt: (index: number) => void
  close: () => void
  setIndex: (index: number) => void
}

const LightboxContext = React.createContext<LightboxContextValue | null>(null)

export function useLightbox() {
  const ctx = React.useContext(LightboxContext)
  if (!ctx) throw new Error('useLightbox must be used within <LightboxProvider>')
  return ctx
}

/**
 * Holds lightbox open-state + active index for one gallery. Wraps the layout
 * (grid/masonry/carousel) and the `<GalleryLightbox>` sibling, so triggers
 * anywhere in the tree can call `openAt(i)`. The server-rendered layout is
 * passed as `children`; client `LightboxTrigger`s inside it still read this
 * context across the RSC boundary.
 */
export default function LightboxProvider({children}: {children: React.ReactNode}) {
  const [open, setOpen] = React.useState(false)
  const [index, setIndex] = React.useState(0)

  const openAt = React.useCallback((i: number) => {
    setIndex(i)
    setOpen(true)
  }, [])
  const close = React.useCallback(() => setOpen(false), [])

  const value = React.useMemo<LightboxContextValue>(
    () => ({open, index, openAt, close, setIndex}),
    [open, index, openAt, close],
  )

  return <LightboxContext.Provider value={value}>{children}</LightboxContext.Provider>
}

/**
 * Transparent overlay button covering a tile; opens the lightbox at `index`.
 * Rendered server-side (grid/masonry) or client-side (carousel) — it only needs
 * the client context at runtime.
 */
export function LightboxTrigger({
  index,
  label,
  className,
  children,
}: {
  index: number
  label: string
  className?: string
  children?: React.ReactNode
}) {
  const {openAt} = useLightbox()
  return (
    <button
      type="button"
      onClick={() => openAt(index)}
      aria-label={label}
      className={cn(
        'absolute inset-0 z-10 cursor-zoom-in rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        className,
      )}
    >
      {children}
    </button>
  )
}
