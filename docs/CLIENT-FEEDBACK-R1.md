# FSMA — Client feedback, round 1 (plan)

**Source:** handwritten notes from the client, transcribed and interpreted 2026-11-02. Every interpretation in §3 has been **confirmed by svey**.
**Status:** ready to start. F1–F3 have no blockers. F4 waits on client content.
**Supersedes:** nothing. This sits beside `docs/FSMA-BUILD-PLAN.md` and does not replace it. Run these sessions before S12 (Audit, polish, cutover).

---

## 0. Start here (read before any session)

You are working on **Future Scholars Montessori Academy** (FSMA, Ottawa), a Next.js 16 + Sanity v6 monorepo. This document is self-contained for the feedback work, but the repo rules still apply.

1. **Read first, in order:**
   - `CLAUDE.md` (stack, layout, stega discipline, Cache Components rules)
   - `AGENTS.md` (read `node_modules/next/dist/docs/` before Next work)
   - `docs/A11Y.md` (before UI work)
   - `docs/CACHING.md` (before data fetching)
   - `docs/TRANSITIONS.md`
   - `docs/FSMA-BUILD-PLAN.md` §3 (locked decisions) and §9 (acceptance bars)
2. **Sanity:** project `wzs9gcps`, dataset `production`. Use the Sanity MCP tools (`query_documents`, `patch_documents`, `get_schema`).
3. **Hard rules:**
   - **Content:** edit through the MCP **as drafts only**. Never call `publish_documents`; svey reviews in Presentation and publishes.
   - **Existing drafts:** before patching a document, check whether `drafts.<id>` already exists. If it does, patch the draft, not the published version. One unrelated draft exists today: `drafts.8366f569-69ee-426c-94d4-1764b950f357`. Leave it alone.
   - **Schema deploys:** never deploy the schema or Studio, and never use MCP `deploy_schema`. svey runs `cd studio && npx sanity schema deploy && npx sanity deploy`. Put it in the PR's owner checklist.
   - **TypeGen:** after any schema change, run `npm run typegen` from the repo root before touching queries.
   - **Packages:** use npm only. Don't run `npm install` (it rewrites the lockfile), and add no new dependencies.
   - **Git:** branch `feat/fsma-f<N>-<slug>` from `main`. Commit locally with the attribution lines; **don't push** (svey pushes). The working tree may contain svey's uncommitted work: never stash, reset or check it out. If a file you must change has uncommitted edits, stop and ask.
   - **Stega:** any CMS string used in logic (enum lookups, `===`, `href`, `id`) goes through `stegaClean` first.
4. **At the end of every session:**
   - Add a row to `docs/FSMA-BUILD-PLAN.md` §11 (session log).
   - Add any new decision to §12 (decisions log).
   - Tick the matching items in §6 of this file.
   - Add owner actions (deploys, publishes) to `docs/OWNER-TODO.md`.
   - Before committing, run `npm run lint` and `npm run type-check`.

## 1. Decisions (locked 2026-11-02)

| # | Client note | Decision |
|---|---|---|
| FB1 | "all emails should be futurescholarsmontesori@gmail.com" | The single "s" is a handwriting slip. Use **`futurescholarsmontessori@gmail.com`** everywhere and remove `info@futurescholarsmontessori.com` from the site. |
| FB2 | "Justify all paragraphs pls." | **Don't justify.** Justified text fails WCAG 1.4.8 (AAA, our target per D10). Body copy stays left-aligned with `text-pretty` and a `max-w-[65ch]` line length. svey sends the client the note in §5. |
| FB3 | "hat black → keep uniform across site" | The graduation cap is **black on every logo**. The reversed (white) artwork keeps white lettering, but the cap becomes `#191E2E` with a thin white keyline. Only `Masthead.tsx` uses the reversed artwork; the side rail and mobile bar already use the standard art. |
| FB4 | "Add the saucas to toddlers as well" | "saucas" = "Casa's". Toddlers gets a curriculum-areas sentence like Casa's. The client supplies the list of areas, so this lands in F4. |
| FB5 | "All programs — same light blue banner — red, green, blue" | All three program mastheads use `tone: 'secondary'` (soft sky). Each gets a **room accent** matching the legacy facility gallery (futurescholarsmontessori.com/facilitygallery.htm): **Roses / Infants = red**, **Shamrock / Toddlers = green**, **Violet / Casa = blue**. Colours are sampled from the legacy room thumbnails (§4.1). |
| FB6 | Circled letters by the faculty note | They spell **T-E-A-C-H-E-R** in circles. They are a layout sketch: teachers appear as **circular headshots in a grid**, about four per row. |
| FB7 | "photos & bldg of all teachers (clickable)" | "bldg" = **bios**. Clicking a teacher opens that teacher's bio. |
| FB8 | "Gallery → last" | Move the **Galleries** item to the end of the side nav, after About Us. |
| FB9 | "FSMA → bigger and more bottom" | On the **home** masthead, the logo gets larger and sits at the bottom centre. |
| FB10 | Hours (school 7:30–5:30, office 9:30–3:30, core 9:00–4:00) | **Hours live only in `settings.contact.hours`**, extending D16. Remove them from prose and from `program.scheduleNote`; the program page's "At a glance" reads the Core program row from settings. |
| FB11 | "facility & neighborhood → map beside" | **Reopens the §12 decision "the map is a link, not an iframe".** Add an embedded map beside the Facility and Neighbourhood copy (spec in F3). Log the reversal in §12. |

## 2. Content map (IDs you'll need)

| What | Document `_id` | Path / `_key` |
|---|---|---|
| Settings singleton | `settings` | `contact.email`, `contact.hours[]` (rows `h1`, `h2`), `navigation[]` |
| Galleries nav dropdown | `settings` | `navigation[_key=="17e35ad3e989"]`. Its links `f6a73f2d1502` (Facilities page) and `0bf5a76372ca` (Special Occasions page) have `title: null` |
| About page | `page-about` | blocks in order: `afacility` (infoSection, anchor `about`), `afaculty` (infoSection), `adirectors` (infoSection, anchor `directors`), `afacultygrid` (facultyGrid), `aadmissions` (infoSection), `aprocess` (featuresGrid), `atour` (CTA), `acontactdetails` (contactDetails, anchor `contact`) |
| Home page | `page-home` | `hmission` (Our Mission), `hfaculty` (facultyGrid `highlight`; its button links to `page-about#directors`, so keep that anchor) |
| Programs | `program-infants`, `program-toddlers`, `program-casa` | `masthead.tone`, `scheduleNote`, `summary`, `body[]` |
| Directors | `person-agata-attersoll`, `person-priyanka-aggarwal` | `bio` (Portable Text), `credentials[]`, `picture` (both empty) |
| Facilities page | `087ec4af-e1ba-4199-bc7c-c1534e8273b9` | gallery anchors `roses-room`, `shamrock-room`, `violet-room` |
| Special Occasions page | `18c58df5-b7c1-4acf-8ba4-f030e211c3aa` | — |

**Code you'll touch:**

| Area | Files |
|---|---|
| Schemas | `studio/src/schemaTypes/objects/{masthead,infoSection,facultyGrid,contact}.ts`, `studio/src/schemaTypes/documents/program.ts` |
| Layout | `frontend/app/components/layout/Masthead.tsx`, `frontend/public/brand/logo-reversed.svg`, `logo-mark-reversed.svg` |
| Program page | `frontend/app/programs/[slug]/page.tsx` |
| Blocks | `frontend/app/components/blocks/{InfoSection,FacultyGrid,ProgramsGrid}.tsx` |
| Queries / styles | `frontend/sanity/lib/queries.ts`, `frontend/app/globals.css` |
| UI | `frontend/components/ui/dialog.tsx` (shadcn, already installed) |

---

## 3. Sessions

### F1 — Content pass · Sanity drafts only, no code · ~1.5 h · branch: none (no repo changes beyond docs)

Use `patch_documents`. For Portable Text, target the span directly, e.g. `pageBuilder[_key=="aadmissions"].content[_key=="aa3"].children[_key=="aa3s"].text`. Match text **exactly**; if the current text differs from "Before", stop and report.

**1. Email (FB1)**
- `settings.contact.email` → `futurescholarsmontessori@gmail.com`.
- `page-about` → `acontactdetails.secondaryEmail`: **unset** (it would duplicate the primary).
- `page-about` → `aadmissions` → `aa2`:
  - Before: `Please schedule a tour by calling our office at 613-244-FSMA (3762), or email us at info@futurescholarsmontessori.com`
  - After: `Please schedule a tour by calling our office at 613-244-FSMA (3762), or email us at futurescholarsmontessori@gmail.com.`

**2. Deposit**
- `aadmissions` → `aa3`, and `aprocess` → `features[_key=="ap3"].text`:
  - Before: `Following the tour, FSMA will accept the application and a non-refundable deposit.`
  - After: `Following the tour, FSMA will accept the application and a deposit.`

**3. Hours (FB10)**
- Replace `settings.contact.hours` with three rows. Keep `_type: 'hoursRow'`. F2 adds a `key` field, so don't set one yet.

  | `_key` | `days` (label) | `time` | `schemaOrg` |
  |---|---|---|---|
  | `h-school` | `School hours` | `Mon – Fri, 7:30 am – 5:30 pm` | `Mo-Fr 07:30-17:30` |
  | `h-office` | `Office hours` | `Mon – Fri, 9:30 am – 3:30 pm` | *(unset)* |
  | `h-core` | `Core program` | `9:00 am – 4:00 pm` | *(unset)* |

- `page-about` → `afacility` → `af3` (span `af3s`):
  - Before: `FSMA's hours of operation are between 7:30 am and 5:30 pm. The Montessori part of the day is between 8:30 am and 3:30 pm. Parents can choose a most suitable time within those time frames for their child. Please inquire with the office as to which options would work best for you.`
  - After: `Parents can choose the schedule that best suits their child within our school hours, listed under Contact below. Please ask the office which options would work best for you.`
- All three programs: **unset `scheduleNote`**. The old value ("…8:30 am – 3:30 pm. TODO(client): confirm.") is now wrong. Better a missing row in "At a glance" than wrong hours; F2 restores the row from settings.

**4. Program banners (FB5, tone only)**
- `program-toddlers.masthead.tone`: `primary` → `secondary`.
- `program-casa.masthead.tone`: `ink` → `secondary`.
- Infants is already `secondary`.

**5. Toddlers copy (`program-toddlers`)**
- `summary`:
  - Before: `Where children learn to belong to a community while their own personalities take shape, through practical life skills and growing independence.`
  - After: `Where children learn to belong to a community, building independence and critical thinking through everyday life skills.`
- `body[_key=="tod1"]` (span `tod1s`): replace `accommodate the growing needs of its occupants.` with `accommodate the growing needs of the children.`
- `body[_key=="tod2"]` (span `tod2s`): replace `At this stage, the children develop most of their personalities, enhance their mobility, improve gross and fine motor skills.` with `At this stage, the children develop independence and critical thinking, enhance their mobility, and improve their gross and fine motor skills.`

**6. Directors**
- `person-agata-attersoll.bio`, first block:
  - `has been a Montessori Directress for over a decade.` → `has been a Montessori Directress for almost three decades.`
  - Fix the typo `Tall Pines Motnessori School` → `Tall Pines Montessori School`.
- `person-priyanka-aggarwal.credentials`: **append** `Montessori Early Childhood Diploma, North American Montessori Center`. Her new bio comes in F4.

**7. Navigation (FB8)**
- Move `settings.navigation[_key=="17e35ad3e989"]` (Galleries) to the end of the array.
- Set its link titles: `f6a73f2d1502` → `Facilities`, `0bf5a76372ca` → `Special Occasions`.

**8. Sweep for leftovers**
Query every `page`, `program`, `person`, `testimonial` and `settings` doc for:
- `info@`
- `non-refundable`
- `8:30`, `3:30` (outside settings)
- `occupants`

Use `pt::text()` on Portable Text fields and also check plain strings (`summary`, `scheduleNote`, CTA bodies, feature texts). Report anything found; fix it if it falls under the decisions above.

**Acceptance:**
- Every change is a draft; the before/after values are listed in the PR or session notes.
- svey checks About, the three programs and the side nav in Presentation.
- JSON-LD (view source on the preview) shows the new `email` and a single `openingHours: ["Mo-Fr 07:30-17:30"]`.

### F2 — Logo, home masthead, room accents, hours from settings · ~3.5 h · `feat/fsma-f2-brand-banners`

**1. Black cap (FB3)**
- In `frontend/public/brand/logo-reversed.svg` and `logo-mark-reversed.svg`, find the cap paths. They are the `#FFFFFF` fills that aren't lettering; compare against `logo-full.svg`, where the cap is `#191E2E`.
  - Cap: set `fill="#191E2E"`, add `stroke="#FFFFFF"`, `stroke-width` ≈ 1.5% of the cap's width, `stroke-linejoin="round"`, `paint-order="stroke"`.
  - Tassel: stays `#F5C400`. Lettering stays white.
- Visually check `/` (photo), `/about` (photo, strong scrim), `/facilities` (`primary` panel) and a program page (`secondary`, which uses the standard art and is unaffected) at 1× and 2×.
- Capture before/after screenshots for the client.

**2. Home logo bigger and lower (FB9)**
- `masthead.ts`:
  - Add `logoSize` (`standard` | `large`, default `standard`, radio).
  - Add `{title: 'Bottom centre', value: 'bottomCenter'}` to `logoPlacement`.
- `Masthead.tsx`:
  - Replace the `centered` boolean with a three-way placement:
    - `center`: current behaviour.
    - `bottomLeft`: current behaviour.
    - `bottomCenter`: `items-end justify-center text-center`, using the `SCRIM_GRADIENT` tier.
  - Logo width: `standard` = `w-48 sm:w-64 lg:w-80` (current); `large` = `w-64 sm:w-96 lg:w-[30rem]`.
  - Stega-clean both enums. The box height is fixed and the logo is vector, so this adds no CLS.
- Run TypeGen. Add the new fields to the masthead projection in `queries.ts` if it doesn't use `...`.
- Content (draft): `page-home.masthead.logoSize = 'large'`, `logoPlacement = 'bottomCenter'`. Check that the h1 and subheading still fit at 360 px on the `tall` height. If they don't, set `titleDisplay: 'none'` on Home only (sr-only h1 per §7.6).

**3. Room accents (FB5)**
- Tokens: add to `:root` in `globals.css`, map in `@theme inline` as `--color-room-*`. Values are in §4.1.
- `program.ts`: add `accent` (`roses` | `shamrock` | `violet`, radio, required). Use an explicit field rather than deriving from `classroomName`, which would break on a rename.
- Content (draft): set Infants = `roses`, Toddlers = `shamrock`, Casa = `violet`.
- Program page, banner: pass the accent to `Masthead` (new optional prop `accent`). Render a **6px rule along the bottom edge** of the masthead (`border-b-[6px] border-room-<x>`), and colour the eyebrow ("Roses room") with `text-room-<x>-strong`.
- Program page, "At a glance" card: add `border-t-4 border-room-<x>`.
- `ProgramsGrid` cards (home + `/programs`): the same 4px top rule, so the colour-to-room mapping repeats across the site.
- A11y:
  - Colour is decorative here. The room name is always in text, so nothing depends on colour (1.4.1).
  - Base tones are fills and rules only. **Never use `--room-shamrock` for text or meaningful icons** (2.05:1 on sky).
  - `-strong` tones are the only text colours.

**4. Hours from settings (FB10)**
- `contact.ts` → `hoursRow`:
  - Add `key` (`school` | `office` | `core`, optional, radio, with the description "Lets the site find this row, e.g. the program pages' 'At a glance' reads Core program").
  - Retitle `days` to "Label" (title only; keep the field name, so no migration).
  - Validation: each `key` may appear at most once.
- Content (draft): set `key` on `h-school` / `h-office` / `h-core`.
- `programs/[slug]/page.tsx`:
  - The "Hours" fact becomes `{term: 'Montessori program', value: coreRow.time}`, where `coreRow = settings.contact.hours.find(r => stegaClean(r.key) === 'core')`. Get settings via `getSettings` (`@/app/components/layout`) through the existing three-layer pattern; don't add a new uncached fetch.
  - If `scheduleNote` is set, render it as an extra line under that fact (program-specific notes only).
  - Update the `scheduleNote` field description in `program.ts`: "Program-specific schedule note. Don't put hours here; they come from Settings → Contact → Hours."
- `ContactDetails.tsx` needs no change (it renders label/time). Check that the three rows read well.

**Acceptance:**
- `docs/A11Y.md` per-PR checklist; Lighthouse a11y ≥ 95 on `/`, `/programs/toddlers`.
- Draft mode ON and OFF (CLAUDE.md gotcha).
- Screenshots of `/` and all three programs at 360 / 768 / 1440 px, saved for svey to send.
- Owner checklist in the PR: schema + Studio deploy, then publish the F2 drafts.

### F3 — About page: map + faculty · ~4 h · `feat/fsma-f3-about`

**1. Map beside Facility (FB11)**
- `infoSection.ts`: add `aside`, a radio with options `none` (default) and `map`. The map reads `settings.contact.address`, so the address is never stored twice (D16).
- `InfoSection.tsx`:
  - When `aside === 'map'` (stega-cleaned), use a two-column layout from `lg`: `lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12`, copy left, map right. Stack below `lg`, map after the copy.
  - Map markup:
    ```tsx
    <figure>
      <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border">
        <iframe
          src={`https://www.google.com/maps?q=${encodeURIComponent(addressLine)}&output=embed`}
          title="Map showing Future Scholars Montessori Academy at 1920 Bank St., Ottawa"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full"
        />
      </div>
      <figcaption>
        {/* visible text link to contact.mapUrl (fallback: maps search on the address) — "Open in Google Maps" */}
      </figcaption>
    </figure>
    ```
  - Build the title from the settings address, not a hard-coded string.
  - Pure RSC, no client JS. The reserved aspect ratio means no CLS. Lazy loading keeps the third-party weight off the initial load (the block sits below the fold).
  - The map needs the settings address, so pass it down from `CachedPage` (which has settings), or extend the page query projection. Don't add a separate fetch inside the block.
- If `next.config.ts` sets a CSP (it doesn't as of 2026-11-02), add `frame-src https://www.google.com`.
- Update the `mapUrl` field description in `contact.ts`: drop "no embedded iframe".
- In `FSMA-BUILD-PLAN.md` §12, replace the bullet "The map is a link, not an iframe…" with: "About → Facility shows a lazy Google Maps embed beside the copy (client request, 2026-11-02); the visible link remains for keyboard/AT users and as the fallback."
- Content (draft): `page-about.afacility.aside = 'map'`.

**2. Faculty grid: circular headshots, clickable (FB6, FB7)**
- `facultyGrid.ts`:
  - Add layout option `split` (title "Intro left, teachers right").
  - Add `intro` (`blockContentTextOnly`), shown in Studio only when `layout === 'split'` (`hidden: ({parent}) => parent?.layout !== 'split'`).
- `FacultyGrid.tsx`, new `FacultySplit` branch, like the existing `FacultyHighlight`:
  - Wrapper: `container` + `lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-16`. Left column: heading, subheading, `intro`. Right column: a `<ul>` of teachers.
  - Teacher grid follows the "TEACHER" sketch: `grid-cols-2 sm:grid-cols-3 xl:grid-cols-4`, gap 6–8.
  - Each card is a `<button type="button">` containing:
    - **circular headshot**: `aspect-square w-full rounded-full object-cover` via `SanityImage`, `sizes="(min-width: 80rem) 10rem, (min-width: 40rem) 30vw, 45vw"`. With no `picture`, show a sky-tone circle with initials (`aria-hidden`).
    - name (`font-display`), then role (`text-muted-foreground text-sm`).
  - The button's accessible name is "{name}, {role}: read bio" (visually: name + role; add `sr-only` ": read bio").
  - Focus: the visible focus ring from A11Y.md, applied to the button, not just the image.
  - Card states: hover/focus lifts the circle (`scale-[1.03]`, `motion-safe:` only). Target size ≥ 44×44 px (2.5.5, AAA), which the card easily clears.
- Bio dialog: new client island `frontend/app/components/blocks/FacultyBioDialog.tsx` (`'use client'`). It wraps the shadcn `Dialog`, `DialogTrigger asChild` (the card button), `DialogContent`.
  - Content: larger circular photo, name as `DialogTitle`, role, credentials list, bio via `PortableText`.
  - **Render the bio on the server** and pass it as `children`, so the island ships only the dialog logic.
  - Radix handles focus trap, Esc and focus return. Check them anyway.
  - Long bios scroll inside the dialog (`max-h-[85vh] overflow-y-auto`).
  - Wrap the island in `<ViewTransition>` only if it doesn't conflict with Radix's own animation; otherwise use `tw-animate-css` enter/exit with `motion-reduce:animate-none`.
  - Export it from `blocks/index.ts`.
- Visual Editing: keep the `data-sanity` attributes on each card (path `people[_key==…]` or the referenced person `_id`) so click-to-edit still works. In draft mode the trigger click opens the dialog; that's acceptable.
- Content restructure on `page-about` (draft):
  1. Set `afacultygrid.layout = 'split'`, `mode = 'all'`, `heading = 'Faculty'`.
  2. Copy the Portable Text of `afaculty.content` into `afacultygrid.intro`.
  3. Move `afacultygrid` to where `afaculty` was (directly after `afacility`).
  4. Delete `afaculty`.
  5. Keep `adirectors` (founding story prose, anchor `directors`) after the grid.
  - Resulting order: `afacility` → `afacultygrid` (split) → `adirectors` → `aadmissions` → …
  - This also settles the OWNER-TODO question about director heading levels: there are no more director `h2`s; names live in buttons and dialog titles. Remove that item from OWNER-TODO.
- Teacher records: `person` already has `firstName`, `lastName`, `picture` (+ `alt`), `role`, `credentials`, `bio`, `order`. **Add no schema** for rooms unless the client asks to group teachers by room. Teachers beyond the two directors arrive in F4.

**Acceptance:**
- Keyboard-only run: Tab to a card, Enter opens, focus lands in the dialog, Esc closes, focus returns to the same card.
- VoiceOver run (name, role, dialog title announced).
- Lighthouse a11y ≥ 95 and no CLS from the map on `/about` (check in the Performance panel).
- Draft mode ON and OFF.
- Owner checklist in the PR: schema + Studio deploy, then publish the About draft.

### F4 — Client content drop · ~1–2 h · drafts only (when content arrives)

| Content | Where it goes |
|---|---|
| Our Mission | replaces `page-home.hmission.content` |
| Faculty intro | replaces `page-about.afacultygrid.intro` |
| Priyanka bio | replaces `person-priyanka-aggarwal.bio` |
| Teachers | one `person` doc each: `firstName`, `lastName`, `role`, `credentials`, `bio`, `order` (directors 1–2, then by room). Upload photos to `picture` with real `alt` ("Portrait of {name}, {role}"). Only staff who agreed to appear online. Then add directors' photos too. |
| Infant photos | replace `program-infants.image` (and a masthead photo if supplied) |
| Toddler curriculum (FB4) | append to `program-toddlers.body` after `tod3`, as a new block mirroring Casa's sentence: "The Shamrock room's prepared environment introduces the Toddler curriculum areas of: {areas from client}." |

**Acceptance:** svey reviews in Presentation. No placeholder text remains.

---

## 4. Reference

### 4.1 Room colour tokens

Sampled from the legacy thumbnails `images/rosesthumb.jpg`, `shamrocksthumb.jpg` and `violetsthumb.jpg` (red roses, green shamrocks, blue violets). Contrast was checked against `--secondary` (soft sky, `214 38% 92%`) and `--background` (paper).

```css
/* Room accents (FB5). Base = decorative fills/rules ONLY. -strong = the only text colours. */
--room-roses: 356 100% 37%;          /* #bd000d — 5.46:1 on sky */
--room-roses-strong: 356 90% 30%;    /* #910811 — 7.67:1 on sky, 8.81:1 on paper */
--room-shamrock: 95 87% 39%;         /* #55ba0d — 2.05:1 on sky: NEVER text/icons */
--room-shamrock-strong: 100 75% 18%; /* #22500b — 7.74:1 on sky */
--room-violet: 240 73% 49%;          /* #2222d8 — 7.55:1 on sky */
--room-violet-strong: 240 70% 38%;   /* #1d1da5 — 9.75:1 on sky */
```

Add the same table to `docs/A11Y.md` (contrast section) and `FSMA-BUILD-PLAN.md` §7.2 (palette).

### 4.2 Why these choices (for reviewers)

- **Hours in one place:** they appeared in three places (settings, About prose, `scheduleNote` × 3) and had already drifted (8:30–3:30 vs the client's 9:00–4:00). Settings now holds them; everything else reads from it.
- **Explicit `accent` and `key` enums** rather than matching on labels or room names: labels are editor-facing prose and carry stega in draft mode, so matching on them is fragile.
- **Dialog bios** rather than inline bios: the client asked for "clickable", and full bios inline made a long page longer. Server-rendered children keep the client JS to the Radix dialog only.
- **Lazy iframe map** rather than a static image: always current, keyless, zero cost until scrolled near. The visible link stays for keyboard/AT users and if the embed fails.

## 5. Note to the client on justified text (svey sends)

> We've kept paragraphs left-aligned on purpose. Justified text stretches the spaces between words to square off the right edge. On narrow screens, and especially on phones, that leaves uneven gaps that make reading harder, particularly for people with dyslexia. The international accessibility standard we're building to (WCAG, AAA level) asks for it to be avoided. We've tidied the right edge instead, so lines break more evenly. Happy to show you both side by side.

Send it with the F2 screenshots.

## 6. Tracker

| Item | Session | Status |
|---|---|---|
| Email → gmail everywhere; info@ removed (FB1) | F1 | ☑ drafts, awaiting publish |
| "non-refundable" removed (aa3, ap3) | F1 | ☑ drafts, awaiting publish |
| Hours rows (school / office / core); prose and `scheduleNote` cleared (FB10) | F1 | ☑ drafts, awaiting publish |
| Program mastheads → soft sky (FB5) | F1 | ☑ drafts, awaiting publish |
| Toddlers copy (occupants, life skills, independence & critical thinking) | F1 | ☑ drafts, awaiting publish |
| Agata bio + typo; Priyanka NAMC credential | F1 | ☑ drafts, awaiting publish |
| Galleries last in nav + link titles (FB8) | F1 | ☑ drafts, awaiting publish |
| Black cap on reversed logos (FB3) | F2 | ☑ code; drafts set |
| Home logo large + bottom centre (FB9) | F2 | ☑ code; drafts set |
| Room accents red / green / blue (FB5) | F2 | ☑ code; drafts set |
| "At a glance" reads Core program from settings (FB10) | F2 | ☑ code; drafts set |
| Map beside Facility (FB11) | F3 | ☑ code; About draft set |
| Faculty split + circular headshots + bio dialog (FB6, FB7) | F3 | ☑ code; About draft set |
| Mission, Faculty intro, Priyanka bio, teachers, infant photos, toddler curriculum | F4 | ☐ waiting on client |
| Justify pushback note sent (FB2) | svey | ☐ |

## 7. Waiting on the client (svey asks)

1. **Our Mission** and **Faculty** text: will they send it, or should we draft it for approval?
2. **Priyanka's** new bio.
3. **Teachers:** name, role, room, short bio and credentials for each, plus headshots of staff who agree to appear online.
4. **Toddler curriculum areas** to list (FB4).
5. **New Infant photos:** when?
6. **info@futurescholarsmontessori.com:** keep it forwarding to the gmail address? Recommended, since old flyers and directories still list it.
7. **Approve** the bigger home logo and the room colours from the F2 screenshots.
