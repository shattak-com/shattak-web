import Image from 'next/image';

import ExperienceVideo from '~/lib/components/media/ExperienceVideo';

type HeroMediaProps = {
	prefersReducedMotion: boolean | null;
};

const HeroMedia = ({ prefersReducedMotion }: HeroMediaProps) => {
	const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim() ?? '';
	const shouldAutoplay = prefersReducedMotion === false;

	return (
		<ExperienceVideo
			autoplay={shouldAutoplay}
			videoUrl={videoUrl}
			title="Shattak learning experience video"
			fallback={<Image src="/illustrations/hero.svg" alt="Live class preview" width={640} height={560} priority />}
		/>
	);
};

export default HeroMedia;
