import {stegaClean} from '@sanity/client/stega'

/**
 * `program.accent` → normalised `#rrggbb` (used by `room.ts`). Standalone and
 * dependency-light, so a client component can import it without pulling in the
 * colour derivation — prefer passing `roomStyle()` output from an RSC instead.
 */

/** Pre-picker enum values (FB5 v1), until `studio/migrations/accent-to-hex` has run. */
const LEGACY: Record<string, string> = {
  roses: '#bd000d',
  shamrock: '#55ba0d',
  violet: '#2222d8',
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/** Stega-safe: draft-mode values carry invisible markers. Invalid → `undefined`. */
export function roomHex(accent?: string | null): string | undefined {
  const raw = stegaClean(accent ?? undefined)
    ?.trim()
    .toLowerCase()
  if (!raw) return undefined
  if (raw in LEGACY) return LEGACY[raw]
  const m = HEX.exec(raw)
  if (!m) return undefined
  const h = m[1]
  return `#${h.length === 3 ? [...h].map((c) => c + c).join('') : h}`
}
