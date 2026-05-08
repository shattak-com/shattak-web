const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getDefaultApiBaseUrl = () => {
	if (process.env.NODE_ENV === 'development') {
		return 'http://localhost:5000/api/v1';
	}

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
	if (siteUrl) {
		return trimTrailingSlash(new URL('/api/v1', siteUrl).toString());
	}

	return 'http://localhost:5000/api/v1';
};

export const getApiBaseUrl = () => {
	const configuredBaseUrl = process.env.SHATTAK_API_BASE_URL ?? process.env.NEXT_PUBLIC_SHATTAK_API_BASE_URL;

	return trimTrailingSlash(configuredBaseUrl || getDefaultApiBaseUrl());
};
