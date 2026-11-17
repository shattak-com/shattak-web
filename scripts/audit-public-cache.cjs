/* eslint-env node */
// Small, read-only probe. No cookies, credentials, purges, or mutations.
const base = new URL(process.argv[2] || 'https://shattak.com');
if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search)
	throw new Error('Use a public HTTP(S) origin');
const paths = process.argv.slice(3);
const targets = paths.length ? paths : ['/login/', '/community/', '/notes/'];

(async () => {
	for (const path of targets) {
		const url = new URL(path, base);
		if (url.origin !== base.origin) throw new Error('Probe paths must stay on the selected origin');
		for (const kind of ['html', 'html', 'rsc', 'rsc']) {
			const target = new URL(url);
			if (kind === 'rsc') target.searchParams.set('_rsc', 'shattak-audit');
			const started = performance.now();
			const result = await fetch(target, {
				headers: kind === 'rsc' ? { RSC: '1', 'Next-Router-Prefetch': '1' } : { Accept: 'text/html' },
				signal: AbortSignal.timeout(20000)
			});
			const bytes = (await result.arrayBuffer()).byteLength;
			const headers = Object.fromEntries(
				['cache-control', 'netlify-cdn-cache-control', 'cache-status', 'age', 'netlify-vary', 'content-type'].map(
					key => [key, result.headers.get(key)]
				)
			);
			console.log(
				JSON.stringify({
					path,
					kind,
					status: result.status,
					elapsedMs: Math.round(performance.now() - started),
					decodedBytes: bytes,
					headers
				})
			);
		}
	}
})().catch(error => {
	console.error(error.message);
	process.exitCode = 1;
});
