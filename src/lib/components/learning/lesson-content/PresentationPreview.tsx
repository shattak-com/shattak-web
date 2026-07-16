'use client';

import { Box, Flex, Spinner, Text } from '@chakra-ui/react';
import { useState } from 'react';

import { getSafePresentationViewerUrl } from '~/lib/components/learning/lesson-content/lesson-content-urls';

type PresentationPreviewProps = {
	url: string;
	title?: string;
};

export const PresentationPreview = ({ url, title = 'Course presentation' }: PresentationPreviewProps) => {
	const [isLoading, setIsLoading] = useState(true);
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
			<Flex
				align="center"
				justify="space-between"
				gap={3}
				borderBottom="1px solid"
				borderColor="border.default"
				px={{ base: 3, md: 4 }}
				py={3}
			>
				<Box minW={0}>
					<Text color="text.primary" fontSize="sm" fontWeight="semibold" lineClamp={1}>
						{title}
					</Text>
					<Text color="text.muted" fontSize="xs">
						Presentation preview
					</Text>
				</Box>
				{isLoading ? (
					<Flex align="center" gap={2} color="text.muted" flexShrink={0}>
						<Spinner size="xs" />
						<Text fontSize="xs">Loading presentation</Text>
					</Flex>
				) : null}
			</Flex>

			<Box position="relative" h={{ base: '62vh', md: '680px' }} minH={{ base: '420px', md: '560px' }} bg="white">
				<iframe
					src={viewerUrl}
					title={title}
					loading="lazy"
					allowFullScreen
					referrerPolicy="strict-origin-when-cross-origin"
					sandbox="allow-forms allow-popups allow-same-origin allow-scripts"
					onLoad={() => setIsLoading(false)}
					style={{ border: 0, height: '100%', width: '100%' }}
				/>
			</Box>
		</Box>
	);
};
