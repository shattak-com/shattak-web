const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const trimTrailingSlash = value => value.replace(/\/+$/, '');

const getApiBaseUrl = () => {
	const configuredBaseUrl = process.env.SHATTAK_API_BASE_URL ?? process.env.NEXT_PUBLIC_SHATTAK_API_BASE_URL;
	const fallbackBaseUrl =
		process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api/v1' : new URL('/api/v1', SITE_URL).toString();
	const baseUrl = configuredBaseUrl || fallbackBaseUrl;

	return trimTrailingSlash(baseUrl.startsWith('http') ? baseUrl : new URL(baseUrl, SITE_URL).toString());
};

const getPublishedCourseSlugs = async () => {
	try {
		const response = await fetch(`${getApiBaseUrl()}/courses`, {
			headers: {
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			console.warn(`[next-sitemap] Course sitemap API request failed with status ${response.status}.`);
			return [];
		}

		const body = await response.json();
		if (!body?.success || !Array.isArray(body.data)) {
			console.warn('[next-sitemap] Course sitemap API response was not in the expected format.');
			return [];
		}

		return body.data.map(course => course?.id).filter(Boolean);
	} catch (error) {
		console.warn('[next-sitemap] Failed to fetch dynamic course URLs from Shattak API.', error);
		return [];
	}
};

/** @type {import('next-sitemap').IConfig} */
const NextSitemapConfig = {
	siteUrl: SITE_URL,
	generateRobotsTxt: true,
	exclude: ['/booking', '/booking/*', '/manifest.webmanifest'],
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

		const staticPaths = ['/', '/about'];
		for (const path of staticPaths) {
			const entry = await config.transform(config, path);
			addUniqueEntry(entry);
		}

		const courseSlugs = await getPublishedCourseSlugs();
		for (const slug of courseSlugs) {
			const normalizedSlug = String(slug).trim();
			if (!normalizedSlug) {
				continue;
			}

			const courseEntry = await config.transform(config, `/course/${encodeURIComponent(normalizedSlug)}`);
			if (courseEntry) {
				addUniqueEntry({
					...courseEntry,
					changefreq: 'weekly',
					priority: 0.9
				});
			}
		}

		return dynamicPaths;
	}
};

module.exports = NextSitemapConfig;
