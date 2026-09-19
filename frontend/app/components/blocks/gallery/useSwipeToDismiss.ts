'use client'

import {type RefObject, useCallback} from 'react'

/** Pull distance (px) past which releasing dismisses. */
const DISMISS_DISTANCE = 120
/** Or a short, fast flick: min distance (px) + average speed (px/ms). */
const FLICK_DISTANCE = 40
const FLICK_VELOCITY = 0.6
/** Movement (px) before the gesture commits to an axis. */
const AXIS_LOCK = 10

/**
 * Swipe-down-to-dismiss for the lightbox stage (Photos-style). Returns a
 * callback ref for the element that should follow the finger.
 *
 * Touch events, not pointer events: the stage sits inside Radix's scroll lock
 * and an Embla carousel, and the browser is free to claim a vertical pan and
 * fire `pointercancel` mid-gesture — `touchmove` keeps flowing regardless.
 * Mouse/pen users have backdrop click, the close button and Esc.
 *
 * The axis locks on the first ~10px: horizontal gestures are left entirely to
 * Embla (which itself bails on cross-axis drags), vertical-down ones are ours.
 * Multi-touch (pinch) aborts. Styles are written straight to the node — no
 * React state per `touchmove`. Drag progress is exposed as `--lb-drag` (0–1)
 * on the dialog root and the Radix overlay (a sibling, so it can't inherit) —
 * chrome, backdrop tint and blur all fade with it in CSS. `--lb-drag` is an
 * `@property` (globals.css), so the snap-back transitions it too.
 */
export function useSwipeToDismiss(
  onDismiss: () => void,
  overlayRef?: RefObject<HTMLElement | null>,
) {
  return useCallback(
    (el: HTMLElement | null) => {
      if (!el) return
      const root = el.closest<HTMLElement>('[role="dialog"]') ?? el
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

      let mode: 'idle' | 'pending' | 'vertical' | 'horizontal' = 'idle'
      let startX = 0
      let startY = 0
      let startT = 0
      let dy = 0

      const EASE = '240ms cubic-bezier(0.22, 1, 0.36, 1)'
      const apply = (y: number, animate: boolean) => {
        const smooth = animate && !reduceMotion.matches
        el.style.transition = smooth ? `transform ${EASE}` : ''
        el.style.transform = y
          ? `translate3d(0, ${y}px, 0) scale(${1 - Math.min(y / 2000, 0.15)})`
          : ''
        const progress = String(Math.min(y / 280, 1))
        for (const node of [root, overlayRef?.current]) {
          if (!node) continue
          node.style.transition = smooth ? `--lb-drag ${EASE}` : ''
          node.style.setProperty('--lb-drag', progress)
        }
      }

      const onStart = (e: TouchEvent) => {
        if (e.touches.length !== 1) {
          if (mode === 'vertical') apply(0, true)
          mode = 'idle'
          return
        }
        const t = e.touches[0]
        startX = t.clientX
        startY = t.clientY
        startT = e.timeStamp
        dy = 0
        mode = 'pending'
      }

      const onMove = (e: TouchEvent) => {
        if (mode === 'idle' || mode === 'horizontal') return
        const t = e.touches[0]
        const dx = t.clientX - startX
        const y = t.clientY - startY
        if (mode === 'pending') {
          if (Math.abs(dx) < AXIS_LOCK && Math.abs(y) < AXIS_LOCK) return
          mode = y > 0 && Math.abs(y) > Math.abs(dx) ? 'vertical' : 'horizontal'
          if (mode === 'horizontal') return
        }
        if (e.cancelable) e.preventDefault()
        dy = Math.max(0, y)
        apply(dy, false)
      }

      const onEnd = (e: TouchEvent) => {
        if (mode !== 'vertical') {
          mode = 'idle'
          return
        }
        mode = 'idle'
        const velocity = dy / Math.max(1, e.timeStamp - startT)
        if (
          e.type === 'touchend' &&
          (dy > DISMISS_DISTANCE || (dy > FLICK_DISTANCE && velocity > FLICK_VELOCITY))
        ) {
          onDismiss()
          return
        }
        apply(0, true)
      }

      const opts: AddEventListenerOptions = {passive: false}
      el.addEventListener('touchstart', onStart, {passive: true})
      el.addEventListener('touchmove', onMove, opts)
      el.addEventListener('touchend', onEnd)
      el.addEventListener('touchcancel', onEnd)
      return () => {
        el.removeEventListener('touchstart', onStart)
        el.removeEventListener('touchmove', onMove, opts)
        el.removeEventListener('touchend', onEnd)
        el.removeEventListener('touchcancel', onEnd)
      }
    },
    [onDismiss, overlayRef],
  )
}
