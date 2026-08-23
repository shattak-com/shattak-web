import { AspectRatio } from '@chakra-ui/react';
import Image from 'next/image';

import { getYouTubeVideoId } from '~/lib/components/learning/lesson-content/lesson-content-urls';

type HeroMediaProps = {
	prefersReducedMotion: boolean | null;
};

const getMuxPlayerUrl = (value: string, shouldAutoplay: boolean) => {
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

		playerUrl.searchParams.set('autoplay', shouldAutoplay ? 'muted' : 'false');
		playerUrl.searchParams.set('muted', 'true');
		playerUrl.searchParams.set('loop', 'true');

		return playerUrl.toString();
	} catch {
		return null;
	}
};

const isDirectVideoUrl = (value: string) => /^https?:\/\/.+\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(value);

const HeroMedia = ({ prefersReducedMotion }: HeroMediaProps) => {
	const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim() ?? '';
	const shouldAutoplay = prefersReducedMotion === false;
	const youtubeVideoId = getYouTubeVideoId(videoUrl);
	const muxPlayerUrl = getMuxPlayerUrl(videoUrl, shouldAutoplay);

	if (youtubeVideoId) {
		const params = new URLSearchParams({
			autoplay: shouldAutoplay ? '1' : '0',
			controls: '1',
			loop: '1',
			mute: '1',
			playlist: youtubeVideoId,
			playsinline: '1',
			rel: '0'
		});

		return (
			<AspectRatio ratio={16 / 9} overflow="hidden" borderRadius="panel">
				<iframe
					src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?${params.toString()}`}
					title="Shattak learning experience video"
					allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				/>
			</AspectRatio>
		);
	}

	if (muxPlayerUrl) {
		return (
			<AspectRatio ratio={16 / 9} overflow="hidden" borderRadius="panel">
				<iframe
					src={muxPlayerUrl}
					title="Shattak learning experience video"
					allow="autoplay; encrypted-media; picture-in-picture"
					allowFullScreen
				/>
			</AspectRatio>
		);
	}

	if (isDirectVideoUrl(videoUrl)) {
		return (
			<AspectRatio ratio={16 / 9} overflow="hidden" borderRadius="panel" bg="black">
				<video
					src={videoUrl}
					autoPlay={shouldAutoplay}
					muted
					loop
					playsInline
					controls
					preload="metadata"
					aria-label="Shattak learning experience video"
					style={{ width: '100%', height: '100%', objectFit: 'cover' }}
				/>
			</AspectRatio>
		);
	}

	return <Image src="/illustrations/hero.svg" alt="Live class preview" width={640} height={560} priority />;
};

export default HeroMedia;
