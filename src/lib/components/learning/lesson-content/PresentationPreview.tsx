'use client';

import { Box, Button, Flex, Spinner, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { FiExternalLink } from 'react-icons/fi';

import {
	getSafeExternalUrl,
	getSafePresentationViewerUrl
} from '~/lib/components/learning/lesson-content/lesson-content-urls';

type PresentationPreviewProps = {
	url: string;
	title?: string;
};

export const PresentationPreview = ({ url, title = 'Lesson PPT' }: PresentationPreviewProps) => {
	const [isLoading, setIsLoading] = useState(true);
	const sourceUrl = getSafeExternalUrl(url);
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
				<Flex align="center" gap={2} color="text.muted" minW={0}>
					{isLoading ? <Spinner size="xs" flexShrink={0} /> : null}
					<Text fontSize="xs" lineClamp={1}>
						{isLoading ? 'Loading presentation' : 'Presentation ready'}
					</Text>
				</Flex>
				<Button asChild size="sm" variant="outline" borderRadius="full" flexShrink={0}>
					<a href={sourceUrl} target="_blank" rel="noreferrer">
						<FiExternalLink aria-hidden="true" />
						Open presentation
					</a>
				</Button>
			</Flex>

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
					onLoad={() => setIsLoading(false)}
					style={{ border: 0, height: '100%', width: '100%' }}
				/>
			</Box>
		</Box>
	);
};
