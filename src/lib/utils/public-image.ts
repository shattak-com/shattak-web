import type { ImageLoaderProps } from 'next/image';

// Leave third-party, signed, document, and already-transformed URLs intact.
// Only unsigned, versioned Cloudinary image uploads use this delivery loader.
export const isOptimizablePublicImage = (source: string) => {
	try {
		const url = new URL(source);
		return (
			url.protocol === 'https:' &&
			url.hostname === 'res.cloudinary.com' &&
			!url.username &&
			!url.password &&
			!url.search &&
			!url.hash &&
			/^\/[^/]+\/image\/upload\/v\d+\/.+\.(?:avif|webp|png|jpe?g)$/i.test(url.pathname)
		);
	} catch {
		return false;
	}
};

export const publicImageLoader = ({ src, width }: ImageLoaderProps) => {
	if (!isOptimizablePublicImage(src) || !Number.isFinite(width)) return src;
	const safeWidth = Math.max(32, Math.min(1920, Math.round(width)));
	return src.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${safeWidth}/`);
};

export default publicImageLoader;
