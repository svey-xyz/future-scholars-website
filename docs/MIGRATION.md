# Content migration / cutover

How to move an existing site's Sanity content into a fork of this template
(issue #20; the procedure vsc-website used, generalized). The pipeline is

```
sanity dataset export  →  transform (per-site)  →  sanity dataset import
```

driven by `studio/scripts/migrate-content.mjs`. **All site-specific logic
lives in `studio/scripts/migration-transform.mjs`** — the runner never needs
editing.

## Prerequisites

- `sanity login` as a user with read access to the source project and write
  access to this project. The script runs on your machine (sandboxed agent
  environments can't reach api.sanity.io).
- `studio/.env` populated — the **target** is always this studio's
  `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET`.
- `/backups` is gitignored; every run leaves its artifacts (raw export,
  transformed tarball, pre-import target backup) in a timestamped folder there.

## Procedure

1. **Design the transform.** Diff the two content models and write the mapping
   into `migration-transform.mjs`: type renames, dropped types, field remaps,
   structural changes (e.g. nested sections → flat `pageBuilder[]`). Keep it
   pure — same input, same output. vsc-website's
   `studio/scripts/migrate-content.mjs` is a full worked example, including a
   three-way sync manifest for *repeated* migrations (see "Repeated syncs").
2. **Dry-run** and inspect:

   ```sh
   npm run migrate-content --workspace=studio -- --from <srcProjectId>/<dataset> --dry
   ```

   Unpack `backups/migrate-*/transformed.tar.gz` and spot-check documents, or
   re-run the transform on a saved export:
   `node studio/scripts/migrate-content.mjs --transform-only path/to/data.ndjson`.
3. **Import** (drops `--dry`). The script exports a backup of the target
   dataset first — the rollback path is printed at the end.
4. **Verify:** `npm run dev`, click through every route; check Presentation
   Tool overlays still bind (transformed docs keep their `_id`s unless you
   remap them); run TypeGen + `npm run type-check`; compare against the old
   site visually.
5. **Cutover:** point production env vars at the new project, deploy, then set
   up redirects for any changed slugs/routes (Next `redirects()` in
   `next.config.ts`).

## Gotchas

- **References:** if you rewrite `_id`s, collect an old→new map in a first
  pass and rewrite every `_ref` in a second — a dangling `_ref` fails the
  whole import.
- **Assets** (`sanity.imageAsset`/`sanity.fileAsset` + blobs) ride along in
  the export tarball; don't drop the documents unless you also strip the
  references to them.
- **Drafts:** exports include drafts (`drafts.` ids) — decide whether to keep,
  publish, or drop them in the transform.
- **`--replace` never deletes** documents that only exist in the target; clear
  the dataset first (or reconcile manually) if you need an exact mirror.
- **Stega/Visual Editing:** nothing to do at migration time — stega is a
  render-time encoding, not stored content.

## Repeated syncs (advanced)

For a long cutover window (old site still being edited), a single
`import --replace` will clobber edits made in the new dataset. vsc-website's
script solves this with a committed `migration-manifest.json` recording a
content hash per document at each import — a three-way merge base that
classifies each doc as added / updated / conflict / only-in-new on the next
run (`--diff`, `--sync`, `--force-conflicts`). Port that pattern from
vsc-website if your migration needs more than one run.
