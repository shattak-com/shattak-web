// Shared by the browser client and the service-worker build. Do not broaden
// this to /api/*: these routes return public metadata, never access URLs.
const PUBLIC_API_PATH_FRAGMENT =
	'/(?:courses(?:/[^/?#]+)?|notes(?:/departments/[^/?#]+(?:/subjects/[^/?#]+(?:/notes/[^/?#]+)?)?)?)';
const publicPathPattern = new RegExp(`^${PUBLIC_API_PATH_FRAGMENT}/?$`);

const isPublicApiPath = path => publicPathPattern.test(path.split('?')[0]);

module.exports = {
	PUBLIC_API_PATH_FRAGMENT,
	PUBLIC_CACHE_SECONDS: 300,
	PUBLIC_BROWSER_CACHE_SECONDS: 60,
	isPublicApiPath
};
