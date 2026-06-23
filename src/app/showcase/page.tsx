import type { Metadata } from 'next';

import BrandShowcasePage from '~/lib/containers/showcase/BrandShowcasePage';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shattak.com';
const SHOWCASE_PATH = '/showcase/';
const TITLE = 'Brand Showcase | Shattak';
const DESCRIPTION = 'A visual reference for the Shattak brand system, colors, typography, surfaces, and components.';

export const metadata: Metadata = {
	title: { absolute: TITLE },
	description: DESCRIPTION,
	alternates: {
		canonical: SHOWCASE_PATH
	},
	openGraph: {
		title: TITLE,
		description: DESCRIPTION,
		type: 'website',
		siteName: 'Shattak',
		url: new URL(SHOWCASE_PATH, SITE_URL).toString()
	},
	twitter: {
		card: 'summary',
		title: TITLE,
		description: DESCRIPTION
	}
};

export default BrandShowcasePage;
