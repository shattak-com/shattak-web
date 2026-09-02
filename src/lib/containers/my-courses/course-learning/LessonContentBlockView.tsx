import { Box, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { FiFileText, FiMonitor, FiPlayCircle } from 'react-icons/fi';

import type { CourseLessonContentBlock } from '~/lib/api/enrollments';
import { getSafeExternalUrl, getYouTubeVideoId } from '~/lib/components/learning/lesson-content/lesson-content-urls';
import { LessonMarkdownContent } from '~/lib/components/learning/lesson-content/LessonMarkdownContent';
import { PdfPreview } from '~/lib/components/learning/lesson-content/PdfPreview';
import { PresentationPreview } from '~/lib/components/learning/lesson-content/PresentationPreview';

import { workspaceBoundaryColor } from './constants';

const LessonResourceCard = ({
	block,
	fallbackTitle,
	icon,
	children
}: {
	block: CourseLessonContentBlock;
	fallbackTitle: string;
	icon: ReactNode;
	children?: ReactNode;
}) => {
	const safeUrl = getSafeExternalUrl(block.url);
	const displayTitle = block.title.trim() || fallbackTitle;

	return (
		<Box border="1px solid" borderColor={workspaceBoundaryColor} borderRadius="card" bg="bg.card" overflow="hidden">
			<Stack gap={{ base: 3, md: 4 }} p={{ base: 4, md: 5 }}>
				<HStack gap={3} minW={0} align="center">
					<Box
						boxSize="42px"
						borderRadius="lg"
						bg="bg.subtle"
						color="primary"
						display="grid"
						flexShrink={0}
						fontSize="xl"
						placeItems="center"
						aria-hidden="true"
					>
						{icon}
					</Box>
					<Heading size="sm" lineClamp={2}>
						{displayTitle}
					</Heading>
				</HStack>
				{children}
				{!safeUrl ? (
					<Text color="red.500" fontSize="sm">
						This resource is missing a valid URL.
					</Text>
				) : null}
			</Stack>
		</Box>
	);
};

const TextLessonBlock = ({ block }: { block: CourseLessonContentBlock }) => (
	<Box border="1px solid" borderColor={workspaceBoundaryColor} borderRadius="card" bg="bg.card" p={{ base: 4, md: 7 }}>
		{block.title ? (
			<Heading size="md" mb={4}>
				{block.title}
			</Heading>
		) : null}
		<LessonMarkdownContent value={block.body} />
	</Box>
);

const YouTubeLessonBlock = ({ block }: { block: CourseLessonContentBlock }) => {
	const videoId = getYouTubeVideoId(block.url);

	return (
		<LessonResourceCard block={block} fallbackTitle="Lesson Video" icon={<FiPlayCircle />}>
			{videoId ? (
				<Box aspectRatio="16 / 9" borderRadius="lg" overflow="hidden" bg="black">
					<iframe
						title={block.title.trim() || 'Lesson Video'}
						src={`https://www.youtube-nocookie.com/embed/${videoId}`}
						allow="accelerometer; autoplay; encrypted-media; gyroscope"
						allowFullScreen
						sandbox="allow-scripts allow-same-origin allow-presentation"
						style={{ border: 0, height: '100%', width: '100%' }}
					/>
				</Box>
			) : (
				<Text color="red.500" fontSize="sm">
					Enter a valid YouTube URL to preview this video.
				</Text>
			)}
		</LessonResourceCard>
	);
};

const UploadedVideoLessonBlock = ({ block }: { block: CourseLessonContentBlock }) => {
	const safeUrl = getSafeExternalUrl(block.url);

	return (
		<LessonResourceCard block={block} fallbackTitle="Lesson Video" icon={<FiPlayCircle />}>
			{safeUrl ? (
				<>
					{/* eslint-disable-next-line jsx-a11y/media-has-caption */}
					<video
						controls
						controlsList="nodownload noremoteplayback"
						disablePictureInPicture
						disableRemotePlayback
						draggable={false}
						playsInline
						preload="metadata"
						onContextMenu={event => event.preventDefault()}
						src={safeUrl}
						style={{
							background: '#000',
							borderRadius: 'var(--chakra-radii-lg)',
							maxHeight: 'min(70dvh, 520px)',
							width: '100%'
						}}
					/>
				</>
			) : null}
		</LessonResourceCard>
	);
};

const PdfLessonBlock = ({ block }: { block: CourseLessonContentBlock }) => {
	const safeUrl = getSafeExternalUrl(block.url);

	return (
		<LessonResourceCard block={block} fallbackTitle="Lesson PDF" icon={<FiFileText />}>
			{safeUrl ? <PdfPreview url={safeUrl} height={560} title={block.title.trim() || 'Lesson PDF'} /> : null}
		</LessonResourceCard>
	);
};

const PresentationLessonBlock = ({ block }: { block: CourseLessonContentBlock }) => {
	const safeUrl = getSafeExternalUrl(block.url);

	return (
		<LessonResourceCard block={block} fallbackTitle="Lesson PPT" icon={<FiMonitor />}>
			{safeUrl ? <PresentationPreview url={safeUrl} title={block.title.trim() || 'Lesson PPT'} /> : null}
		</LessonResourceCard>
	);
};

export const LessonContentBlockView = ({ block }: { block: CourseLessonContentBlock }) => {
	switch (block.type) {
		case 'TEXT':
			return <TextLessonBlock block={block} />;
		case 'VIDEO_YOUTUBE':
			return <YouTubeLessonBlock block={block} />;
		case 'VIDEO_UPLOAD':
			return <UploadedVideoLessonBlock block={block} />;
		case 'PDF_UPLOAD':
		case 'PDF_LINK':
			return <PdfLessonBlock block={block} />;
		case 'PPT_UPLOAD':
		case 'PPT_LINK':
			return <PresentationLessonBlock block={block} />;
		default:
			return null;
	}
};
