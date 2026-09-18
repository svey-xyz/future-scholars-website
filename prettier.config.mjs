import sanityConfig from '@sanity/prettier-config'

/**
 * Prettier config, moved out of the `prettier` key in package.json (build
 * plan Q21).
 *
 * Two things were tangled together here. Prettier resolves the package.json
 * key *before* any config file, so the key had to go for a config file to
 * take effect at all. And Q21 recorded that the repo was committed at
 * `printWidth` 80 while `@sanity/prettier-config@3.0.0` resolves 100 —
 * measured, that is backwards: at 80 the repo needs 174 files reformatted,
 * at 100 it needs 58. The repo was never at 80, so the width stays at the
 * shared config's value and the churn was closed by reformatting once and
 * by teaching .prettierignore to leave prose and vendored code alone.
 */
export default {
  ...sanityConfig,
}
