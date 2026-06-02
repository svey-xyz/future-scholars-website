import {person} from './documents/person'
import {page} from './documents/page'
import {post} from './documents/post'
import {category} from './documents/category'
import {callToAction} from './objects/callToAction'
import {infoSection} from './objects/infoSection'
import {settings} from './singletons/settings'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import button from './objects/button'
import {blockContentTextOnly} from './objects/blockContentTextOnly'
import {contact} from './objects/contact'
import {social} from './objects/social'
import {hero} from './objects/hero'
import {postsArchive} from './objects/postsArchive'
import {authorsArchive} from './objects/authorsArchive'
import {gallery} from './objects/gallery'
import {featuresGrid} from './objects/featuresGrid'
import {testimonials} from './objects/testimonials'
import {faq} from './objects/faq'
import {stats} from './objects/stats'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/studio/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  // Documents
  page,
  post,
  person,
  category,
  // Objects
  button,
  blockContent,
  blockContentTextOnly,
  infoSection,
  callToAction,
  link,
  contact,
  social,
  // Page builder blocks
  hero,
  postsArchive,
  authorsArchive,
  gallery,
  featuresGrid,
  testimonials,
  faq,
  stats,
]
