const defaultRuntimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
	dest: 'public',
	disable: process.env.NODE_ENV === 'development',
	runtimeCaching: [
		{
			urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
			handler: 'NetworkOnly',
			method: 'GET',
			options: {
				cacheName: 'shattak-api-network-only'
			}
		},
		...defaultRuntimeCaching
	]
});

/** @type {import('next').NextConfig} */
module.exports = withPWA({
	outputFileTracingRoot: __dirname,
	typescript: {
		// !! WARN !!
		// Dangerously allow production builds to successfully complete even if
		// your project has type errors.
		// !! WARN !!
		ignoreBuildErrors: true
	},
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 's.udemycdn.com' },
			{ protocol: 'https', hostname: 'c.superprof.com' }
		],
		unoptimized: true
	},
	trailingSlash: true,
	reactStrictMode: true
});
