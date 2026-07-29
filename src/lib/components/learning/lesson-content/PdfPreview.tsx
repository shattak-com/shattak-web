'use client';

import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';

import { trackCourseDashboardEvent } from '~/lib/analytics/mixpanel';

type PdfPreviewProps = {
	url: string;
	height?: string | number;
	title?: string;
};

const getPreviewHeight = (height: PdfPreviewProps['height']) => {
	const numericHeight = typeof height === 'number' ? height : Number.parseInt(height ?? '', 10);

	if (!Number.isFinite(numericHeight)) {
		return 760;
	}

	return Math.min(Math.max(numericHeight, 620), 900);
};

export const PdfPreview = ({ url, height, title = 'PDF lesson resource' }: PdfPreviewProps) => {
	const [isFullScreen, setIsFullScreen] = useState(false);
	const previewHeight = getPreviewHeight(height);
	const previewUrl = `${url.split('#')[0]}#toolbar=0&navpanes=0&scrollbar=1`;

	const updateFullScreen = useCallback((isExpanded: boolean, interaction: 'button' | 'escape') => {
		setIsFullScreen(isExpanded);
		trackCourseDashboardEvent({
			eventName: 'course_pdf_viewer_toggled',
			displayMode: isExpanded ? 'fullscreen' : 'standard',
			expanded: isExpanded,
			interaction,
			resourceType: 'pdf',
			sourcePage: 'course_learning'
		});
	}, []);

	useEffect(() => {
		if (!isFullScreen) {
			return undefined;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				updateFullScreen(false, 'escape');
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isFullScreen, updateFullScreen]);

	return (
		<Box
			position={isFullScreen ? 'fixed' : 'relative'}
			inset={isFullScreen ? 0 : undefined}
			zIndex={isFullScreen ? 1800 : undefined}
			display="flex"
			flexDirection="column"
			h={isFullScreen ? '100dvh' : undefined}
			border="1px solid"
			borderColor="border.default"
			borderRadius={isFullScreen ? 0 : 'lg'}
			bg="bg.card"
			my={isFullScreen ? 0 : 4}
			overflow="hidden"
		>
			<Flex
				flexShrink={0}
				align="center"
				justify="space-between"
				gap={3}
				borderBottom="1px solid"
				borderColor="border.default"
				px={{ base: 3, md: 4 }}
				py={3}
			>
				<Text minW={0} color="text.primary" fontSize="sm" fontWeight="semibold" lineClamp={1}>
					{title}
				</Text>
				<Button
					type="button"
					flexShrink={0}
					size="sm"
					variant="outline"
					borderRadius="full"
					aria-expanded={isFullScreen}
					aria-label={isFullScreen ? 'Exit PDF full screen' : 'Open PDF in full screen'}
					onClick={() => updateFullScreen(!isFullScreen, 'button')}
				>
					{isFullScreen ? <FiMinimize2 aria-hidden="true" /> : <FiMaximize2 aria-hidden="true" />}
					{isFullScreen ? 'Exit full screen' : 'Full screen'}
				</Button>
			</Flex>

			<Box
				flex={isFullScreen ? 1 : undefined}
				h={
					isFullScreen
						? undefined
						: {
								base: 'min(68dvh, 560px)',
								md: `clamp(620px, 72dvh, ${Math.max(previewHeight, 860)}px)`
							}
				}
				minH={isFullScreen ? 0 : { base: '360px', md: '620px' }}
				bg="white"
			>
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
