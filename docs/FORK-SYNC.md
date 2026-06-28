# Keeping a fork in sync with the template

`sanity-next-clean` is a **template**. Other sites (e.g. `soule-directory-site`) are **git
forks** of it and are updated *from* it: the template is upstream, the forks are downstream.
Changes flow template → fork, never the reverse.

## Rule: sync from upstream before editing a fork

**Before making any edit to a fork of `sanity-next-clean`, first check for upstream template
changes and merge them in.** Editing a stale fork re-introduces bugs already fixed upstream
and creates avoidable merge conflicts. Sync first, then build.

Agents: treat this as a hard precondition. `git fetch` the template and report whether the
fork is behind before proposing any change.

## How to sync — use git's merge, never hand-copy files

A real three-way `git merge` applies every non-conflicting upstream change automatically
(lockfiles included), preserves history (the fork keeps a true merge commit with the
template as a parent), and makes the next sync cheap. Copying files by hand silently drops
or duplicates changes — don't.

From a fork's working copy, with `main` up to date:

```bash
# one-time: register the template as an 'upstream' remote
git remote add upstream https://gitea.tarte.svey.xyz/svey/sanity-next-clean.git

git fetch upstream
git switch -c sync/template-main
git merge upstream/main      # resolve conflicts (see "Handling divergence")
git push origin sync/template-main
# then open a PR: sync/template-main → main
```

If you can't push from where the merge happens, produce it locally and hand off a git
bundle — `git bundle create sync.bundle sync/template-main` — for someone to `git fetch`
from the bundle and push.

## Handling divergence

Most files fast-forward to the template with no conflict. Conflicts arise only where a fork
has **intentionally customized** a file the template also changed. Resolve by **keeping the
fork's customization and layering the template's change on top** — never discard a fork's
deliberate divergence just to "win" the merge.

Keep this registry of known per-fork divergences current so future syncs stay predictable:

| Fork | File | Divergence | On merge |
| --- | --- | --- | --- |
| soule-directory-site | `frontend/app/components/layout/Header.tsx` | custom `HeaderLogo` + `select-none` | keep the fork's structure; take the template's className changes (e.g. `z-50 → z-40`) |
