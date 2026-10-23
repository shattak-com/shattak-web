import { getJson } from '~/lib/api/client';
import { getApiBaseUrl } from '~/lib/api/config';
import { browserPublicCache } from '~/lib/api/public-browser-cache';
import { isPublicApiPath, PUBLIC_CACHE_SECONDS } from '~/lib/api/public-cache-policy';

export const getPublicJson = <T>(path: string): Promise<T> => {
	if (!isPublicApiPath(path)) throw new Error('Only public catalog metadata may use this cache');
	const scope = path.startsWith('/courses') ? 'courses' : 'notes';
	const load = () =>
		getJson<T>(path, {
			cache: typeof window === 'undefined' ? 'force-cache' : 'default',
			next: { revalidate: PUBLIC_CACHE_SECONDS, tags: [`shattak-${scope}`] }
		});

	// Server caching belongs to Next.js, not a process-global response map.
	return typeof window === 'undefined' ? load() : browserPublicCache.get(`${getApiBaseUrl()}${path}`, load);
};
