import { Box, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { FiFileText } from 'react-icons/fi';

import type { CourseLessonContentBlock } from '~/lib/api/enrollments';
import { getSafeExternalUrl, getYouTubeVideoId } from '~/lib/components/learning/lesson-content/lesson-content-urls';
import { LessonMarkdownContent } from '~/lib/components/learning/lesson-content/LessonMarkdownContent';
import { PdfPreview } from '~/lib/components/learning/lesson-content/PdfPreview';
import { PresentationPreview } from '~/lib/components/learning/lesson-content/PresentationPreview';

import { workspaceBoundaryColor } from './constants';

const LessonResourceCard = ({
	block,
	label,
	children
}: {
	block: CourseLessonContentBlock;
	label: string;
	children?: ReactNode;
}) => {
	const safeUrl = getSafeExternalUrl(block.url);

	return (
		<Box border="1px solid" borderColor={workspaceBoundaryColor} borderRadius="card" bg="bg.card" overflow="hidden">
			<Stack gap={4} p={{ base: 4, md: 5 }}>
				<HStack gap={4} align="start">
					<HStack gap={3} minW={0}>
						<Box
							boxSize="42px"
							borderRadius="lg"
							bg="bg.subtle"
							color="primary"
							display="grid"
							flexShrink={0}
							placeItems="center"
						>
							<FiFileText />
						</Box>
						<Box minW={0}>
							<Text color="text.muted" fontSize="xs" fontWeight="bold" textTransform="uppercase">
								{label}
							</Text>
							<Heading mt={1} size="sm" lineClamp={2}>
								{block.title || block.fileName || label}
							</Heading>
						</Box>
					</HStack>
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
	<Box border="1px solid" borderColor={workspaceBoundaryColor} borderRadius="card" bg="bg.card" p={{ base: 5, md: 7 }}>
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
		<LessonResourceCard block={block} label="YouTube video">
			{videoId ? (
				<Box aspectRatio="16 / 9" borderRadius="lg" overflow="hidden" bg="black">
					<iframe
						title={block.title || 'YouTube lesson video'}
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
		<LessonResourceCard block={block} label="Uploaded video">
			{safeUrl ? (
				<>
					{/* eslint-disable-next-line jsx-a11y/media-has-caption */}
					<video
						controls
						controlsList="nodownload noremoteplayback"
						disablePictureInPicture
						disableRemotePlayback
						draggable={false}
						onContextMenu={event => event.preventDefault()}
						src={safeUrl}
						style={{
							background: '#000',
							borderRadius: 'var(--chakra-radii-lg)',
							maxHeight: '520px',
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
		<LessonResourceCard block={block} label={block.type === 'PDF_UPLOAD' ? 'Uploaded PDF' : 'PDF link'}>
			{safeUrl ? <PdfPreview url={safeUrl} height={560} title={block.title || 'PDF lesson resource'} /> : null}
		</LessonResourceCard>
	);
};

const PresentationLessonBlock = ({ block }: { block: CourseLessonContentBlock }) => {
	const safeUrl = getSafeExternalUrl(block.url);
	const label = block.type === 'PPT_UPLOAD' ? 'Uploaded presentation' : 'Presentation link';

	return (
		<LessonResourceCard block={block} label={label}>
			{safeUrl ? (
				<PresentationPreview url={safeUrl} title={block.title || block.fileName || 'Course presentation'} />
			) : null}
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
