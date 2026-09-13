# Legacy image inventory — measured 2026-09-13

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
720×480 at 60vh full-bleed is roughly a 3× upscale. This turns plan Q5 (photo shoot) from a
nice-to-have into a prerequisite for the design the client asked for. Options, in order of preference:
a client photo shoot; licensed stock as a stopgap; or a non-photographic masthead treatment
(brand colour field + logo) for pages with no usable image.

## Usable-with-care set (21 photos)

`casagallery/casagallery{1,2,3,5,6,7,8,9,10}.jpg` and `outsidegallery/outside{1..12}.jpg` — all
720×480, 100–220 KB. Fine for a gallery grid and for in-page section images. Not for mastheads.

## Broken references (404, do not chase)

`casagallery/casagallery{11..16}.jpg` and their thumbs — linked but never uploaded.

## Transport note

The legacy host is not on this session's egress allowlist, so no agent session can download these
files. They were measured through the desktop browser pane, which can reach the site. To upload them
to Sanity, either add `futurescholarsmontessori.com` to the allowlist, or download them locally and
upload with the Sanity CLI.
