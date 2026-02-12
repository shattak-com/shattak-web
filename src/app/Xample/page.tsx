import type { Metadata } from 'next';

import Xample from '~/lib/containers/xample';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shattak.com';
const ABOUT_PATH = '/about/';
const ABOUT_URL = new URL(ABOUT_PATH, SITE_URL).toString();
const SHARE_IMAGE = '/assets/android-chrome-512x512.png';
const TITLE = 'Shattak | Live, Mentor-Led Classes That Build Real Skills & Portfolios';
const DESCRIPTION =	'Discover how Shattak delivers live mentor sessions, portfolio projects, and job-ready skills through practical, outcome-driven classes in India.';

export const metadata: Metadata = {
	title: { absolute: TITLE },
	description: DESCRIPTION,
	alternates: {
		canonical: ABOUT_PATH
	},
	openGraph: {
		title: TITLE,
		description: DESCRIPTION,
		type: 'website',
		siteName: 'Shattak',
		url: ABOUT_URL,
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
		title: TITLE,
		description: DESCRIPTION,
		images: [SHARE_IMAGE]
	}
};

const structuredData = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'EducationalOrganization',
			name: 'Shattak',
			url: 'https://shattak.com',
			logo: `${SITE_URL}${SHARE_IMAGE}`,
			contactPoint: [
				{
					'@type': 'ContactPoint',
					contactType: 'customer support',
					email: 'hello@shattak.com',
					availableLanguage: ['English']
				}
			],
			sameAs: ['https://www.linkedin.com/company/shattak', 'https://twitter.com/shattak']
		},
		{
			'@type': 'WebSite',
			name: 'Shattak',
			url: SITE_URL,
			description:
				'Shattak offers live classes with mentor guidance, practical portfolio projects, and structured learning for job-ready skills.'
		},
		{
			'@type': 'BreadcrumbList',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: 'Home',
					item: SITE_URL
				},
				{
					'@type': 'ListItem',
					position: 2,
					name: 'About',
					item: ABOUT_URL
				}
			]
		}
	]
};

const Page = () => (
	<>
		<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
		<Xample />
	</>
);

export default Page;
