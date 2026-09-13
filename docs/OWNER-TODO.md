# FSMA — owner action list

Everything here needs credentials, a network path, or a machine that an agent session doesn't have.
Nothing in §8 of the build plan past S3 can be *verified* until items 1–3 are done.

Last updated: 2026-09-13 (after S0, S1, S2).

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

- [ ] **8. Upload `frontend/public/brand/logo-full.svg` to `settings.logo` in Studio** (plan Q13).
      It's a `file` field, not an `image`. The site itself reads the SVGs from `public/`, so this is
      only for editor-facing previews.

- [ ] **9. Show the client the heading typeface in context before it's locked.** S1 shipped **Outfit**;
      §7.3 asks for Outfit and Poppins side by side. Reversible until they've seen it.

- [ ] **10. Get the client to confirm the contact facts** — street address, phone, general email,
      office hours (plan Q2). S7 can't publish any of it otherwise, and S11's JSON-LD needs the
      address and hours. Pull the current values off legacy `contact.htm` and send them back for a
      yes/no rather than asking cold.

- [ ] **11. Social accounts — which platforms, exact URLs** (plan Q1). The floating rail is built
      data-driven and renders nothing while `settings.contact.socials` is empty, so this isn't
      blocking, but the client asked for it specifically.

- [ ] **12. Ask about a photo shoot** (plan Q5). Releases are in hand (D17), but the legacy images are
      small — anything used at masthead scale (~2000px wide) will not survive the crop. This is the
      single biggest risk to how the finished site looks.

- [ ] **13. Two smaller client questions:** tuition on the site or "contact us for rates" (Q6), and
      whether to keep the "Recognition From The Mayor" item and where (Q7).

---

## Notes

- Legacy imagery can't be downloaded from any agent session either — same allowlist. If item 2 doesn't
  cover `futurescholarsmontessori.com`, you'll need to pull the image set down yourself for S6/S10.
  (Reading the legacy *copy* works — that goes through a different path.)
- File deletion in the repo folder needs a per-session grant. Both Next.js and Sanity Studio wedge on a
  stale cache that can only be cleared with `rm -rf`, so grant it early in a session.
