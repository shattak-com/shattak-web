import { Badge, Box, Button, HStack, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import type {
	AdminCurriculumContentBlock,
	AdminCurriculumContentBlockType,
	AdminCurriculumContentVisibility,
	AdminCurriculumSubsection
} from '~/lib/api/admin-curriculum';

import {
	contentBlockTypeOptions,
	getUploadAccept,
	linkedBlockTypes,
	uploadBlockTypes,
	visibilityOptions
} from './constants';
import { CurriculumLinkPreview } from './CurriculumLinkPreview';
import { FieldLabel, SelectInput } from './FormControls';
import type { MediaUploadHandler, UpdateContentBlock, UpdateSubsection } from './types';
import { createContentBlock, formatBytes, isValidUrl, moveItem } from './utils';

type CurriculumContentBlockEditorProps = {
	moduleIndex: number;
	subsectionIndex: number;
	subsection: AdminCurriculumSubsection;
	block: AdminCurriculumContentBlock;
	blockIndex: number;
	uploadingBlockKey: string | null;
	onUpdateSubsection: UpdateSubsection;
	onUpdateContentBlock: UpdateContentBlock;
	onRequestRemoveContentBlock: (moduleIndex: number, subsectionIndex: number, blockIndex: number) => void;
	onMediaUpload: MediaUploadHandler;
};

type BlockContext = Pick<CurriculumContentBlockEditorProps, 'moduleIndex' | 'subsectionIndex' | 'blockIndex'>;

type BlockUpdateContext = BlockContext & {
	block: AdminCurriculumContentBlock;
	onUpdateContentBlock: UpdateContentBlock;
};

type BlockHeaderProps = BlockContext & {
	block: AdminCurriculumContentBlock;
	subsection: AdminCurriculumSubsection;
	onUpdateSubsection: UpdateSubsection;
	onRequestRemoveContentBlock: (moduleIndex: number, subsectionIndex: number, blockIndex: number) => void;
};

const getBlockTypeLabel = (blockType: AdminCurriculumContentBlockType) =>
	contentBlockTypeOptions.find(option => option.value === blockType)?.label ?? 'Content';

const BlockHeader = ({
	block,
	blockIndex,
	subsection,
	moduleIndex,
	subsectionIndex,
	onUpdateSubsection,
	onRequestRemoveContentBlock
}: BlockHeaderProps) => (
	<HStack justify="space-between" gap={3} flexWrap="wrap">
		<HStack gap={2} flexWrap="wrap">
			<Badge colorPalette="purple">Block {blockIndex + 1}</Badge>
			<Badge colorPalette={block.visibility === 'PUBLIC_PREVIEW' ? 'green' : 'orange'}>
				{block.visibility === 'PUBLIC_PREVIEW' ? 'Public preview' : 'Enrolled only'}
			</Badge>
			<Text fontSize="sm" fontWeight="semibold">
				{getBlockTypeLabel(block.type)}
			</Text>
		</HStack>
		<HStack gap={2}>
			<Button
				type="button"
				size="xs"
				variant="outline"
				borderRadius="full"
				disabled={blockIndex === 0}
				onClick={() =>
					onUpdateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
						...currentSubsection,
						contentBlocks: moveItem(currentSubsection.contentBlocks, blockIndex, blockIndex - 1)
					}))
				}
			>
				Move up
			</Button>
			<Button
				type="button"
				size="xs"
				variant="outline"
				borderRadius="full"
				disabled={blockIndex === subsection.contentBlocks.length - 1}
				onClick={() =>
					onUpdateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
						...currentSubsection,
						contentBlocks: moveItem(currentSubsection.contentBlocks, blockIndex, blockIndex + 1)
					}))
				}
			>
				Move down
			</Button>
			<Button
				type="button"
				size="xs"
				variant="outline"
				borderRadius="full"
				color="red.500"
				onClick={() => onRequestRemoveContentBlock(moduleIndex, subsectionIndex, blockIndex)}
			>
				Remove
			</Button>
		</HStack>
	</HStack>
);

const BlockMetadataFields = ({
	moduleIndex,
	subsectionIndex,
	blockIndex,
	block,
	onUpdateContentBlock
}: BlockUpdateContext) => (
	<SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
		<Box>
			<FieldLabel>Content type</FieldLabel>
			<SelectInput
				value={block.type}
				options={contentBlockTypeOptions}
				onChange={value =>
					onUpdateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
						...createContentBlock(value as AdminCurriculumContentBlockType),
						id: currentBlock.id,
						visibility: currentBlock.visibility,
						title: currentBlock.title
					}))
				}
			/>
		</Box>
		<Box>
			<FieldLabel>Visibility</FieldLabel>
			<SelectInput
				value={block.visibility}
				options={visibilityOptions}
				onChange={value =>
					onUpdateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
						...currentBlock,
						visibility: value as AdminCurriculumContentVisibility
					}))
				}
			/>
		</Box>
		<Box>
			<FieldLabel>Title</FieldLabel>
			<Input
				value={block.title}
				onChange={event => {
					const nextTitle = event.currentTarget.value ?? '';

					onUpdateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
						...currentBlock,
						title: nextTitle
					}));
				}}
				placeholder="Optional block title"
			/>
		</Box>
	</SimpleGrid>
);

const TextBlockEditor = ({
	moduleIndex,
	subsectionIndex,
	blockIndex,
	block,
	onUpdateContentBlock
}: BlockUpdateContext) => {
	const [isTextExpanded, setIsTextExpanded] = useState(false);
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

	useEffect(() => {
		if (block.type !== 'TEXT') {
			setIsTextExpanded(false);
		}
	}, [block.type]);

	if (block.type !== 'TEXT') {
		return null;
	}

	return (
		<Box
			position={isTextExpanded ? 'fixed' : 'relative'}
			inset={isTextExpanded ? { base: 3, md: 5 } : undefined}
			zIndex={isTextExpanded ? 1500 : 'auto'}
			bg="bg.card"
			border={isTextExpanded ? '1px solid' : '0'}
			borderColor="border.default"
			borderRadius={isTextExpanded ? 'xl' : '0'}
			boxShadow={isTextExpanded ? '2xl' : 'none'}
			p={isTextExpanded ? { base: 4, md: 5 } : 0}
			display="flex"
			flexDirection="column"
			gap={3}
		>
			<HStack justify="space-between" gap={3} flexWrap="wrap">
				<Box>
					<FieldLabel>Text content</FieldLabel>
					{isTextExpanded ? (
						<Text fontSize="xs" color="text.muted">
							Expanded writing mode. Your unsaved content stays in this block.
						</Text>
					) : null}
				</Box>
				<Button
					type="button"
					size="xs"
					variant="outline"
					borderRadius="full"
					onClick={() => {
						setIsTextExpanded(currentValue => !currentValue);
						window.setTimeout(() => textAreaRef.current?.focus(), 0);
					}}
				>
					{isTextExpanded ? 'Exit writing mode' : 'Expand text editor'}
				</Button>
			</HStack>
			<textarea
				ref={textAreaRef}
				value={block.body}
				placeholder="Markdown-compatible text content"
				onChange={event => {
					const nextBody = event.currentTarget.value ?? '';

					onUpdateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
						...currentBlock,
						body: nextBody
					}));
				}}
				style={{
					flex: isTextExpanded ? '1 1 auto' : undefined,
					minHeight: isTextExpanded ? 'calc(100vh - 170px)' : '280px',
					width: '100%',
					border: '1px solid var(--chakra-colors-border-default)',
					borderRadius: '10px',
					background: 'var(--chakra-colors-bg-card)',
					padding: '18px 20px',
					fontSize: '15px',
					lineHeight: 1.7,
					resize: isTextExpanded ? 'none' : 'vertical',
					outline: 'none'
				}}
			/>
		</Box>
	);
};

const LinkedBlockFields = ({
	moduleIndex,
	subsectionIndex,
	blockIndex,
	block,
	onUpdateContentBlock
}: BlockUpdateContext) => {
	if (!linkedBlockTypes.has(block.type)) {
		return null;
	}

	return (
		<Stack gap={3}>
			<Box>
				<FieldLabel>{block.type === 'VIDEO_YOUTUBE' ? 'YouTube URL' : 'File URL'}</FieldLabel>
				<Input
					value={block.url}
					onChange={event => {
						const nextUrl = event.currentTarget.value ?? '';

						onUpdateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
							...currentBlock,
							url: nextUrl
						}));
					}}
					placeholder={
						block.type === 'VIDEO_YOUTUBE' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com/file.pdf'
					}
				/>
			</Box>
			<CurriculumLinkPreview type={block.type} url={block.url} title={block.title} />
		</Stack>
	);
};

const UploadBlockFields = ({
	moduleIndex,
	subsectionIndex,
	blockIndex,
	block,
	uploadingBlockKey,
	onUpdateContentBlock,
	onMediaUpload
}: BlockUpdateContext & Pick<CurriculumContentBlockEditorProps, 'uploadingBlockKey' | 'onMediaUpload'>) => {
	const blockKey = `${moduleIndex}-${subsectionIndex}-${blockIndex}`;

	if (!uploadBlockTypes.has(block.type)) {
		return null;
	}

	return (
		<Stack gap={3}>
			<Box>
				<FieldLabel>Upload file</FieldLabel>
				<input
					type="file"
					accept={getUploadAccept(block.type)}
					disabled={uploadingBlockKey === blockKey}
					onChange={event => {
						onMediaUpload(event, moduleIndex, subsectionIndex, blockIndex).catch(() => undefined);
					}}
				/>
				{uploadingBlockKey === blockKey ? (
					<Text mt={1} fontSize="xs" color="text.muted">
						Uploading media...
					</Text>
				) : null}
			</Box>
			<SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
				<Box>
					<FieldLabel>Cloudinary URL</FieldLabel>
					<Input
						value={block.url}
						onChange={event => {
							const nextUrl = event.currentTarget.value ?? '';

							onUpdateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
								...currentBlock,
								url: nextUrl
							}));
						}}
						placeholder="Uploaded URL"
					/>
				</Box>
				<Box>
					<FieldLabel>Public ID</FieldLabel>
					<Input
						value={block.publicId}
						onChange={event => {
							const nextPublicId = event.currentTarget.value ?? '';

							onUpdateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
								...currentBlock,
								publicId: nextPublicId
							}));
						}}
						placeholder="Cloudinary public ID"
					/>
				</Box>
				<Box>
					<FieldLabel>MIME type</FieldLabel>
					<Input
						value={block.mimeType}
						onChange={event => {
							const nextMimeType = event.currentTarget.value ?? '';

							onUpdateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
								...currentBlock,
								mimeType: nextMimeType
							}));
						}}
						placeholder="video/mp4"
					/>
				</Box>
			</SimpleGrid>
		</Stack>
	);
};

const BlockPreviewLink = ({ block }: { block: AdminCurriculumContentBlock }) => {
	if (!block.url) {
		return null;
	}

	return (
		<HStack gap={3} flexWrap="wrap">
			<Text fontSize="xs" color="text.muted">
				{block.fileName || 'Linked media'} {formatBytes(block.fileSize)}
			</Text>
			{isValidUrl(block.url) ? (
				<a
					href={block.url.trim()}
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
			) : (
				<Text fontSize="xs" color="text.muted">
					Preview available after a valid URL is added.
				</Text>
			)}
		</HStack>
	);
};

export const CurriculumContentBlockEditor = ({
	moduleIndex,
	subsectionIndex,
	subsection,
	block,
	blockIndex,
	uploadingBlockKey,
	onUpdateSubsection,
	onUpdateContentBlock,
	onRequestRemoveContentBlock,
	onMediaUpload
}: CurriculumContentBlockEditorProps) => {
	const blockContext = {
		moduleIndex,
		subsectionIndex,
		blockIndex
	};
	const blockUpdateContext = {
		...blockContext,
		block,
		onUpdateContentBlock
	};

	return (
		<Box
			key={block.id ?? `block-${blockIndex}`}
			border="1px solid"
			borderColor="border.brandSoft"
			borderRadius="xl"
			bg="bg.card"
			p={{ base: 3, md: 4 }}
		>
			<Stack gap={4}>
				<BlockHeader
					{...blockContext}
					block={block}
					subsection={subsection}
					onUpdateSubsection={onUpdateSubsection}
					onRequestRemoveContentBlock={onRequestRemoveContentBlock}
				/>
				<BlockMetadataFields {...blockUpdateContext} />
				<TextBlockEditor {...blockUpdateContext} />
				<LinkedBlockFields {...blockUpdateContext} />
				<UploadBlockFields
					{...blockUpdateContext}
					uploadingBlockKey={uploadingBlockKey}
					onMediaUpload={onMediaUpload}
				/>
				<BlockPreviewLink block={block} />
			</Stack>
		</Box>
	);
};
