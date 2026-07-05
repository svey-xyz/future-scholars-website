import React from 'react'
import {stegaClean} from '@sanity/client/stega'

import Cta from './Cta'
import Info from './InfoSection'
import Hero from './Hero'
import FeaturesGrid from './FeaturesGrid'
import Stats from './Stats'
import Scores from './Scores'
import Testimonials from './Testimonials'
import Gallery from '@/app/components/blocks/gallery/Gallery'
import Faq from './Faq'
import Note from './Note'
import PostsArchive from './PostsArchive'
import ProjectsArchive from './ProjectsArchive'
import AuthorsArchive from './AuthorsArchive'
import {dataAttr} from '@/sanity/lib/utils'
import {PageBuilderSection} from '@/sanity/lib/types'
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert'
import {ShaderBackground} from '@/app/components/shader'

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
  scores: Scores,
  testimonials: Testimonials,
  gallery: Gallery,
  faq: Faq,
  note: Note,
  postsArchive: PostsArchive,
  projectsArchive: ProjectsArchive,
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
    // `stegaClean`: enum values carry stega characters in draft mode — a raw
    // comparison would never match and the shader background would vanish.
    const hasShader = stegaClean(background?.type) === 'shader'

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
