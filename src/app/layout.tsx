import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';

import { Layout } from '~/lib/containers/layout';
import { RootProviders } from '~/lib/providers/root';
import '~/lib/styles/globals.css';

type RootLayoutProps = {
	children: React.ReactNode;
};

const APP_NAME = 'Shattak';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const GA_MEASUREMENT_ID = 'G-75NBV2Y1D8';
const MANIFEST_PATH = '/assets/site.webmanifest';
const FAVICON_ICO = '/assets/favicon.ico';
const FAVICON_16 = '/assets/favicon-16x16.png';
const FAVICON_32 = '/assets/favicon-32x32.png';
const APPLE_TOUCH_ICON = '/assets/apple-touch-icon.png';
const ANDROID_ICON_192 = '/assets/android-chrome-192x192.png';
const ANDROID_ICON_512 = '/assets/android-chrome-512x512.png';
const THEME_STORAGE_KEY = 'shattak-theme';

const themeInitScript = `(function(){try{var key='${THEME_STORAGE_KEY}';var root=document.documentElement;var stored=localStorage.getItem(key);var systemDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var theme=(stored==='light'||stored==='dark')?stored:(systemDark?'dark':'light');root.classList.remove('light','dark');root.classList.add(theme);}catch(e){}})();`;

const headingFont = Bricolage_Grotesque({
	subsets: ['latin'],
	variable: '--font-heading',
	weight: ['400', '500', '600', '700']
});

const bodyFont = Plus_Jakarta_Sans({
	subsets: ['latin'],
	variable: '--font-body',
	weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
	title: { default: APP_NAME, template: '%s | Shattak' },
	description: 'Live classes, expert mentors, and career-ready learning with Shattak.',
	applicationName: APP_NAME,
	metadataBase: new URL(SITE_URL),
	verification: {
    google: "Ed4AzxtahacP_bpNmfVpHwwGWTgCCjUSlGm6kIWeNpU",
  	},
	keywords: ['Shattak', 'live classes', 'expert mentors', 'courses', 'learning platform', 'career upskilling'],
	alternates: {
		canonical: SITE_URL
	},
	manifest: MANIFEST_PATH,
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-image-preview': 'large',
			'max-snippet': -1,
			'max-video-preview': -1
		}
	},
	icons: {
		icon: [
			{ url: FAVICON_ICO, type: 'image/x-icon' },
			{ url: FAVICON_16, type: 'image/png', sizes: '16x16' },
			{ url: FAVICON_32, type: 'image/png', sizes: '32x32' },
			{ url: ANDROID_ICON_192, type: 'image/png', sizes: '192x192' },
			{ url: ANDROID_ICON_512, type: 'image/png', sizes: '512x512' }
		],
		apple: [{ url: APPLE_TOUCH_ICON, type: 'image/png', sizes: '180x180' }],
		shortcut: FAVICON_ICO
	},
	appleWebApp: {
		capable: true,
		title: APP_NAME,
		statusBarStyle: 'default'
	},
	formatDetection: {
		telephone: false
	},
	openGraph: {
		url: SITE_URL,
		title: 'Shattak',
		description: 'Learn from experts. Build what matters.',
		type: 'website',
		siteName: 'Shattak',
		images: [
			{
				url: ANDROID_ICON_512,
				width: 512,
				height: 512,
				alt: 'Shattak logo'
			}
		]
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Shattak',
		description: 'Learn from experts. Build what matters.',
		images: [ANDROID_ICON_512]
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	themeColor: '#ffffff'
};

const RootLayout = async ({ children }: RootLayoutProps) => (
	<html lang="en" className={`${headingFont.variable} ${bodyFont.variable} light`} suppressHydrationWarning>
		<body>
			<Script id="theme-init" strategy="beforeInteractive">
				{themeInitScript}
			</Script>
			<Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
			<Script id="ga-init" strategy="afterInteractive">
				{`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
			</Script>
			<RootProviders>
				<Layout>{children}</Layout>
			</RootProviders>
		</body>
	</html>
);

export default RootLayout;
