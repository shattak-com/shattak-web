/* eslint-env serviceworker */

const legacyRuntimeCaches = [
	'apis',
	'cross-origin',
	'others',
	'next-data',
	'start-url',
	'shattak-api-network-only',
	'google-fonts-webfonts',
	'google-fonts-stylesheets',
	'static-font-assets',
	'static-image-assets',
	'next-image',
	'static-audio-assets',
	'static-video-assets',
	'static-js-assets',
	'static-style-assets',
	'static-data-assets',
	// Unversioned public images should refresh with each application release.
	'shattak-public-assets-v1'
];

self.addEventListener('activate', event => {
	event.waitUntil(
		caches
			.keys()
			.then(names =>
				Promise.all(names.filter(name => legacyRuntimeCaches.includes(name)).map(name => caches.delete(name)))
			)
	);
});

self.addEventListener('message', event => {
	if (event.data?.type !== 'SHATTAK_CLEAR_PUBLIC_CACHE') return;
	event.waitUntil(
		caches.delete('shattak-public-api-v1').then(() => {
			event.ports[0]?.postMessage({ cleared: true });
		})
	);
});
