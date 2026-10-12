/* eslint-env node */

const DEFAULT_REQUEST_TIMEOUT_MS = 8_000;
const DEFAULT_BUDGET_MS = 60_000;
const DEFAULT_CONCURRENCY = 4;

const normalizeSlug = value => (typeof value === 'string' ? value.trim() : '');
const positiveInteger = (value, fallback, maximum) =>
	Number.isSafeInteger(value) && value > 0 ? Math.min(value, maximum) : fallback;

const mapConcurrent = async (items, concurrency, shouldStop, task) => {
	const results = new Array(items.length);
	let cursor = 0;
	const worker = async () => {
		while (cursor < items.length && !shouldStop()) {
			const index = cursor++;
			results[index] = await task(items[index]);
		}
	};
	await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
	return results;
};

const createApiReader = ({ apiBaseUrl, fetchImpl, logger, requestTimeoutMs, deadline, stats }) => {
	const shouldStop = () => Date.now() >= deadline;
	const read = async path => {
		if (shouldStop()) return null;
		const controller = new AbortController();
		const timeoutMs = Math.min(requestTimeoutMs, deadline - Date.now());
		let timer;
		stats.requests += 1;
		stats.active += 1;
		try {
			// The deadline covers both receiving headers and consuming the JSON body.
			// Racing also bounds a transport that does not respond to cancellation.
			const timeout = new Promise((resolve, reject) => {
				timer = setTimeout(() => {
					controller.abort();
					const error = new Error('Sitemap request deadline exceeded');
					error.name = 'SitemapTimeoutError';
					reject(error);
				}, timeoutMs);
			});
			const request = async () => {
				const response = await fetchImpl(`${apiBaseUrl}${path}`, {
					headers: { Accept: 'application/json' },
					signal: controller.signal
				});
				if (!response.ok) {
					const error = new Error('Sitemap API request failed');
					error.status = response.status;
					throw error;
				}
				const body = await response.json();
				if (body?.success !== true || body.data == null) throw new Error('Invalid sitemap API response');
				return body.data;
			};
			return await Promise.race([request(), timeout]);
		} catch (error) {
			stats.failed += 1;
			const reason = controller.signal.aborted ? 'request deadline exceeded' : 'network or invalid response';
			// Release unread error bodies, which could otherwise keep the Node process alive.
			controller.abort();
			logger.warn(
				`[next-sitemap] ${path}: ${error?.status ? `HTTP ${error.status}` : reason}. Keeping discovered URLs.`
			);
			return null;
		} finally {
			clearTimeout(timer);
			stats.active -= 1;
		}
	};
	return { read, shouldStop };
};

const collectSubjects = (departments, departmentResults, logger, stats) => {
	const notesPaths = new Set(['/notes']);
	const subjects = new Map();
	departments.forEach((department, index) => {
		const departmentSlug = normalizeSlug(department.slug);
		const departmentPath = `/notes/${encodeURIComponent(departmentSlug)}`;
		notesPaths.add(departmentPath);
		const result = departmentResults[index];
		if (result == null) return;
		if (!Array.isArray(result.subjects)) {
			stats.failed += 1;
			logger.warn('[next-sitemap] Invalid department subject list. Keeping discovered URLs.');
			return;
		}
		for (const subject of result.subjects) {
			const subjectSlug = normalizeSlug(subject?.slug);
			if (!subjectSlug) continue;
			const subjectPath = `${departmentPath}/${encodeURIComponent(subjectSlug)}`;
			notesPaths.add(subjectPath);
			const key = normalizeSlug(subject.id) || `${departmentSlug}/${subjectSlug}`;
			const current = subjects.get(key) ?? { departmentSlug, subjectSlug, paths: new Set(), hasNotes: false };
			current.paths.add(subjectPath);
			current.hasNotes ||= subject.noteCount !== 0;
			subjects.set(key, current);
		}
	});
	return { notesPaths, subjects: [...subjects.values()] };
};

const getNotesPageCount = (data, page, hasNewSlugs, logger, stats) => {
	const reportedPages = data.pagination?.totalPages;
	if (!Number.isSafeInteger(reportedPages) || reportedPages < page) {
		stats.failed += 1;
		logger.warn('[next-sitemap] Invalid notes pagination. Keeping discovered URLs.');
		return null;
	}
	if (data.notes.length === 0) return null;
	if (page > 1 && !hasNewSlugs) {
		stats.failed += 1;
		logger.warn('[next-sitemap] Notes pagination returned no new slugs. Keeping discovered URLs.');
		return null;
	}
	return reportedPages;
};

const collectSubjectNotes = async (subject, api, logger, stats) => {
	const noteSlugs = new Set();
	const path = `/notes/departments/${encodeURIComponent(subject.departmentSlug)}/subjects/${encodeURIComponent(subject.subjectSlug)}`;
	let page = 1;
	let totalPages = 1;
	while (page <= totalPages && !api.shouldStop()) {
		const data = await api.read(`${path}?page=${page}&pageSize=50`);
		if (data === null) break;
		if (!Array.isArray(data.notes)) {
			stats.failed += 1;
			logger.warn('[next-sitemap] Invalid subject notes list. Keeping discovered URLs.');
			break;
		}
		const previousSlugCount = noteSlugs.size;
		for (const note of data.notes) {
			const slug = normalizeSlug(note?.slug);
			if (slug) noteSlugs.add(slug);
		}
		const reportedPages = getNotesPageCount(data, page, noteSlugs.size > previousSlugCount, logger, stats);
		if (reportedPages === null) break;
		totalPages = reportedPages;
		page += 1;
	}
	return [...noteSlugs].flatMap(slug =>
		[...subject.paths].map(pathPrefix => `${pathPrefix}/${encodeURIComponent(slug)}`)
	);
};

/** Collect public sitemap metadata only; never request authenticated note resource URLs. */
const collectDynamicSitemapPaths = async ({
	apiBaseUrl,
	fetchImpl = fetch,
	logger = console,
	requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
	budgetMs = DEFAULT_BUDGET_MS,
	concurrency = DEFAULT_CONCURRENCY
}) => {
	const started = Date.now();
	const timeout = positiveInteger(requestTimeoutMs, DEFAULT_REQUEST_TIMEOUT_MS, 30_000);
	const budget = positiveInteger(budgetMs, DEFAULT_BUDGET_MS, 120_000);
	const workerCount = positiveInteger(concurrency, DEFAULT_CONCURRENCY, 8);
	const stats = { requests: 0, active: 0, failed: 0, budgetExceeded: false };
	const baseUrl = new URL(apiBaseUrl);
	logger.info(
		`[next-sitemap] Discovering dynamic URLs via ${baseUrl.origin}${baseUrl.pathname} (${workerCount} concurrent, ${timeout}ms request deadline, ${budget}ms budget).`
	);
	const api = createApiReader({
		apiBaseUrl: apiBaseUrl.replace(/\/+$/, ''),
		fetchImpl,
		logger,
		requestTimeoutMs: timeout,
		deadline: started + budget,
		stats
	});
	const heartbeat = setInterval(() => {
		logger.info(
			`[next-sitemap] Discovery progress: ${stats.requests} requests, ${stats.active} active, ${stats.failed} failed, ${Date.now() - started}ms elapsed.`
		);
	}, 10_000);
	try {
		const [courses = null, landing = null] = await mapConcurrent(
			['/courses', '/notes'],
			workerCount,
			api.shouldStop,
			api.read
		);
		const coursePaths = Array.isArray(courses)
			? [...new Set(courses.map(course => normalizeSlug(course?.id)).filter(Boolean))].map(
					id => `/course/${encodeURIComponent(id)}`
				)
			: [];
		if (courses !== null && !Array.isArray(courses)) {
			stats.failed += 1;
			logger.warn('[next-sitemap] Invalid published course list. Keeping static URLs.');
		}
		if (landing !== null && !Array.isArray(landing?.departments)) {
			stats.failed += 1;
			logger.warn('[next-sitemap] Invalid Notes landing response. Keeping static URLs.');
		}
		const departmentMap = new Map();
		for (const department of Array.isArray(landing?.departments) ? landing.departments : []) {
			const slug = normalizeSlug(department?.slug);
			if (slug) departmentMap.set(slug, department);
		}
		const departments = [...departmentMap.values()];
		logger.info(`[next-sitemap] Found ${coursePaths.length} courses and ${departments.length} Notes departments.`);
		const departmentResults = await mapConcurrent(departments, workerCount, api.shouldStop, department =>
			api.read(`/notes/departments/${encodeURIComponent(normalizeSlug(department.slug))}`)
		);
		const { notesPaths, subjects } = collectSubjects(departments, departmentResults, logger, stats);
		const populatedSubjects = subjects.filter(subject => subject.hasNotes);
		logger.info(
			`[next-sitemap] Found ${subjects.length} unique subjects; fetching ${populatedSubjects.length}, skipping ${subjects.length - populatedSubjects.length} empty subjects.`
		);
		const subjectResults = await mapConcurrent(populatedSubjects, workerCount, api.shouldStop, subject =>
			collectSubjectNotes(subject, api, logger, stats)
		);
		for (const paths of subjectResults) {
			for (const path of paths ?? []) notesPaths.add(path);
		}
		stats.budgetExceeded = api.shouldStop();
		if (stats.failed || stats.budgetExceeded) {
			logger.warn(
				`[next-sitemap] Dynamic discovery is incomplete (${stats.failed} failed requests/responses, budget exceeded: ${stats.budgetExceeded}). Undiscovered URLs are omitted; static and discovered URLs are retained.`
			);
		}
		logger.info(
			`[next-sitemap] Discovery complete in ${Date.now() - started}ms: ${coursePaths.length} course URLs, ${notesPaths.size} Notes URLs, ${stats.requests} requests.`
		);
		return { coursePaths, notesPaths: [...notesPaths], stats };
	} finally {
		clearInterval(heartbeat);
	}
};

module.exports = { collectDynamicSitemapPaths };
