# Future Scholars Montessori Academy — website

Website for [Future Scholars Montessori Academy](https://futurescholarsmontessori.com), a Montessori
school in Ottawa for children 6 months to 6 years. It replaces the school's ~2010 static site.

- **Frontend** (`frontend/`): Next.js 16 App Router with Cache Components, React 19, Tailwind CSS v4,
  deployed on Vercel.
- **CMS** (`studio/`): Sanity Studio (project `wzs9gcps`), deployed separately with `sanity deploy`.
  Editors arrange pages from blocks and preview drafts live with the Presentation tool.

## Docs

| Doc | What it covers |
| --- | --- |
| [docs/FSMA-BUILD-PLAN.md](docs/FSMA-BUILD-PLAN.md) | Scope, locked decisions, remaining work, cutover runbook |
| [docs/OWNER-TODO.md](docs/OWNER-TODO.md) | Owner actions and open client questions |
| [CLAUDE.md](CLAUDE.md) | Architecture, content model, conventions, gotchas |
| [docs/A11Y.md](docs/A11Y.md) | Accessibility rules and per-PR checklist (read before UI work) |
| [docs/CACHING.md](docs/CACHING.md) | Cache Components, live content, revalidation Function |
| [docs/TRANSITIONS.md](docs/TRANSITIONS.md) | View transitions |

## Local development

Requires Node ≥ 22.12.

```sh
npm install
cp frontend/.env.example frontend/.env.local   # add SANITY_API_READ_TOKEN
# studio/.env: SANITY_STUDIO_PROJECT_ID=wzs9gcps, SANITY_STUDIO_DATASET=production
npm run dev   # TypeGen, then Next on :3000 and Studio on :3333
```

`SANITY_API_READ_TOKEN` is required even for published content — the app fails on import without it.

Other scripts: `npm run lint`, `npm run type-check`, `npm run typegen`, `npm run format`.

## Deploying

- **Frontend:** Vercel builds `frontend/` on push. Env vars are listed in [CLAUDE.md](CLAUDE.md#env-vars).
- **Studio:** `npm --workspace=studio run deploy`.
- **Schema:** `cd studio && npx sanity schema deploy`.
- **Revalidation Function:** `npx sanity blueprints deploy` from the repo root; one-time setup in
  [docs/CACHING.md](docs/CACHING.md).
