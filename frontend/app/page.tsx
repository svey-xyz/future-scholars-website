import {Suspense, ViewTransition} from 'react'
import Link from 'next/link'
import {PortableText} from '@portabletext/react'
import {ArrowTopRightOnSquareIcon} from '@heroicons/react/24/outline'

import {AllPosts} from '@/app/components/Posts'
import GetStartedCode from '@/app/components/GetStartedCode'
import SideBySideIcons from '@/app/components/SideBySideIcons'
import {Button} from '@/components/ui/button'
import {Skeleton} from '@/components/ui/skeleton'
import {getPageQuery, pagesSlugs, settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {dataAttr} from '@/sanity/lib/utils'
import PageRoute from '@/app/[slug]/page'
import { Metadata } from 'next'

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
	const { data: settings } = await sanityFetch({
		query: settingsQuery,
		stega: false,
		perspective: 'published',
	})

	return settings?.homepage?.slug ? [{ slug: settings.homepage.slug.current }] : []
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
	const { data: settings } = await sanityFetch({
		query: settingsQuery,
		stega: false,
	})

	const { data: page } = await sanityFetch({
		query: getPageQuery,
		params: new Promise((resolve) => {
			resolve({ slug: settings?.homepage?.slug.current || '' })
		}),
		// Metadata should never contain stega
		stega: false,
	})

	return {
		title: page?.name,
		description: page?.heading,
	} satisfies Metadata
}


export default async function Page() {
	const { data: settings } = await sanityFetch({
		query: settingsQuery,
		stega: false,
	})

	if (!settings || !settings.homepage?.slug) {
		return (
			<div className="text-center">
				No homepage set.
			</div>
		)
	}

	return <PageRoute params={new Promise((resolve, reject) => { resolve({ slug: settings.homepage?.slug.current || '' }) })} />
}
