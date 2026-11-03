import type {CSSProperties} from 'react'
import {roomHex} from './room-hex'

export {roomHex}

/**
 * Program room colours (FB5). Editors pick ONE colour per program
 * (`program.accent`, a hex string). Everything a reader has to perceive is
 * derived from it here, on the server, so the AAA guarantees hold for any pick:
 *
 * - `--room`        the colour as picked. Decorative only (rules, dots, washes):
 *                   a bright pick can be < 3:1, so it never carries text or icons.
 * - `--room-strong` same hue, darkened until it clears 7:1 against the tint, the
 *                   paper background, and white text on it. The only text tone.
 * - `--room-tint`   same hue, light surface, lightened until body and muted text
 *                   on it clear 7:1.
 *
 * Values are HSL channel triplets, matching every other token in globals.css
 * (`hsl(var(--room-strong))`). Components never branch on the colour — they
 * spread `roomStyle(accent)` onto a wrapper and use the `room`, `room-strong`
 * and `room-tint` utilities; outside a wrapper those fall back to the brand.
 */

const AAA = 7

type HSL = readonly [h: number, s: number, l: number]
type RGB = readonly [r: number, g: number, b: number]

// Fixed surfaces/text the derived tones are measured against (globals.css).
const WHITE: RGB = [1, 1, 1]
const PAPER = hslToRgb([38, 40, 97]) // --background
const FOREGROUND = hslToRgb([226, 30, 14]) // --foreground
const MUTED = hslToRgb([226, 16, 34]) // --muted-foreground

export type RoomTheme = {base: HSL; strong: HSL; tint: HSL}

/** Derives the three room tones from a picked colour. Pure; cheap enough to run per render. */
export function deriveRoom(hex: string): RoomTheme {
  const base = rgbToHsl(hexToRgb(hex))
  const [h, s] = base

  // Tint: a whisper of the hue. Start at 96% L and lighten until text clears AAA.
  let tint: HSL = [h, Math.min(s, 70), 96]
  while (
    tint[2] < 99.5 &&
    (contrast(FOREGROUND, hslToRgb(tint)) < AAA || contrast(MUTED, hslToRgb(tint)) < AAA)
  ) {
    tint = [h, tint[1], tint[2] + 0.5]
  }

  // Strong: start visibly deeper than the pick (≥ 6 points, ≤ 40% L) so text
  // reads as the room's ink rather than a copy of the rule, then darken until
  // it clears AAA as text on the tint and paper, and under white.
  const tintRgb = hslToRgb(tint)
  let strong: HSL = [h, Math.min(s, 90), Math.max(2, Math.min(base[2] - 6, 40))]
  const ok = (c: RGB) =>
    contrast(c, tintRgb) >= AAA && contrast(c, PAPER) >= AAA && contrast(WHITE, c) >= AAA
  while (strong[2] > 2 && !ok(hslToRgb(strong))) {
    strong = [h, strong[1], strong[2] - 0.5]
  }

  return {base, strong, tint}
}

/** Inline custom properties for a room wrapper, or `undefined` (brand fallback). */
export function roomStyle(accent?: string | null): CSSProperties | undefined {
  const hex = roomHex(accent)
  if (!hex) return undefined
  const {base, strong, tint} = deriveRoom(hex)
  return {
    '--room': triplet(base),
    '--room-strong': triplet(strong),
    '--room-tint': triplet(tint),
  } as CSSProperties
}

/* ---------------------------------------------------------------- colour math */

const round = (n: number) => Math.round(n * 10) / 10
const triplet = ([h, s, l]: HSL) => `${round(h)} ${round(s)}% ${round(l)}%`

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function rgbToHsl([r, g, b]: RGB): HSL {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return [0, 0, l * 100]
  const s = d / (1 - Math.abs(2 * l - 1))
  const h =
    max === r
      ? ((g - b) / d + (g < b ? 6 : 0)) * 60
      : max === g
        ? ((b - r) / d + 2) * 60
        : ((r - g) / d + 4) * 60
  return [h, s * 100, l * 100]
}

function hslToRgb([h, s, l]: HSL): RGB {
  const sat = s / 100
  const lig = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = sat * Math.min(lig, 1 - lig)
  const f = (n: number) => lig - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  return [f(0), f(8), f(4)]
}

function luminance(rgb: RGB): number {
  const [r, g, b] = rgb.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2.x contrast ratio. */
export function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
