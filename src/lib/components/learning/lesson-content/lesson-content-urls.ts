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

		return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : '';
	} catch {
		return '';
	}
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
	const videoId = getYouTubeVideoId(value);

	if (videoId) {
		return `https://www.youtube-nocookie.com/embed/${videoId}`;
	}

	try {
		const url = new URL(value);
		const hostname = url.hostname.replace(/^www\./, '');
		const googleSlidesEmbedUrl = getGoogleSlidesEmbedUrl(url.toString());

		if (googleSlidesEmbedUrl) {
			return googleSlidesEmbedUrl;
		}

		if (hostname === 'player.vimeo.com' && /^\/video\/\d+\/?$/.test(url.pathname)) {
			return url.toString();
		}

		if (hostname === 'drive.google.com' && /^\/file\/d\/[^/]+\/preview\/?$/.test(url.pathname)) {
			return url.toString();
		}

		return '';
	} catch {
		return '';
	}
};
