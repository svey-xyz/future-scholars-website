import React from 'react'

import Cta from '@/app/components/Cta'
import Info from '@/app/components/InfoSection'
import Hero from '@/app/components/Hero'
import FeaturesGrid from '@/app/components/FeaturesGrid'
import Stats from '@/app/components/Stats'
import Testimonials from '@/app/components/Testimonials'
import Gallery from '@/app/components/Gallery'
import Faq from '@/app/components/Faq'
import Note from '@/app/components/Note'
import PostsArchive from '@/app/components/PostsArchive'
import AuthorsArchive from '@/app/components/AuthorsArchive'
import {dataAttr} from '@/sanity/lib/utils'
import {PageBuilderSection} from '@/sanity/lib/types'
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert'
import ShaderBackground from '@/app/components/shader/ShaderBackground'

type BlockProps = {
  index: number
  block: PageBuilderSection
  pageId: string
  pageType: string
}

type BlocksType = {
  [key: string]: React.FC<BlockProps>
}

const Blocks = {
  hero: Hero,
  callToAction: Cta,
  infoSection: Info,
  featuresGrid: FeaturesGrid,
  stats: Stats,
  testimonials: Testimonials,
  gallery: Gallery,
  faq: Faq,
  note: Note,
  postsArchive: PostsArchive,
  authorsArchive: AuthorsArchive,
  // Each block component narrows `block` to its own `_type` member of the
  // page-builder union, which is intentionally narrower than `BlockProps`'s
  // full union — hence the `unknown` hop (the registry is looked up by
  // `block._type` at runtime, so the narrowing is sound in practice).
} as unknown as BlocksType

/**
 * Used by the <PageBuilder>, this component renders a the component that matches the block type.
 */
export default function BlockRenderer({block, index, pageId, pageType}: BlockProps) {
  // Block does exist
  if (typeof Blocks[block._type] !== 'undefined') {
    // Per-block animated background. When a shader is configured, wrap the
    // block's output in a `relative` container so the `absolute inset-0 -z-10`
    // canvas sits behind the content. The `data-sanity` attr stays on the same
    // editable node so Visual Editing keeps targeting the block.
    const background = 'background' in block ? block.background : null
    const hasShader = background?.type === 'shader'

    const rendered = React.createElement(Blocks[block._type], {
      key: block._key,
      block: block,
      index: index,
      pageId: pageId,
      pageType: pageType,
    })

    return (
      <div
        key={block._key}
        className={hasShader ? 'relative isolate' : undefined}
        data-sanity={dataAttr({
          id: pageId,
          type: pageType,
          path: `pageBuilder[_key=="${block._key}"]`,
        }).toString()}
      >
        {hasShader ? (
          <ShaderBackground
            preset={background?.preset}
            speed={background?.speed}
            intensity={background?.intensity}
            colorSource={background?.colorSource}
            customColor={background?.customColor}
            opacity={background?.opacity}
          />
        ) : null}
        {rendered}
      </div>
    )
  }
  // Block doesn't exist yet
  return (
    <div key={block._key} className="container my-12">
      <Alert variant="destructive">
        <AlertTitle>Unknown block</AlertTitle>
        <AlertDescription>
          A &ldquo;{block._type}&rdquo; block hasn&apos;t been created yet.
        </AlertDescription>
      </Alert>
    </div>
  )
}
