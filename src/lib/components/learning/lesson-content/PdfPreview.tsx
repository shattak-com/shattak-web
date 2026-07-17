'use client';

import { Box, Flex, Text } from '@chakra-ui/react';

type PdfPreviewProps = {
	url: string;
	height?: string | number;
	title?: string;
};

const getPreviewHeight = (height: PdfPreviewProps['height']) => {
	const numericHeight = typeof height === 'number' ? height : Number.parseInt(height ?? '', 10);

	if (!Number.isFinite(numericHeight)) {
		return 640;
	}

	return Math.min(Math.max(numericHeight, 420), 900);
};

export const PdfPreview = ({ url, height, title = 'PDF lesson resource' }: PdfPreviewProps) => {
	const previewHeight = getPreviewHeight(height);
	const previewUrl = `${url.split('#')[0]}#toolbar=0&navpanes=0&scrollbar=1`;

	return (
		<Box border="1px solid" borderColor="border.default" borderRadius="lg" bg="bg.card" my={4} overflow="hidden">
			<Flex align="center" gap={3} borderBottom="1px solid" borderColor="border.default" px={{ base: 3, md: 4 }} py={3}>
				<Text color="text.primary" fontSize="sm" fontWeight="semibold">
					{title}
				</Text>
			</Flex>

			<Box h={{ base: '65vh', md: `${previewHeight}px` }} minH="420px" bg="white">
				<iframe
					src={previewUrl}
					title={title}
					loading="lazy"
					referrerPolicy="strict-origin-when-cross-origin"
					style={{ border: 0, height: '100%', width: '100%' }}
				/>
			</Box>
		</Box>
	);
};
