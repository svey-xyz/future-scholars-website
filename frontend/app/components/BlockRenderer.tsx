import React from 'react'

import Cta from '@/app/components/Cta'
import Info from '@/app/components/InfoSection'
import Hero from '@/app/components/Hero'
import FeaturesGrid from '@/app/components/FeaturesGrid'
import Stats from '@/app/components/Stats'
import Testimonials from '@/app/components/Testimonials'
import Gallery from '@/app/components/Gallery'
import Faq from '@/app/components/Faq'
import PostsArchive from '@/app/components/PostsArchive'
import AuthorsArchive from '@/app/components/AuthorsArchive'
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
  hero: Hero,
  callToAction: Cta,
  infoSection: Info,
  featuresGrid: FeaturesGrid,
  stats: Stats,
  testimonials: Testimonials,
  gallery: Gallery,
  faq: Faq,
  postsArchive: PostsArchive,
  authorsArchive: AuthorsArchive,
} as BlocksType

/**
 * Used by the <PageBuilder>, this component renders a the component that matches the block type.
 */
export default function BlockRenderer({block, index, pageId, pageType}: BlockProps) {
  // Block does exist
  if (typeof Blocks[block._type] !== 'undefined') {
    return (
      <div
        key={block._key}
        data-sanity={dataAttr({
          id: pageId,
          type: pageType,
          path: `pageBuilder[_key=="${block._key}"]`,
        }).toString()}
      >
        {React.createElement(Blocks[block._type], {
          key: block._key,
          block: block,
          index: index,
          pageId: pageId,
          pageType: pageType,
        })}
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
