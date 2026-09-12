'use client';

import { Box, Text } from '@chakra-ui/react';

import { getSafePresentationViewerUrl } from '~/lib/components/learning/lesson-content/lesson-content-urls';

type PresentationPreviewProps = {
	url: string;
	title?: string;
};

export const PresentationPreview = ({ url, title = 'Lesson PPT' }: PresentationPreviewProps) => {
	const viewerUrl = getSafePresentationViewerUrl(url);

	if (!viewerUrl) {
		return (
			<Box border="1px solid" borderColor="red.300" borderRadius="lg" bg="red.50" p={4}>
				<Text color="red.700" fontSize="sm">
					This presentation is missing a valid URL.
				</Text>
			</Box>
		);
	}

	return (
		<Box border="1px solid" borderColor="border.default" borderRadius="lg" bg="bg.card" overflow="hidden">
			<Box
				position="relative"
				h={{ base: 'min(64dvh, 560px)', md: '680px' }}
				minH={{ base: '360px', md: '560px' }}
				bg="white"
			>
				<iframe
					src={viewerUrl}
					title={title}
					loading="lazy"
					allowFullScreen
					referrerPolicy="strict-origin-when-cross-origin"
					sandbox="allow-forms allow-same-origin allow-scripts"
					style={{ border: 0, height: '100%', width: '100%' }}
				/>
			</Box>
		</Box>
	);
};
