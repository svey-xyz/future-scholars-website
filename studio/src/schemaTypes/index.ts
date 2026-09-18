import {person} from './documents/person'
import {page} from './documents/page'
import {program} from './documents/program'
import {testimonial} from './documents/testimonial'
import {callToAction} from './objects/callToAction'
import {infoSection} from './objects/infoSection'
import {settings} from './singletons/settings'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import button from './objects/button'
import {blockContentTextOnly} from './objects/blockContentTextOnly'
import {contact} from './objects/contact'
import {masthead} from './objects/masthead'
import {seo} from './objects/seo'
import {programsGrid} from './objects/programsGrid'
import {contactDetails} from './objects/contactDetails'
import {facultyGrid} from './objects/facultyGrid'
import {social} from './objects/social'
import {navLink} from './objects/navLink'
import {navDropdown} from './objects/navDropdown'
import {gallery} from './objects/gallery'
import {galleryVideo} from './objects/galleryVideo'
import {featuresGrid} from './objects/featuresGrid'
import {testimonials} from './objects/testimonials'
import {faq} from './objects/faq'
import {stats} from './objects/stats'
import {note} from './objects/note'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/studio/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  // Documents
  page,
  program,
  testimonial,
  person,
  // Objects
  button,
  blockContent,
  blockContentTextOnly,
  infoSection,
  callToAction,
  link,
  contact,
  masthead,
  seo,
  social,
  navLink,
  navDropdown,
  // Page builder blocks
  gallery,
  galleryVideo,
  featuresGrid,
  testimonials,
  programsGrid,
  facultyGrid,
  contactDetails,
  faq,
  stats,
  note,
]
