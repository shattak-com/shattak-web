const { createRuntimeCaching } = require('./scripts/pwa-runtime-caching.cjs');

const browserApiBaseUrl =
	process.env.NEXT_PUBLIC_SHATTAK_API_BASE_URL ||
	new URL('/api/v1', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000').toString();

const withPWA = require('next-pwa')({
	dest: 'public',
	disable: process.env.NODE_ENV === 'development',
	cacheStartUrl: false,
	dynamicStartUrl: false,
	// Cache assets when used, not every lazy/admin bundle and public file.
	publicExcludes: ['!**/*'],
	buildExcludes: [/chunks\/.*\.js$/, /\.map$/],
	runtimeCaching: createRuntimeCaching(browserApiBaseUrl)
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
		loader: 'custom',
		loaderFile: './src/lib/utils/public-image.ts',
		deviceSizes: [360, 640, 960, 1280, 1920],
		imageSizes: [32, 48, 64, 96, 128, 256],
		remotePatterns: [
			{ protocol: 'https', hostname: 's.udemycdn.com' },
			{ protocol: 'https', hostname: 'c.superprof.com' }
		]
	},
	trailingSlash: true,
	reactStrictMode: true
});
