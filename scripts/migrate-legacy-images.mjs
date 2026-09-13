#!/usr/bin/env node
/**
 * One-off migration: mirror the legacy futurescholarsmontessori.com image set
 * into the FSMA Sanity dataset as image assets.
 *
 *   SANITY_API_WRITE_TOKEN=sk... node scripts/migrate-legacy-images.mjs [--include-thumbs] [--dry]
 *
 * The token needs `create` permission (Editor or higher) — the app's
 * SANITY_API_READ_TOKEN is viewer-scoped and will 403.
 *
 * Idempotent: Sanity deduplicates by content hash, so re-running returns the
 * same asset ids rather than duplicating. Writes scripts/legacy-assets.json,
 * a path -> assetId map used to wire the assets into documents.
 *
 * Crawls the live site itself, so it needs egress to futurescholarsmontessori.com
 * (the apex — `www.` is a separate host and may not be allowlisted).
 */
import {writeFileSync, existsSync, readFileSync} from 'node:fs'

// Node's global fetch ignores HTTP(S)_PROXY. Harmless on a normal machine;
// required inside a sandbox that only has egress through a proxy.
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy
if (PROXY) {
  try {
    const {ProxyAgent, setGlobalDispatcher} = await import('undici')
    setGlobalDispatcher(new ProxyAgent(PROXY))
    console.log('routing through proxy from HTTPS_PROXY')
  } catch {
    console.warn('HTTPS_PROXY is set but undici is not installed — requests may fail')
  }
}

const BASE = 'https://futurescholarsmontessori.com/'
const PROJECT = 'wzs9gcps'
const DATASET = process.env.SANITY_DATASET || 'production'
const API = '2025-09-25'
const TOKEN = process.env.SANITY_API_WRITE_TOKEN
const INCLUDE_THUMBS = process.argv.includes('--include-thumbs')
const DRY = process.argv.includes('--dry')
const OUT = new URL('./legacy-assets.json', import.meta.url).pathname

if (!TOKEN && !DRY) {
  console.error('SANITY_API_WRITE_TOKEN is required (Editor or higher). Use --dry to crawl only.')
  process.exit(1)
}

const IMG_RE = /(?:images|Images)\/[^\s"'<>)]+?\.(?:jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)/g
const HREF_RE = /href\s*=\s*["']([^"'#?]+)["']/gi

/** Breadth-first crawl of every local .htm/.html page, collecting image paths. */
async function crawl() {
  const seen = new Set()
  const queue = ['index.html']
  const paths = new Set()
  while (queue.length) {
    const page = queue.shift()
    if (seen.has(page)) continue
    seen.add(page)
    let html
    try {
      const res = await fetch(BASE + page)
      if (!res.ok) continue
      html = await res.text()
    } catch {
      continue
    }
    for (const m of html.match(IMG_RE) || []) paths.add(m)
    for (const [, href] of html.matchAll(HREF_RE)) {
      const h = href.trim().replace(/^\.?\//, '')
      if (/^(https?:|mailto:|javascript:)/i.test(href)) continue
      if (/\.(html?|htm)$/i.test(h) && !seen.has(h)) queue.push(h)
    }
  }
  return {pages: [...seen].sort(), paths: [...paths].sort()}
}

const isThumb = (p) => /thumb/i.test(p)
// Site furniture, not content: sliced logo bitmaps, the spinner, the page
// background strip and two stray decorative pixels.
const isChrome = (p) => /logo slice|logo600|loading\.gif|bkgrndimg|images\/(a17|t01)\.png/i.test(p)

/** Human-readable name: images/specoccgallery/easter2014/easter3.jpg -> legacy-specocc-easter2014-easter3.jpg */
const filenameFor = (p) =>
  'legacy-' +
  p
    .replace(/^images\//, '')
    .replace(/specoccgallery\//, 'specocc-')
    .replace(/gallery\//g, '-')
    .replace(/\//g, '-')
    .replace(/-+/g, '-')

async function uploadOne(path) {
  const res = await fetch(BASE + encodeURI(path))
  if (!res.ok) return {path, error: `fetch ${res.status}`}
  const body = Buffer.from(await res.arrayBuffer())
  if (body.length < 100) return {path, error: 'too small'}
  const url =
    `https://${PROJECT}.api.sanity.io/v${API}/assets/images/${DATASET}` +
    `?filename=${encodeURIComponent(filenameFor(path))}`
  const up = await fetch(url, {
    method: 'POST',
    headers: {'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/octet-stream'},
    body,
  })
  const json = await up.json().catch(() => ({}))
  if (!up.ok) return {path, error: `upload ${up.status} ${JSON.stringify(json).slice(0, 200)}`}
  return {
    path,
    assetId: json.document._id,
    width: json.document.metadata?.dimensions?.width,
    height: json.document.metadata?.dimensions?.height,
    bytes: json.document.size,
  }
}

const {pages, paths} = await crawl()
const wanted = paths.filter((p) => !isChrome(p) && (INCLUDE_THUMBS || !isThumb(p)))
console.log(
  `crawled ${pages.length} pages, ${paths.length} image paths, ` +
    `${wanted.length} to upload (${INCLUDE_THUMBS ? 'including' : 'excluding'} thumbnails)`,
)
if (DRY) {
  writeFileSync(OUT, JSON.stringify({pages, paths, wanted}, null, 1))
  console.log('dry run — wrote', OUT)
  process.exit(0)
}

const existing = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}
const assets = existing.assets || {}
const failed = []
let done = 0
const CONCURRENCY = 5
const queue = wanted.filter((p) => !assets[p])
await Promise.all(
  Array.from({length: CONCURRENCY}, async () => {
    for (;;) {
      const p = queue.shift()
      if (!p) return
      const r = await uploadOne(p)
      if (r.error) failed.push(r)
      else assets[p] = r
      if (++done % 20 === 0) console.log(`  ${done}/${wanted.length}`)
    }
  }),
)
writeFileSync(OUT, JSON.stringify({pages, paths, assets, failed}, null, 1))
console.log(`uploaded ${Object.keys(assets).length}, failed ${failed.length}`)
if (failed.length) console.log('failures:', failed.slice(0, 10))
console.log('wrote', OUT)
