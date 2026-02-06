import type { Metadata } from 'next';

import HomePage from '~/lib/containers/home';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const SHARE_IMAGE = '/assets/android-chrome-512x512.png';
const DESCRIPTION = 'Shattak offers compact but complete live classes led by industry mentors. Learn one skill deeply, build real projects, and strengthen your portfolio with outcome-driven learning.';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
	title: 'Shattak – Live Classes That Build Real Skills & Portfolio Projects',
	description: 'Shattak offers compact but complete live classes led by industry mentors. Learn one skill deeply, build real projects, and strengthen your portfolio with outcome-driven learning.',
	alternates: {
		canonical: SITE_URL
	},
	openGraph: {
		title: 'Shattak – Learn Skills by Building Real Projects',
		description: 'Live, mentor-led classes focused on one skill at a time. Learn deeply, build real projects, and prove your skills with a strong portfolio.',
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
		title: 'Shattak – Outcome-Driven Live Learning',
		description: 'Compact live classes with expert mentors. Learn one topic deeply, build real projects, and show proof of work that employers care about.',
		images: [SHARE_IMAGE]
	}
};

// const structuredData = {
// 	'@context': 'https://schema.org',
// 	'@graph': [
// 		{
// 			'@type': 'Organization',
// 			name: 'Shattak',
// 			url: SITE_URL,
// 			logo: `${SITE_URL}${SHARE_IMAGE}`
// 		},
// 		{
// 			'@type': 'WebSite',
// 			name: 'Shattak',
// 			url: SITE_URL,
// 			description: DESCRIPTION
// 		}
// 	]
// };


const structuredData = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'EducationalOrganization',
			name: 'Shattak',
			url: SITE_URL,
			logo: `${SITE_URL}${SHARE_IMAGE}`,
			description:
				'Shattak is a live learning platform offering compact but complete courses where learners build real projects and gain job-ready skills.',
			sameAs: [
				'https://www.linkedin.com/company/shattak',
				'https://twitter.com/shattak'
			]
		},
		{
			'@type': 'WebSite',
			name: 'Shattak',
			url: SITE_URL,
			description:
				'Live, mentor-led classes focused on one skill at a time with real-world projects and portfolio outcomes.',
			potentialAction: {
				'@type': 'SearchAction',
				target: `${SITE_URL}/search?q={search_term_string}`,
				'query-input': 'required name=search_term_string'
			}
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
