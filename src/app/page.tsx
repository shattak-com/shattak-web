import type { Metadata } from 'next';

import HomePage from '~/lib/containers/home';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const SHARE_IMAGE = '/assets/android-chrome-512x512.png';
const DESCRIPTION = 'Live classes, expert mentors, and career-ready learning with Shattak.';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
	title: 'Shattak',
	description: DESCRIPTION,
	alternates: {
		canonical: SITE_URL
	},
	openGraph: {
		title: 'Shattak',
		description: DESCRIPTION,
		type: 'website',
		url: SITE_URL,
		images: [
			{
				url: SHARE_IMAGE,
				width: 512,
				height: 512,
				alt: 'Shattak logo'
			}
		]
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Shattak',
		description: DESCRIPTION,
		images: [SHARE_IMAGE]
	}
};

const structuredData = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'Organization',
			name: 'Shattak',
			url: SITE_URL,
			logo: `${SITE_URL}${SHARE_IMAGE}`
		},
		{
			'@type': 'WebSite',
			name: 'Shattak',
			url: SITE_URL,
			description: DESCRIPTION
		}
	]
};

const Page = () => (
	<>
		<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
		<HomePage />
	</>
);

export default Page;
