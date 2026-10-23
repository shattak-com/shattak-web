'use client';

import Image, { type ImageProps } from 'next/image';

import { isOptimizablePublicImage, publicImageLoader } from '~/lib/utils/public-image';

// Preserve the existing layout and avoid routing remote images through Netlify.
const PublicImage = ({ src, unoptimized, ...props }: ImageProps) => (
	<Image
		{...props}
		src={src}
		loader={publicImageLoader}
		unoptimized={unoptimized || typeof src !== 'string' || !isOptimizablePublicImage(src)}
	/>
);

export default PublicImage;
