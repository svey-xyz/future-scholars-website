#!/usr/bin/env node
/**
 * Content migration runner: source dataset → this project's dataset
 * (issue #20; generalized from vsc-website's cutover tooling).
 *
 *   export (sanity CLI) → transform (./migration-transform.mjs) → import
 *
 * All site-specific logic lives in `migration-transform.mjs` — edit that,
 * not this file. See docs/MIGRATION.md for the full cutover procedure.
 *
 * Usage (from the repo root; requires `sanity login` with access to both
 * projects — runs on your machine, sandboxed environments can't reach
 * api.sanity.io):
 *
 *   npm run migrate-content --workspace=studio -- --from <projectId>[/<dataset>]          # full: export → transform → import --replace
 *   npm run migrate-content --workspace=studio -- --from <projectId>[/<dataset>] --dry    # no import; leaves the transformed tarball
 *   node studio/scripts/migrate-content.mjs --transform-only path/to/data.ndjson          # transform an existing export in place
 *
 * The target is always THIS studio's project/dataset (from studio/.env /
 * SANITY_STUDIO_PROJECT_ID + SANITY_STUDIO_DATASET). Every run writes its
 * artifacts under `backups/` (gitignored): the raw export, the transformed
 * tarball, and a timestamped backup of the TARGET dataset taken before any
 * import — your rollback path.
 */

import {execFileSync} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {transformDocument} from './migration-transform.mjs'

const STUDIO_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const REPO_DIR = path.dirname(STUDIO_DIR)
const BACKUP_DIR = path.join(REPO_DIR, 'backups')

// ---------------------------------------------------------------- args / env

const args = process.argv.slice(2)
const has = (flag) => args.includes(flag)
const valueOf = (flag) => {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}

const loadStudioEnv = () => {
  // Minimal .env reader — avoids a dotenv dependency for a dev-only script.
  const envFile = path.join(STUDIO_DIR, '.env')
  const env = {...process.env}
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/)
      if (m && !(m[1] in process.env)) env[m[1]] = m[2]
    }
  }
  return env
}

const env = loadStudioEnv()
const TARGET_PROJECT = env.SANITY_STUDIO_PROJECT_ID
const TARGET_DATASET = env.SANITY_STUDIO_DATASET || 'production'

const warnings = []
const warn = (msg) => {
  warnings.push(msg)
  console.warn(`  ⚠ ${msg}`)
}

const sanity = (cliArgs, opts = {}) =>
  execFileSync('npx', ['sanity', ...cliArgs], {
    cwd: STUDIO_DIR,
    stdio: 'inherit',
    ...opts,
  })

const stamp = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

// ------------------------------------------------------------- transform core

/**
 * Rewrite an export's data.ndjson through `transformDocument`. Works on a
 * plain .ndjson path (in place, for --transform-only) or inside an unpacked
 * export directory.
 */
function transformNdjsonFile(ndjsonPath) {
  const lines = fs.readFileSync(ndjsonPath, 'utf8').split('\n').filter(Boolean)
  const out = []
  let dropped = 0
  for (const line of lines) {
    const doc = JSON.parse(line)
    const result = transformDocument(doc, {warn})
    if (result === null) {
      dropped += 1
      warn(`dropped ${doc._type} ${doc._id}`)
      continue
    }
    out.push(JSON.stringify(result))
  }
  fs.writeFileSync(ndjsonPath, out.join('\n') + '\n')
  console.log(`  transformed ${out.length} docs (${dropped} dropped)`)
}

// --------------------------------------------------------------------- modes

if (has('--transform-only')) {
  const file = valueOf('--transform-only')
  if (!file) {
    console.error('Usage: migrate-content.mjs --transform-only path/to/data.ndjson')
    process.exit(1)
  }
  transformNdjsonFile(path.resolve(file))
  process.exit(0)
}

const from = valueOf('--from')
if (!from) {
  console.error('Usage: migrate-content.mjs --from <projectId>[/<dataset>] [--dry]')
  process.exit(1)
}
if (!TARGET_PROJECT) {
  console.error('SANITY_STUDIO_PROJECT_ID is not set (studio/.env) — cannot resolve the target.')
  process.exit(1)
}
const [SOURCE_PROJECT, SOURCE_DATASET = 'production'] = from.split('/')

fs.mkdirSync(BACKUP_DIR, {recursive: true})
const runDir = path.join(BACKUP_DIR, `migrate-${stamp()}`)
fs.mkdirSync(runDir)

// 1. Export the source dataset.
console.log(`\n▶ Exporting ${SOURCE_PROJECT}/${SOURCE_DATASET} …`)
const sourceTarball = path.join(runDir, 'source.tar.gz')
sanity([
  'dataset',
  'export',
  SOURCE_DATASET,
  sourceTarball,
  '--project',
  SOURCE_PROJECT,
  '--no-prompt',
])

// 2. Unpack, transform data.ndjson, repack.
console.log('\n▶ Transforming …')
const unpackDir = path.join(runDir, 'unpacked')
fs.mkdirSync(unpackDir)
execFileSync('tar', ['xzf', sourceTarball, '-C', unpackDir])
// Exports unpack to a single directory containing data.ndjson + assets/.
const [exportRoot] = fs.readdirSync(unpackDir)
const ndjson = path.join(unpackDir, exportRoot, 'data.ndjson')
transformNdjsonFile(ndjson)
const transformedTarball = path.join(runDir, 'transformed.tar.gz')
execFileSync('tar', ['czf', transformedTarball, '-C', unpackDir, exportRoot])
console.log(`  → ${path.relative(REPO_DIR, transformedTarball)}`)

if (has('--dry')) {
  console.log('\n✔ Dry run complete — nothing imported. Inspect the tarball above.')
  if (warnings.length) console.log(`  ${warnings.length} warning(s).`)
  process.exit(0)
}

// 3. Back up the target dataset — the rollback path.
console.log(`\n▶ Backing up target ${TARGET_PROJECT}/${TARGET_DATASET} …`)
const targetBackup = path.join(runDir, 'target-backup.tar.gz')
sanity(['dataset', 'export', TARGET_DATASET, targetBackup, '--no-prompt'])

// 4. Import.
console.log(`\n▶ Importing into ${TARGET_PROJECT}/${TARGET_DATASET} (--replace) …`)
sanity(['dataset', 'import', transformedTarball, TARGET_DATASET, '--replace'])

console.log(`\n✔ Done. Artifacts in ${path.relative(REPO_DIR, runDir)}/`)
console.log('  Rollback: sanity dataset import target-backup.tar.gz ' + TARGET_DATASET + ' --replace')
if (warnings.length) console.log(`  ${warnings.length} warning(s) — review above.`)
