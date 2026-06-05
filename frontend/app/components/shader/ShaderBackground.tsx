'use client'

import {useEffect, useMemo, useRef, useState, useSyncExternalStore} from 'react'
import dynamic from 'next/dynamic'

import {
  defaultShaderPreset,
  isShaderPreset,
  shaderPresets,
  type ShaderPresetName,
} from './registry'

// Type-only import: erased at compile time, so it adds nothing to the runtime
// module graph (the actual canvas is loaded via `dynamic` below). It lets our
// hooks/uniforms match the package's strict `UniformType` without `any`.
import type {UniformType} from '@svey-xyz/simple-shader-component'

// Loaded only in the browser: the package touches `window`/WebGL at module
// scope-adjacent init and has no SSR story, so prerendering is disabled.
// `dynamic(..., {ssr:false})` is only legal inside a Client Component — hence
// the `'use client'` directive above.
const SimpleShaderCanvas = dynamic(
  () => import('@svey-xyz/simple-shader-component/react').then((m) => m.SimpleShaderCanvas),
  {ssr: false},
)

// MethodName is a real runtime enum in the package; mirror the values locally so
// we don't pull the (browser-only) core module into this module's static graph.
// TOUCH=0, INIT=1, LOOP=2, RENDER=3, RESIZE=4, INPUT=5.
const Method = {INIT: 1, LOOP: 2, RESIZE: 4} as const

// The shader/hook signatures from the package, kept minimal so we don't import
// the browser-only types at module scope (keeps the RSC graph clean) and never
// fall back to `any`.
type Uniform = {name: string; type: UniformType; value: number | number[]}
type ShaderInstance = {
  getElapsedTime: () => number
  setUniform: (u: Uniform) => void
  container: HTMLCanvasElement
}
type ShaderHook = (shader: ShaderInstance, ...args: unknown[]) => void
type ShaderArgs = {
  vertShader?: string
  fragShader?: string
  uniforms?: Array<Uniform>
  hooks?: Array<{methodName: number; hook: ShaderHook}>
  loadedClass?: string
}

export type ShaderBackgroundProps = {
  preset?: string | null
  speed?: number | null
  intensity?: number | null
  colorSource?: 'theme' | 'custom' | null
  customColor?: string | null
  opacity?: number | null
}

/** RGB in the 0–1 range that GLSL `vec3` uniforms expect. */
type Rgb = readonly [number, number, number]

const FALLBACK_RGB: Rgb = [1, 0.33, 0] // brand-ish accent if a read fails

// --- Reduced-motion as an external store (hydration-safe, no setState-in-effect,
// matching the `useSyncExternalStore` pattern used elsewhere in this repo). The
// server snapshot is `false` (assume motion-OK during SSR; the canvas is
// client-only anyway) and the client snapshot reflects the live media query.
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia(REDUCED_MOTION_QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}
function getReducedMotionSnapshot(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}
function getReducedMotionServerSnapshot(): boolean {
  return false
}

/**
 * Resolve the accent color the shader should paint with, normalized to 0–1 rgb.
 * `theme` reads the Tailwind `@theme` `--primary` HSL channel triplet off
 * `<html>` (the source of truth in `globals.css`); `custom` parses the author's
 * hex/rgb string. Done lazily on the client only — never during SSR.
 */
function readThemeRgb(): Rgb {
  if (typeof window === 'undefined') return FALLBACK_RGB
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
  const parsed = hslChannelsToRgb(raw)
  return parsed ?? FALLBACK_RGB
}

/** Parse a Tailwind/shadcn HSL channel triplet like "0 0% 9%" → 0–1 rgb. */
function hslChannelsToRgb(value: string): Rgb | null {
  if (!value) return null
  const m = value.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/)
  if (!m) return null
  const h = parseFloat(m[1])
  const s = parseFloat(m[2]) / 100
  const l = parseFloat(m[3]) / 100
  return hslToRgb(h, s, l)
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = ((h % 360) + 360) % 360 / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let r = 0
  let g = 0
  let b = 0
  if (hp < 1) [r, g, b] = [c, x, 0]
  else if (hp < 2) [r, g, b] = [x, c, 0]
  else if (hp < 3) [r, g, b] = [0, c, x]
  else if (hp < 4) [r, g, b] = [0, x, c]
  else if (hp < 5) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const m = l - c / 2
  return [r + m, g + m, b + m]
}

/** Parse an author `customColor` (#rgb/#rrggbb or rgb()/named) → 0–1 rgb. */
function parseCustomColor(value: string | null | undefined): Rgb | null {
  if (!value) return null
  const v = value.trim()
  const hex = v.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255,
    ]
  }
  // Fall back to letting the browser resolve named/rgb()/hsl() colors.
  if (typeof window !== 'undefined') {
    const probe = document.createElement('span')
    probe.style.color = v
    probe.style.display = 'none'
    document.body.appendChild(probe)
    const computed = getComputedStyle(probe).color
    document.body.removeChild(probe)
    const rgb = computed.match(/(\d+)\D+(\d+)\D+(\d+)/)
    if (rgb) {
      return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255]
    }
  }
  return null
}

/**
 * `ShaderBackground` — full-bleed animated WebGL background, positioned behind
 * its `relative` parent's content. Driven by a GLSL preset from `./registry`.
 *
 * Accessibility / motion:
 *   - `aria-hidden` wrapper, `pointer-events-none`, removed from the tab order;
 *     the canvas never receives focus and is invisible to assistive tech.
 *   - Under `prefers-reduced-motion: reduce` the WebGL canvas is **not mounted**
 *     at all — a static CSS gradient using the same color renders instead.
 *
 * Performance / correctness:
 *   - `args` is memoized on stable primitives so the package's cleanup-less
 *     `useEffect(..., [args])` does NOT re-create the `Shader` (and its rAF
 *     loop + listeners) on every parent re-render — the single most important
 *     correctness requirement under Visual-Editing re-renders.
 *   - Offscreen / hidden-tab → the canvas is **unmounted** (IntersectionObserver
 *     + `visibilitychange`). NOTE: package 1.1.1 has no `stopLoop`/cleanup, so a
 *     just-unmounted instance's loop can linger until GC; true pause lands with
 *     the SVE-42 hardened build. Unmounting still releases the DOM canvas and
 *     stops new instances from stacking.
 */
export default function ShaderBackground({
  preset,
  speed,
  intensity,
  colorSource,
  customColor,
  opacity,
}: ShaderBackgroundProps) {
  const presetName: ShaderPresetName = isShaderPreset(preset) ? preset : defaultShaderPreset
  const speedValue = typeof speed === 'number' && speed > 0 ? speed : 1
  const intensityValue = typeof intensity === 'number' && intensity >= 0 ? intensity : 1
  const resolvedOpacity =
    typeof opacity === 'number' ? Math.min(Math.max(opacity, 0), 1) : 1

  const wrapperRef = useRef<HTMLDivElement>(null)

  // Live shader handle so theme-recolor can re-push u_color without re-creating
  // the Shader (which would require touching the memoized `args`).
  const shaderRef = useRef<ShaderInstance | null>(null)

  // Resolved 0–1 rgb the canvas paints with; also used by the static fallback.
  const [color, setColor] = useState<Rgb>(FALLBACK_RGB)

  // Reduced-motion gate (client-only, hydration-safe via external store). When
  // reduced, we render the static gradient and never mount the canvas.
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  )

  // Visibility gate (offscreen / hidden tab) — unmounts the canvas when false.
  const [visible, setVisible] = useState(true)

  const mountCanvas = !reducedMotion && visible

  // --- Resolve + track the paint color (theme var or custom string) ---
  useEffect(() => {
    const update = () => {
      if (colorSource === 'custom') {
        setColor(parseCustomColor(customColor) ?? FALLBACK_RGB)
      } else {
        setColor(readThemeRgb())
      }
    }
    update()

    if (colorSource === 'custom') return

    // Theme toggle flips a class on <html> (next-themes attribute="class"); a
    // MutationObserver re-reads the accent var so the shader recolors live.
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme'],
    })
    return () => observer.disconnect()
  }, [colorSource, customColor])

  // Push the latest color into the live shader without rebuilding `args` (so the
  // Shader is never re-instantiated on recolor). Also re-fires when the canvas
  // (re)mounts — `SimpleShaderCanvas` is a child, so its effect creates the
  // Shader (and INIT captures `shaderRef`) before this parent effect runs.
  useEffect(() => {
    if (!mountCanvas) return
    shaderRef.current?.setUniform({name: 'u_color', type: 'vec3', value: [...color]})
  }, [color, mountCanvas])

  // --- Offscreen / hidden-tab visibility gate (unmounts the canvas) ---
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    let onScreen = true
    const computeVisible = () => setVisible(onScreen && !document.hidden)

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true
        computeVisible()
      },
      {rootMargin: '128px'},
    )
    io.observe(el)

    const onVisibility = () => computeVisible()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  // --- Memoized ShaderArgs (the critical correctness requirement) ---
  // Keyed ONLY on stable primitives (preset / speed / intensity). The color is
  // NOT baked in here — it's pushed via the `setUniform` effect above — so a
  // recolor never changes `args`' identity and therefore never re-instantiates
  // the Shader (the package's `useEffect(..., [args])` has no cleanup; a new
  // identity would spawn a duplicate rAF loop + listeners).
  const args = useMemo<ShaderArgs>(() => {
    const def = shaderPresets[presetName]
    const pushResolution = (shader: ShaderInstance) => {
      const c = shader.container
      shader.setUniform({
        name: 'u_resolution',
        type: 'vec2',
        value: [c.width || c.clientWidth || 1, c.height || c.clientHeight || 1],
      })
    }
    return {
      vertShader: def.vert,
      fragShader: def.frag,
      // Inert defaults (incl. the preset's default color) so the program links
      // and renders before the first hook/effect fires; the real color is set
      // by the recolor effect once the Shader is captured.
      uniforms: [
        {name: 'u_time', type: 'float', value: 0},
        {name: 'u_resolution', type: 'vec2', value: [1, 1]},
        ...def.uniforms.filter((u) => u.name === 'u_color'),
        {name: 'u_intensity', type: 'float', value: intensityValue},
      ],
      hooks: [
        {
          // Capture the instance (so the recolor effect can reach it) + seed
          // intensity/resolution on INIT.
          methodName: Method.INIT,
          hook: (shader) => {
            shaderRef.current = shader
            shader.setUniform({name: 'u_intensity', type: 'float', value: intensityValue})
            pushResolution(shader)
          },
        },
        {
          // Drive time every frame; `speedValue` scales the rate.
          methodName: Method.LOOP,
          hook: (shader) => {
            shader.setUniform({
              name: 'u_time',
              type: 'float',
              value: shader.getElapsedTime() * speedValue,
            })
          },
        },
        {
          // Keep resolution in sync on resize.
          methodName: Method.RESIZE,
          hook: pushResolution,
        },
      ],
    }
  }, [presetName, speedValue, intensityValue])

  // Static gradient (reduced motion, or pre-canvas paint). Uses the resolved
  // color so the fallback matches the animated version's hue.
  const [r, g, b] = color
  const cssColor = `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`
  const gradient = `radial-gradient(120% 120% at 30% 20%, ${cssColor} 0%, transparent 55%), radial-gradient(100% 100% at 80% 80%, ${cssColor} 0%, transparent 50%)`

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-hidden"
      style={{opacity: resolvedOpacity}}
    >
      {mountCanvas ? (
        <SimpleShaderCanvas args={args} className="absolute inset-0 block h-full w-full" />
      ) : (
        // Static CSS gradient fallback — reduced motion or offscreen.
        <div
          className="absolute inset-0 h-full w-full"
          style={{backgroundImage: gradient, opacity: 0.6}}
        />
      )}
    </div>
  )
}
