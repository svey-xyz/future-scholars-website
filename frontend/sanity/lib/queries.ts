import {defineQuery} from 'next-sanity'

const navLinkProjection = /* groq */ `
  _key,
  _type,
  title,
  link {
    ...,
    _type == "link" => {
      "page": page->slug.current,
      "post": post->slug.current
    }
  },
  "resolvedTitle": coalesce(title, link.page->name, link.post->title, link.href)
`

export const settingsQuery = defineQuery(`*[_type == "settings"][0]{
	...,
	homepage->,
	contact,
	legal,
	builtWith[]{
		name,
		url,
		icon
	},
	mobileNav,
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

const postFields = /* groq */ `
  _id,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  coverImage,
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
`

const projectFields = /* groq */ `
  _id,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  coverImage,
  website,
  repo,
  featured,
  hidden,
  "publishedAt": coalesce(publishedAt, _createdAt),
  "updatedAt": coalesce(updatedAt, _updatedAt),
  "categories": categories[]->{_id, title, "slug": slug.current},
  "tech": tech[]->{_id, title, "slug": slug.current},
`

// FSMA fork (build plan S6): card-sized projection of a `program` document,
// used by the programs grid. Deliberately excludes `body` and `masthead` —
// those belong to the detail route (S8), not to a card.
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

// FSMA fork (build plan S6): card-sized projection of a `testimonial` document.
const testimonialCardFields = /* groq */ `
  _id,
  quote,
  highlight,
  authorName,
  authorRole,
  authorImage
`

// FSMA fork (build plan S7): card-sized projection of a `person` document for
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
    "page": page->slug.current,
    "post": post->slug.current
  }
`

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`

// Shared projection for the reusable `background` object (page-level + per-block).
const backgroundFields = /* groq */ `
  background {
    type,
    preset,
    speed,
    intensity,
    colorSource,
    customColor,
    opacity
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
    archive,
    masthead,
    seo,
    ${backgroundFields},
    "pageBuilder": pageBuilder[]{
      ...,
      ${backgroundFields},
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
      _type == "hero" => {
        ...,
        buttons[]{
          ...,
          ${linkFields}
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
        "documentTestimonials": select(
          source == "documents" => *[
            _type == "testimonial" && (^.featuredOnly != true || featured == true)
          ] | order(coalesce(order, 99) asc, _createdAt asc)[0...24]{
            ${testimonialCardFields}
          },
          []
        )
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
      _type == "scores" => {
        ...,
        heading,
        caption[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        },
        items[]{
          _key,
          label,
          value,
          max,
          asPercent
        }
      },
      _type == "postsArchive" => {
        ...,
        category->{_id, title, "slug": slug.current},
        "posts": select(
          source == "picked" => posts[]->{ ${postFields} },
          source == "all" => *[_type == "post" && defined(slug.current) && (!defined(^.category) || ^.category._ref in categories[]._ref)] | order(date desc, _updatedAt desc){
            ${postFields}
          },
          *[_type == "post" && defined(slug.current) && (!defined(^.category) || ^.category._ref in categories[]._ref)] | order(date desc, _updatedAt desc)[0...24]{
            ${postFields}
          }
        )
      },
      _type == "projectsArchive" => {
        ...,
        category->{_id, title, "slug": slug.current},
        "projects": select(
          source == "picked" => projects[]->{ ${projectFields} },
          source == "all" => *[_type == "project" && defined(slug.current) && !hidden && (!defined(^.category) || ^.category._ref in categories[]._ref)] | order(coalesce(publishedAt, _createdAt) desc){
            ${projectFields}
          },
          *[_type == "project" && defined(slug.current) && !hidden && (!defined(^.category) || ^.category._ref in categories[]._ref)] | order(coalesce(publishedAt, _createdAt) desc)[0...24]{
            ${projectFields}
          }
        )
      },
      _type == "authorsArchive" => {
        ...,
        "authors": select(
          source == "picked" => authors[]->{
            _id, firstName, lastName, picture,
            "postCount": count(*[_type == "post" && defined(slug.current) && references(^._id)])
          },
          *[_type == "person"] | order(lastName asc, firstName asc)[0...48]{
            _id, firstName, lastName, picture,
            "postCount": count(*[_type == "post" && defined(slug.current) && references(^._id)])
          }
        )
      },
    },
  }
`)

// The designated homepage is excluded for the same reason as in `pagesSlugs`:
// `app/sitemap.ts` already emits the site root, so listing the homepage's own
// slug would advertise a second, redirecting URL for the same content.
export const sitemapData = defineQuery(`
  *[(_type == "page" || _type == "post" || _type == "project")
    && defined(slug.current)
    && !(_type == "project" && hidden == true)
    && !(_type == "page" && slug.current == *[_type == "settings"][0].homepage->slug.current)] | order(_type asc) {
    "slug": slug.current,
    _type,
    _updatedAt,
  }
`)

export const allPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${postFields}
  }
`)

export const morePostsQuery = defineQuery(`
  *[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    ${postFields}
  }
`)

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    content[]{
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
  },
    ${postFields}
  }
`)

export const postPagesSlugs = defineQuery(`
  *[_type == "post" && defined(slug.current)]
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

// Resolve the canonical archive page's slug for a given archive type (the stored
// `archive` value is the block `_type`, e.g. "projectsArchive"). Used to build
// links to the listing (project detail back-link + taxonomy chips). Each archive
// is unique to one page (enforced in the Studio schema), so `[0]` is exact.
export const archivePageSlugQuery = defineQuery(`
  *[_type == "page" && archive == $archive && defined(slug.current)][0].slug.current
`)

export const allProjectsQuery = defineQuery(`
  *[_type == "project" && defined(slug.current) && !hidden] | order(featured desc, coalesce(publishedAt, _createdAt) desc) {
    ${projectFields}
  }
`)

export const projectBySlugQuery = defineQuery(`
  *[_type == "project" && slug.current == $slug] [0] {
    ${projectFields}
    body[]{
      ...,
      markDefs[]{
        ...,
        ${linkReference}
      }
    },
    ogImage,
  }
`)

export const projectSlugsQuery = defineQuery(`
  *[_type == "project" && defined(slug.current) && !hidden]
  {"slug": slug.current}
`)

/**
 * Default-order slug/title list backing the project detail's prev/next
 * pagination (issue #17) when no in-tab nav context exists. Order matches the
 * archive block's server default (`coalesce(publishedAt, _createdAt) desc`).
 */
export const projectNavListQuery = defineQuery(`
  *[_type == "project" && defined(slug.current) && !hidden] | order(coalesce(publishedAt, _createdAt) desc) {
    "slug": slug.current,
    title
  }
`)
