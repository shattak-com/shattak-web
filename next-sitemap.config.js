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

const getNotesSitemapPaths = async () => {
	try {
		const landingResponse = await fetch(`${getApiBaseUrl()}/notes`, {
			headers: { Accept: 'application/json' }
		});
		if (!landingResponse.ok) {
			console.warn(`[next-sitemap] Notes sitemap API request failed with status ${landingResponse.status}.`);
			return [];
		}
		const landingBody = await landingResponse.json();
		const departments =
			landingBody?.success && Array.isArray(landingBody.data?.departments) ? landingBody.data.departments : [];
		const paths = ['/notes'];

		for (const department of departments) {
			const departmentSlug = String(department?.slug ?? '').trim();
			if (!departmentSlug) continue;
			const departmentPath = `/notes/${encodeURIComponent(departmentSlug)}`;
			paths.push(departmentPath);

			const departmentResponse = await fetch(
				`${getApiBaseUrl()}/notes/departments/${encodeURIComponent(departmentSlug)}`,
				{ headers: { Accept: 'application/json' } }
			);
			if (!departmentResponse.ok) continue;
			const departmentBody = await departmentResponse.json();
			const subjects =
				departmentBody?.success && Array.isArray(departmentBody.data?.subjects) ? departmentBody.data.subjects : [];

			for (const subject of subjects) {
				const subjectSlug = String(subject?.slug ?? '').trim();
				if (!subjectSlug) continue;
				const subjectPath = `${departmentPath}/${encodeURIComponent(subjectSlug)}`;
				paths.push(subjectPath);

				let page = 1;
				let totalPages = 1;
				do {
					const subjectResponse = await fetch(
						`${getApiBaseUrl()}/notes/departments/${encodeURIComponent(departmentSlug)}/subjects/${encodeURIComponent(subjectSlug)}?page=${page}&pageSize=50`,
						{ headers: { Accept: 'application/json' } }
					);
					if (!subjectResponse.ok) break;
					const subjectBody = await subjectResponse.json();
					const notes = subjectBody?.success && Array.isArray(subjectBody.data?.notes) ? subjectBody.data.notes : [];
					for (const note of notes) {
						const noteSlug = String(note?.slug ?? '').trim();
						if (noteSlug) paths.push(`${subjectPath}/${encodeURIComponent(noteSlug)}`);
					}
					totalPages = Number(subjectBody?.data?.pagination?.totalPages ?? 1);
					page += 1;
				} while (page <= totalPages);
			}
		}

		return paths;
	} catch (error) {
		console.warn('[next-sitemap] Failed to fetch dynamic Notes URLs from Shattak API.', error);
		return ['/notes'];
	}
};

/** @type {import('next-sitemap').IConfig} */
const NextSitemapConfig = {
	siteUrl: SITE_URL,
	generateRobotsTxt: true,
	exclude: ['/booking', '/booking/*', '/manifest.webmanifest', '/roadmap', '/[contentSlug]'],
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

		const notesPaths = await getNotesSitemapPaths();
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
