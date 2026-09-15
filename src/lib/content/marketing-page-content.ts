import 'server-only';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { marketingPages, type MarketingPageConfig } from '~/lib/constants/marketing-pages';

const MARKDOWN_CONTENT_PATH = join(process.cwd(), 'content', 'pages', 'markdown-content.md');

const parseMarkdownPages = () => {
	const source = readFileSync(MARKDOWN_CONTENT_PATH, 'utf8');
	const sections = source
		.split(/(?=^# )/m)
		.map(section => section.trim())
		.filter(Boolean);
	const pagesByHeading = sections.reduce((pageMap, section) => {
		const headingMatch = section.match(/^# (.+)$/m);
		if (headingMatch?.[1]) {
			pageMap.set(headingMatch[1].trim(), section);
		}

		return pageMap;
	}, new Map<string, string>());

	const missingHeadings = marketingPages.filter(page => !pagesByHeading.has(page.sourceHeading));
	if (missingHeadings.length) {
		throw new Error(`Missing marketing page content: ${missingHeadings.map(page => page.sourceHeading).join(', ')}`);
	}

	return pagesByHeading;
};

let cachedPagesByHeading: Map<string, string> | undefined;

const getPagesByHeading = () => {
	cachedPagesByHeading ??= parseMarkdownPages();
	return cachedPagesByHeading;
};

export const getMarketingPageMarkdown = (page: MarketingPageConfig) => {
	const markdown = getPagesByHeading().get(page.sourceHeading);
	if (!markdown) {
		throw new Error(`Marketing page content not found for ${page.sourceHeading}.`);
	}

	return markdown;
};

export const getMarketingPageDescription = (page: MarketingPageConfig) => {
	const markdown = getMarketingPageMarkdown(page);
	const firstBodyLine = markdown
		.split(/\r?\n/)
		.map(line => line.trim())
		.find(line => line && !line.startsWith('#') && line !== '---' && !line.startsWith('|'));
	const plainText = (firstBodyLine ?? page.sourceHeading)
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/[*_`>#]/g, '')
		.trim();

	return plainText.length > 160 ? `${plainText.slice(0, 157).trimEnd()}...` : plainText;
};
