const { PUBLIC_API_PATH_FRAGMENT, PUBLIC_BROWSER_CACHE_SECONDS } = require('../src/lib/api/public-cache-policy');

const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createRuntimeCaching = apiBaseUrl => {
	const baseUrl = new URL(apiBaseUrl);
	const base = `${baseUrl.origin}${baseUrl.pathname.replace(/\/+$/, '')}`;
	return [
		{
			urlPattern: new RegExp(`^${escapePattern(base)}${PUBLIC_API_PATH_FRAGMENT}/?(?:\\?[^#]*)?$`),
			handler: 'CacheFirst',
			method: 'GET',
			options: {
				cacheName: 'shattak-public-api-v1',
				cacheableResponse: { statuses: [200] },
				expiration: { maxEntries: 64, maxAgeSeconds: PUBLIC_BROWSER_CACHE_SECONDS }
			}
		},
		{
			urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
			handler: 'NetworkOnly',
			method: 'GET'
		},
		{
			urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/_next/static/'),
			handler: 'CacheFirst',
			options: {
				cacheName: 'shattak-static-v1',
				cacheableResponse: { statuses: [200] },
				expiration: { maxEntries: 128, maxAgeSeconds: 365 * 24 * 60 * 60 }
			}
		},
		{
			urlPattern: ({ url, request, sameOrigin }) =>
				sameOrigin &&
				['image', 'font'].includes(request.destination) &&
				/^\/(assets|images|illustrations|fonts)\//.test(url.pathname),
			handler: 'CacheFirst',
			options: {
				cacheName: 'shattak-public-assets-v1',
				cacheableResponse: { statuses: [200] },
				expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 }
			}
		}
		// Unmatched requests use the network. No HTML, RSC, protected documents,
		// arbitrary third-party URLs, or API responses enter a generic cache.
	];
};

module.exports = { createRuntimeCaching };
