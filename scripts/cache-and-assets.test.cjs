/* eslint-env node */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const { isPublicApiPath } = require('../src/lib/api/public-cache-policy');
const { createRuntimeCaching } = require('./pwa-runtime-caching.cjs');

const loadTs = (file, mocks = {}, globals = {}) => {
	const filename = path.resolve(__dirname, '..', file);
	const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
	}).outputText;
	const module = { exports: {} };
	vm.runInNewContext(
		source,
		{
			module,
			exports: module.exports,
			require: name => (Object.hasOwn(mocks, name) ? mocks[name] : require(name)),
			structuredClone,
			setTimeout,
			clearTimeout,
			MessageChannel,
			URL,
			Request,
			Response,
			Buffer,
			process: { env: { NODE_ENV: 'test' } },
			...globals
		},
		{ filename }
	);
	return module.exports;
};

const { PublicRequestCache } = loadTs('src/lib/api/public-browser-cache.ts');

test('only public course and Notes metadata can enter the public cache', () => {
	for (const url of [
		'/courses',
		'/courses/aws',
		'/notes/',
		'/notes/departments/cse',
		'/notes/departments/cse/subjects/math?page=2&category=PYQ',
		'/notes/departments/cse/subjects/math/notes/algebra'
	])
		assert.equal(isPublicApiPath(url), true, url);
	for (const url of [
		'/me',
		'/admin/courses',
		'/auth/google',
		'/enrollments',
		'/notes/123/access',
		'/courses/aws/lessons',
		'/courses/aws/certificate',
		'/notes/private',
		'/api/v1/courses'
	]) {
		assert.equal(isPublicApiPath(url), false, url);
	}
});

test('service worker restricts CacheFirst to the configured API origin and public paths', () => {
	const rules = createRuntimeCaching('https://api.example.test/api/v1/');
	const publicRule = rules[0];
	assert.equal(publicRule.handler, 'CacheFirst');
	assert.equal(publicRule.options.expiration.maxAgeSeconds, 60);
	assert.equal(
		publicRule.urlPattern.test('https://api.example.test/api/v1/notes/departments/cse/subjects/math?page=2'),
		true
	);
	for (const url of [
		'https://evil.test/api/v1/courses',
		'https://apiXexample.test/api/v1/courses',
		'https://api.example.test/api/v1/admin/courses',
		'https://api.example.test/api/v1/me',
		'https://api.example.test/api/v1/courses/aws/progress',
		'https://api.example.test/api/v1/notes/id/access'
	]) {
		assert.equal(publicRule.urlPattern.test(url), false, url);
	}
	for (const pathname of ['/profile', '/my-courses/aws', '/admin/courses']) {
		const url = new URL(pathname, 'https://web.example.test');
		const input = { url, sameOrigin: true, request: { destination: 'document' } };
		assert.equal(
			rules.some(rule => (rule.urlPattern instanceof RegExp ? rule.urlPattern.test(url.href) : rule.urlPattern(input))),
			false
		);
	}
	assert.equal(rules[1].handler, 'NetworkOnly');
});

test('public request cache deduplicates, expires, and isolates returned objects', async () => {
	let now = 0;
	let calls = 0;
	const cache = new PublicRequestCache(100, 2, () => now);
	const load = async () => ({ number: ++calls });
	const [first, second] = await Promise.all([cache.get('a', load), cache.get('a', load)]);
	assert.equal(calls, 1);
	first.number = 99;
	assert.equal(second.number, 1);
	assert.equal((await cache.get('a', load)).number, 1);
	now = 100;
	assert.equal((await cache.get('a', load)).number, 2);
	await cache.get('b', load);
	await cache.get('c', load);
	await cache.get('a', load);
	assert.equal(calls, 5);
});

test('failed loads are retried and invalidation prevents old requests repopulating the cache', async () => {
	const cache = new PublicRequestCache();
	await assert.rejects(
		cache.get('a', async () => {
			throw new Error('offline');
		})
	);
	assert.equal(await cache.get('a', async () => 'recovered'), 'recovered');
	let finish;
	const pending = cache.get(
		'b',
		() =>
			new Promise(resolve => {
				finish = resolve;
			})
	);
	await Promise.resolve();
	cache.clear();
	assert.equal(await cache.get('b', async () => 'new'), 'new');
	finish('old');
	await pending;
	assert.equal(await cache.get('b', async () => 'unexpected'), 'new');
});

test('private requests retain credentials and disable HTTP caching; only successful admin writes invalidate public data', async () => {
	const calls = [];
	let clears = 0;
	let status = 200;
	const client = loadTs(
		'src/lib/api/client.ts',
		{
			'~/lib/api/config': { getApiBaseUrl: () => 'https://api.test/api/v1' },
			'~/lib/api/public-browser-cache': {
				clearBrowserPublicCache: async () => {
					clears += 1;
				}
			}
		},
		{
			fetch: async (url, init) => {
				calls.push({ url, init });
				return Response.json({ success: status === 200, data: { ok: true }, message: 'test' }, { status });
			}
		}
	);
	await client.getJson('/me');
	assert.equal(calls[0].init.cache, 'no-store');
	assert.equal(calls[0].init.credentials, 'include');
	await client.patchJson('/admin/courses/id', {});
	assert.equal(clears, 1);
	status = 401;
	await assert.rejects(client.patchJson('/admin/notes/id', {}));
	assert.equal(clears, 1);
});

test('server public requests use tagged Next.js caching, not process-global response reuse', async () => {
	const calls = [];
	const client = loadTs('src/lib/api/public-requests.ts', {
		'~/lib/api/client': {
			getJson: async (url, init) => {
				calls.push({ url, init });
				return {};
			}
		},
		'~/lib/api/config': { getApiBaseUrl: () => 'https://api.test/api/v1' },
		'~/lib/api/public-cache-policy': require('../src/lib/api/public-cache-policy'),
		'~/lib/api/public-browser-cache': {
			browserPublicCache: {
				get: () => {
					throw new Error('must not run on server');
				}
			}
		}
	});
	await client.getPublicJson('/courses');
	assert.equal(calls[0].init.cache, 'force-cache');
	assert.equal(calls[0].init.next.revalidate, 300);
	assert.equal(calls[0].init.next.tags[0], 'shattak-courses');
	assert.throws(() => client.getPublicJson('/admin/courses'));
});

const createRevalidationRoute = secret => {
	const calls = [];
	const route = loadTs(
		'src/app/api/cache/revalidate/route.ts',
		{
			'next/cache': {
				revalidateTag: (...args) => calls.push(['tag', ...args]),
				revalidatePath: (...args) => calls.push(['path', ...args])
			}
		},
		{ process: { env: { PUBLIC_CACHE_REVALIDATION_SECRET: secret } } }
	);
	return {
		calls,
		post: (authorization, body) =>
			route.POST(
				new Request('https://web.test/api/cache/revalidate/', {
					method: 'POST',
					headers: { authorization },
					body
				})
			)
	};
};

test('revalidation rejects missing configuration, invalid credentials, and arbitrary scopes', async () => {
	assert.equal((await createRevalidationRoute('').post('', '{}')).status, 503);
	const { calls, post } = createRevalidationRoute('s'.repeat(32));
	assert.equal((await post('Bearer wrong', '{"scope":"courses"}')).status, 401);
	assert.equal((await post(`Bearer ${'s'.repeat(32)}`, '{"scope":"admin"}')).status, 400);
	assert.equal((await post(`Bearer ${'s'.repeat(32)}`, 'invalid JSON')).status, 400);
	assert.equal(calls.length, 0);
});

test('authorized revalidation expires only public data and affected public page paths', async () => {
	const secret = 's'.repeat(32);
	const { calls, post } = createRevalidationRoute(secret);
	const response = await post(`Bearer ${secret}`, '{"scope":"courses"}');
	assert.equal(response.status, 200);
	assert.equal(response.headers.get('cache-control'), 'private, no-store');
	assert.equal(calls[0][1], 'shattak-courses');
	assert.equal(calls[0][2].expire, 0);
	assert.deepEqual(
		calls.slice(1).map(call => call[1]),
		['/', '/course/[id]', '/notes']
	);
	const notes = createRevalidationRoute(secret);
	await notes.post(`Bearer ${secret}`, '{"scope":"notes"}');
	assert.deepEqual(
		notes.calls.map(call => call[1]),
		['shattak-notes', '/notes']
	);
});

test('responsive image loader optimizes only unsigned public image uploads', () => {
	const { isOptimizablePublicImage, publicImageLoader } = loadTs('src/lib/utils/public-image.ts');
	const src = 'https://res.cloudinary.com/demo/image/upload/v123/photo.jpg';
	assert.equal(isOptimizablePublicImage(src), true);
	assert.equal(
		publicImageLoader({ src, width: 640 }),
		'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_640/v123/photo.jpg'
	);
	assert.match(publicImageLoader({ src, width: 4000 }), /w_1920/);
	for (const source of [
		'/images/local.svg',
		'https://other.test/photo.jpg',
		'https://res.cloudinary.com/demo/image/upload/s--signature--/v123/photo.jpg',
		'https://res.cloudinary.com/demo/image/upload/v123/file.pdf',
		'https://res.cloudinary.com/demo/image/upload/w_300/v123/photo.jpg',
		`${src}?token=secret`
	]) {
		assert.equal(publicImageLoader({ src: source, width: 640 }), source);
	}
	const { getImageProps } = require('next/image');
	const { props } = getImageProps({ src, width: 640, height: 360, alt: 'test', loader: publicImageLoader });
	assert.match(props.srcSet, /f_auto,q_auto,c_limit,w_/);
	assert.doesNotMatch(props.srcSet, /\/_next\/image/);
});

test('worker removes legacy caches and acknowledges explicit public cache clearing', async () => {
	const listeners = {};
	const deleted = [];
	vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../worker/index.js'), 'utf8'), {
		self: {
			addEventListener: (name, callback) => {
				listeners[name] = callback;
			}
		},
		caches: {
			keys: async () => ['apis', 'cross-origin', 'others', 'shattak-static-v1', 'unrelated-app'],
			delete: async name => {
				deleted.push(name);
			}
		}
	});
	let pending;
	listeners.activate({
		waitUntil: promise => {
			pending = promise;
		}
	});
	await pending;
	assert.deepEqual(deleted, ['apis', 'cross-origin', 'others']);
	let acknowledged = false;
	listeners.message({
		data: { type: 'SHATTAK_CLEAR_PUBLIC_CACHE' },
		ports: [
			{
				postMessage: () => {
					acknowledged = true;
				}
			}
		],
		waitUntil: promise => {
			pending = promise;
		}
	});
	await pending;
	assert.equal(deleted.at(-1), 'shattak-public-api-v1');
	assert.equal(acknowledged, true);
});
