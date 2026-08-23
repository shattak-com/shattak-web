export type MarketingPageGroup = 'company' | 'legal' | 'resources';

export type MarketingPageConfig = {
	slug: string;
	label: string;
	sourceHeading: string;
	group: MarketingPageGroup;
};

export const marketingPages = [
	{ slug: 'about', label: 'About Shattak', sourceHeading: 'About Shattak', group: 'company' },
	{ slug: 'how-it-works', label: 'How It Works', sourceHeading: 'How Shattak Works', group: 'company' },
	{ slug: 'manifesto', label: 'Manifesto', sourceHeading: 'The Shattak Manifesto', group: 'company' },
	{ slug: 'become-a-mentor', label: 'Become a Mentor', sourceHeading: 'Become a Mentor at Shattak', group: 'company' },
	{ slug: 'careers', label: 'Careers', sourceHeading: 'Careers at Shattak', group: 'company' },
	{ slug: 'contact', label: 'Contact Us', sourceHeading: 'Contact Us', group: 'company' },
	{ slug: 'terms', label: 'Terms & Conditions', sourceHeading: 'Terms & Conditions', group: 'legal' },
	{ slug: 'privacy-policy', label: 'Privacy Policy', sourceHeading: 'Privacy Policy', group: 'legal' },
	{ slug: 'cookie-policy', label: 'Cookie Policy', sourceHeading: 'Cookie Policy', group: 'legal' },
	{ slug: 'refund-policy', label: 'Refund Policy', sourceHeading: 'Refund Policy', group: 'legal' },
	{ slug: 'faq', label: 'FAQ', sourceHeading: 'Frequently Asked Questions', group: 'legal' },
	{ slug: 'blog', label: 'Blog', sourceHeading: 'The Shattak blog', group: 'resources' },
	{ slug: 'career-guides', label: 'Career Guides', sourceHeading: 'Career guides', group: 'resources' },
	{ slug: 'skill-guides', label: 'Skill Guides', sourceHeading: 'Skill guides', group: 'resources' },
	{
		slug: 'interview-preparation',
		label: 'Interview Preparation',
		sourceHeading: 'Interview preparation',
		group: 'resources'
	},
	{ slug: 'community', label: 'Community', sourceHeading: 'Community', group: 'resources' }
] as const satisfies readonly MarketingPageConfig[];

export type MarketingPageSlug = (typeof marketingPages)[number]['slug'];

export const getMarketingPageConfig = (slug: string) => marketingPages.find(page => page.slug === slug);

export const footerPageGroups: ReadonlyArray<{
	id: MarketingPageGroup;
	label: string;
	links: readonly MarketingPageConfig[];
}> = [
	{
		id: 'company',
		label: 'Company',
		links: marketingPages.filter(page => page.group === 'company')
	},
	{
		id: 'legal',
		label: 'Legal',
		links: marketingPages.filter(page => page.group === 'legal')
	},
	{
		id: 'resources',
		label: 'Resources',
		links: marketingPages.filter(page => page.group === 'resources')
	}
];
