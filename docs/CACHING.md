# Caching & revalidation

How content flows from Sanity to visitors: Next.js **Cache Components** for
caching, **Sanity Live** for in-session updates, and an **Invalidate Sync Tags
Function** for guaranteed publish-to-visitor freshness. Added July 2026 on
next-sanity v13 / Next 16.2 — see the
[Cache Components guide](https://www.sanity.io/docs/nextjs/cache-components)
and the [sync-tag function quickstart](https://www.sanity.io/docs/functions/sync-tag-function-quickstart).

## Architecture

```
publish in Studio
   │
   ├─► Content Lake sync-tag event ──► functions/invalidate-tags (Sanity infra)
   │                                        │ POST {tags}
   │                                        ▼
   │                              /api/revalidate-tags (Next.js)
   │                              revalidateTag('sanity:<tag>', {expire: 0})
   │                                        │ done(syncTags)
   │                                        ▼
   └─► Live Content API ──(waitFor="function" holds events until done())──► <SanityLive> in browsers ──► refresh
```

- **Cache Components** (`cacheComponents: true` in `next.config.ts`):
  `sanityFetch` runs inside explicit `'use cache'` boundaries and tags each
  cache entry with the response's own `syncTags` (single Content Lake request,
  no separate tag-lookup roundtrip). `cacheLife: {default: sanity}` disables
  time-based revalidation — on-demand invalidation is the only path.
- **The function pipeline** guarantees freshness even with zero connected
  visitors: publishes expire the affected tags within seconds via
  `/api/revalidate-tags`.
- **`waitFor="function"`** on `<SanityLive>` (production only) holds live
  events back until the function has finished, so a client refresh never
  re-reads a stale cache.

## The three-layer pattern (every route)

Request-time APIs (`cookies()`, `params`, `searchParams`) are forbidden inside
`'use cache'`. `draftMode()` is the one exception — a top-level component that
only awaits `draftMode()` still prerenders into the static shell.

Draft mode bypasses **every** `'use cache'` boundary: with draft mode enabled,
cached components re-run as uncached request-time fetches. Layers 2–3 must
therefore always render inside `<Suspense>` — a fetching component left
outside one prerenders fine in published mode but throws the blocking-route
error the moment Presentation opens the page. This applies even to components
pinned to `perspective: 'published'` (e.g. `SiteJsonLd`): pinning fixes the
*data*, not the cache bypass.

```tsx
// Layer 1 — Page/Layout: branch on draftMode() ONLY. No 'use cache' here.
export default async function Page(props: Props) {
  const {isEnabled: isDraftMode} = await draftMode()
  if (isDraftMode) {
    return (
      <Suspense fallback={<Fallback />}>
        <DynamicPage params={props.params} /> {/* params NOT awaited here */}
      </Suspense>
    )
  }
  const {slug} = await props.params
  return <CachedPage slug={slug} perspective="published" stega={false} />
}

// Layer 2 — draft mode only: resolve request state, pass plain props.
async function DynamicPage({params}: Pick<Props, 'params'>) {
  const [{slug}, {perspective, stega}] = await Promise.all([params, getDynamicFetchOptions()])
  return <CachedPage slug={slug} perspective={perspective} stega={stega} />
}

// Layer 3 — 'use cache': serializable props in, sanityFetch inside.
async function CachedPage({slug, perspective, stega}: {slug: string} & DynamicFetchOptions) {
  'use cache'
  const {data} = await sanityFetch({query: getPageQuery, params: {slug}, perspective, stega})
  return <article>…</article>
}
```

`defineLive` is configured with `strict: true`, so TypeScript rejects any
`sanityFetch` call missing `perspective`/`stega` and any `<SanityLive>` render
missing `includeDrafts`. Helpers in `frontend/sanity/lib/live.ts`:

| Helper                    | Use in                                                                      |
| ------------------------- | --------------------------------------------------------------------------- |
| `sanityFetch`             | `'use cache'` components rendered from a page/layout                        |
| `sanityFetchMetadata`     | `generateMetadata`, `sitemap.ts`, `manifest.ts`, OG images (never stega)    |
| `sanityFetchStaticParams` | `generateStaticParams` only                                                  |
| `getDynamicFetchOptions`  | Resolving `perspective`/`stega` OUTSIDE any cache boundary (reads cookies)  |

Existing cached building blocks: `CachedPage`
(`app/components/blocks/CachedPage.tsx`, shared by `/` and `/[slug]`),
`getSettings` (`app/components/layout/getSettings.ts`, shared by Header,
Footer, and the homepage), `Header`/`Footer` (cached, branched per draft mode
in `app/layout.tsx`), `MorePosts`/`AllPosts` (`app/components/posts/Posts.tsx`).

### Rules of thumb

- New data-fetching component → give it `'use cache'` and
  `{...} & DynamicFetchOptions` props; never hardcode
  `perspective: 'published'` / `stega: false` inside page-content components
  (breaks Visual Editing + release previews). Hardcoding IS correct in
  `generateStaticParams`, metadata routes, and route handlers.
- Every fetching component reachable in draft mode needs a `<Suspense>`
  ancestor — `'use cache'` alone is not enough, since draft mode bypasses it
  (see above).
- Never call `sanityFetch` in a `'use server'` action — resolve
  `getDynamicFetchOptions()` inside the action, forward to a `'use cache'`
  helper.
- The theme is applied by a static `getThemeScript()` inline script in
  `<head>` (`app/layout.tsx`) — do NOT reintroduce `getTheme()` in the root
  layout; its cookie read would force the whole shell dynamic.
- Exactly one `<SanityLive>` and one `<VisualEditing>` in the tree.

## Deploy runbook (one-time)

1. Generate a long random secret; set `SANITY_REVALIDATE_TAGS_SECRET` in the
   frontend's production env (Vercel) and redeploy.
2. Connect + deploy the blueprint from the repo root (uses
   `sanity.blueprint.ts`, project `h52u3jiw`, dataset `production`):

   ```sh
   npx sanity blueprints init   # first time only — connects the local blueprint to a stack
   npx sanity blueprints deploy # the function must exist before env vars can be set
   npx sanity functions env add invalidate-tags REVALIDATE_TAGS_URL https://<prod-domain>/api/revalidate-tags
   npx sanity functions env add invalidate-tags SANITY_REVALIDATE_TAGS_SECRET <same secret>
   ```

   (Env vars take effect without a redeploy; on a fresh stack, `functions env
   add` before the first deploy fails with `Unable to find function`.)

3. Verify: publish a change in Studio, then
   `npx sanity functions logs invalidate-tags` should show
   `Revalidated N tags, HTTP 200`, and the published site reflects the change
   within seconds without a hard refresh.

Local testing: `npx sanity functions dev` (function playground);
`next dev` must be tested with draft mode ON and OFF — the two modes render
through different layers. `next build --debug-prerender` catches static-shell
regressions but does not prove Visual Editing works.

## Gotchas

- Only ONE sync-tag-invalidate function may exist per dataset (race
  conditions) — the blueprint scopes it to `h52u3jiw.production`.
- The function must always call `done(syncTags)`, even when the revalidate
  POST fails — otherwise `waitFor="function"` clients never receive events.
- `/api/revalidate-tags` prefixes tags with `sanity:` to match `sanityFetch`'s
  `cacheTag()` naming; the shared secret is compared in constant time.
- `waitFor` is gated on `VERCEL_ENV === 'production'` so previews/dev don't
  wait for a function that isn't wired to them.
- Streamed segments hydrate AFTER the layout's static shell, so client code
  mounted in the layout (e.g. `RevealObserver`) can mutate segment DOM before
  that segment hydrates → hydration-mismatch warnings. Any attribute managed
  outside React needs `suppressHydrationWarning` on the element that carries it
  (see `Reveal.tsx`'s `data-revealed`).
