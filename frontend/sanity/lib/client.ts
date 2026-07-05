import {createClient} from 'next-sanity'

import {apiVersion, dataset, projectId, studioUrl} from '@/sanity/lib/api'
import {token} from '@/sanity/lib/token'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  token, // Required if you have a private dataset
  // Default to published content; draft/release perspectives are passed
  // explicitly per fetch (see the three-layer pattern in docs/CACHING.md).
  perspective: 'published',
  stega: {studioUrl},
})
