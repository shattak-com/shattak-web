import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const manifest = (): MetadataRoute.Manifest => ({
	short_name: 'Shattak',
	name: 'Shattak',
	lang: 'en',
	start_url: '/',
	scope: '/',
	background_color: '#ffffff',
	theme_color: '#ffffff',
	dir: 'ltr',
	display: 'standalone',
	prefer_related_applications: false,
	icons: [
		{
			src: '/assets/android-chrome-192x192.png',
			type: 'image/png',
			sizes: '192x192'
		},
		{
			src: '/assets/android-chrome-512x512.png',
			type: 'image/png',
			sizes: '512x512'
		}
	]
});

export default manifest;
