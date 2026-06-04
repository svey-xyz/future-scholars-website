'use client'

import {useEffect, useState} from 'react'
import {useTheme} from '@teispace/next-themes'
import {MoonIcon, SunIcon} from '@heroicons/react/24/outline'

import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'

/**
 * Single light↔dark theme toggle (replaces the 3-way `ModeToggle` dropdown).
 *
 * The explicit "System" option is intentionally dropped from the UI: the app
 * still resolves to the OS preference on first load via `defaultTheme="system"`
 * in `app/layout.tsx`, and this control sets an explicit `light`/`dark`
 * thereafter.
 *
 * Icon-only, so it carries an action-reflecting `aria-label` (+ `sr-only` text).
 * The Sun/Moon swap keys off the `dark` class on <html> (provider
 * `attribute="class"`); `motion-reduce:transition-none` honours reduced motion
 * per docs/A11Y.md, and the provider's `disableTransitionOnChange` suppresses the
 * color-token transition during the switch.
 */
export default function ThemeToggle({className}: {className?: string}) {
  const {resolvedTheme, setTheme} = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Pre-mount the resolved theme is unknown (no `window` during SSR/first paint).
  // Reserve the 9×9 slot with an inert placeholder so the footer doesn't shift
  // on hydration and we never flash the wrong icon.
  if (!mounted) {
    return <div className={cn('h-9 w-9', className)} aria-hidden="true" />
  }

  const isDark = resolvedTheme === 'dark'
  const next = isDark ? 'light' : 'dark'
  const label = `Switch to ${next} mode`

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('relative', className)}
      onClick={() => setTheme(next)}
      aria-label={label}
    >
      <SunIcon
        className="h-5 w-5 rotate-0 scale-100 transition-all motion-reduce:transition-none dark:-rotate-90 dark:scale-0"
        aria-hidden="true"
      />
      <MoonIcon
        className="absolute h-5 w-5 rotate-90 scale-0 transition-all motion-reduce:transition-none dark:rotate-0 dark:scale-100"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </Button>
  )
}
