const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const COURSES_COLLECTION = 'courses';
const PUBLISHED_STATUSES = ['Published', 'published'];
const FIREBASE_ENV_KEYS = [
	'NEXT_PUBLIC_FIREBASE_API_KEY',
	'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
	'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
	'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
	'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
	'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const hasRequiredFirebaseEnv = () => FIREBASE_ENV_KEYS.every(key => Boolean(process.env[key]));

const getPublishedCourseSlugs = async () => {
	if (!hasRequiredFirebaseEnv()) {
		console.warn('[next-sitemap] Firebase env vars missing. Dynamic course URLs were skipped.');
		return [];
	}

	try {
		const [{ getApp, getApps, initializeApp }, { collection, getDocs, getFirestore, query, where }] =
			await Promise.all([import('firebase/app'), import('firebase/firestore')]);

		const firebaseConfig = {
			apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
			authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
			projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
			storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
			messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
			appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
			measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
		};

		const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
		const db = getFirestore(app);
		const publishedQuery = query(collection(db, COURSES_COLLECTION), where('status', 'in', PUBLISHED_STATUSES));
		const snapshot = await getDocs(publishedQuery);

		return snapshot.docs.map(docSnap => docSnap.id).filter(Boolean);
	} catch (error) {
		console.warn('[next-sitemap] Failed to fetch dynamic course URLs from Firestore.', error);
		return [];
	}
};

/** @type {import('next-sitemap').IConfig} */
const NextSitemapConfig = {
	siteUrl: SITE_URL,
	generateRobotsTxt: true,
	exclude: ['/admin/login', '/add-course', '/booking', '/booking/*', '/manifest.webmanifest'],
	transform: async (config, path) => ({
		loc: path,
		changefreq: path === '/' ? 'daily' : 'weekly',
		priority: path === '/' ? 1 : 0.7,
		lastmod: new Date().toISOString(),
		alternateRefs: config.alternateRefs ?? []
	}),
	additionalPaths: async config => {
		const dynamicPaths = [];
		const seenLocs = new Set();
		const addUniqueEntry = entry => {
			if (!entry || !entry.loc || seenLocs.has(entry.loc)) {
				return;
			}
			seenLocs.add(entry.loc);
			dynamicPaths.push(entry);
		};

		const staticPaths = ['/', '/about'];
		for (const path of staticPaths) {
			const entry = await config.transform(config, path);
			addUniqueEntry(entry);
		}

		const courseSlugs = await getPublishedCourseSlugs();
		for (const slug of courseSlugs) {
			const normalizedSlug = String(slug).trim();
			if (!normalizedSlug) {
				continue;
			}

			const courseEntry = await config.transform(config, `/course/${encodeURIComponent(normalizedSlug)}`);
			if (courseEntry) {
				addUniqueEntry({
					...courseEntry,
					changefreq: 'weekly',
					priority: 0.9
				});
			}
		}

		return dynamicPaths;
	}
};

module.exports = NextSitemapConfig;
