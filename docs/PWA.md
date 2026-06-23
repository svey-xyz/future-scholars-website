# PWA / offline support

The frontend is an installable PWA with offline support via **Serwist** (the maintained
`next-pwa` successor), wired in **configurator mode**.

## Why configurator mode

Next.js 16 builds with **Turbopack** by default. The classic `withSerwist` wrapper hooks
into webpack, so it would force `next build --webpack`. Configurator mode (Serwist 9.4+)
instead builds the service worker as an **external step after `next build`**, so it is
bundler-agnostic — the production build stays on Turbopack and Serwist still precaches every
prerendered route. No `--webpack` fallback, no `@serwist/turbopack` shim.

## Files

| File | Purpose |
| --- | --- |
| `frontend/serwist.config.mjs` | Serwist (`@serwist/cli`) config: `swSrc`, `swDest`, offline-fallback precache entry. |
| `frontend/app/sw.ts` | Service worker source — runtime caching strategies + offline fallback. |
| `frontend/app/manifest.ts` | Web manifest, generated from the Sanity `settings` singleton. |
| `frontend/app/~offline/page.tsx` | Offline fallback page (precached, network-independent). |
| `frontend/app/icon.svg`, `app/apple-icon.png` | Favicon + iOS touch icon (file-convention). |
| `frontend/public/icons/*` | `192/512` (any) + maskable `192/512` install icons. |
| `frontend/app/layout.tsx` | `SerwistProvider` registration, `viewport.themeColor`, `appleWebApp` metadata. |

`build` is `next build && serwist build`. `serwist build` emits `public/sw.js` (gitignored).

## Caching strategy

Precaching covers build assets and prerendered routes. Runtime caching is
**stale-while-revalidate** for:

- **HTML document navigations** (`pages`) — falls back to `/~offline` when offline with no cache.
- **App Router RSC payloads** (`rsc`) — client navigations / prefetch.
- **Sanity images** (`sanity-images`) — `cdn.sanity.io` and the `/_next/image` optimizer.

`/api/*` is never cached. The SW is registered in production only — `SerwistProvider` is
`disable`d in development so `next dev` stays on Turbopack with no `/sw.js`.

## One-time setup

```bash
npm install            # installs @serwist/next, @serwist/cli, serwist, esbuild (run on your machine, not in CI sandbox)
npm run build --workspace=frontend
npx serve frontend/.next   # or deploy; SW + install only work over HTTPS (localhost is exempt)
```

Service workers do **not** run under `next dev`. To test offline, build and serve, then use
Chrome DevTools → Application → Service Workers / Manifest, or Lighthouse → PWA.

## Caveats

- **Placeholder icons.** `public/icons/*`, `app/icon.svg`, `app/apple-icon.png` are generated
  from `--primary-accent` (a `>_` prompt mark). Swap in real brand art when ready.
- **Theme color** is hardcoded (`#ff5500` / dark `#ff7e3d`) to mirror `--primary-accent`;
  update both `app/manifest.ts` and `app/layout.tsx`'s `viewport` if the token changes.
- **Draft mode.** The SWR page cache could retain a draft response if an editor browses with
  Draft Mode on. End-user installs are unaffected; verify before relying on the cache for
  preview sessions.
