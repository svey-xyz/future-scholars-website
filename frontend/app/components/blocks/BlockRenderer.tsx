import React from 'react'
import {stegaClean} from '@sanity/client/stega'

import Cta from './Cta'
import Info from './InfoSection'
import Hero from './Hero'
import FeaturesGrid from './FeaturesGrid'
import Stats from './Stats'
import Scores from './Scores'
import Testimonials from './Testimonials'
import ProgramsGrid from './ProgramsGrid'
import FacultyGrid from './FacultyGrid'
import ContactDetails from './ContactDetails'
import Gallery from '@/app/components/blocks/gallery/Gallery'
import Faq from './Faq'
import Note from './Note'
import PostsArchive from './PostsArchive'
import ProjectsArchive from './ProjectsArchive'
import AuthorsArchive from './AuthorsArchive'
import {cn} from '@/lib/utils'
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
  programsGrid: ProgramsGrid,
  facultyGrid: FacultyGrid,
  contactDetails: ContactDetails,
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

    // FSMA fork (S7): an optional `anchor` becomes the wrapper's `id`, so a long
    // page can be linked into (`/about#admissions`, which the redirect map in
    // build plan §6.3 depends on). `scroll-mt` clears the fixed mobile top bar
    // (64px) — without it an anchored heading lands underneath the bar. It is
    // only applied when there is an anchor, so unanchored blocks are untouched.
    // `stegaClean`: the value ends up in an `id`/URL fragment, where stega
    // characters would silently break the match.
    const anchor = stegaClean(('anchor' in block ? block.anchor : null) || '') || undefined

    return (
      <div
        key={block._key}
        id={anchor}
        className={cn(hasShader && 'relative isolate', anchor && 'scroll-mt-20 lg:scroll-mt-8')}
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
