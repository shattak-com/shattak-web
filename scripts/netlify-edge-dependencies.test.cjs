/* eslint-env node */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const webpack = require('webpack');

const projectRoot = path.join(__dirname, '..');

test('known non-app probe paths use exact static 404 rules, without a catch-all', () => {
	const config = fs.readFileSync(path.join(projectRoot, 'netlify.toml'), 'utf8');
	const rules = Array.from(
		config.matchAll(/\[\[redirects\]\]\s+from = "([^"]+)"\s+to = "([^"]+)"\s+status = (\d+)/g),
		([, from, to, status]) => ({ from, to, status })
	);
	const probes = rules.filter(rule => rule.to === '/probe-not-found.html');
	assert.deepEqual(probes.map(rule => rule.from).sort(), ['/Jenkinsfile', '/index.php', '/userfiles']);
	assert.ok(probes.every(rule => rule.status === '404'));
	assert.match(fs.readFileSync(path.join(projectRoot, 'public/probe-not-found.html'), 'utf8'), /content="noindex"/);
});

test('Netlify extension SDK is an explicit runtime dependency and imports successfully', async () => {
	const manifest = require('../package.json');
	assert.ok(manifest.dependencies['@netlify/blobs'], 'Edge extensions must not rely on a transitive/dev-only SDK');
	const sdk = await import('@netlify/blobs');
	assert.equal(typeof sdk.getStore, 'function');
	assert.equal(typeof sdk.getDeployStore, 'function');
	// Import only: never open a store or read/write any Netlify data in tests.
});

test('Netlify Blobs namespace import bundles for an Edge-compatible web-worker target', async () => {
	const prefix = path.join(os.tmpdir(), 'shattak-edge-bundle-test-');
	const output = fs.mkdtempSync(prefix);
	const compiler = webpack({
		context: projectRoot,
		entry: './scripts/fixtures/netlify-blobs-edge.mjs',
		mode: 'production',
		target: 'webworker',
		// Netlify Edge uses Deno, which supports node:-prefixed built-ins.
		// Keep the built-in external; never externalize the missing SDK itself.
		externals: { process: 'module node:process' },
		optimization: { minimize: false },
		output: { path: output, filename: 'edge.mjs', library: { type: 'module' } },
		experiments: { outputModule: true }
	});
	try {
		const stats = await new Promise((resolve, reject) =>
			compiler.run((error, result) => (error ? reject(error) : resolve(result)))
		);
		assert.equal(stats.hasErrors(), false, stats.toString({ all: false, errors: true }));
		assert.ok(fs.statSync(path.join(output, 'edge.mjs')).size > 0);
	} finally {
		await new Promise(resolve => compiler.close(resolve));
		if (path.resolve(output).startsWith(path.resolve(prefix))) fs.rmSync(output, { recursive: true, force: true });
	}
});
