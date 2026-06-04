import { Box, HStack, Text } from '@chakra-ui/react';

import type { AdminCurriculumContentBlockType } from '~/lib/api/admin-curriculum';

import { getYouTubeVideoId, isValidUrl } from './utils';

const getLinkPreviewLabel = (type: AdminCurriculumContentBlockType) => {
	if (type === 'PDF_LINK') {
		return 'PDF link';
	}

	if (type === 'PPT_LINK') {
		return 'Presentation link';
	}

	if (type === 'VIDEO_YOUTUBE') {
		return 'YouTube video';
	}

	return 'Linked content';
};

const isSafeYouTubeVideoId = (value: string) => /^[A-Za-z0-9_-]{6,}$/.test(value);

export const CurriculumLinkPreview = ({
	type,
	url,
	title
}: {
	type: AdminCurriculumContentBlockType;
	url: string;
	title?: string;
}) => {
	const trimmedUrl = url.trim();

	if (!trimmedUrl) {
		return null;
	}

	const isSafeUrl = isValidUrl(trimmedUrl);
	const linkLabel = getLinkPreviewLabel(type);
	const displayTitle = title?.trim() || linkLabel;

	if (!isSafeUrl) {
		return (
			<Box border="1px solid" borderColor="red.300" borderRadius="lg" bg="bg.subtle" p={3}>
				<Text fontSize="sm" fontWeight="semibold" color="red.500">
					Invalid or incomplete link
				</Text>
				<Text mt={1} fontSize="xs" color="text.muted" wordBreak="break-word">
					{trimmedUrl}
				</Text>
			</Box>
		);
	}

	if (type === 'VIDEO_YOUTUBE') {
		const videoId = getYouTubeVideoId(trimmedUrl);
		const canEmbed = videoId && isSafeYouTubeVideoId(videoId);

		if (!canEmbed) {
			return (
				<Box border="1px solid" borderColor="red.300" borderRadius="lg" bg="bg.subtle" p={3}>
					<Text fontSize="sm" fontWeight="semibold" color="red.500">
						Unsupported YouTube link
					</Text>
					<Text mt={1} fontSize="xs" color="text.muted" wordBreak="break-word">
						Use a standard YouTube watch, short, live, embed, or youtu.be link.
					</Text>
				</Box>
			);
		}

		return (
			<Box border="1px solid" borderColor="border.default" borderRadius="lg" bg="bg.subtle" overflow="hidden">
				<iframe
					src={`https://www.youtube-nocookie.com/embed/${videoId}`}
					title={displayTitle}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowFullScreen
					style={{
						aspectRatio: '16 / 9',
						border: 0,
						display: 'block',
						width: '100%'
					}}
				/>
				<HStack justify="space-between" gap={3} flexWrap="wrap" p={3}>
					<Box minW={0}>
						<Text fontSize="sm" fontWeight="semibold">
							{displayTitle}
						</Text>
						<Text fontSize="xs" color="text.muted">
							YouTube preview
						</Text>
					</Box>
					<a
						href={trimmedUrl}
						target="_blank"
						rel="noreferrer"
						style={{
							color: 'var(--chakra-colors-primary)',
							fontSize: '12px',
							fontWeight: 600
						}}
					>
						Open preview
					</a>
				</HStack>
			</Box>
		);
	}

	return (
		<Box border="1px solid" borderColor="border.default" borderRadius="lg" bg="bg.subtle" p={3}>
			<HStack justify="space-between" gap={3} align="start" flexWrap="wrap">
				<Box minW={0}>
					<Text fontSize="sm" fontWeight="semibold">
						{displayTitle}
					</Text>
					<Text fontSize="xs" color="text.muted">
						{linkLabel}
					</Text>
					<Text mt={2} fontSize="xs" color="text.muted" wordBreak="break-word">
						{trimmedUrl}
					</Text>
				</Box>
				<a
					href={trimmedUrl}
					target="_blank"
					rel="noreferrer"
					style={{
						color: 'var(--chakra-colors-primary)',
						fontSize: '12px',
						fontWeight: 600
					}}
				>
					Open preview
				</a>
			</HStack>
		</Box>
	);
};
