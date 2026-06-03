import {defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons'

/**
 * galleryVideo — an external (YouTube / Vimeo) video item for the `gallery`
 * block. Rendered front-end via a lightweight click-to-load facade (no heavy
 * iframe until the poster is clicked).
 *
 * a11y: `title` is required — it labels the facade button and is set as the
 * iframe `title`. Authors must enable captions on the source video (WCAG 1.2.2);
 * see frontend/docs/A11Y.md.
 */
const YOUTUBE_VIMEO =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/|vimeo\.com\/|player\.vimeo\.com\/video\/)[\w-]+/i

export const galleryVideo = defineType({
  name: 'galleryVideo',
  title: 'Video',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      description: 'A YouTube or Vimeo link.',
      validation: (Rule) =>
        Rule.required()
          .uri({scheme: ['http', 'https']})
          .custom((url) =>
            !url || YOUTUBE_VIMEO.test(url) ? true : 'Must be a YouTube or Vimeo URL',
          ),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Accessible label for the play button and the iframe title. Required.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'poster',
      title: 'Poster image',
      type: 'image',
      description: 'Optional. Shown before the video loads. Falls back to the provider thumbnail.',
      options: {hotspot: true, aiAssist: {imageDescriptionField: 'alt'}},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'Describe the poster for screen readers.',
        }),
      ],
    }),
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
    defineField({
      name: 'aspect',
      title: 'Aspect ratio',
      type: 'string',
      description: 'Optional per-item override of the gallery aspect ratio.',
      options: {
        list: [
          {title: 'Square (1:1)', value: 'square'},
          {title: 'Landscape (16:9)', value: 'video'},
          {title: 'Original', value: 'auto'},
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {title: 'title', caption: 'caption', media: 'poster'},
    prepare({title, caption, media}) {
      return {title: title || caption || 'Video', subtitle: 'Video', media: media || PlayIcon}
    },
  },
})
