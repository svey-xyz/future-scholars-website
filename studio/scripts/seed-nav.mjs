/**
 * Seeds the site navigation on the `settings` singleton to showcase the
 * CMS-driven header nav in several configs:
 *
 *   1. Pricing      — direct internal link, NO title → label falls back to the
 *                     page name ("Pricing").
 *   2. Services ▾   — disclosure-only dropdown (the label is NOT a link) mixing
 *                     internal pages + an external link, with title overrides:
 *                     Overview, Components demo, Next.js docs ↗.
 *   3. Company ▾    — second dropdown: a title override ("Our story" → /about),
 *                     a name-fallback child (Contact), and an external link
 *                     (GitHub ↗).
 *   4. Sanity ↗     — direct external link (opens in a new tab).
 *
 * It also sets the mobile-nav footer toggle and a legal disclaimer.
 *
 * ── Prerequisite ────────────────────────────────────────────────────────────
 * Deploy the new nav schema once so Studio can edit these fields and TypeGen
 * stays in sync (the frontend already reads them via GROQ, so it will render
 * the nav as soon as the data below exists — schema deploy is for Studio/types):
 *
 *   cd studio
 *   npx sanity schema deploy
 *
 * ── Run ─────────────────────────────────────────────────────────────────────
 * From the studio workspace, with your own Sanity login (write access):
 *
 *   cd studio
 *   npx sanity exec scripts/seed-nav.mjs --with-user-token
 *
 * Looks the demo pages up by slug, so create them first (services / pricing /
 * contact must exist; about + components-demo ship with the sample data).
 * Re-running just overwrites `settings.navigation`, so it is idempotent.
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-09-25'})

let n = 0
const key = (p = 'k') => `${p}${(n++).toString(36)}`

const ref = (id) => ({_type: 'reference', _ref: id})

/** A nav link to an internal page. Omit `title` to fall back to the page name. */
const internal = (id, title) => ({
  _type: 'navLink',
  _key: key('nl'),
  ...(title ? {title} : {}),
  link: {_type: 'link', linkType: 'page', page: ref(id), openInNewTab: false},
})

/** A nav link to an external URL (always opens in a new tab). */
const external = (title, href) => ({
  _type: 'navLink',
  _key: key('nl'),
  title,
  link: {_type: 'link', linkType: 'href', href, openInNewTab: true},
})

/** A disclosure-only dropdown. `title` is a trigger label, never a link. */
const dropdown = (title, links) => ({_type: 'navDropdown', _key: key('nd'), title, links})

/** Resolve a published page _id by slug (throws if missing). */
async function idForSlug(slug) {
  const id = await client.fetch(
    `*[_type == "page" && slug.current == $slug] | order(_updatedAt desc)[0]._id`,
    {slug},
  )
  if (!id) throw new Error(`No page found with slug "${slug}". Create/publish it first.`)
  return id.replace(/^drafts\./, '')
}

async function main() {
  const [pricing, services, contact, about, components] = await Promise.all(
    ['pricing', 'services', 'contact', 'about', 'components-demo'].map(idForSlug),
  )

  const navigation = [
    internal(pricing), // 1) name fallback → "Pricing"
    dropdown('Services', [
      internal(services, 'Overview'),
      internal(components, 'Components demo'),
      external('Next.js docs', 'https://nextjs.org'),
    ]),
    dropdown('Company', [
      internal(about, 'Our story'),
      internal(contact), // name fallback → "Contact"
      external('GitHub', 'https://github.com/svey-xyz/lptbia'),
    ]),
    external('Sanity', 'https://www.sanity.io'),
  ]

  // Preserve an existing title if there is one; only invent a placeholder if no
  // settings document exists at all.
  const existing = await client.fetch(
    `coalesce(*[_id == "settings"][0]{title}, *[_id == "drafts.settings"][0]{title})`,
  )
  await client.createIfNotExists({
    _id: 'settings',
    _type: 'settings',
    title: existing?.title || 'Site',
  })

  await client
    .patch('settings')
    .set({
      navigation,
      mobileNav: {showFooterContent: true},
      legal: `© ${new Date().getFullYear()} — All rights reserved.`,
    })
    .commit()

  console.log('✓ Seeded settings.navigation:')
  console.log('   • Pricing            (direct link · name fallback)')
  console.log('   • Services ▾         (Overview, Components demo, Next.js docs ↗)')
  console.log('   • Company ▾          (Our story, Contact, GitHub ↗)')
  console.log('   • Sanity ↗           (direct external link)')
  console.log('   + mobileNav.showFooterContent = true, legal disclaimer set')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
