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
 *
 * `variant` exists because the legacy photography tops out at 720×480 and
 * cannot fill a masthead (Q5). `brand` renders a flat colour panel with the
 * reversed logo instead of a photograph, so every page can still open with a
 * masthead today; switch a page to `image` as real photography arrives.
 */
export const masthead = defineType({
  name: 'masthead',
  title: 'Masthead',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      initialValue: 'brand',
      description:
        'Photograph, or a flat brand panel when no image of sufficient resolution exists yet.',
      options: {
        list: [
          {title: 'Brand panel', value: 'brand'},
          {title: 'Photograph', value: 'image'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description:
        'Full-bleed background image. Set the hotspot — the crop changes shape considerably between mobile and desktop. Needs to be at least ~2000px wide to survive the crop.',
      options: {hotspot: true, aiAssist: {imageDescriptionField: 'alt'}},
      fields: [altField],
      hidden: ({parent}) => parent?.variant !== 'image',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const variant = (context.parent as {variant?: string} | undefined)?.variant
          if (variant === 'image' && !(value as {asset?: unknown} | undefined)?.asset) {
            return 'Pick an image, or switch the variant to Brand panel.'
          }
          return true
        }),
    }),
    defineField({
      name: 'tone',
      title: 'Panel tone',
      type: 'string',
      initialValue: 'primary',
      description: 'Which brand colour fills the panel.',
      options: {
        list: [
          {title: 'Academy blue', value: 'primary'},
          {title: 'Ink', value: 'ink'},
          {title: 'Soft sky', value: 'secondary'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      hidden: ({parent}) => parent?.variant === 'image',
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
        'Gradient scrim strength behind the logo and heading. Increase it on bright or busy photographs so overlaid text keeps its contrast ratio. Not used by the brand panel, which is a flat colour already chosen for contrast.',
      options: {
        list: [
          {title: 'None', value: 'none'},
          {title: 'Light', value: 'light'},
          {title: 'Medium', value: 'medium'},
          {title: 'Strong', value: 'strong'},
        ],
        layout: 'radio',
      },
      hidden: ({parent}) => parent?.variant !== 'image',
    }),
    defineField({
      name: 'focalNote',
      title: 'Focal note',
      type: 'string',
      description:
        'Editor-facing note about what the crop must keep in frame. Never rendered on the site.',
      hidden: ({parent}) => parent?.variant !== 'image',
    }),
  ],
  preview: {
    select: {
      media: 'image.asset',
      alt: 'image.alt',
      height: 'height',
      variant: 'variant',
      tone: 'tone',
    },
    prepare({media, alt, height, variant, tone}) {
      const brand = variant !== 'image'
      return {
        title: brand ? 'Masthead — brand panel' : 'Masthead — photograph',
        subtitle: [height, brand ? tone : alt].filter(Boolean).join(' · '),
        media: brand ? undefined : media,
      }
    },
  },
})
