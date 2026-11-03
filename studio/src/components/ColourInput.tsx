import {useState} from 'react'
import {set, type StringInputProps} from 'sanity'
import {Box, Button, Flex, Stack, Text, TextInput} from '@sanity/ui'

/**
 * Room colour picker for `program.accent` (FB5). Stores a plain `#rrggbb`
 * string — no colour object, no plugin — because the frontend derives every
 * text and surface tone from it (`frontend/lib/room.ts`), so one value is all
 * the model needs.
 *
 * Native `<input type="color">` for picking, a hex field for pasting brand
 * values, and the original room colours as one-click presets.
 */

export const ROOM_PRESETS = [
  {title: 'Roses', value: '#bd000d'},
  {title: 'Shamrock', value: '#55ba0d'},
  {title: 'Violet', value: '#2222d8'},
] as const

// Pre-picker enum values, until `migrations/accent-to-hex` has run.
const LEGACY: Record<string, string> = {roses: '#bd000d', shamrock: '#55ba0d', violet: '#2222d8'}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

export function normaliseHex(input: string | undefined): string | undefined {
  const raw = input?.trim().toLowerCase()
  if (!raw) return undefined
  if (raw in LEGACY) return LEGACY[raw]
  const m = HEX.exec(raw)
  if (!m) return undefined
  const h = m[1]
  return `#${h.length === 3 ? [...h].map((c) => c + c).join('') : h}`
}

export function ColourInput(props: StringInputProps) {
  const {value, onChange, readOnly, elementProps} = props
  const current = normaliseHex(value)

  // Local draft so a half-typed hex isn't written; resync when the value
  // changes from outside (picker, preset, another editor).
  const [draft, setDraft] = useState(current ?? value ?? '')
  const [prev, setPrev] = useState(value)
  if (prev !== value) {
    setPrev(value)
    setDraft(current ?? value ?? '')
  }

  const commit = (next: string) => {
    const hex = normaliseHex(next)
    if (hex && hex !== value) onChange(set(hex))
  }

  return (
    <Stack gap={3}>
      <Flex gap={2} align="center">
        <input
          type="color"
          aria-label="Pick room colour"
          value={current ?? '#000000'}
          disabled={readOnly}
          onChange={(e) => commit(e.currentTarget.value)}
          style={{
            width: 44,
            height: 36,
            padding: 2,
            border: '1px solid var(--card-border-color)',
            borderRadius: 4,
            background: 'transparent',
            cursor: readOnly ? 'default' : 'pointer',
          }}
        />
        <Box flex={1}>
          <TextInput
            {...elementProps}
            value={draft}
            readOnly={readOnly}
            placeholder="#2222d8"
            onChange={(e) => {
              setDraft(e.currentTarget.value)
              commit(e.currentTarget.value)
            }}
          />
        </Box>
      </Flex>
      <Flex gap={2} wrap="wrap" align="center">
        <Text size={1} muted>
          Presets:
        </Text>
        {ROOM_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            mode={current === preset.value ? 'default' : 'ghost'}
            padding={2}
            fontSize={1}
            disabled={readOnly}
            onClick={() => commit(preset.value)}
            text={
              <Flex gap={2} align="center" as="span">
                <span
                  aria-hidden
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: preset.value,
                    display: 'inline-block',
                  }}
                />
                {preset.title}
              </Flex>
            }
          />
        ))}
      </Flex>
    </Stack>
  )
}
