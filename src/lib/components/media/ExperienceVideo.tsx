import { AspectRatio } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import { getYouTubeVideoId } from '~/lib/components/learning/lesson-content/lesson-content-urls';

type ExperienceVideoProps = {
	autoplay?: boolean;
	fallback: ReactNode;
	title: string;
	videoUrl: string;
};

const getMuxPlayerUrl = (value: string, autoplay: boolean) => {
	try {
		const sourceUrl = new URL(value);
		const hostname = sourceUrl.hostname.toLowerCase();
		let playerUrl: URL;

		if (hostname === 'player.mux.com') {
			playerUrl = sourceUrl;
		} else if (hostname === 'stream.mux.com') {
			const playbackId = sourceUrl.pathname
				.split('/')
				.filter(Boolean)[0]
				?.replace(/\.(m3u8|mp4)$/i, '');
			if (!playbackId) {
				return null;
			}

			playerUrl = new URL(`https://player.mux.com/${playbackId}`);
			sourceUrl.searchParams.forEach((parameterValue, parameterName) => {
				playerUrl.searchParams.set(parameterName, parameterValue);
			});
		} else {
			return null;
		}

		playerUrl.searchParams.set('autoplay', autoplay ? 'muted' : 'false');
		playerUrl.searchParams.set('muted', 'true');
		playerUrl.searchParams.set('loop', 'true');

		return playerUrl.toString();
	} catch {
		return null;
	}
};

const isDirectVideoUrl = (value: string) => /^https?:\/\/.+\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(value);

const ExperienceVideo = ({ autoplay = false, fallback, title, videoUrl }: ExperienceVideoProps) => {
	const normalizedVideoUrl = videoUrl.trim();
	const youtubeVideoId = getYouTubeVideoId(normalizedVideoUrl);
	const muxPlayerUrl = getMuxPlayerUrl(normalizedVideoUrl, autoplay);

	if (youtubeVideoId) {
		const params = new URLSearchParams({
			autoplay: autoplay ? '1' : '0',
			controls: '1',
			loop: '1',
			mute: '1',
			playlist: youtubeVideoId,
			playsinline: '1',
			rel: '0'
		});

		return (
			<AspectRatio ratio={16 / 9} overflow="hidden" borderRadius="panel" bg="black">
				<iframe
					src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?${params.toString()}`}
					title={title}
					allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				/>
			</AspectRatio>
		);
	}

	if (muxPlayerUrl) {
		return (
			<AspectRatio ratio={16 / 9} overflow="hidden" borderRadius="panel" bg="black">
				<iframe
					src={muxPlayerUrl}
					title={title}
					allow="autoplay; encrypted-media; picture-in-picture"
					allowFullScreen
				/>
			</AspectRatio>
		);
	}

	if (isDirectVideoUrl(normalizedVideoUrl)) {
		return (
			<AspectRatio ratio={16 / 9} overflow="hidden" borderRadius="panel" bg="black">
				<video
					src={normalizedVideoUrl}
					autoPlay={autoplay}
					muted
					loop
					playsInline
					controls
					preload="metadata"
					aria-label={title}
					style={{ width: '100%', height: '100%', objectFit: 'cover' }}
				/>
			</AspectRatio>
		);
	}

	return fallback;
};

export default ExperienceVideo;
