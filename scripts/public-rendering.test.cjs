/* eslint-env node */
// Run after a production build: assert the compiled contract, not just source text.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { test } = require('node:test');

const readManifest = name => JSON.parse(fs.readFileSync(path.join(__dirname, '../.next', name), 'utf8'));

test('public subject variants use on-demand static generation, not per-request SSR', () => {
	const manifest = readManifest('prerender-manifest.json');
	for (const route of [
		'/notes/[departmentSlug]/[subjectSlug]',
		'/notes-browse/[departmentSlug]/[subjectSlug]/[category]/[page]'
	]) {
		assert.ok(manifest.dynamicRoutes[route], `${route} should be in the prerender manifest`);
		assert.equal(manifest.dynamicRoutes[route].fallback, null, 'Unknown slugs remain available on demand');
	}
	assert.equal(manifest.routes['/'].initialRevalidateSeconds, 3600);
	assert.equal(manifest.routes['/notes'].initialRevalidateSeconds, 3600);
	const departments = Object.keys(manifest.routes).filter(route => /^\/notes\/[^/]+$/.test(route));
	assert.ok(departments.length <= 24, 'Build-time generation must remain bounded');
});

test('compiled query rewrites preserve category/page keys without modifying private routes', () => {
	const manifest = readManifest('routes-manifest.json');
	const rewrites = manifest.rewrites.beforeFiles.filter(rule => rule.destination.startsWith('/notes-browse/'));
	assert.equal(rewrites.length, 3);
	assert.ok(rewrites.every(rule => rule.source === '/notes/:departmentSlug/:subjectSlug/'));
	const headers = manifest.headers.find(rule => rule.source === '/notes/:departmentSlug/:subjectSlug/');
	assert.ok(headers.headers.some(header => header.key === 'Netlify-Vary' && header.value === 'query=category|page'));
	assert.ok(
		!manifest.headers.some(rule => rule.headers.some(header => /cache-control/i.test(header.key))),
		'No blanket public-cache overrides may reach authenticated/error responses'
	);
});

test('Netlify adapter preserves query variants AND HTML/RSC isolation', async () => {
	const location = path.join(__dirname, '../node_modules/@netlify/plugin-nextjs/dist/run/headers.js');
	const { setVaryHeaders } = await import(pathToFileURL(location).href);
	const headers = new Headers({ 'Netlify-Vary': 'query=category|page' });
	setVaryHeaders(headers, new Request('https://example.test/notes/d/s/?category=PYQ&page=2'), {});
	const vary = headers.get('netlify-vary');
	for (const key of ['category', 'page', '_rsc', 'rsc', 'next-router-state-tree', '__prerender_bypass'])
		assert.ok(vary.includes(key));
});

test('sitemap does not tell crawlers every page changed at each deployment', async () => {
	const config = require('../next-sitemap.config');
	assert.equal((await config.transform(config, '/community')).lastmod, undefined);
	assert.ok(config.exclude.includes('/notes-browse/*'));
});
