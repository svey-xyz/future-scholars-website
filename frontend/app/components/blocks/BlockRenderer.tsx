import React from 'react'
import {stegaClean} from '@sanity/client/stega'

import Cta from './Cta'
import Info from './InfoSection'
import FeaturesGrid from './FeaturesGrid'
import Stats from './Stats'
import Testimonials from './Testimonials'
import ProgramsGrid from './ProgramsGrid'
import FacultyGrid from './FacultyGrid'
import ContactDetails from './ContactDetails'
import Gallery from '@/app/components/blocks/gallery/Gallery'
import Faq from './Faq'
import Note from './Note'
import PullQuote from './PullQuote'
import {cn} from '@/lib/utils'
import {dataAttr} from '@/sanity/lib/utils'
import {PageBuilderSection} from '@/sanity/lib/types'
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert'

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
  callToAction: Cta,
  infoSection: Info,
  featuresGrid: FeaturesGrid,
  stats: Stats,
  testimonials: Testimonials,
  programsGrid: ProgramsGrid,
  facultyGrid: FacultyGrid,
  contactDetails: ContactDetails,
  gallery: Gallery,
  faq: Faq,
  note: Note,
  pullQuote: PullQuote,
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
    const rendered = React.createElement(Blocks[block._type], {
      key: block._key,
      block: block,
      index: index,
      pageId: pageId,
      pageType: pageType,
    })

    // An optional `anchor` becomes the wrapper's `id`, so a long page can be
    // linked into (`/about#admissions`, which the legacy redirect map in
    // next.config.ts depends on). `scroll-mt` clears the fixed mobile top bar
    // (64px) — without it an anchored heading lands underneath the bar. It is
    // only applied when there is an anchor, so unanchored blocks are untouched.
    // `stegaClean`: the value ends up in an `id`/URL fragment, where stega
    // characters would silently break the match.
    const anchor = stegaClean(('anchor' in block ? block.anchor : null) || '') || undefined

    return (
      <div
        key={block._key}
        id={anchor}
        className={cn(anchor && 'scroll-mt-20 lg:scroll-mt-8')}
        data-sanity={dataAttr({
          id: pageId,
          type: pageType,
          path: `pageBuilder[_key=="${block._key}"]`,
        }).toString()}
      >
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
