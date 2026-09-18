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

## Repo housekeeping (on your Mac, as its own commit)

- [ ] Remove `react-dom` from the root `package.json`; it conflicts with the `^19.2.7` in each
      workspace. While you're there, pin `next`, `sanity` and `next-sanity` to exact versions, then
      run `npm install`. Do this on your Mac because the sandbox's npm rewrites the lockfile.
- [ ] Upload `frontend/public/brand/logo-full.svg` to **Settings → logo** in Studio. It's a `file`
      field and is only used for editor previews.
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
      Montessori page.
- [ ] **Mayor's recognition certificate:** keep it, and if so, on which page? It's uploaded but not
      placed.
- [ ] **Tuition:** publish fees, or say "contact us for rates"?
- [ ] **Admissions FAQ (optional):** there isn't one because the old site had none. If they send
      real questions and answers, adding it is a short job.
- [ ] **Gallery alt text:** the 107 images have album-level alt text ("Halloween … 7 of 16"). Before
      launch, someone should review them and describe each photo.
