/**
 * Per-site transform for `migrate-content.mjs` — THE ONLY FILE a fork should
 * need to edit when migrating content into this template (issue #20).
 *
 * The runner streams every document of the source dataset's NDJSON export
 * through `transformDocument`. Return:
 *   - an object  → imported as-is (mutate freely, or return a new doc)
 *   - `null`     → dropped from the import (with a warning logged)
 *
 * Keep transforms pure and deterministic: same input NDJSON → same output,
 * so repeated runs (and diffs between them) are meaningful.
 *
 * The template ships an identity transform. Typical fork edits, in the shape
 * vsc-website used (see its studio/scripts/migrate-content.mjs for a full
 * worked example):
 *
 *   const TYPE_MAP = {old_type: 'newType'}              // rename document/block types
 *   const DROPPED_TYPES = new Set(['legacy_widget'])    // drop dead types
 *   – flatten nested section/page-builder structures into `pageBuilder[]`
 *   – remap field names (`title` → `name`), split/merge fields
 *   – rewrite references when _ids change (collect a map in pass 1, apply in pass 2)
 *
 * Asset documents (`sanity.imageAsset` / `sanity.fileAsset`) and their blobs
 * ride along inside the export tarball untouched unless you drop/rename them.
 */

/**
 * @param {Record<string, any>} doc  one document from the source export
 * @param {{warn: (msg: string) => void}} ctx
 * @returns {Record<string, any> | null}
 */
export function transformDocument(doc, {warn}) {
  void warn // referenced so the identity transform lints clean
  return doc
}
