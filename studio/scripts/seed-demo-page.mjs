/**
 * Seeds a "/demo" page that exercises every page-builder block with filler
 * content, then publishes it.
 *
 * Run from the studio workspace with your own Sanity login (write access):
 *
 *   cd studio
 *   npx sanity exec scripts/seed-demo-page.mjs --with-user-token
 *
 * It uploads a handful of placeholder images (picsum.photos), wires up the
 * Hero / Features / Stats / Testimonials / Gallery / CTA / Info / FAQ blocks,
 * and points the Posts/Authors archives at your existing content (run
 * `npm run import-sample-data` first if the dataset is empty). Re-running
 * replaces the same `page.demo` document, so it is idempotent.
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-09-25'})

// ---- helpers ---------------------------------------------------------------

let n = 0
const key = (p = 'k') => `${p}${(n++).toString(36)}`

/** A single Portable Text paragraph block. */
const para = (text) => ({
  _type: 'block',
  _key: key('b'),
  style: 'normal',
  markDefs: [],
  children: [{_type: 'span', _key: key('s'), text, marks: []}],
})

/** A Portable Text heading block (used in the Info section). */
const h3 = (text) => ({
  _type: 'block',
  _key: key('b'),
  style: 'h3',
  markDefs: [],
  children: [{_type: 'span', _key: key('s'), text, marks: []}],
})

const hrefButton = (buttonText, href) => ({
  _type: 'button',
  _key: key('btn'),
  buttonText,
  link: {_type: 'link', linkType: 'href', href, openInNewTab: false},
})

const imageValue = (assetId, extra = {}) => ({
  _type: 'image',
  asset: {_type: 'reference', _ref: assetId},
  ...extra,
})

async function uploadImage(url, filename, alt) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, {filename})
  return {assetId: asset._id, alt}
}

// ---- main ------------------------------------------------------------------

async function run() {
  const [postCount, personCount] = await Promise.all([
    client.fetch('count(*[_type == "post" && defined(slug.current)])'),
    client.fetch('count(*[_type == "person"])'),
  ])

  console.log(`→ Found ${postCount} post(s) and ${personCount} author(s) for the archive blocks.`)
  console.log('→ Uploading placeholder images…')

  const hero = await uploadImage(
    'https://picsum.photos/seed/swc-hero/1600/1000',
    'demo-hero.jpg',
    'Abstract gradient artwork',
  )

  const gallery = []
  for (let i = 1; i <= 6; i++) {
    gallery.push(
      await uploadImage(
        `https://picsum.photos/seed/swc-gallery-${i}/900/900`,
        `demo-gallery-${i}.jpg`,
        `Gallery placeholder ${i}`,
      ),
    )
  }

  const avatars = []
  for (let i = 1; i <= 3; i++) {
    avatars.push(
      await uploadImage(
        `https://picsum.photos/seed/swc-avatar-${i}/200/200`,
        `demo-avatar-${i}.jpg`,
        `Portrait placeholder ${i}`,
      ),
    )
  }

  console.log('→ Building page document…')

  const pageBuilder = [
    // 1. Hero
    {
      _type: 'hero',
      _key: key('hero'),
      eyebrow: 'Page builder demo',
      heading: 'Every block, on one page',
      lede: 'A kitchen-sink page that renders each page-builder section with placeholder content. Edit any block in the Studio to see live Visual Editing.',
      buttons: [
        hrefButton('Get started', '#features'),
        hrefButton('Read the docs', 'https://www.sanity.io/docs'),
      ],
      image: imageValue(hero.assetId, {alt: hero.alt}),
      layout: 'split',
      theme: 'light',
    },

    // 2. Features grid
    {
      _type: 'featuresGrid',
      _key: key('feat'),
      heading: 'Built for speed and clarity',
      subheading: 'Composable sections you can rearrange without touching code.',
      columns: 3,
      features: [
        {
          _type: 'feature',
          _key: key('f'),
          icon: 'bolt',
          heading: 'Fast by default',
          text: 'Server-rendered sections keep the client bundle small and TTFB low.',
        },
        {
          _type: 'feature',
          _key: key('f'),
          icon: 'shield',
          heading: 'Accessible',
          text: 'Semantic markup and AA/AAA contrast tokens baked into every block.',
        },
        {
          _type: 'feature',
          _key: key('f'),
          icon: 'sparkles',
          heading: 'Visual editing',
          text: 'Click any element in Presentation to edit it in place.',
        },
        {
          _type: 'feature',
          _key: key('f'),
          icon: 'code',
          heading: 'Typed end to end',
          text: 'GROQ queries generate TypeScript types automatically.',
        },
        {
          _type: 'feature',
          _key: key('f'),
          icon: 'globe',
          heading: 'Edge ready',
          text: 'Streamed, cacheable, and happy on the edge runtime.',
        },
        {
          _type: 'feature',
          _key: key('f'),
          icon: 'cloud',
          heading: 'Content Lake',
          text: 'Structured content with real-time collaboration out of the box.',
        },
      ],
    },

    // 3. Stats
    {
      _type: 'stats',
      _key: key('stats'),
      heading: 'Numbers that matter',
      subheading: 'Illustrative metrics — swap in your own.',
      columns: 4,
      items: [
        {
          _type: 'stat',
          _key: key('st'),
          value: '99.9%',
          label: 'Uptime',
          description: 'Across all regions',
        },
        {
          _type: 'stat',
          _key: key('st'),
          value: '<50ms',
          label: 'TTFB',
          description: 'Median, cached',
        },
        {
          _type: 'stat',
          _key: key('st'),
          value: '10k+',
          label: 'Builds / mo',
          description: 'And counting',
        },
        {
          _type: 'stat',
          _key: key('st'),
          value: '4.9/5',
          label: 'Satisfaction',
          description: 'From 1,200 reviews',
        },
      ],
    },

    // 4. Testimonials
    {
      _type: 'testimonials',
      _key: key('tst'),
      heading: 'Loved by teams',
      subheading: 'What people say about the platform.',
      columns: 3,
      testimonials: [
        {
          _type: 'testimonial',
          _key: key('t'),
          quote:
            'We shipped our marketing site in a week and editors stopped filing tickets. The page builder just works.',
          authorName: 'Avery Chen',
          authorRole: 'Head of Marketing, Northwind',
          authorImage: imageValue(avatars[0].assetId, {alt: avatars[0].alt}),
        },
        {
          _type: 'testimonial',
          _key: key('t'),
          quote:
            'Visual Editing changed how our writers work. They see exactly what readers see, instantly.',
          authorName: 'Jordan Patel',
          authorRole: 'Content Lead, Lumen',
          authorImage: imageValue(avatars[1].assetId, {alt: avatars[1].alt}),
        },
        {
          _type: 'testimonial',
          _key: key('t'),
          quote:
            'Type-safe queries caught bugs before they shipped. Our Lighthouse scores have never been higher.',
          authorName: 'Sam Rivera',
          authorRole: 'Staff Engineer, Aperture',
          authorImage: imageValue(avatars[2].assetId, {alt: avatars[2].alt}),
        },
      ],
    },

    // 5. Gallery
    {
      _type: 'gallery',
      _key: key('gal'),
      heading: 'Gallery',
      layout: 'grid',
      columns: 3,
      aspect: 'square',
      enableLightbox: true,
      items: gallery.map((g, i) =>
        imageValue(g.assetId, {
          _type: 'galleryImage',
          _key: key('img'),
          alt: g.alt,
          caption: `Placeholder image ${i + 1}`,
        }),
      ),
    },

    // 6. Call to action (existing block)
    {
      _type: 'callToAction',
      _key: key('cta'),
      eyebrow: 'Ready?',
      heading: 'Start building today',
      body: [para('Spin up a project, model your content, and ship a page in minutes.')],
      button: hrefButton('Create a project', 'https://www.sanity.io/get-started'),
      theme: 'dark',
    },

    // 7. Info section (existing block)
    {
      _type: 'infoSection',
      _key: key('info'),
      heading: 'How it works',
      subheading: 'Three steps',
      content: [
        h3('1. Model'),
        para('Define documents and reusable objects as schema. Everything is structured content.'),
        h3('2. Compose'),
        para('Editors arrange blocks in the page builder; the frontend renders each one.'),
        h3('3. Ship'),
        para('Deploy to the edge with streaming, caching, and Visual Editing enabled.'),
      ],
    },

    // 8. FAQ
    {
      _type: 'faq',
      _key: key('faq'),
      heading: 'Frequently asked questions',
      subheading: 'The short version.',
      items: [
        {
          _type: 'faqItem',
          _key: key('q'),
          question: 'Can I reorder these blocks?',
          answer: [
            para('Yes — drag them in the page builder. Order is preserved on the frontend.'),
          ],
        },
        {
          _type: 'faqItem',
          _key: key('q'),
          question: 'Do the archives update automatically?',
          answer: [
            para(
              'The Posts and Authors archives pull live content, so new posts and people appear without editing this page.',
            ),
          ],
        },
        {
          _type: 'faqItem',
          _key: key('q'),
          question: 'Is this accessible?',
          answer: [
            para(
              'Each block targets WCAG AA at minimum; the FAQ uses native <details> for keyboard and screen-reader support with zero JavaScript.',
            ),
          ],
        },
        {
          _type: 'faqItem',
          _key: key('q'),
          question: 'How do I add my own images?',
          answer: [
            para(
              'Open any image field in the Studio and upload — these placeholders came from picsum.photos.',
            ),
          ],
        },
      ],
    },

    // 9. Posts archive (auto: latest)
    {
      _type: 'postsArchive',
      _key: key('parc'),
      heading: 'From the blog',
      subheading:
        postCount > 0
          ? 'Latest posts, pulled live.'
          : 'Import sample data to populate this section.',
      source: 'latest',
      limit: 6,
      columns: 3,
    },

    // 10. Authors archive (auto: all)
    {
      _type: 'authorsArchive',
      _key: key('aarc'),
      heading: 'Meet the authors',
      subheading:
        personCount > 0
          ? 'Everyone who contributes.'
          : 'Import sample data to populate this section.',
      source: 'all',
      limit: 12,
      columns: 3,
    },
  ]

  const doc = {
    _id: 'page.demo',
    _type: 'page',
    name: 'Demo — All Blocks',
    slug: {_type: 'slug', current: 'demo'},
    heading: 'Component demo',
    subheading: 'Every page-builder block with placeholder content',
    pageBuilder,
  }

  await client.createOrReplace(doc)

  const base = client.config().projectId
  console.log('\n✅ Published. The page is live at /demo')
  console.log(`   Studio: edit it under "Page" → "${doc.name}" (project ${base}).`)
  if (postCount === 0 || personCount === 0) {
    console.log(
      '   Tip: run `npm run import-sample-data` from the repo root to fill the archive blocks.',
    )
  }
}

run().catch((err) => {
  console.error('\n❌ Seed failed:', err.message)
  process.exit(1)
})
