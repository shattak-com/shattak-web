const withPWA = require('next-pwa')({
	dest: 'public',
	disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
module.exports = withPWA({
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
