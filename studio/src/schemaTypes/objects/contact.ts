import {defineArrayMember, defineField, defineType} from 'sanity'

export const contact = defineType({
  title: 'Contact',
  name: 'contact',
  type: 'object',
  fields: [
    defineField({
      title: 'Email',
      name: 'email',
      type: 'string',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      title: 'Phone',
      name: 'phone',
      type: 'string',
      validation: (Rule) =>
        Rule.regex(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, {name: 'phone number'}),
    }),
    // The legacy site publishes a fax number. It is close to useless in 2026,
    // but it is a contact method the school currently advertises — dropping it
    // is the client's call (OWNER-TODO), not a migration decision.
    defineField({
      title: 'Fax',
      name: 'fax',
      type: 'string',
      description: 'Optional. Only shown if set.',
    }),
    // defineField({
    // 	title: 'Website',
    // 	name: 'website',
    // 	type: 'link',
    // }),
    defineField({
      title: 'Address',
      name: 'address',
      type: 'object',
      description:
        'Street address, used for the contact section and the Organization/LocalBusiness JSON-LD.',
      options: {collapsible: true, collapsed: false},
      fields: [
        defineField({name: 'street', title: 'Street address', type: 'string'}),
        defineField({name: 'city', title: 'City', type: 'string'}),
        defineField({
          name: 'region',
          title: 'Province / State',
          type: 'string',
          description: 'Two-letter code where one exists, e.g. "ON".',
        }),
        defineField({name: 'postalCode', title: 'Postal code', type: 'string'}),
        defineField({
          name: 'country',
          title: 'Country',
          type: 'string',
          description: 'ISO 3166-1 alpha-2 code, e.g. "CA".',
          initialValue: 'CA',
        }),
      ],
      preview: {
        select: {title: 'street', subtitle: 'city'},
      },
    }),
    defineField({
      title: 'Opening hours',
      name: 'hours',
      type: 'array',
      description:
        'One row per distinct schedule, e.g. "Monday – Friday" / "7:00 AM – 6:00 PM". Order is the display order.',
      of: [
        defineArrayMember({
          name: 'hoursRow',
          title: 'Hours',
          type: 'object',
          fields: [
            defineField({
              name: 'days',
              title: 'Days',
              type: 'string',
              description: 'Human-readable day range, e.g. "Monday – Friday".',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'time',
              title: 'Time',
              type: 'string',
              description: 'Human-readable time range, e.g. "7:00 AM – 6:00 PM", or "Closed".',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'schemaOrg',
              title: 'Structured-data equivalent',
              type: 'string',
              description:
                'Optional schema.org openingHours string for JSON-LD, e.g. "Mo-Fr 07:00-18:00". Leave empty to omit this row from structured data.',
            }),
          ],
          preview: {
            select: {title: 'days', subtitle: 'time'},
          },
        }),
      ],
    }),
    defineField({
      title: 'Map link',
      name: 'mapUrl',
      type: 'url',
      description:
        'Link to the location on a map provider. Rendered as a plain link — no embedded iframe.',
    }),
    defineField({
      title: 'Socials',
      name: 'socials',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'social',
        }),
      ],
    }),
  ],
})
