/* eslint-env node */

const assert = require('node:assert/strict');
const http = require('node:http');
const { test } = require('node:test');

const { collectDynamicSitemapPaths } = require('./sitemap-dynamic-paths');

const reply = data => ({ ok: true, json: async () => ({ success: true, data }) });
const makeFixture = (routes, options = {}) => {
	const calls = [];
	const logs = [];
	let active = 0;
	let peak = 0;
	const fetchImpl = async (url, init) => {
		const parsed = new URL(url);
		const path = `${parsed.pathname.replace('/api/v1', '')}${parsed.search}`;
		calls.push({ path, init });
		active += 1;
		peak = Math.max(peak, active);
		try {
			if (options.delay) await new Promise(resolve => setTimeout(resolve, options.delay));
			assert.ok(Object.hasOwn(routes, path), `Unexpected API request: ${path}`);
			const data = routes[path];
			return typeof data === 'function' ? await data(init) : reply(data);
		} finally {
			active -= 1;
		}
	};
	const run = settings =>
		collectDynamicSitemapPaths({
			apiBaseUrl: 'https://api.example/api/v1',
			fetchImpl,
			logger: { info: message => logs.push(message), warn: message => logs.push(message) },
			...settings
		});
	return { calls, logs, run, peak: () => peak };
};

const oneSubjectRoutes = (pages = 1) => ({
	'/courses': [{ id: 'course-1' }],
	'/notes': { departments: [{ slug: 'department' }] },
	'/notes/departments/department': { subjects: [{ id: 'subject', slug: 'subject', noteCount: 2 }] },
	'/notes/departments/department/subjects/subject?page=1&pageSize=50': {
		notes: [{ slug: 'note-1' }],
		pagination: { totalPages: pages }
	}
});

test('includes paginated notes under every department alias and deduplicates shared subjects', async () => {
	const common = { id: 'common-id', slug: 'shared subject', noteCount: 51 };
	const fixture = makeFixture(
		{
			'/courses': [{ id: 'course-1' }, { id: 'course-1' }, { id: 'course /2' }, { id: null }],
			'/notes': { departments: [{ slug: 'department-a' }, { slug: 'department-b' }, { slug: 'department-a' }, null] },
			'/notes/departments/department-a': { subjects: [common, { id: 'empty', slug: 'empty', noteCount: 0 }] },
			'/notes/departments/department-b': { subjects: [common, { id: 'other', slug: 'other', noteCount: 1 }] },
			'/notes/departments/department-a/subjects/shared%20subject?page=1&pageSize=50': {
				notes: [{ slug: 'note 1' }, { slug: 'note 1' }, null],
				pagination: { totalPages: 2 }
			},
			'/notes/departments/department-a/subjects/shared%20subject?page=2&pageSize=50': {
				notes: [{ slug: 'note-2' }],
				pagination: { totalPages: 2 }
			},
			'/notes/departments/department-b/subjects/other?page=1&pageSize=50': {
				notes: [{ slug: 'other-note' }],
				pagination: { totalPages: 1 }
			}
		},
		{ delay: 2 }
	);
	const result = await fixture.run();
	assert.deepEqual(result.coursePaths, ['/course/course-1', '/course/course%20%2F2']);
	for (const department of ['department-a', 'department-b']) {
		assert.ok(result.notesPaths.includes(`/notes/${department}/shared%20subject/note%201`));
		assert.ok(result.notesPaths.includes(`/notes/${department}/shared%20subject/note-2`));
	}
	assert.ok(result.notesPaths.includes('/notes/department-a/empty'));
	assert.ok(result.notesPaths.includes('/notes/department-b/other/other-note'));
	assert.equal(fixture.calls.length, 7);
	assert.equal(new Set(result.notesPaths).size, result.notesPaths.length);
	assert.equal(result.stats.failed, 0);
	assert.ok(fixture.calls.every(call => call.init.signal && call.init.headers.Accept === 'application/json'));
	assert.ok(!fixture.calls.some(call => call.path.includes('/access')));
});

test('four departments with 52 empty subjects each need only six requests instead of 214', async () => {
	const departments = Array.from({ length: 4 }, (_, index) => ({ slug: `department-${index}` }));
	const routes = { '/courses': [], '/notes': { departments } };
	for (const department of departments) {
		routes[`/notes/departments/${department.slug}`] = {
			subjects: Array.from({ length: 52 }, (_, index) => ({ slug: `subject-${index}`, noteCount: 0 }))
		};
	}
	const fixture = makeFixture(routes);
	const result = await fixture.run();
	assert.equal(fixture.calls.length, 6);
	assert.equal(result.notesPaths.length, 213);
	assert.ok(fixture.logs.some(message => message.includes('skipping 208 empty subjects')));
});

test('bounds concurrency across a populated catalog', async () => {
	const subjects = Array.from({ length: 12 }, (_, index) => ({
		id: `subject-${index}`,
		slug: `subject-${index}`,
		noteCount: 1
	}));
	const routes = {
		'/courses': [],
		'/notes': { departments: [{ slug: 'department' }] },
		'/notes/departments/department': { subjects }
	};
	for (const subject of subjects) {
		routes[`/notes/departments/department/subjects/${subject.slug}?page=1&pageSize=50`] = {
			notes: [{ slug: 'note' }],
			pagination: { totalPages: 1 }
		};
	}
	const fixture = makeFixture(routes, { delay: 5 });
	await fixture.run();
	assert.equal(fixture.peak(), 4);
	const singleWorker = makeFixture(routes, { delay: 2 });
	await singleWorker.run({ concurrency: 1 });
	assert.equal(singleWorker.peak(), 1);
});

test('failed departments do not discard courses or successful department and note URLs', async () => {
	const routes = oneSubjectRoutes();
	routes['/notes'].departments.push({ slug: 'failed-department' });
	routes['/notes/departments/failed-department'] = () => ({ ok: false, status: 503 });
	const fixture = makeFixture(routes);
	const result = await fixture.run();
	assert.ok(result.coursePaths.includes('/course/course-1'));
	assert.ok(result.notesPaths.includes('/notes/failed-department'));
	assert.ok(result.notesPaths.includes('/notes/department/subject/note-1'));
	assert.equal(result.stats.failed, 1);
	assert.ok(fixture.logs.some(message => message.includes('HTTP 503')));
	assert.ok(fixture.logs.some(message => message.includes('discovery is incomplete')));
});

test('a stalled transport that ignores cancellation still settles within the request deadline', async () => {
	const fixture = makeFixture({ '/courses': () => new Promise(() => {}), '/notes': () => new Promise(() => {}) });
	const started = Date.now();
	const result = await fixture.run({ requestTimeoutMs: 25, budgetMs: 1_000 });
	assert.ok(Date.now() - started < 1_000);
	assert.equal(result.stats.failed, 2);
	assert.deepEqual(result.notesPaths, ['/notes']);
	assert.ok(fixture.calls.every(call => call.init.signal.aborted));
});

test('the deadline covers stalled JSON bodies as well as response headers', async () => {
	const stalledBody = () => ({ ok: true, json: () => new Promise(() => {}) });
	const fixture = makeFixture({ '/courses': stalledBody, '/notes': stalledBody });
	const result = await fixture.run({ requestTimeoutMs: 25, budgetMs: 1_000 });
	assert.equal(result.stats.failed, 2);
	assert.ok(fixture.calls.every(call => call.init.signal.aborted));
});

test('a failed later page preserves earlier note URLs', async () => {
	const routes = oneSubjectRoutes(2);
	routes['/notes/departments/department/subjects/subject?page=2&pageSize=50'] = () => new Promise(() => {});
	const result = await makeFixture(routes).run({ requestTimeoutMs: 25, budgetMs: 1_000 });
	assert.ok(result.notesPaths.includes('/notes/department/subject/note-1'));
	assert.equal(result.stats.failed, 1);
});

test('the overall budget stops queuing requests and retains directory and previously collected note URLs', async () => {
	const subjects = Array.from({ length: 20 }, (_, index) => ({
		id: `subject-${index}`,
		slug: `subject-${index}`,
		noteCount: 1
	}));
	const routes = {
		'/courses': [],
		'/notes': { departments: [{ slug: 'department' }] },
		'/notes/departments/department': { subjects }
	};
	for (const subject of subjects) {
		routes[`/notes/departments/department/subjects/${subject.slug}?page=1&pageSize=50`] = () => new Promise(() => {});
	}
	routes['/notes/departments/department/subjects/subject-0?page=1&pageSize=50'] = {
		notes: [{ slug: 'first-note' }],
		pagination: { totalPages: 1 }
	};
	const fixture = makeFixture(routes);
	const started = Date.now();
	const result = await fixture.run({ budgetMs: 50, requestTimeoutMs: 1_000 });
	assert.ok(Date.now() - started < 1_000);
	assert.equal(result.stats.budgetExceeded, true);
	assert.ok(result.notesPaths.includes('/notes/department/subject-0/first-note'));
	assert.ok(result.notesPaths.includes('/notes/department/subject-19'));
	assert.ok(!fixture.calls.some(call => call.path.includes('/subject-19?')));
	assert.ok(fixture.calls.filter(call => call.path.includes('/subjects/')).length <= 5);
});

test('invalid pagination and repeated pages cannot produce an endless walk', async () => {
	for (const totalPages of [Infinity, -1, 1.5, '100', undefined]) {
		const routes = oneSubjectRoutes();
		routes['/notes/departments/department/subjects/subject?page=1&pageSize=50'].pagination.totalPages = totalPages;
		const invalid = makeFixture(routes);
		const result = await invalid.run();
		assert.ok(result.notesPaths.includes('/notes/department/subject/note-1'));
		assert.equal(invalid.calls.length, 4);
		assert.equal(result.stats.failed, 1);
	}
	const routes = oneSubjectRoutes(1_000_000);
	routes['/notes/departments/department/subjects/subject?page=2&pageSize=50'] =
		routes['/notes/departments/department/subjects/subject?page=1&pageSize=50'];
	const repeated = makeFixture(routes);
	assert.equal((await repeated.run()).stats.failed, 1);
	assert.equal(repeated.calls.length, 5);
	const emptyRoutes = oneSubjectRoutes(1_000_000);
	emptyRoutes['/notes/departments/department/subjects/subject?page=1&pageSize=50'].notes = [];
	const empty = makeFixture(emptyRoutes);
	await empty.run();
	assert.equal(empty.calls.length, 4);
});

test('malformed payloads and raw error details do not leak into logs or fail discovery', async () => {
	const fixture = makeFixture({
		'/courses': () => {
			throw new Error('secret-token-123');
		},
		'/notes': { departments: 'not an array' }
	});
	const result = await fixture.run();
	assert.deepEqual(result.coursePaths, []);
	assert.deepEqual(result.notesPaths, ['/notes']);
	assert.equal(result.stats.failed, 2);
	assert.ok(!fixture.logs.join(' ').includes('secret-token-123'));
	const invalidSubject = oneSubjectRoutes();
	invalidSubject['/notes/departments/department/subjects/subject?page=1&pageSize=50'] = false;
	assert.equal((await makeFixture(invalidSubject).run()).stats.failed, 1);
});

test('logs include safe API context without URL credentials or query strings', async () => {
	const fixture = makeFixture({
		'/courses?secret=query/courses': [],
		'/courses?secret=query/notes': { departments: [] }
	});
	await fixture.run({ apiBaseUrl: 'https://user:password@api.example/api/v1/courses?secret=query' });
	assert.ok(!fixture.logs.join(' ').includes('password'));
	assert.ok(!fixture.logs.join(' ').includes('secret=query'));
});

test('real fetch cancels responses that stall before headers or during the body', async context => {
	const server = http.createServer((request, response) => {
		if (request.url.endsWith('/notes')) {
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.write('{"success":true,"data":');
		}
		// Courses never sends headers; Notes sends a body that never ends.
	});
	await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
	context.after(async () => {
		server.closeAllConnections();
		await new Promise(resolve => server.close(resolve));
	});
	const started = Date.now();
	const result = await collectDynamicSitemapPaths({
		apiBaseUrl: `http://127.0.0.1:${server.address().port}/api/v1`,
		requestTimeoutMs: 100,
		budgetMs: 1_000,
		logger: { info: () => {}, warn: () => {} }
	});
	assert.ok(Date.now() - started < 1_000);
	assert.equal(result.stats.failed, 2);
	assert.deepEqual(result.notesPaths, ['/notes']);
});

test('real fetch cancels unread error response bodies so they cannot hold the build open', async context => {
	let closedResponses = 0;
	let markClosed;
	const bothClosed = new Promise(resolve => {
		markClosed = resolve;
	});
	const server = http.createServer((request, response) => {
		response.on('close', () => {
			closedResponses += 1;
			if (closedResponses === 2) markClosed();
		});
		response.writeHead(503, { 'Content-Type': 'text/plain' });
		response.write('Unavailable');
		// Deliberately never end the error response.
	});
	await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
	context.after(async () => {
		server.closeAllConnections();
		await new Promise(resolve => server.close(resolve));
	});
	const result = await collectDynamicSitemapPaths({
		apiBaseUrl: `http://127.0.0.1:${server.address().port}/api/v1`,
		logger: { info: () => {}, warn: () => {} }
	});
	assert.equal(result.stats.failed, 2);
	await new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error('Error response connections were not cancelled')), 1_000);
		bothClosed.then(() => {
			clearTimeout(timer);
			resolve();
		});
	});
	assert.equal(closedResponses, 2);
});
