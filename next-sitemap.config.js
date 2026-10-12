/* eslint-env node */

const { collectDynamicSitemapPaths } = require('./scripts/sitemap-dynamic-paths');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const trimTrailingSlash = value => value.replace(/\/+$/, '');

const getApiBaseUrl = () => {
	const configuredBaseUrl = process.env.SHATTAK_API_BASE_URL ?? process.env.NEXT_PUBLIC_SHATTAK_API_BASE_URL;
	const fallbackBaseUrl =
		process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api/v1' : new URL('/api/v1', SITE_URL).toString();
	const baseUrl = configuredBaseUrl || fallbackBaseUrl;

	return trimTrailingSlash(baseUrl.startsWith('http') ? baseUrl : new URL(baseUrl, SITE_URL).toString());
};

/** @type {import('next-sitemap').IConfig} */
const NextSitemapConfig = {
	siteUrl: SITE_URL,
	generateRobotsTxt: true,
	exclude: ['/booking', '/booking/*', '/manifest.webmanifest', '/[contentSlug]'],
	transform: async (config, path) => ({
		loc: path,
		changefreq: path === '/' ? 'daily' : 'weekly',
		priority: path === '/' ? 1 : 0.7,
		lastmod: new Date().toISOString(),
		alternateRefs: config.alternateRefs ?? []
	}),
	additionalPaths: async config => {
		const dynamicPaths = [];
		const seenLocs = new Set();
		const addUniqueEntry = entry => {
			if (!entry || !entry.loc || seenLocs.has(entry.loc)) {
				return;
			}
			seenLocs.add(entry.loc);
			dynamicPaths.push(entry);
		};

		const staticPaths = [
			'/',
			'/about',
			'/how-it-works',
			'/manifesto',
			'/become-a-mentor',
			'/careers',
			'/contact',
			'/terms',
			'/privacy-policy',
			'/cookie-policy',
			'/refund-policy',
			'/faq',
			'/blog',
			'/career-guides',
			'/skill-guides',
			'/interview-preparation',
			'/community'
		];
		for (const path of staticPaths) {
			const entry = await config.transform(config, path);
			addUniqueEntry(entry);
		}

		const { coursePaths, notesPaths } = await collectDynamicSitemapPaths({ apiBaseUrl: getApiBaseUrl() });
		for (const path of coursePaths) {
			const courseEntry = await config.transform(config, path);
			if (courseEntry) {
				addUniqueEntry({ ...courseEntry, changefreq: 'weekly', priority: 0.9 });
			}
		}

		for (const path of notesPaths) {
			const notesEntry = await config.transform(config, path);
			if (notesEntry) {
				addUniqueEntry({
					...notesEntry,
					changefreq: 'weekly',
					priority: path === '/notes' ? 0.9 : 0.8
				});
			}
		}

		return dynamicPaths;
	}
};

module.exports = NextSitemapConfig;
