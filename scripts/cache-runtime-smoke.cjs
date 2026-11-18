/* eslint-env node */

// Production HTTP integration check using an isolated public API fixture.
// No real database, user session, deployment, or Netlify purge is involved.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const listen = (server, port = 0) =>
	new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(port, '127.0.0.1', () => resolve(server.address().port));
	});

const run = async () => {
	const fixtureModule = { exports: {} };
	vm.runInNewContext(
		ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/lib/containers/course/mock.ts'), 'utf8'), {
			compilerOptions: { module: ts.ModuleKind.CommonJS }
		}).outputText,
		{ exports: fixtureModule.exports }
	);
	const id = `cache-runtime-smoke-${Date.now()}`;
	const course = {
		...fixtureModule.exports.courseDetailsMock,
		id,
		title: 'Cache smoke version one',
		thumbnailImage: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
	};
	let reads = 0;
	let departmentReads = 0;
	let noteReads = 0;
	let subjectReads = 0;
	let courseListReads = 0;
	let browserFixtureReady = false;
	let noteAvailable = true;
	const timings = [];
	const phase2 = process.env.NOTES_PHASE2_BASELINE !== '1';
	let notesVersion = 'one';
	let forwardedCookie = false;
	const api = http.createServer((request, response) => {
		response.setHeader('Content-Type', 'application/json');
		if (browserFixtureReady && request.headers.origin === base) {
			response.setHeader('Access-Control-Allow-Origin', base);
			response.setHeader('Access-Control-Allow-Credentials', 'true');
			response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
			response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
			if (request.method === 'OPTIONS') return response.writeHead(204).end();
		}
		forwardedCookie ||= Boolean(request.headers.cookie);
		const department = { id, slug: id, name: `Department version ${notesVersion}`, icon: '', subjectCount: 1 };
		if (request.url === '/api/v1/notes') {
			response.end(
				JSON.stringify({
					success: true,
					data: { departments: browserFixtureReady ? [department] : [], popularSubjects: [] }
				})
			);
		} else if (request.url?.startsWith('/api/v1/notes/sitemap')) {
			response.end(JSON.stringify({ success: true, data: { departments: [], notes: [], nextCursor: null } }));
		} else if (request.url === `/api/v1/courses/${id}`) {
			reads += 1;
			forwardedCookie ||= Boolean(request.headers.cookie);
			response.end(JSON.stringify({ success: true, message: 'Fixture course', data: course }));
		} else if (request.url === '/api/v1/courses') {
			courseListReads++;
			setTimeout(() => response.end(JSON.stringify({ success: true, message: 'Fixture catalog', data: [] })), 300);
		} else if (request.url === `/api/v1/notes/departments/${id}`) {
			departmentReads += 1;
			response.end(
				JSON.stringify({
					success: true,
					message: 'Fixture department',
					data: {
						department,
						subjects: browserFixtureReady
							? [{ id: 'math', slug: 'math', name: 'Math', noteCount: 41, departments: [department] }]
							: []
					}
				})
			);
		} else if (request.url?.startsWith(`/api/v1/notes/departments/${id}/subjects/math?`)) {
			subjectReads += 1;
			const query = new URL(request.url, 'http://fixture').searchParams;
			const page = Number(query.get('page') || 1);
			const category = query.get('category') || 'NOTES';
			response.end(
				JSON.stringify({
					success: true,
					data: {
						department,
						subject: { id: 'math', slug: 'math', name: 'Math', noteCount: 41, departments: [department] },
						notes: [
							{
								id: 'item',
								slug: 'sample',
								title: `Result ${category} page ${page} version ${notesVersion}`,
								category,
								resourceType: 'PDF',
								resourceDate: '2026-01-01T00:00:00.000Z',
								viewCount: 0,
								downloadCount: 0
							}
						],
						pagination: { page, pageSize: 20, total: 41, totalPages: 3 },
						departmentSubjects: []
					}
				})
			);
		} else if (request.url?.split('?')[0] === `/api/v1/notes/departments/${id}/subjects/math/notes/sample`) {
			noteReads += 1;
			if (!noteAvailable)
				return response.writeHead(404).end(JSON.stringify({ success: false, error: { code: 'NOTE_NOT_FOUND' } }));
			const compact = new URL(request.url, 'http://fixture').searchParams.get('view') === 'compact';
			const subjectNotes = Array.from({ length: compact ? 20 : 250 }, (_, i) => ({
				id: `related-${i}`,
				slug: `related-${i}`,
				title: `Related study handout ${i}`,
				category: 'NOTES',
				resourceType: 'PDF',
				resourceDate: '2026-01-01T00:00:00.000Z',
				viewCount: 0,
				downloadCount: 0
			}));
			response.end(
				JSON.stringify({
					success: true,
					message: 'Fixture note',
					data: {
						department,
						subject: { id: 'math', slug: 'math', name: 'Math', noteCount: 250, departments: [department] },
						note: {
							id: 'sample',
							slug: 'sample',
							title: `Note version ${notesVersion}`,
							category: 'NOTES',
							resourceType: 'PDF',
							resourceDate: '2026-01-01T00:00:00.000Z',
							viewCount: 0,
							downloadCount: 0
						},
						subjectNotes
					}
				})
			);
		} else if (browserFixtureReady && request.method === 'POST' && request.url === '/api/v1/notes/sample/access') {
			response.setHeader('Cache-Control', 'private, no-store');
			if (!request.headers.cookie?.includes('notes-fixture-user=authorized'))
				return response.writeHead(401).end(JSON.stringify({ success: false }));
			response.end(
				JSON.stringify({
					success: true,
					data: { resourceUrl: `http://127.0.0.1:${api.address().port}/fixture-file`, resourceType: 'PDF' }
				})
			);
		} else if (browserFixtureReady && request.url === '/fixture-file') {
			response.writeHead(200, { 'Content-Type': 'text/plain' }).end('Synthetic protected preview');
		} else {
			response.writeHead(404).end(JSON.stringify({ success: false, message: 'Not found' }));
		}
	});
	const apiPort = await listen(api, Number(process.env.NOTES_FIXTURE_API_PORT || 0));
	const reservation = net.createServer();
	const webPort = await listen(reservation);
	await new Promise(resolve => reservation.close(resolve));
	const base = `http://127.0.0.1:${webPort}`;
	const secret = 'synthetic-local-only-revalidation-test-secret';
	const root = process.env.NOTES_FIXTURE_WEB_ROOT || path.resolve(__dirname, '..');
	const fixtureEnv = {
		...process.env,
		SHATTAK_API_BASE_URL: `http://127.0.0.1:${apiPort}/api/v1`,
		NEXT_PUBLIC_SHATTAK_API_BASE_URL: `http://127.0.0.1:${apiPort}/api/v1`,
		PUBLIC_CACHE_REVALIDATION_SECRET: secret,
		NEXT_TELEMETRY_DISABLED: '1'
	};
	if (process.env.NOTES_FIXTURE_BUILD === '1') {
		try {
			for (const [script, ...args] of [
				[require.resolve('next/dist/bin/next'), 'build', '--webpack'],
				[
					path.join(__dirname, '../node_modules/next-sitemap/bin/next-sitemap.mjs'),
					'--config',
					'next-sitemap.config.js'
				]
			]) {
				await new Promise((resolve, reject) => {
					const build = spawn(process.execPath, [script, ...args], {
						cwd: root,
						env: fixtureEnv,
						stdio: 'inherit',
						windowsHide: true
					});
					build.once('error', reject);
					build.once('exit', code => (code === 0 ? resolve() : reject(new Error(`Fixture build failed (${code})`))));
				});
			}
		} catch (error) {
			api.closeAllConnections();
			await new Promise(resolve => api.close(resolve));
			throw error;
		}
		courseListReads = 0;
	}
	const child = spawn(
		process.execPath,
		[require.resolve('next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', String(webPort)],
		{
			cwd: root,
			windowsHide: true,
			env: fixtureEnv,
			stdio: ['ignore', 'pipe', 'pipe']
		}
	);
	let output = '';
	child.stdout.on('data', chunk => {
		output = (output + chunk).slice(-3000);
	});
	child.stderr.on('data', chunk => {
		output = (output + chunk).slice(-3000);
	});
	const get = (url, init = {}) => fetch(url, { ...init, signal: AbortSignal.timeout(15000) });
	try {
		let ready = false;
		const deadline = Date.now() + 90000;
		while (Date.now() < deadline && child.exitCode === null) {
			try {
				ready = (await get(`${base}/manifest.webmanifest`)).ok;
			} catch {
				/* still starting */
			}
			if (ready) break;
			await new Promise(resolve => setTimeout(resolve, 250));
		}
		assert.ok(ready, 'Local production server did not become ready');
		const first = await get(`${base}/course/${id}/`);
		assert.equal(first.status, 200);
		const html = await first.text();
		assert.match(html, /Cache smoke version one/);
		assert.match(html, /f_auto,q_auto,c_limit,w_640/);
		assert.doesNotMatch(html, /src="\/_next\/image/);
		assert.match(first.headers.get('cache-control'), /s-maxage=3600/);
		const initialReads = reads;
		assert.equal(initialReads, 1, 'Metadata and rendering should share one public API read');
		course.title = 'Cache smoke version two';
		const cached = await get(`${base}/course/${id}/`, {
			headers: { Cookie: 'shattak_session=synthetic-not-a-real-session' }
		});
		assert.match(await cached.text(), /Cache smoke version one/);
		assert.equal(reads, initialReads, 'A public page cache hit should avoid another API read');
		assert.equal(forwardedCookie, false, 'Public server fetch must not forward a visitor session');
		const denied = await get(`${base}/api/cache/revalidate/`, { method: 'POST', body: '{"scope":"courses"}' });
		assert.equal(denied.status, 401);
		assert.equal(denied.headers.get('cache-control'), 'private, no-store');
		await denied.body?.cancel();
		const invalidated = await get(`${base}/api/cache/revalidate/`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({ scope: 'courses' })
		});
		assert.equal(invalidated.status, 200);
		await invalidated.body?.cancel();
		const refreshed = await get(`${base}/course/${id}/`);
		assert.match(await refreshed.text(), /Cache smoke version two/);
		assert.equal(reads, initialReads + 1, 'Revalidation should fetch the edited public content');
		const departmentUrl = `${base}/notes/${id}/`;
		const noteUrl = `${base}/notes/${id}/math/sample/`;
		for (const [url, title] of [
			[departmentUrl, 'Department version one'],
			[noteUrl, 'Note version one']
		]) {
			const started = performance.now();
			const result = await get(url);
			const ttfbMs = performance.now() - started;
			assert.equal(result.status, 200);
			assert.match(result.headers.get('cache-control'), /s-maxage=3600/);
			const body = await result.text();
			assert.ok(body.includes(title));
			timings.push({
				route: url === noteUrl ? 'detail' : 'department',
				run: 'cold-html',
				ttfbMs,
				bytes: Buffer.byteLength(body)
			});
			if (phase2 && url === noteUrl) {
				assert.ok(!body.includes('Related study handout 249'), 'Detail should not render the full subject collection');
				assert.ok(body.includes('Browse all 250 resources'), 'Detail should link to the complete subject listing');
			}
		}
		notesVersion = 'two';
		for (const [url, title] of [
			[departmentUrl, 'Department version one'],
			[noteUrl, 'Note version one']
		]) {
			const started = performance.now();
			const result = await get(url);
			const ttfbMs = performance.now() - started;
			const body = await result.text();
			assert.ok(body.includes(title));
			timings.push({
				route: url === noteUrl ? 'detail' : 'department',
				run: 'warm-html',
				ttfbMs,
				bytes: Buffer.byteLength(body)
			});
		}
		const noteFlight = await get(`${noteUrl}?_rsc=fixture`, { headers: { RSC: '1' } });
		assert.match(noteFlight.headers.get('content-type'), /text\/x-component/);
		timings.push({ route: 'detail', run: 'warm-rsc', bytes: Buffer.byteLength(await noteFlight.text()) });
		assert.equal(departmentReads, 1);
		assert.equal(noteReads, 1);
		const notesInvalidation = await get(`${base}/api/cache/revalidate/`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({ scope: 'notes' })
		});
		assert.equal(notesInvalidation.status, 200);
		await notesInvalidation.body?.cancel();
		for (const [url, title] of [
			[departmentUrl, 'Department version two'],
			[noteUrl, 'Note version two']
		]) {
			assert.ok((await (await get(url)).text()).includes(title));
		}
		assert.equal(departmentReads, 2);
		assert.equal(noteReads, 2);
		const subjectUrl = `${base}/notes/${id}/math/`;
		for (const [query, result] of [
			['', 'Result NOTES page 1'],
			['?page=2', 'Result NOTES page 2'],
			['?category=PYQ', 'Result PYQ page 1'],
			['?category=PYQ&page=2', 'Result PYQ page 2'],
			['?category=lab&page=3', 'Result LAB page 3'],
			['?category=invalid&page=-1', 'Result NOTES page 1']
		]) {
			const url = `${subjectUrl}${query}`;
			const started = performance.now();
			const resultResponse = await get(url);
			const ttfbMs = performance.now() - started;
			assert.equal(resultResponse.status, 200, url);
			const content = await resultResponse.text();
			if (query === '?category=PYQ&page=2')
				timings.push({ route: 'filtered-page-2', run: 'first-html', ttfbMs, bytes: Buffer.byteLength(content) });
			assert.ok(content.includes(result), `${url} should SSR ${result}`);
			assert.match(resultResponse.headers.get('cache-control'), /s-maxage=3600/);
			assert.match(resultResponse.headers.get('netlify-vary'), /query=category\|page/);
			const canonical = content.match(/<link rel="canonical" href="([^"]+)"/);
			assert.ok(canonical, 'Public canonical URL must be present');
			assert.equal(new URL(canonical[1]).pathname.replace(/\/$/, ''), `/notes/${id}/math`);
			assert.ok(!content.includes('href="/notes-browse/'), 'Links must use public URLs, not rewrite destinations');
			const count = subjectReads;
			const warmStarted = performance.now();
			const warmResult = await get(url);
			const warmTtfbMs = performance.now() - warmStarted;
			assert.ok((await warmResult.text()).includes(result));
			if (query === '?category=PYQ&page=2')
				timings.push({ route: 'filtered-page-2', run: 'warm-html', ttfbMs: warmTtfbMs });
			assert.equal(subjectReads, count, 'Warm query variants must not read the API again');
		}
		// Browser back/forward revisits preserve each independently cached variant.
		assert.ok((await (await get(`${subjectUrl}?page=2`)).text()).includes('Result NOTES page 2'));
		const flight = await get(`${subjectUrl}?category=PYQ&page=2&_rsc=fixture`, { headers: { RSC: '1' } });
		assert.match(flight.headers.get('content-type'), /text\/x-component/);
		const flightBody = await flight.text();
		assert.ok(flightBody.includes('Result PYQ page 2'));
		timings.push({ route: 'filtered-page-2', run: 'warm-rsc', bytes: Buffer.byteLength(flightBody) });
		notesVersion = 'three';
		await (
			await get(`${base}/api/cache/revalidate/`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${secret}` },
				body: '{"scope":"notes"}'
			})
		).body?.cancel();
		assert.ok(
			(await (await get(`${subjectUrl}?category=PYQ&page=2`)).text()).includes('version three'),
			'Notes invalidation must also expire rewritten variants'
		);
		assert.equal(forwardedCookie, false);
		if (phase2) assert.equal(courseListReads, 0, 'No Notes render should request the recommendation catalog');
		console.log(JSON.stringify({ courseListReads, timings }));
		if (phase2) {
			const invalidateNotes = async () => {
				const response = await get(`${base}/api/cache/revalidate/`, {
					method: 'POST',
					headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
					body: '{"scope":"notes"}'
				});
				assert.equal(response.status, 200);
				await response.body?.cancel();
			};
			const absent = async url => {
				const response = await get(url);
				assert.equal(response.status, 404, url);
				await response.body?.cancel();
			};
			await absent(`${base}/notes/${'a'.repeat(161)}/`);
			await absent(`${base}/notes/unknown-department/`);
			noteAvailable = false;
			await invalidateNotes();
			await absent(noteUrl);
			noteAvailable = true;
			browserFixtureReady = Boolean(process.env.NOTES_BROWSER_PLAYWRIGHT);
			await invalidateNotes();
			assert.match(await (await get(noteUrl)).text(), /Note version three/);
			if (browserFixtureReady) {
				await require('./notes-browser-smoke.cjs').verifyNotesBrowser({
					base,
					apiBase: `http://127.0.0.1:${apiPort}`,
					department: id
				});
			}
		}
		console.log(
			'PASS: production ISR cache hit, request reuse, no forwarded session, authenticated invalidation, fresh content after invalidation'
		);
	} catch (error) {
		console.error(output);
		throw error;
	} finally {
		child.kill();
		api.closeAllConnections();
		await new Promise(resolve => api.close(resolve));
	}
};

run().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
