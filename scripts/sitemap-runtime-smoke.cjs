/* eslint-env node */
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');

(async () => {
	const prefix = path.join(os.tmpdir(), 'shattak-sitemap-test-');
	const output = fs.mkdtempSync(prefix);
	let requests = 0;
	const departments = Array.from({ length: 17 }, (_, d) => ({ slug: `department-${d}`, subjects: [] }));
	for (let s = 0; s < 302; s++) departments[s % 17].subjects.push({ slug: `subject-${s}` });
	const notes = Array.from({ length: 6740 }, (_, n) => ({
		slug: `note-${n}`,
		subjectSlug: `subject-${n % 302}`,
		departmentSlugs: [`department-${(n % 302) % 17}`]
	}));
	const server = http.createServer((request, response) => {
		requests++;
		const url = new URL(request.url, 'http://fixture');
		let data;
		if (url.pathname === '/api/v1/courses') data = Array.from({ length: 41 }, (_, i) => ({ id: `course-${i}` }));
		else if (url.pathname === '/api/v1/notes/sitemap') {
			const cursor = Number(url.searchParams.get('cursor') || 0);
			data = {
				departments: cursor === 0 ? departments : [],
				notes: notes.slice(cursor, cursor + 1000),
				nextCursor: cursor + 1000 < notes.length ? String(cursor + 1000) : null
			};
		} else {
			response.writeHead(404).end();
			return;
		}
		response.setHeader('Content-Type', 'application/json');
		response.end(JSON.stringify({ success: true, data }));
	});
	await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
	try {
		const started = performance.now();
		const child = spawn(
			process.execPath,
			[
				path.join(__dirname, '../node_modules/next-sitemap/bin/next-sitemap.mjs'),
				'--config',
				'scripts/fixtures/sitemap.config.cjs'
			],
			{
				cwd: path.join(__dirname, '..'),
				windowsHide: true,
				stdio: ['ignore', 'pipe', 'pipe'],
				env: {
					...process.env,
					SHATTAK_API_BASE_URL: `http://127.0.0.1:${server.address().port}/api/v1`,
					NEXT_PUBLIC_SITE_URL: 'https://fixture.shattak.test',
					SHATTAK_SITEMAP_TEST_OUTPUT: output
				}
			}
		);
		let logs = '';
		child.stdout.on('data', data => {
			logs += data;
		});
		child.stderr.on('data', data => {
			logs += data;
		});
		const code = await new Promise((resolve, reject) => {
			child.on('error', reject);
			child.on('exit', resolve);
		});
		assert.equal(code, 0, logs);
		assert.equal(requests, 8, '6740 notes should need seven compact batches plus one course request');
		const xml = fs
			.readdirSync(output)
			.filter(file => /^sitemap-\d+\.xml$/.test(file))
			.map(file => fs.readFileSync(path.join(output, file), 'utf8'))
			.join('');
		const noteLocations = [
			...xml.matchAll(/<loc>https:\/\/fixture.shattak.test\/notes\/department-\d+\/subject-\d+\/note-\d+\/?<\/loc>/g)
		];
		assert.equal(noteLocations.length, 6740);
		assert.doesNotMatch(xml, /\/notes-browse\/|<lastmod>/);
		assert.doesNotMatch(logs, /incomplete|deadline exceeded/);
		console.log(
			`PASS: generated all 6740 note URLs and aliases with 8 requests in ${Math.round(performance.now() - started)}ms (synthetic local fixture, not production throughput)`
		);
	} finally {
		server.closeAllConnections();
		await new Promise(resolve => server.close(resolve));
		if (path.resolve(output).startsWith(path.resolve(prefix))) fs.rmSync(output, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
