'use client'

import dynamic from 'next/dynamic'

import type {ShaderBackgroundProps} from './ShaderBackground'

/**
 * Lazily-loaded `ShaderBackground`.
 *
 * The WebGL runtime (`@svey-xyz/simple-shader-component`) is large and only
 * needed when a block or page actually sets `background.type === 'shader'`.
 * Importing `ShaderBackground` statically pulled that runtime into the shared
 * client bundle for *every* route (~217 KB, ~99% unused on shader-less pages
 * like the homepage). Code-splitting it here moves it into its own chunk that's
 * fetched only when a shader is rendered.
 *
 * `ssr: false` is intentional: the canvas can't paint during SSR, and the
 * background is purely decorative (`aria-hidden`, out of flow), so deferring it
 * to the client costs nothing for LCP, CLS, or SEO.
 */
const ShaderBackground = dynamic(() => import('./ShaderBackground'), {
  ssr: false,
})

export default function ShaderBackgroundLazy(props: ShaderBackgroundProps) {
  return <ShaderBackground {...props} />
}
