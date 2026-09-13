# FSMA — owner action list

Everything here needs credentials, a network path, or a machine that an agent session doesn't have.
Nothing in §8 of the build plan past S3 can be *verified* until items 1–3 are done.

Last updated: 2026-09-13 (after S0–S3, the content seed and the image migration).

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

- [x] **2. Open `*.sanity.io` on the egress allowlist** — or accept that every rendered-page check is
      yours. (Plan Q11.) Right now the proxy returns `403 blocked-by-allowlist` for
      `wzs9gcps.api.sanity.io` and `wzs9gcps.apicdn.sanity.io` from both the Cowork VM and the cloud
      container, so the frontend boots but every data-fetching route 500s. Needs
      `*.sanity.io` **and** `*.apicdn.sanity.io`.
      Consequence if you skip it: S5–S12 verification (rendered pages, Lighthouse, Presentation,
      image uploads) all move to you, and agent sessions stay limited to schema, components and config.

- [x] **3. `npx sanity login`** on your dev machine (plan Q10) — needed for `schema deploy` and
      `sanity deploy`.

---

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

- **Watch the lockfile.** The template pins `next`, `sanity` and `next-sanity` with caret ranges, so any
  `npm install` can float them to a new minor. That happened this session and broke `main` (Next 16.3
  dropped `experimental.viewTransition`; newer `next-sanity` brands results as `StegaString<T>`). Reverted
  — but worth pinning those three exactly in the template so it can't recur.
- File deletion in the repo folder needs a per-session grant. Both Next.js and Sanity Studio wedge on a
  stale cache that can only be cleared with `rm -rf`, so grant it early in a session.
