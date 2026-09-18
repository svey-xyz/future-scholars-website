/**
 * Future Scholars Montessori Academy — Sanity Studio config.
 * Learn more: https://www.sanity.io/docs/configuration
 */

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'
import {documentOptions, schemaOptions, structure} from './src/structure'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {media} from 'sanity-plugin-media'
import {
  presentationTool,
  defineDocuments,
  defineLocations,
  type DocumentLocation,
} from 'sanity/presentation'
import {assist} from '@sanity/assist'

// Environment variables for project configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'wzs9gcps'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

// URL for preview functionality, defaults to localhost:3000 if not set
const SANITY_STUDIO_PREVIEW_URL = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'

// Define the home location for the presentation tool
const homeLocation = {
  title: 'Home',
  href: '/',
} satisfies DocumentLocation

// resolveHref() is a convenience function that resolves the URL
// path for different document types and used in the presentation tool.
function resolveHref(documentType?: string, slug?: string): string | undefined {
  switch (documentType) {
    case 'page':
      return slug ? `/${slug}` : undefined
    case 'program':
      return slug ? `/programs/${slug}` : undefined
    default:
      console.warn('Invalid document type:', documentType)
      return undefined
  }
}

const deskPlugins = [
  // Presentation tool configuration for Visual Editing
  presentationTool({
    previewUrl: {
      origin: SANITY_STUDIO_PREVIEW_URL,
      previewMode: {
        enable: '/api/draft-mode/enable',
      },
    },
    resolve: {
      // The Main Document Resolver API provides a method of resolving a main document from a given route or route pattern. https://www.sanity.io/docs/visual-editing/presentation-resolver-api#57720a5678d9
      mainDocuments: defineDocuments([
        // `/` renders the page that Settings → Homepage points at.
        {
          route: '/',
          filter: `_type == "page" && _id == *[_type == "settings"][0].homepage._ref`,
        },
        {
          route: '/:slug',
          filter: `_type == "page" && slug.current == $slug || _id == $slug`,
        },
        {
          route: '/programs/:slug',
          filter: `_type == "program" && slug.current == $slug || _id == $slug`,
        },
      ]),
      // Locations Resolver API allows you to define where data is being used in your application. https://www.sanity.io/docs/visual-editing/presentation-resolver-api#8d8bca7bfcd7
      locations: {
        settings: defineLocations({
          locations: [homeLocation],
          message: 'This document is used on all pages',
          tone: 'positive',
        }),
        page: defineLocations({
          select: {
            name: 'name',
            slug: 'slug.current',
          },
          resolve: (doc) => ({
            locations: [
              {
                title: doc?.name || 'Untitled',
                href: resolveHref('page', doc?.slug)!,
              },
            ],
          }),
        }),
        // A program has its own detail route and is also carded on the
        // /programs index and the homepage grid.
        program: defineLocations({
          select: {
            name: 'name',
            slug: 'slug.current',
          },
          resolve: (doc) => ({
            locations: [
              {
                title: doc?.name || 'Untitled',
                href: resolveHref('program', doc?.slug)!,
              },
              {title: 'Programs', href: '/programs'},
              homeLocation,
            ].filter((l) => Boolean(l.href)) as DocumentLocation[],
          }),
        }),
      },
    },
  }),
  structureTool({
    structure, // Custom studio structure configuration, imported from ./src/structure.ts
  }),
  media(),

  // Additional plugins for enhanced functionality
  unsplashImageAsset(),
  assist(),
  // visionTool(), // Uncomment to enable Vision, a tool for testing GROQ queries within the Studio
]

// Main Sanity configuration
export default defineConfig({
  name: 'default',
  title: 'Future Scholars Montessori Academy',

  projectId,
  dataset,

  plugins: deskPlugins,

  // Schema configuration, imported from ./src/schemaTypes/index.ts
  schema: {
    types: schemaTypes,
    ...schemaOptions,
  },
  document: documentOptions,
  releases: {
    enabled: false,
  },
  scheduledPublishing: {
    enabled: false,
  },
  scheduledDrafts: {
    enabled: false,
  },
  tasks: {
    enabled: false,
  },
  beta: {
    create: {
      startInCreateEnabled: false,
    },
  },
})
