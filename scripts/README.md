# scripts

One-off migration utilities. Not part of the build.

## `migrate-legacy-images.mjs`

Mirrors the legacy `futurescholarsmontessori.com` image set into the FSMA Sanity dataset as image
assets. Crawls the live site itself (27 pages, including the gallery sub-albums that aren't linked
from the main gallery index), so it needs egress to the **apex** host — `www.` is a separate host and
is not on this project's allowlist.

```bash
# dry run: crawl and report, upload nothing
node scripts/migrate-legacy-images.mjs --dry

# the real thing
SANITY_API_WRITE_TOKEN=sk... node scripts/migrate-legacy-images.mjs
```

The token needs `create` permission — Editor or higher. The app's `SANITY_API_READ_TOKEN` is
viewer-scoped and returns 403.

**Flags**

| Flag | Effect |
|---|---|
| `--dry` | Crawl only; write the page and path lists, upload nothing. No token needed. |
| `--include-thumbs` | Also upload the 115 legacy thumbnails. Off by default: they are 99×66 and 200×200 crops of images already in the set, and Sanity derives its own. |

**Output:** `scripts/legacy-assets.json` — a `path → {assetId, width, height, bytes}` map, plus the
crawled page list and any failures. Commit it; it is the record of what came from where, and the
input for wiring assets into documents.

**Idempotent.** Sanity deduplicates by content hash, and the script skips paths already present in
`legacy-assets.json`, so re-running after a partial failure resumes rather than duplicating.

**Expected result:** 27 pages crawled, 270 image paths found, 131 uploaded. 17 of the 270 are 404s on
the live site (`casagallery/casagallery11-16.jpg` and their thumbs — linked but never uploaded); the
script reports them under `failed` and carries on.
