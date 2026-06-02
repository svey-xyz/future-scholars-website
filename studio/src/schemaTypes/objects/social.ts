// import { socialIcon } from "@/next-app/lib/SocialIcon";
import { defineType, defineField } from "sanity";

const platforms = [
	{ title: 'Twitter / X', value: 'twitter' },
	{ title: 'Instagram', value: 'instagram' },
	{ title: 'Facebook', value: 'facebook' },
	{ title: 'Vimeo', value: 'vimeo' },
	{ title: 'LinkedIn', value: 'linkedin' },
	{ title: 'GitHub', value: 'github' },
	{ title: 'Mastodon', value: 'mastodon' },
]

export const social = defineType({
	title: 'Social',
	name: 'social',
	description: 'Link to a social platform.',
	type: 'object',
	fields: [
		defineField({
			title: 'Title',
			name: 'title',
			type: 'string',
			description: 'The title associated with the account prefixed with the address sign (e.g. @username)',
			validation: Rule => Rule.required()
		}),
		defineField({
			title: 'Platform',
			name: 'platform',
			type: 'string',
			options: {
				list: platforms
			},
			validation: Rule => Rule.required()
		}),
		defineField({
			title: 'URL',
			name: 'url',
			type: 'url',
			validation: Rule => Rule.required()
		}),

	],
	preview: {
		select: {
			title: 'title',
			type: 'platform'
		},
		prepare(value: any) {
			const socialSitePlatformTitle = value.type && platforms.flatMap(option => option.value === value.type ? [option.title] : [])
			// const Icon = socialIcon(`${value.type}`)
			return {
				title: `${socialSitePlatformTitle}`,
				subtitle: value.title,
				// media: <Icon className="text-accent" />
			}
		}
	}
})