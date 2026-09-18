# FSMA — owner action list

Things an agent session can't do: they need your credentials, a browser, or an answer from the client.
**Updated:** 2026-09-18

---

## Decisions for you

- [ ] **Canonical domain: apex or `www`?** (plan Q26) Until one is set, pages have no canonical URL,
      Open Graph image links don't resolve, and the JSON-LD loses its `Organization` node. A Vercel
      fallback covers this for now. Once you decide, set **Settings → ogImage → metadataBase** (for
      example `https://futurescholarsmontessori.com`) or `NEXT_PUBLIC_SITE_URL` in Vercel. The old site
      answers on the apex and returns 403 on `www`.
- [ ] **Title separator:** `About Us | Future Scholars…` or `About Us · Future Scholars…`? (plan Q27)
- [ ] **Heading levels on the About page:** the directors are now `h2` next to "Directors" rather than
      `h3` under it. Both are valid; this version stays correct if the block is moved. Keep it?

## Checks on the preview

- [ ] **Mobile drawer keyboard:** open it and Tab through. Focus should stay inside, and Esc should
      close it and return focus to the menu button.
- [ ] **Draft mode and Presentation:** check that edits round-trip, on a normal page and on a program
      page.
- [ ] **Screenshots for the client** at 360, 768 and 1440 px.

## After merging `chore/fsma-drop-template`

- [ ] **Redeploy the schema and Studio:** `cd studio && npx sanity schema deploy && npx sanity deploy`.
- [ ] **Redeploy the revalidation Function.** `sanity.blueprint.ts` pointed at the template's Sanity
      project, so publishing never revalidated this site. Run `npx sanity blueprints deploy` from the
      repo root, then publish a change and check `npx sanity functions logs invalidate-tags`. If the
      old stack was bound to the other project, re-run `npx sanity blueprints init` first
      (docs/CACHING.md).
- [ ] **Clean leftover field data** once the new frontend is live on Vercel:
      `cd studio && npx sanity migration run drop-template-fields` (dry run), then add
      `--no-dry-run`. It removes `settings.mobileNav` and the testimonials blocks' `source`.
- [ ] **Old service worker:** the PWA is gone. The site hasn't launched, so only browsers that opened
      a preview before this change can still have the worker; clear site data once in those.

## After merging `feat/fsma-s9-montessori`

- [ ] **Deploy the schema and Studio** (adds the Pull quote block):
      `cd studio && npx sanity schema deploy && npx sanity deploy`.
- [ ] **Publish the Montessori page draft** once the new frontend is live. The restructured page is
      saved as a draft because it uses the new Pull quote block, which the current live frontend
      would show as "Unknown block". Review it in Presentation first.
- [ ] **Check the 404** at any made-up URL on the preview, including on a phone.

## Repo housekeeping (on your Mac, as its own commit)

- [ ] Remove `react-dom` from the root `package.json`; it conflicts with the `^19.2.7` in each
      workspace. While you're there, pin `next`, `sanity` and `next-sanity` to exact versions, then
      run `npm install`. Do this on your Mac because the sandbox's npm rewrites the lockfile.
- [ ] Optional: delete `frontend/node_modules/.stale/` (about 140 MB of old caches; it's gitignored).

## Ask the client

- [ ] **Confirm contact details.** These appear on the About page with a `TODO(client)` notice until
      confirmed:
      - 1920 Bank St., Ottawa ON K1V 7Z8
      - phone (613) 244-FSMA (3762) · fax (613) 244-3764
      - info@futurescholarsmontessori.com · futurescholarsmontessori@gmail.com
      - open 7:30–5:30, Montessori day 8:30–3:30
      - opened January 2013
      - directors Agata Attersoll and Priyanka Aggarwal

      Also ask whether they still want the fax number published.
- [ ] **Social accounts.** Facebook (`facebook.com/FutureScholarsMontessoriAcademy`) came from the old
      site. **The Instagram entry is a made-up placeholder.** Fix or remove it in Settings → Contact →
      Socials before the client sees the site.
- [ ] **Typeface:** show them Outfit and Poppins side by side before Outfit is locked in.
- [ ] **Photography:** Home, About, Montessori and Programs use Unsplash placeholders; Gallery and
      Testimonials use brand-colour panels. Show them both looks. If they prefer photos, the shoot
      needs four wide landscape frames of 2000px or more, one per page.
- [ ] **Testimonial photos:** three photos from the old page aren't labelled with who is in them.
      They're uploaded but not used.
- [ ] **Maria Montessori photo** (`legacy-maria.gif`): check who owns it before it goes on the
      Montessori page. The rebuilt page doesn't use it.
- [ ] **Montessori page copy** (ported verbatim, D4). Ask whether they want to fix these:
      "mild retardation" (a dated term), "Casa De Bambini" (Casa dei Bambini), "Edoard Seguin"
      (Édouard Séguin), and "she has been nominated" (she died in 1952).
- [ ] **Mayor's recognition certificate:** keep it, and if so, on which page? It's uploaded but not
      placed.
- [ ] **Tuition:** publish fees, or say "contact us for rates"?
- [ ] **Admissions FAQ (optional):** there isn't one because the old site had none. If they send
      real questions and answers, adding it is a short job.
- [ ] **Gallery alt text:** the 107 images have album-level alt text ("Halloween … 7 of 16"). Before
      launch, someone should review them and describe each photo.
