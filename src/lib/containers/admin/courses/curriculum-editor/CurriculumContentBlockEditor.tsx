import { Badge, Box, Button, HStack, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';

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
import { FieldLabel, SelectInput, TextareaInput } from './FormControls';
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
	const blockKey = `${moduleIndex}-${subsectionIndex}-${blockIndex}`;
	const isUploadType = uploadBlockTypes.has(block.type);
	const isLinkedType = linkedBlockTypes.has(block.type);

	return (
		<Box
			key={block.id ?? `block-${blockIndex}`}
			border="1px solid"
			borderColor="border.default"
			borderRadius="lg"
			bg="bg.card"
			p={3}
		>
			<Stack gap={3}>
				<HStack justify="space-between" gap={3} flexWrap="wrap">
					<HStack gap={2} flexWrap="wrap">
						<Badge colorPalette="purple">Block {blockIndex + 1}</Badge>
						<Badge colorPalette={block.visibility === 'PUBLIC_PREVIEW' ? 'green' : 'orange'}>
							{block.visibility === 'PUBLIC_PREVIEW' ? 'Public preview' : 'Enrolled only'}
						</Badge>
						<Text fontSize="sm" fontWeight="semibold">
							{contentBlockTypeOptions.find(option => option.value === block.type)?.label}
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

				{block.type === 'TEXT' ? (
					<Box>
						<FieldLabel>Text content</FieldLabel>
						<TextareaInput
							value={block.body}
							onChange={value =>
								onUpdateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
									...currentBlock,
									body: value
								}))
							}
							minH="130px"
							placeholder="Markdown-compatible text content"
						/>
					</Box>
				) : null}

				{isLinkedType ? (
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
									block.type === 'VIDEO_YOUTUBE'
										? 'https://www.youtube.com/watch?v=...'
										: 'https://example.com/file.pdf'
								}
							/>
						</Box>
						<CurriculumLinkPreview type={block.type} url={block.url} title={block.title} />
					</Stack>
				) : null}

				{isUploadType ? (
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
				) : null}

				{block.url ? (
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
				) : null}
			</Stack>
		</Box>
	);
};
