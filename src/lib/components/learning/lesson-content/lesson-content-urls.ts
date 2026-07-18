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

export const getSafePresentationViewerUrl = (value: string) => {
	const sourceUrl = getSafeExternalUrl(value);

	if (!sourceUrl) {
		return '';
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

		if (hostname === 'player.vimeo.com' && /^\/video\/\d+\/?$/.test(url.pathname)) {
			return url.toString();
		}

		if (hostname === 'docs.google.com' && /\/(embed|preview)\/?$/.test(url.pathname)) {
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
