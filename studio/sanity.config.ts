/**
 * This config is used to configure your Sanity Studio.
 * Learn more: https://www.sanity.io/docs/configuration
 */

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'
import {archiveTitle} from './src/schemaTypes/objects/shared'
import {structure} from './src/structure'
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
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-projectID'
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
    case 'post':
      return slug ? `/posts/${slug}` : undefined
    case 'project':
      return slug ? `/projects/${slug}` : undefined
    case 'page':
      return slug ? `/${slug}` : undefined
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
        {
          route: '/',
          filter: `_type == "settings" && _id == "siteSettings"`,
        },
        {
          route: '/:slug',
          filter: `_type == "page" && slug.current == $slug || _id == $slug`,
        },
        {
          route: '/posts/:slug',
          filter: `_type == "post" && slug.current == $slug || _id == $slug`,
        },
        {
          route: '/projects/:slug',
          filter: `_type == "project" && slug.current == $slug || _id == $slug`,
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
            archive: 'archive',
          },
          resolve: (doc) => ({
            // Surface the archive designation so editors can see (in
            // Presentation) which content type this page lists.
            message: doc?.archive
              ? `This page is the ${archiveTitle(doc.archive)} archive`
              : undefined,
            tone: doc?.archive ? 'positive' : undefined,
            locations: [
              {
                title: doc?.archive
                  ? `${doc?.name || 'Untitled'} · ${archiveTitle(doc.archive)} archive`
                  : doc?.name || 'Untitled',
                href: resolveHref('page', doc?.slug)!,
              },
            ],
          }),
        }),
        post: defineLocations({
          select: {
            title: 'title',
            slug: 'slug.current',
          },
          resolve: (doc) => ({
            locations: [
              {
                title: doc?.title || 'Untitled',
                href: resolveHref('post', doc?.slug)!,
              },
              {
                title: 'Home',
                href: '/',
              } satisfies DocumentLocation,
            ].filter(Boolean) as DocumentLocation[],
          }),
        }),
        project: defineLocations({
          select: {
            title: 'title',
            slug: 'slug.current',
          },
          // The projects listing is now a normal page designated the Projects
          // archive (`page.archive`), at an editor-chosen slug. `defineLocations`'
          // resolver is synchronous with no dataset access, so it can't look that
          // slug up — hence only the detail location (no hard-coded `/projects`).
          resolve: (doc) => ({
            locations: [
              {
                title: doc?.title || 'Untitled',
                href: resolveHref('project', doc?.slug)!,
              },
            ].filter(Boolean) as DocumentLocation[],
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
  title: 'Sanity + Next.js Starter Template',

  projectId,
  dataset,

  plugins: deskPlugins,

  // Schema configuration, imported from ./src/schemaTypes/index.ts
  schema: {
    types: schemaTypes,
  },
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
