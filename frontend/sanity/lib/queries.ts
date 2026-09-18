import {defineQuery} from 'next-sanity'

const navLinkProjection = /* groq */ `
  _key,
  _type,
  title,
  link {
    ...,
    _type == "link" => {
      "page": page->slug.current
    }
  },
  "resolvedTitle": coalesce(title, link.page->name, link.href)
`

export const settingsQuery = defineQuery(`*[_type == "settings"][0]{
	...,
	homepage->,
	contact,
	legal,
	navigation[]{
		_type == "navLink" => {
			${navLinkProjection}
		},
		_type == "navDropdown" => {
			_key,
			_type,
			title,
			links[]{
				${navLinkProjection}
			}
		}
	}
}`)

// Card-sized projection of a `program` document,
// used by the programs grid. Deliberately excludes `body` and `masthead` —
// those belong to the detail route, not to a card.
const programCardFields = /* groq */ `
  _id,
  name,
  "slug": slug.current,
  ageRange,
  ratio,
  classroomName,
  summary,
  image,
  "order": coalesce(order, 99)
`

// Card-sized projection of a `testimonial` document.
const testimonialCardFields = /* groq */ `
  _id,
  quote,
  highlight,
  authorName,
  authorRole,
  authorImage
`

// Card-sized projection of a `person` document for
// the faculty grid. `bio` is `blockContentTextOnly`, which carries no link
// annotations, so it needs no markDefs resolution.
const personCardFields = /* groq */ `
  _id,
  firstName,
  lastName,
  role,
  credentials,
  bio,
  picture,
  "order": coalesce(order, 99)
`

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current
  }
`

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`

export const getPageQuery = defineQuery(`
  *[_type == 'page' && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    heading,
    subheading,
    titleDisplay,
    masthead,
    seo,
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "callToAction" => {
        ...,
        button {
          ...,
          ${linkFields}
        }
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
      _type == "featuresGrid" => {
        ...,
        features[]{
          ...,
          ${linkFields}
        }
      },
      _type == "gallery" => {
        ...,
        items[]{
          ...,
          _type == "galleryImage" => {
            "aspectRatio": asset->metadata.dimensions.aspectRatio
          },
          _type == "galleryVideo" => {
            "poster": poster{
              ...,
              "aspectRatio": asset->metadata.dimensions.aspectRatio
            }
          }
        }
      },
      _type == "programsGrid" => {
        ...,
        "programs": select(
          mode == "selected" => programs[]->{ ${programCardFields} },
          *[_type == "program" && defined(slug.current)] | order(coalesce(order, 99) asc, name asc){
            ${programCardFields}
          }
        )
      },
      _type == "testimonials" => {
        ...,
        "documentTestimonials": *[
          _type == "testimonial" && (^.featuredOnly != true || featured == true)
        ] | order(coalesce(order, 99) asc, _createdAt asc)[0...24]{
          ${testimonialCardFields}
        }
      },
      _type == "facultyGrid" => {
        ...,
        "people": select(
          mode == "selected" => people[]->{ ${personCardFields} },
          *[_type == "person"] | order(coalesce(order, 99) asc, lastName asc){
            ${personCardFields}
          }
        )
      },
      _type == "contactDetails" => {
        ...,
        "contact": *[_type == "settings"][0].contact
      },
      _type == "faq" => {
        ...,
        items[]{
          ...,
          answer[]{
            ...,
            markDefs[]{
              ...,
              ${linkReference}
            }
          }
        }
      },
      _type == "note" => {
        ...,
        tone,
        icon,
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
    },
  }
`)

// The designated homepage is excluded for the same reason as in `pagesSlugs`:
// `app/sitemap.ts` already emits the site root, so listing the homepage's own
// slug would advertise a second, redirecting URL for the same content.
export const sitemapData = defineQuery(`
  *[(_type == "page" || _type == "program")
    && defined(slug.current)
    && !(_type == "page" && slug.current == *[_type == "settings"][0].homepage->slug.current)] | order(_type asc) {
    "slug": slug.current,
    _type,
    _updatedAt,
  }
`)

// A `program` document for `/programs/[slug]`.
// `siblings` feeds the "other programs" links at the foot of the page, and
// `parentName` the breadcrumb — the index is the `page` whose slug is
// `programs` (the route segment is fixed, the page's display name is not).
export const programQuery = defineQuery(`
  *[_type == "program" && slug.current == $slug][0]{
    ${programCardFields},
    scheduleNote,
    masthead,
    body[]{
      ...,
      markDefs[]{
        ...,
        ${linkReference}
      }
    },
    "parentName": *[_type == "page" && slug.current == "programs"][0].name,
    "siblings": *[_type == "program" && defined(slug.current) && slug.current != $slug]
      | order(coalesce(order, 99) asc, name asc){
        _id,
        name,
        "slug": slug.current,
        ageRange
      }
  }
`)

export const programSlugsQuery = defineQuery(`
  *[_type == "program" && defined(slug.current)]
  {"slug": slug.current}
`)

/**
 * Page slugs for `app/[slug]`'s `generateStaticParams`.
 *
 * The designated homepage is excluded: `settings.homepage` points at a `page`
 * document, and prerendering it here published the homepage a second time at
 * `/<its slug>` alongside `/`. `next.config.ts` 301s that URL to `/`, and
 * this keeps the route from being generated (and indexed) in the first place.
 */
export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current)
    && slug.current != *[_type == "settings"][0].homepage->slug.current]
  {"slug": slug.current}
`)
