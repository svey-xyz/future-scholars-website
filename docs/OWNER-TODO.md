# FSMA — owner action list

Everything here needs credentials, a network path, or a machine that an agent session doesn't have.
Items 1–3 and 4–6 are done. What remains is mostly client answers, plus two environment fixes (A, E).

Last updated: 2026-09-14 (after S7 — the About page).

---

## Blocking — do these first

- [x] **1. Push the four local branches.** No agent session can push (no SSH, no PAT in the sandbox).
      `main` also needs a one-time force-push because its history was regrafted onto the template
      (plan §12) — nothing is lost, the old tip is kept as `backup/pre-graft-main`.
      ```
      git push --force-with-lease origin main
      git push -u origin feat/fsma-s0-setup feat/fsma-s2-schema feat/fsma-s1-brand
      ```
      The three feature branches are stacked (S0 → S2 → S1), not siblings off `main` — merge them in
      that order, or squash-merge S0 first and rebase the other two.

- [x] **2. Open `*.sanity.io` on the egress allowlist** — done, and **it works now**: the missing half
      was that Node ignores `HTTPS_PROXY`. With `NODE_USE_ENV_PROXY=1` the dev server renders every route
      against `production`. Original note kept below.

      Original: — or accept that every rendered-page check is
      yours. (Plan Q11.) Right now the proxy returns `403 blocked-by-allowlist` for
      `wzs9gcps.api.sanity.io` and `wzs9gcps.apicdn.sanity.io` from both the Cowork VM and the cloud
      container, so the frontend boots but every data-fetching route 500s. Needs
      `*.sanity.io` **and** `*.apicdn.sanity.io`.
      Consequence if you skip it: S5–S12 verification (rendered pages, Lighthouse, Presentation,
      image uploads) all move to you, and agent sessions stay limited to schema, components and config.

- [x] **3. `npx sanity login`** on your dev machine (plan Q10) — needed for `schema deploy` and
      `sanity deploy`.

---

## New from S4 — do these before the next session

- [ ] **A. Allowlist `fonts.googleapis.com` and `fonts.gstatic.com`** (plan Q19), or say the word and I'll
      self-host Inter + Outfit with `next/font/local` instead. Right now `next build` **fails outright**
      with three `next/font` errors, so no agent session can produce a production build or run Lighthouse.
      Self-hosting is arguably the better fix regardless: one less build-time dependency, and it removes a
      third-party request from every page load.

- [ ] **B. Decide on file deletion in the repo folder** (plan Q18). The Cowork mount refuses `unlink`, and
      git updates working-tree files by unlinking and recreating them — so `git merge`, `git checkout -- .`
      and `reset --hard` all fail in place, as does `next dev`. I worked around both this session (merge in
      a scratch clone, dev server from a copy outside the mount; §5.1 has the recipes), but a standing
      delete grant would remove an hour of overhead per session. Your call — the workarounds do hold.

- [ ] **C. Check the drawer on the preview.** Everything else in S4 is verified, including all six routes
      rendering against `production` and the shell geometry at 360/768/1024/1440. The one thing I could not
      exercise is the mobile drawer's keyboard behaviour — open it, Tab through it (focus should stay
      inside), press Esc (should close and put focus back on the hamburger). It is stock Radix modal
      Dialog, so it should be right; I just can't claim it.

- [x] **D. ~~The homepage shows a red "Unknown block" box.~~** Fixed in S6 — the `programsGrid` renderer
      now exists, and a second cause turned up alongside it (a seeded CTA body stored as a plain string
      where the schema wants Portable Text, on `/` **and** `/programs`). Both fixed and republished.
      **The homepage is now showable.** Every route renders clean: zero unknown blocks, one `h1` each,
      no missing alt text.

---

## New from S6 — decisions I need from you

- [ ] **E. Prettier is misconfigured and it is a trap** (plan Q21). The repo on disk is formatted at
      `printWidth` 80, but `@sanity/prettier-config@3.0.0` — the version your `node_modules` and the
      lockfile both carry — resolves to 100. So `npm run format` rewrites **~50 files nobody touched**.
      I reverted all of it this session, but it will ambush the next person who runs the script and
      doesn't check `git status`. Two clean ways out, your call:
      1. pin `printWidth: 80` in a root `.prettierrc` so the config matches what is already committed, or
      2. run the reformat once, deliberately, and commit it on its own branch.
      Until then, don't run `npm run format` repo-wide on a feature branch.

- [ ] **F. Client screenshots have to come from the Vercel preview, not from me** (follows from A).
      S6 asked for homepage screenshots at three breakpoints for the client thread. I can verify the
      rendered HTML, and did — but local renders fall back to system fonts because of the Google Fonts
      block, so any screenshot I produce shows the wrong typeface. Since item 9 below is literally
      "show the client the heading typeface", sending them a screenshot in the wrong font would be
      worse than sending none. Once the preview is up, three widths (360 / 768 / 1440) is all it needs.

## New from S7 — three client questions

- [ ] **G. The About page now publishes an accessibility statement** (plan Q23). It commits FSMA to
      WCAG 2.2 Level AA and to providing information in accessible formats on request, and points
      accessibility feedback at the office. The *website* half of that I have built and can evidence;
      the organisational half is the school's to agree to. Please get a yes before launch — there is a
      `TODO(client)` paragraph on the page saying so, and S12 greps for it.

- [ ] **H. There is no admissions FAQ, on purpose** (plan Q25). S7 called for one, but the old site has
      none, so writing the answers would have meant inventing things parents act on — deposit amounts,
      waiting lists, that sort of thing. If you can get five real questions and answers out of the
      client, the `faq` block already exists and it is a short follow-up.

- [ ] **I. I added the fax number back** rather than quietly dropping it. It is on the old site, so it
      is a contact method they currently advertise; worth asking whether they still want it published.

## Deploys and hosting (S0b)

- [x] **4. Deploy the S2 schema.** From the repo root, after checking out the merged branch:
      ```
      cd studio && npx sanity schema deploy
      ```
      Never use the Sanity MCP `deploy_schema` tool for this project — it creates a competing
      MCP-managed schema record alongside the Studio one (plan §2).

- [x] **5. Deploy the Studio.** `cd studio && SANITY_STUDIO_STUDIO_HOST=fsma npx sanity deploy`
      (fall back to `future-scholars` if `fsma` is taken). Then set `NEXT_PUBLIC_SANITY_STUDIO_URL`
      and `SANITY_STUDIO_PREVIEW_URL` to the deployed host, locally and in Vercel.

- [x] **6. Create and link the Vercel project** (plan Q9) and mirror all five env vars into both
      Preview and Production:
      `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`,
      `NEXT_PUBLIC_SANITY_STUDIO_URL`, `SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_TAGS_SECRET`.

- [ ] **7. Confirm draft mode + Presentation round-trips** once 2–6 are done (plan Q11 carried from S0).

---

## Content and client

- [ ] **8b. Three quick client questions the images raised:**
      1. The three photos beside the old testimonials have no attribution in the markup. Who is in
         each? They're uploaded but deliberately unattached — pairing one with a named family would
         assert something the old site never said. (Q16)
      2. `maria.gif` is a photograph of Maria Montessori, not FSMA's own image. Worth checking
         provenance before republishing it. (Q17)
      3. The "Recognition From The Mayor" certificate is uploaded and unplaced, still waiting on
         Q7 — keep it, and where?

- [ ] **8c. Alt text pass before launch.** All 107 gallery images have alt text, but it's album-level
      and indexed ("Halloween celebration … 7 of 16") rather than describing that specific photo. It
      clears the schema and is honest; a pass with eyes on the images would make it good.

- [ ] **8. Upload `frontend/public/brand/logo-full.svg` to `settings.logo` in Studio** (plan Q13).
      It's a `file` field, not an `image`. The site itself reads the SVGs from `public/`, so this is
      only for editor-facing previews.

- [ ] **9. Show the client the heading typeface in context before it's locked.** S1 shipped **Outfit**;
      §7.3 asks for Outfit and Poppins side by side. Reversible until they've seen it.

- [ ] **10. Get the client to confirm the contact facts.** Already pulled off the old site and seeded,
      so this is now a yes/no list rather than an open question:
      1920 Bank St., Ottawa ON K1V 7Z8 · phone (613) 244-FSMA (3762) · fax (613) 244-3764 ·
      info@futurescholarsmontessori.com and futurescholarsmontessori@gmail.com ·
      open 7:30 am–5:30 pm with the Montessori day 8:30 am–3:30 pm · opened January 2013 ·
      directors Agata Attersoll and Priyanka Aggarwal. The About page carries a visible
      `TODO(client)` notice until these are confirmed; S12 greps for it.

- [ ] **11. Social accounts** (plan Q1). Facebook was in the old site's chrome and is already seeded:
      `facebook.com/FutureScholarsMontessoriAcademy`. Confirm it's still theirs, and ask whether
      Instagram or anything else exists.

- [ ] **12. Raise the photo shoot with the client** (plan Q5) — no longer blocking, but still the right
      answer. Not one image on the old site is 1000px or wider; the best photography is 720×480. Every
      page now opens with a brand-colour masthead panel instead, which ships fine and swaps to a
      photograph per page whenever real images arrive. Worth showing them the brand panel first — they
      may like it, in which case the shoot becomes a nice-to-have rather than a rescue.

- [ ] **13. Two smaller client questions:** tuition on the site or "contact us for rates" (Q6), and
      whether to keep the "Recognition From The Mayor" item and where (Q7).

---

## Notes

- **A lockfile bump slipped through again.** Commit `0cd10bc` ("gallery wiring results", a docs commit)
  also carries a 5,800-line `package-lock.json` rewrite and adds `react-dom: ^19.3.0` to the **root**
  package.json, where it doesn't belong and disagrees with the `^19.2.7` both workspaces pin. Type-check
  and lint pass on what's installed (`next` 16.2.10, `sanity` 6.13.2, `next-sanity` 13.1.1), so I left it
  alone rather than reverting a lockfile that matches `node_modules` mid-session — but it wants a clean-up
  commit of its own, and it is the second time in two sessions. Pinning those three exactly in the template
  is still the fix.
- **Watch the lockfile.** The template pins `next`, `sanity` and `next-sanity` with caret ranges, so any
  `npm install` can float them to a new minor. That happened this session and broke `main` (Next 16.3
  dropped `experimental.viewTransition`; newer `next-sanity` brands results as `StegaString<T>`). Reverted
  — but worth pinning those three exactly in the template so it can't recur.
- File deletion in the repo folder needs a per-session grant. Both Next.js and Sanity Studio wedge on a
  stale cache that can only be cleared with `rm -rf`, so grant it early in a session.

- **Disk:** `frontend/node_modules/.stale/` holds ~140 MB of caches and scratch I had to move aside rather
  than delete (see Q18). Safe to `rm -rf` whenever you like; it is gitignored.

- **The Cowork VM needs five linux-arm64 native packages, not three.** `node_modules` is your macOS
  install, so agent sessions have to hand-unpack linux builds. Two were missing from the notes and are
  the reason `npm run typegen` looks broken in a fresh session: `@esbuild/linux-arm64` and
  `@rolldown/binding-linux-arm64-gnu` (the Sanity CLI loads its config through jiti → Vite → rolldown,
  and fails with an unhelpful `Class extends value undefined`). Plan §5.1 now has the full table.
  Harmless to your Mac — they're gitignored and it picks its own platform packages.
