import {type ClassValue, clsx} from 'clsx'
import {twMerge} from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalise a display phone number into a `tel:` href (FSMA, build plan S7).
 *
 * Strips formatting and prefixes the country code when the number has none: a
 * bare `tel:6132443762` is ambiguous once the caller is roaming or on a carrier
 * that does not assume a local NANP number, and this site's phone link *is* the
 * contact mechanism (D6 — no forms). Defaults to +1 because the school is in
 * Ontario; a number already carrying a `+` is left alone.
 */
export function telHref(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, '')
  return cleaned.startsWith('+') ? cleaned : `+1${cleaned}`
}
