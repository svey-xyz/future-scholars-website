import {defineField, defineType} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons/Envelope'

import {anchorField} from './shared'

/**
 * Contact details (build plan S7).
 *
 * Deliberately holds **no** address, phone, email or hours of its own: it
 * renders whatever is in Settings → Contact, so the school's details live in
 * exactly one place and cannot drift between the page and the JSON-LD (S11)
 * that reads the same fields. Everything here is presentation.
 *
 * No embedded map. §7 and D6 both rule it out — a Google Maps iframe is a
 * third-party tracker on every page load plus a CLS liability, in exchange for
 * one link's worth of value. The map is a plain link out.
 */
export const contactDetails = defineType({
  name: 'contactDetails',
  title: 'Contact Details',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 2,
      description: 'Optional sentence above the details.',
    }),
    defineField({
      name: 'showHours',
      title: 'Show hours',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showMapLink',
      title: 'Show “Open in Maps” link',
      type: 'boolean',
      initialValue: true,
      description:
        'Links out to the map URL in Settings → Contact. No embedded map — it would load a third-party tracker on this page.',
    }),
    defineField({
      name: 'secondaryEmail',
      title: 'Secondary email',
      type: 'string',
      description:
        'Optional. The main email comes from Settings → Contact; use this only if a second address is genuinely published.',
      validation: (Rule) => Rule.email().warning('That does not look like an email address.'),
    }),
    anchorField,
  ],
  preview: {
    select: {heading: 'heading', anchor: 'anchor'},
    prepare({heading, anchor}) {
      return {
        title: heading || 'Contact Details',
        subtitle: anchor ? `From Settings · #${anchor}` : 'From Settings → Contact',
      }
    },
  },
})
