# Legacy image inventory — measured 2026-09-13, re-crawled after the allowlist opened

**Superseded numbers below.** The first pass only saw the pages linked from the main nav. A full
recursive crawl of the apex host finds **27 pages and 270 image paths** (253 downloadable, ~25 MB).
The 14 extra pages are gallery sub-albums that the gallery index never links to directly:
`halloween2013gallery`, `christmas2013gallery`, `1213graduationgallery`, `valentines2014gallery`,
`easter2014gallery`, `gardeninggallery`, `bakinggallery`, and the per-room facility galleries
(`infantfacility`, `toddlerfacility`, `casafacility`, `schoolfacility`).

Album breakdown (full images, excluding the 115 thumbnails and 4 chrome files):

| Album | Full images |
|---|---|
| Casa classroom | 16 |
| Outside / playground | 12 |
| Halloween 2013 | 16 |
| Easter 2014 | 10 |
| Christmas 2013 | 8 |
| Valentines 2014 | 8 |
| Graduation 2012/13 | 7 |
| Gardening | 7 |
| Baking | 7 |
| Facility (rooms) | 7 |
| Homepage slider | 3 |
| Misc (programs, testimonials, directors, mayor) | 24 |

`scripts/migrate-legacy-images.mjs` uploads these; `scripts/legacy-assets.json` records what landed
where.

---

## First pass (nav-linked pages only)

Measured in-browser (`naturalWidth`/`naturalHeight` + `content-length`) against the live site.
96 referenced paths; 12 of them 404. Total ~7.8 MB.

## The finding that matters

**Not one legacy image is 1000px or wider.** The plan's S10 rule ("cut anything under ~1000px on the
long edge") would discard the entire set. The largest files are:

| File | Size | Notes |
|---|---|---|
| `images/homepage/hp1-3.png` | 928×345 | jssor slider strips — a letterbox band, unusable as a masthead |
| `images/FutureScholarsMayor.jpg` | 789×1024 | portrait certificate scan, not photography |
| `casagallery/casagallery{1,2,3,5,6,7,8,9,10}.jpg` | 720×480 | 9 classroom photos — the best real photography on the site |
| `outsidegallery/outside1-12.jpg` | 720×480 | 12 playground photos |
| `FutureScholarsTest{3,4,5}.jpg` | ~325×335 | testimonial portraits |
| `aa1.jpg`, `pa1.jpg` | 156×192 | director portraits — too small for a faculty section |
| everything else | 200×200 or 99×66 | thumbnails |

**Consequence:** the masthead on every page (D12, §7.6) needs photography that does not exist yet.
720×480 at 60vh full-bleed is roughly a 3× upscale. **Resolved for now (2026-09-13):** the masthead
object gained a `brand` variant — a flat brand-colour panel with the reversed logo — and every page
and program is seeded with one. Real photography swaps a page to `variant: image` later; nothing else
has to change. The photo shoot (Q5) is still the right long-term answer.

## Usable-with-care set (21 photos)

`casagallery/casagallery{1,2,3,5,6,7,8,9,10}.jpg` and `outsidegallery/outside{1..12}.jpg` — all
720×480, 100–220 KB. Fine for a gallery grid and for in-page section images. Not for mastheads.

## Broken references (404, do not chase)

`casagallery/casagallery{11..16}.jpg` and their thumbs — linked but never uploaded.

## Transport note

The **apex** host `futurescholarsmontessori.com` is allowlisted as of 2026-09-13; `www.` is not, and
requests to it still 403. Use the apex everywhere.

---

## Migration result (2026-09-13)

`scripts/migrate-legacy-images.mjs` ran; **124 image assets** are in `production`. Fewer than the 131
the dry run counted because Sanity deduplicates by content hash — several images are byte-identical
across albums and collapsed into one asset each — and `1213grad/grad6.jpg` 404s.

**111 of the 124 are referenced by content.** The Gallery page carries 13 gallery blocks / 107 images,
every one with alt text and a resolving asset:

| Block | Images | Layout |
|---|---|---|
| The Roses room — Infants | 6 | grid |
| The Shamrock room — Toddlers | 4 | grid |
| The Violet room — Casa | 7 | grid |
| Casa children at work | 9 | masonry |
| Around the school | 7 | grid |
| Outside | 12 | masonry |
| Halloween 2013 | 16 | masonry |
| Christmas 2013 | 8 | grid |
| Graduation 2012–13 | 6 | grid |
| Valentine's Day 2014 | 8 | grid |
| Easter 2014 | 10 | masonry |
| Gardening | 7 | grid |
| Baking | 7 | grid |

Also wired: a six-image teaser on the home page, program card images for all three programs, and both
director portraits (which also clears `person.picture`'s required-field validation).

### The 13 assets deliberately left unreferenced

Preserved in the dataset, not placed on any page:

- `legacy-FutureScholarsMayor.jpg` — the "Recognition From The Mayor" certificate. **Q7** is still
  open: keep it, and where?
- `legacy-maria.gif` — the Maria Montessori portrait from `maria.htm`. A 250×326 GIF of a historical
  photograph; check provenance before republishing it (it is not FSMA's own image).
- `legacy-mapicon.jpg` — a decorative map pin from the old contact page. Superseded by the `mapUrl`
  link (D6: no embedded map).
- `legacy-homepage-hp1/2/3.png` — the jssor slider strips, 928×345. Unusable at any size the new
  design needs.
- `legacy-FutureScholarsPrgInf2/3`, `PrgTdlr2/3` — the second and third program thumbnails; one per
  program is enough for a card.
- `legacy-FutureScholarsTest3/4/5.jpg` — the three photos beside the testimonials on the old page.
  **Left off deliberately:** the legacy markup gives no attribution, so pairing one with a named
  family would assert something the source does not. Attach them only if the client confirms who is
  in each.

### Alt text

Every gallery image has alt text, but it is **album-level and indexed** ("Halloween celebration at
Future Scholars Montessori Academy, 2013 (7 of 16)") rather than describing that specific frame.
That clears the schema's requirement and is honest about what the image shows, but a human or vision
pass over the 107 would make it genuinely good. Worth doing before launch; noted in S10.
