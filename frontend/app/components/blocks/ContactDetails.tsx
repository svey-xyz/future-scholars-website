import {ArrowTopRightOnSquareIcon} from '@heroicons/react/24/outline'

import Reveal from '@/app/components/motion/Reveal'
import {telHref} from '@/lib/utils'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'contactDetails'>
  index: number
  pageId: string
  pageType: string
}

/**
 * Contact details (build plan S7).
 *
 * Every value comes from Settings → Contact (see the schema note): the school's
 * details live in one place, so this block and S11's JSON-LD cannot disagree.
 *
 * Markup choices worth keeping:
 * - the address is a real `<address>`, which is the element for exactly this
 * - phone and email are `tel:` / `mailto:` (D6 — there are no forms on this
 *   site, so these links *are* the contact mechanism and have to work on a
 *   phone in one tap)
 * - hours are a `<dl>`, because "Monday – Friday" → "7:30 am – 5:30 pm" is a
 *   labelled pair, not a table and not two loose lines
 * - the map is a link, never an iframe (schema note, §7, D6)
 */
export default function ContactDetails({block}: Props) {
  const {heading, intro, showHours, showMapLink, secondaryEmail, contact} = block
  if (!contact) return null

  const {address, phone, fax, email, hours, mapUrl} = contact
  const addressLines = [
    address?.street,
    [address?.city, address?.region].filter(Boolean).join(', '),
    address?.postalCode,
  ].filter(Boolean) as string[]

  // Falls back to a maps search built from the address itself rather than
  // asking an editor to paste a URL. Derived from the address, not invented.
  const resolvedMapUrl =
    mapUrl ||
    (addressLines.length > 0
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLines.join(', '))}`
      : null)

  const emails = [email, secondaryEmail].filter(Boolean) as string[]
  const linkClass =
    'inline-flex min-h-11 items-center rounded-md underline underline-offset-4 decoration-primary/40 hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

  return (
    <section className="container my-12 lg:my-16">
      <header className="max-w-3xl">
        {heading && (
          <Reveal as="h2" className="text-2xl md:text-3xl lg:text-4xl">
            {heading}
          </Reveal>
        )}
        {intro && (
          <Reveal as="p" i={1} className="mt-3 text-lg leading-8 text-muted-foreground">
            {intro}
          </Reveal>
        )}
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-12">
        <Reveal className="flex flex-col gap-6">
          {addressLines.length > 0 && (
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Address
              </h3>
              <address className="mt-2 not-italic leading-7">
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              {showMapLink !== false && resolvedMapUrl && (
                <a
                  href={resolvedMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} mt-1 gap-1 text-sm`}
                >
                  Open in Maps
                  <ArrowTopRightOnSquareIcon aria-hidden="true" className="size-3.5" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
          )}

          {phone && (
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Phone
              </h3>
              <p className="mt-2">
                <a href={`tel:${telHref(phone)}`} className={linkClass}>
                  {phone}
                </a>
              </p>
            </div>
          )}

          {fax && (
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Fax
              </h3>
              <p className="mt-2 leading-7">{fax}</p>
            </div>
          )}

          {emails.length > 0 && (
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Email
              </h3>
              <ul className="mt-2 flex flex-col">
                {emails.map((emailAddress) => (
                  <li key={emailAddress}>
                    <a href={`mailto:${emailAddress}`} className={`${linkClass} break-all`}>
                      {emailAddress}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>

        {showHours !== false && hours && hours.length > 0 && (
          <Reveal i={1}>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Hours
            </h3>
            <dl className="mt-2 flex flex-col gap-2">
              {hours.map((row) => (
                <div key={row._key} className="flex flex-wrap justify-between gap-x-6 gap-y-1">
                  <dt className="font-medium">{row.days}</dt>
                  <dd className="text-muted-foreground">{row.time}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
    </section>
  )
}
