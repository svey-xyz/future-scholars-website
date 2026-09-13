import {person} from './documents/person'
import {page} from './documents/page'
import {post} from './documents/post'
import {project} from './documents/project'
import {category} from './documents/category'
import {technology} from './documents/technology'
import {callToAction} from './objects/callToAction'
import {infoSection} from './objects/infoSection'
import {settings} from './singletons/settings'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import button from './objects/button'
import {blockContentTextOnly} from './objects/blockContentTextOnly'
import {contact} from './objects/contact'
import {masthead} from './objects/masthead'
import {social} from './objects/social'
import {navLink} from './objects/navLink'
import {navDropdown} from './objects/navDropdown'
import {hero} from './objects/hero'
import {postsArchive} from './objects/postsArchive'
import {projectsArchive} from './objects/projectsArchive'
import {authorsArchive} from './objects/authorsArchive'
import {gallery} from './objects/gallery'
import {galleryVideo} from './objects/galleryVideo'
import {featuresGrid} from './objects/featuresGrid'
import {testimonials} from './objects/testimonials'
import {faq} from './objects/faq'
import {stats} from './objects/stats'
import {scores} from './objects/scores'
import {note} from './objects/note'
import {background} from './objects/background'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/studio/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  // Documents
  page,
  post,
  project,
  person,
  category,
  technology,
  // Objects
  button,
  blockContent,
  blockContentTextOnly,
  infoSection,
  callToAction,
  link,
  contact,
  masthead,
  social,
  navLink,
  navDropdown,
  background,
  // Page builder blocks
  hero,
  postsArchive,
  projectsArchive,
  authorsArchive,
  gallery,
  galleryVideo,
  featuresGrid,
  testimonials,
  faq,
  stats,
  scores,
  note,
]
