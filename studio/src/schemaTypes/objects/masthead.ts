import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'

import {altField} from './shared'

/**
 * Masthead — the full-bleed image + logo lockup that opens every page.
 *
 * This is a page-level field rather than a page-builder block (FSMA build plan
 * D12): the client wants one at the top of every page, and a field guarantees
 * position where a block could be reordered below content. The image is the LCP
 * element — the frontend renders it with `priority` and no lazy loading.
 *
 * Vary `height`, `overlay` and the hotspot per page: six identical mastheads is
 * an explicit anti-goal (build plan §7.1).
 */
export const masthead = defineType({
  name: 'masthead',
  title: 'Masthead',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description:
        'Full-bleed background image. Set the hotspot — the crop changes shape considerably between mobile and desktop.',
      options: {hotspot: true, aiAssist: {imageDescriptionField: 'alt'}},
      fields: [altField],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Optional short line above the page heading.',
    }),
    defineField({
      name: 'showLogo',
      title: 'Show logo',
      type: 'boolean',
      description: 'Overlay the reversed (white) logo lockup on the image.',
      initialValue: true,
    }),
    defineField({
      name: 'logoPlacement',
      title: 'Logo placement',
      type: 'string',
      initialValue: 'center',
      options: {
        list: [
          {title: 'Centre', value: 'center'},
          {title: 'Bottom left', value: 'bottomLeft'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      hidden: ({parent}) => parent?.showLogo === false,
    }),
    defineField({
      name: 'height',
      title: 'Height',
      type: 'string',
      initialValue: 'standard',
      description: 'Tall ≈ 60vh, Standard ≈ 48vh, Compact ≈ 34vh on desktop.',
      options: {
        list: [
          {title: 'Tall', value: 'tall'},
          {title: 'Standard', value: 'standard'},
          {title: 'Compact', value: 'compact'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'overlay',
      title: 'Overlay',
      type: 'string',
      initialValue: 'medium',
      description:
        'Gradient scrim strength behind the logo and heading. Increase it on bright or busy photographs so overlaid text keeps its contrast ratio.',
      options: {
        list: [
          {title: 'None', value: 'none'},
          {title: 'Light', value: 'light'},
          {title: 'Medium', value: 'medium'},
          {title: 'Strong', value: 'strong'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'focalNote',
      title: 'Focal note',
      type: 'string',
      description:
        'Editor-facing note about what the crop must keep in frame. Never rendered on the site.',
    }),
  ],
  preview: {
    select: {media: 'image.asset', alt: 'image.alt', height: 'height'},
    prepare({media, alt, height}) {
      return {
        title: 'Masthead',
        subtitle: [height, alt].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
