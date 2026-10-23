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

const listen = server =>
	new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', () => resolve(server.address().port));
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
	let notesVersion = 'one';
	let forwardedCookie = false;
	const api = http.createServer((request, response) => {
		response.setHeader('Content-Type', 'application/json');
		forwardedCookie ||= Boolean(request.headers.cookie);
		const department = { id, slug: id, name: `Department version ${notesVersion}`, icon: '', subjectCount: 1 };
		if (request.url === `/api/v1/courses/${id}`) {
			reads += 1;
			forwardedCookie ||= Boolean(request.headers.cookie);
			response.end(JSON.stringify({ success: true, message: 'Fixture course', data: course }));
		} else if (request.url === '/api/v1/courses') {
			response.end(JSON.stringify({ success: true, message: 'Fixture catalog', data: [] }));
		} else if (request.url === `/api/v1/notes/departments/${id}`) {
			departmentReads += 1;
			response.end(
				JSON.stringify({ success: true, message: 'Fixture department', data: { department, subjects: [] } })
			);
		} else if (request.url === `/api/v1/notes/departments/${id}/subjects/math/notes/sample`) {
			noteReads += 1;
			response.end(
				JSON.stringify({
					success: true,
					message: 'Fixture note',
					data: {
						department,
						subject: { id: 'math', slug: 'math', name: 'Math', noteCount: 1, departments: [department] },
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
						subjectNotes: []
					}
				})
			);
		} else {
			response.writeHead(404).end(JSON.stringify({ success: false, message: 'Not found' }));
		}
	});
	const apiPort = await listen(api);
	const reservation = net.createServer();
	const webPort = await listen(reservation);
	await new Promise(resolve => reservation.close(resolve));
	const base = `http://127.0.0.1:${webPort}`;
	const secret = 'synthetic-local-only-revalidation-test-secret';
	const child = spawn(
		process.execPath,
		[require.resolve('next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', String(webPort)],
		{
			cwd: path.resolve(__dirname, '..'),
			windowsHide: true,
			env: {
				...process.env,
				SHATTAK_API_BASE_URL: `http://127.0.0.1:${apiPort}/api/v1`,
				PUBLIC_CACHE_REVALIDATION_SECRET: secret
			},
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
		const deadline = Date.now() + 45000;
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
		assert.match(first.headers.get('cache-control'), /s-maxage=300/);
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
			const result = await get(url);
			assert.equal(result.status, 200);
			assert.match(result.headers.get('cache-control'), /s-maxage=300/);
			assert.ok((await result.text()).includes(title));
		}
		notesVersion = 'two';
		for (const [url, title] of [
			[departmentUrl, 'Department version one'],
			[noteUrl, 'Note version one']
		]) {
			assert.ok((await (await get(url)).text()).includes(title));
		}
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
		assert.equal(forwardedCookie, false);
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
