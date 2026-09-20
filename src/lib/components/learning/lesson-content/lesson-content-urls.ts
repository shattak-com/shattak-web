export const getYouTubeVideoId = (value: string) => {
	if (!value.trim()) {
		return null;
	}

	try {
		const url = new URL(value.trim());
		const hostname = url.hostname.replace(/^www\./, '');

		if (hostname === 'youtu.be') {
			return url.pathname.split('/').filter(Boolean)[0] ?? null;
		}

		if (!['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(hostname)) {
			return null;
		}

		if (url.pathname === '/watch') {
			return url.searchParams.get('v');
		}

		const [firstSegment, secondSegment] = url.pathname.split('/').filter(Boolean);

		if (['embed', 'shorts', 'live'].includes(firstSegment ?? '')) {
			return secondSegment ?? null;
		}

		return null;
	} catch {
		return null;
	}
};

export const getSafeExternalUrl = (value: string) => {
	try {
		const url = new URL(value);
		const hostname = url.hostname.toLowerCase();
		const isPrivateHost =
			hostname === 'localhost' ||
			hostname === '0.0.0.0' ||
			hostname === '[::1]' ||
			hostname.endsWith('.local') ||
			hostname.endsWith('.internal') ||
			/^(?:10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(hostname);

		return (url.protocol === 'http:' || url.protocol === 'https:') && !url.username && !url.password && !isPrivateHost
			? url.toString()
			: '';
	} catch {
		return '';
	}
};

const iframeSourcePattern = /<iframe\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i;

const decodeHtmlAttribute = (value: string) =>
	value
		.replace(/&amp;/gi, '&')
		.replace(/&quot;/gi, '"')
		.replace(/&#(?:0*39|x0*27);/gi, "'")
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>');

export const getSafeEmbedInputUrl = (value: string) => {
	const trimmedValue = value.trim();
	const iframeMatch = trimmedValue.match(iframeSourcePattern);
	const candidate = decodeHtmlAttribute(
		(iframeMatch?.[1] ?? iframeMatch?.[2] ?? iframeMatch?.[3] ?? trimmedValue).trim()
	);

	return getSafeExternalUrl(candidate);
};

const getGoogleSlidesEmbedUrl = (sourceUrl: string) => {
	try {
		const url = new URL(sourceUrl);
		const hostname = url.hostname.replace(/^www\./, '');

		if (hostname !== 'docs.google.com') {
			return '';
		}

		const standardPresentation = url.pathname.match(
			/^\/presentation\/d\/([A-Za-z0-9_-]+)(?:\/(?:edit|embed|present|preview|pub|view))?\/?$/
		);

		if (standardPresentation?.[1]) {
			return `https://docs.google.com/presentation/d/${standardPresentation[1]}/embed`;
		}

		const publishedPresentation = url.pathname.match(/^\/presentation\/d\/e\/([A-Za-z0-9_-]+)(?:\/(?:embed|pub))?\/?$/);

		return publishedPresentation?.[1]
			? `https://docs.google.com/presentation/d/e/${publishedPresentation[1]}/embed`
			: '';
	} catch {
		return '';
	}
};

const getCanvaEmbedUrl = (url: URL) => {
	const hostname = url.hostname.replace(/^www\./, '');

	if (hostname === 'canva.link') {
		return url.toString();
	}

	if (
		hostname !== 'canva.com' ||
		!/^\/design\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)?\/(?:view|watch|edit)\/?$/.test(url.pathname)
	) {
		return '';
	}

	if (url.searchParams.has('embed')) {
		return url.toString();
	}

	return `${url.origin}${url.pathname}${url.search}${url.search ? '&' : '?'}embed`;
};

const getFigmaEmbedUrl = (url: URL) => {
	const hostname = url.hostname.replace(/^www\./, '');
	const isSupportedPath = /^\/(?:design|proto|file|board|slides)\/[A-Za-z0-9_-]+(?:\/|$)/.test(url.pathname);

	if (!['figma.com', 'embed.figma.com'].includes(hostname) || !isSupportedPath) {
		return '';
	}

	const embedUrl = new URL(url.toString());
	embedUrl.hostname = 'embed.figma.com';
	embedUrl.searchParams.set('embed-host', 'share');

	return embedUrl.toString();
};

const isFacebookHostname = (hostname: string) =>
	hostname === 'facebook.com' || hostname === 'm.facebook.com' || hostname === 'web.facebook.com';

const getFacebookEmbedUrl = (url: URL) => {
	const hostname = url.hostname.replace(/^www\./, '');

	if (!isFacebookHostname(hostname)) {
		return '';
	}

	if (/^\/plugins\/(?:post|video)\.php$/.test(url.pathname)) {
		const sharedUrl = url.searchParams.get('href');

		if (!sharedUrl) {
			return '';
		}

		try {
			const sharedHostname = new URL(sharedUrl).hostname.replace(/^www\./, '');

			return isFacebookHostname(sharedHostname) ? url.toString() : '';
		} catch {
			return '';
		}
	}

	const isPostPath =
		/^\/(?:[^/]+\/posts\/|permalink\.php|photo(?:\.php)?|reel\/|watch\/?)/.test(url.pathname) ||
		url.searchParams.has('story_fbid');

	return isPostPath
		? `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url.toString())}&show_text=true&width=750`
		: '';
};

const getInstagramEmbedUrl = (url: URL) => {
	const hostname = url.hostname.replace(/^www\./, '');
	const match = url.pathname.match(/^\/(p|reel|tv)\/([A-Za-z0-9_-]+)(?:\/embed)?\/?$/);

	return hostname === 'instagram.com' && match?.[1] && match[2]
		? `https://www.instagram.com/${match[1]}/${match[2]}/embed/`
		: '';
};

const getVimeoEmbedUrl = (url: URL) => {
	const hostname = url.hostname.replace(/^www\./, '');

	if (hostname === 'player.vimeo.com' && /^\/video\/\d+\/?$/.test(url.pathname)) {
		return url.toString();
	}

	const videoMatch = hostname === 'vimeo.com' ? url.pathname.match(/^\/(\d+)\/?$/) : null;

	return videoMatch?.[1] ? `https://player.vimeo.com/video/${videoMatch[1]}` : '';
};

const getLinkedInEmbedUrl = (url: URL) => {
	const hostname = url.hostname.replace(/^www\./, '');

	return hostname === 'linkedin.com' && /^\/embed\/feed\/update\/urn:li:(?:activity|share):\d+\/?$/.test(url.pathname)
		? url.toString()
		: '';
};

export const isResolvableEmbedShortLink = (value: string) => {
	const sourceUrl = getSafeEmbedInputUrl(value);

	return sourceUrl ? new URL(sourceUrl).hostname.toLowerCase() === 'canva.link' : false;
};

export type EmbeddableResource = {
	sourceUrl: string;
	embedUrl: string;
	providerLabel: string;
	isKnownProvider: boolean;
};

export const getEmbeddableResource = (value: string): EmbeddableResource | null => {
	const sourceUrl = getSafeEmbedInputUrl(value);

	if (!sourceUrl) {
		return null;
	}

	const videoId = getYouTubeVideoId(sourceUrl);

	if (videoId) {
		return {
			sourceUrl,
			embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
			providerLabel: 'YouTube',
			isKnownProvider: true
		};
	}

	const url = new URL(sourceUrl);
	const hostname = url.hostname.replace(/^www\./, '');
	const googleSlidesEmbedUrl = getGoogleSlidesEmbedUrl(sourceUrl);

	if (googleSlidesEmbedUrl) {
		return { sourceUrl, embedUrl: googleSlidesEmbedUrl, providerLabel: 'Google Slides', isKnownProvider: true };
	}

	if (hostname === 'drive.google.com' && /^\/file\/d\/[^/]+\/(?:preview|view)\/?$/.test(url.pathname)) {
		const driveMatch = url.pathname.match(/^\/file\/d\/([^/]+)/);

		return driveMatch?.[1]
			? {
					sourceUrl,
					embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
					providerLabel: 'Google Drive',
					isKnownProvider: true
				}
			: null;
	}

	const providers = [
		{ label: 'Canva', embedUrl: getCanvaEmbedUrl(url) },
		{ label: 'Figma', embedUrl: getFigmaEmbedUrl(url) },
		{ label: 'Facebook', embedUrl: getFacebookEmbedUrl(url) },
		{ label: 'Instagram', embedUrl: getInstagramEmbedUrl(url) },
		{ label: 'Vimeo', embedUrl: getVimeoEmbedUrl(url) },
		{ label: 'LinkedIn', embedUrl: getLinkedInEmbedUrl(url) }
	];
	const provider = providers.find(candidate => candidate.embedUrl);

	return {
		sourceUrl,
		embedUrl: provider?.embedUrl ?? sourceUrl,
		providerLabel: provider?.label ?? new URL(sourceUrl).hostname.replace(/^www\./, ''),
		isKnownProvider: Boolean(provider)
	};
};

export const getSafePresentationViewerUrl = (value: string) => {
	const sourceUrl = getSafeExternalUrl(value);

	if (!sourceUrl) {
		return '';
	}

	const googleSlidesEmbedUrl = getGoogleSlidesEmbedUrl(sourceUrl);

	if (googleSlidesEmbedUrl) {
		return googleSlidesEmbedUrl;
	}

	return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(sourceUrl)}`;
};

export const getSafeIframeUrl = (value: string) => {
	const resource = getEmbeddableResource(value);

	return resource?.isKnownProvider ? resource.embedUrl : '';
};
