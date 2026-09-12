import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getMarketingPageConfig, marketingPages } from '~/lib/constants/marketing-pages';
import MarketingContentPage from '~/lib/containers/content/MarketingContentPage';
import { getMarketingPageDescription, getMarketingPageMarkdown } from '~/lib/content/marketing-page-content';

type PageProps = {
	params: Promise<{ contentSlug: string }>;
};

export const dynamicParams = false;

export const generateStaticParams = () => marketingPages.map(page => ({ contentSlug: page.slug }));

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
	const { contentSlug } = await params;
	const page = getMarketingPageConfig(contentSlug);

	if (!page) {
		return {};
	}

	const description = getMarketingPageDescription(page);
	return {
		title: `${page.sourceHeading} | Shattak`,
		description,
		alternates: {
			canonical: `/${page.slug}/`
		},
		openGraph: {
			title: page.sourceHeading,
			description,
			type: 'website',
			url: `/${page.slug}/`
		}
	};
};

const Page = async ({ params }: PageProps) => {
	const { contentSlug } = await params;
	const page = getMarketingPageConfig(contentSlug);

	if (!page) {
		notFound();
	}

	return <MarketingContentPage markdown={getMarketingPageMarkdown(page)} />;
};

export default Page;
