import { Badge, Box, Button, HStack, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { FiEdit3 } from 'react-icons/fi';

import type { AdminCurriculumModule, AdminCurriculumSubsection } from '~/lib/api/admin-curriculum';

import { contentBlockTypeOptions } from './constants';
import { CurriculumContentBlockEditor } from './CurriculumContentBlockEditor';
import { FeedbackBox, FieldLabel } from './FormControls';
import type {
	CurriculumFeedback,
	MediaUploadHandler,
	SetSelectedSubsectionIndex,
	UpdateContentBlock,
	UpdateSubsection
} from './types';
import { createContentBlock, parseOptionalInteger } from './utils';

type CurriculumSubsectionPanelProps = {
	selectedModuleIndex: number | null;
	selectedModule: AdminCurriculumModule | null;
	selectedSubsectionIndex: number | null;
	selectedSubsection: AdminCurriculumSubsection | null;
	feedback: CurriculumFeedback | null;
	isDirty: boolean;
	isSaving: boolean;
	uploadingBlockKey: string | null;
	onClose: () => void;
	onSaveCurriculum: () => void;
	onAddSubsection: (moduleIndex: number) => void;
	onMoveSubsection: (moduleIndex: number, subsectionIndex: number, nextIndex: number) => void;
	onRequestRemoveSubsection: (moduleIndex: number, subsectionIndex: number) => void;
	onRequestRemoveContentBlock: (moduleIndex: number, subsectionIndex: number, blockIndex: number) => void;
	onSetSelectedSubsectionIndex: SetSelectedSubsectionIndex;
	onUpdateSubsection: UpdateSubsection;
	onUpdateContentBlock: UpdateContentBlock;
	onMediaUpload: MediaUploadHandler;
};

const getPanelWidth = (isFullScreen: boolean) => {
	if (isFullScreen) {
		return '100vw';
	}

	return { base: '100%', lg: 'min(1180px, calc(100vw - 260px))', '2xl': 'min(1360px, calc(100vw - 280px))' };
};

const getEditorGridColumns = (hasSubsections: boolean, isFullScreen: boolean) => {
	if (!hasSubsections) {
		return { base: '1fr', xl: '1fr', '2xl': '1fr' };
	}

	if (isFullScreen) {
		return { base: '1fr', xl: '420px minmax(0, 1fr)', '2xl': '460px minmax(0, 1fr)' };
	}

	return { base: '1fr', xl: '340px minmax(0, 1fr)', '2xl': '380px minmax(0, 1fr)' };
};

export const CurriculumSubsectionPanel = ({
	selectedModuleIndex,
	selectedModule,
	selectedSubsectionIndex,
	selectedSubsection,
	feedback,
	isDirty,
	isSaving,
	uploadingBlockKey,
	onClose,
	onSaveCurriculum,
	onAddSubsection,
	onMoveSubsection,
	onRequestRemoveSubsection,
	onRequestRemoveContentBlock,
	onSetSelectedSubsectionIndex,
	onUpdateSubsection,
	onUpdateContentBlock,
	onMediaUpload
}: CurriculumSubsectionPanelProps) => {
	const [isFullScreen, setIsFullScreen] = useState(false);

	if (selectedModuleIndex === null || !selectedModule) {
		return null;
	}

	const moduleIndex = selectedModuleIndex;
	const subsectionIndex = selectedSubsectionIndex;
	const hasSubsections = selectedModule.subsections.length > 0;
	const panelWidth = getPanelWidth(isFullScreen);
	const editorGridColumns = getEditorGridColumns(hasSubsections, isFullScreen);

	return (
		<>
			<Box position="fixed" inset={0} bg="blackAlpha.700" zIndex={1390} onClick={onClose} />
			<Box
				position="fixed"
				top={0}
				right={0}
				bottom={0}
				w={panelWidth}
				maxW="100vw"
				bg="bg.card"
				borderLeft="1px solid"
				borderColor="gray.500"
				boxShadow="2xl"
				zIndex={1400}
				transition="width 0.22s ease"
			>
				<Stack h="100%" gap={0}>
					<Box borderBottom="1px solid" borderColor="gray.500" bg="bg.card" p={{ base: 4, md: 5 }}>
						<HStack justify="space-between" gap={3} align="flex-start">
							<Box minW={0}>
								<HStack gap={2} flexWrap="wrap">
									<Badge colorPalette="orange">Module {moduleIndex + 1}</Badge>
									<Badge colorPalette="gray">{selectedModule.subsections.length} subsections</Badge>
									<Badge colorPalette="gray">
										{selectedModule.subsections.reduce(
											(total, subsection) => total + subsection.contentBlocks.length,
											0
										)}{' '}
										content blocks
									</Badge>
									<Badge colorPalette={isDirty ? 'orange' : 'green'}>
										{isDirty ? 'Unsaved curriculum' : 'Curriculum saved'}
									</Badge>
								</HStack>
								<Text mt={2} fontSize="xl" fontWeight="bold">
									{selectedModule.title.trim() || 'Untitled module'}
								</Text>
								<Text mt={1} fontSize="sm" color="text.muted">
									Manage a single module&apos;s subsections and detailed content without expanding the full page.
								</Text>
							</Box>
							<HStack gap={2} flexWrap="wrap" justify="flex-end">
								<Button
									type="button"
									variant="outline"
									borderRadius="full"
									onClick={() => setIsFullScreen(currentValue => !currentValue)}
								>
									{isFullScreen ? 'Exit full screen' : 'Full screen'}
								</Button>
								<Button
									type="button"
									bg="primary"
									color="ink.900"
									borderRadius="full"
									disabled={isSaving}
									onClick={onSaveCurriculum}
								>
									{isSaving ? 'Saving...' : 'Save curriculum'}
								</Button>
								<Button type="button" variant="outline" borderRadius="full" onClick={onClose}>
									Close
								</Button>
							</HStack>
						</HStack>
					</Box>

					<Box flex="1" overflowY="auto" p={{ base: 4, md: 5 }}>
						{feedback ? (
							<Box mb={4}>
								<FeedbackBox feedback={feedback} />
							</Box>
						) : null}
						<Box display="grid" gridTemplateColumns={editorGridColumns} gap={{ base: 4, '2xl': isFullScreen ? 6 : 4 }}>
							<Box
								border="1px solid"
								borderColor="gray.500"
								borderRadius="xl"
								p={4}
								alignSelf="start"
								position={{ xl: 'sticky' }}
								top={4}
							>
								<HStack justify="space-between" gap={3} mb={3}>
									<Box>
										<Text fontWeight="semibold">Subsections</Text>
										<Text fontSize="xs" color="text.muted">
											Select one row to edit.
										</Text>
									</Box>
									<Button
										type="button"
										size="sm"
										variant="outline"
										borderRadius="full"
										onClick={() => onAddSubsection(moduleIndex)}
									>
										Add
									</Button>
								</HStack>

								{selectedModule.subsections.length ? (
									<Stack gap={2}>
										{selectedModule.subsections.map((subsection, currentSubsectionIndex) => {
											const isSelected = currentSubsectionIndex === selectedSubsectionIndex;

											return (
												<Box
													key={subsection.id ?? `subsection-${currentSubsectionIndex}`}
													border="2px solid"
													borderColor={isSelected ? 'brand.600' : 'gray.500'}
													borderRadius="lg"
													bg={isSelected ? 'bg.subtle' : 'bg.card'}
													boxShadow={isSelected ? '0 0 0 1px var(--chakra-colors-brand-600)' : 'none'}
													p={3}
													transition="border-color 0.16s ease, background-color 0.16s ease"
													_hover={{ borderColor: 'primary', bg: 'bg.subtle' }}
												>
													<Stack gap={2}>
														<Button
															type="button"
															variant="ghost"
															justifyContent="flex-start"
															h="auto"
															p={0}
															onClick={() => onSetSelectedSubsectionIndex(currentSubsectionIndex)}
														>
															<Stack gap={1} align="stretch" w="100%">
																<HStack gap={2} flexWrap="wrap">
																	<Badge colorPalette="gray">Subsection {currentSubsectionIndex + 1}</Badge>
																	{subsection.contentBlocks.length ? (
																		<Badge colorPalette="purple">{subsection.contentBlocks.length} blocks</Badge>
																	) : null}
																	{isSelected ? (
																		<Badge colorPalette="orange" gap={1}>
																			<FiEdit3 aria-hidden /> Editing
																		</Badge>
																	) : null}
																</HStack>
																<Text fontSize="sm" fontWeight="semibold" textAlign="left">
																	{subsection.title.trim() || 'Untitled subsection'}
																</Text>
																<Text fontSize="xs" color="text.muted" textAlign="left">
																	{subsection.durationLabel.trim() || 'No duration set'}
																</Text>
															</Stack>
														</Button>
														<HStack gap={2} flexWrap="wrap">
															<Button
																type="button"
																size="xs"
																variant="outline"
																borderRadius="full"
																disabled={currentSubsectionIndex === 0}
																onClick={() =>
																	onMoveSubsection(moduleIndex, currentSubsectionIndex, currentSubsectionIndex - 1)
																}
															>
																Move up
															</Button>
															<Button
																type="button"
																size="xs"
																variant="outline"
																borderRadius="full"
																disabled={currentSubsectionIndex === selectedModule.subsections.length - 1}
																onClick={() =>
																	onMoveSubsection(moduleIndex, currentSubsectionIndex, currentSubsectionIndex + 1)
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
																onClick={() => onRequestRemoveSubsection(moduleIndex, currentSubsectionIndex)}
															>
																Remove
															</Button>
														</HStack>
													</Stack>
												</Box>
											);
										})}
									</Stack>
								) : (
									<Box border="1px dashed" borderColor="border.default" borderRadius="lg" p={4}>
										<Text fontSize="sm" color="text.muted">
											No subsections in this module yet.
										</Text>
									</Box>
								)}
							</Box>

							{subsectionIndex !== null && selectedSubsection ? (
								<Box border="1px solid" borderColor="gray.500" borderRadius="xl" p={{ base: 4, md: 5 }}>
									<Stack gap={5}>
										<HStack justify="space-between" gap={3} flexWrap="wrap">
											<Box>
												<HStack gap={2} flexWrap="wrap">
													<Badge colorPalette="gray">Subsection {subsectionIndex + 1}</Badge>
													<Text fontWeight="semibold">{selectedSubsection.title.trim() || 'Untitled subsection'}</Text>
												</HStack>
												<Text mt={1} fontSize="xs" color="text.muted">
													Public preview fields plus enrolled-only content blocks.
												</Text>
											</Box>
											<HStack gap={2} flexWrap="wrap" justify="flex-end">
												{contentBlockTypeOptions.map(option => (
													<Button
														key={option.value}
														type="button"
														size="xs"
														variant="outline"
														borderRadius="full"
														onClick={() =>
															onUpdateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
																...currentSubsection,
																contentBlocks: [...currentSubsection.contentBlocks, createContentBlock(option.value)]
															}))
														}
													>
														Add {option.label}
													</Button>
												))}
											</HStack>
										</HStack>

										<SimpleGrid columns={{ base: 1, md: 2, '2xl': 4 }} gap={3}>
											<Box>
												<FieldLabel>Subsection title</FieldLabel>
												<Input
													value={selectedSubsection.title}
													onChange={event => {
														const nextTitle = event.currentTarget.value ?? '';

														onUpdateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
															...currentSubsection,
															title: nextTitle
														}));
													}}
													placeholder="Understanding guitar parts"
												/>
											</Box>
											<Box>
												<FieldLabel>Preview summary</FieldLabel>
												<Input
													value={selectedSubsection.previewSummary}
													onChange={event => {
														const nextPreviewSummary = event.currentTarget.value ?? '';

														onUpdateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
															...currentSubsection,
															previewSummary: nextPreviewSummary
														}));
													}}
													placeholder="Optional preview note"
												/>
											</Box>
											<Box>
												<FieldLabel>Duration label</FieldLabel>
												<Input
													value={selectedSubsection.durationLabel}
													onChange={event => {
														const nextDurationLabel = event.currentTarget.value ?? '';

														onUpdateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
															...currentSubsection,
															durationLabel: nextDurationLabel
														}));
													}}
													placeholder="20 min"
												/>
											</Box>
											<Box>
												<FieldLabel>Duration minutes</FieldLabel>
												<Input
													type="number"
													min={0}
													value={selectedSubsection.durationMinutes ?? ''}
													onChange={event => {
														const nextDurationMinutes = parseOptionalInteger(event.currentTarget.value ?? '');

														onUpdateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
															...currentSubsection,
															durationMinutes: nextDurationMinutes
														}));
													}}
													placeholder="20"
												/>
											</Box>
										</SimpleGrid>

										<Box
											bg="bg.subtle"
											border="1px solid"
											borderColor="gray.500"
											borderRadius="xl"
											p={{ base: 3, md: 4 }}
										>
											<Stack gap={4}>
												<Box>
													<Text fontSize="sm" fontWeight="semibold">
														Detailed content
													</Text>
													<Text fontSize="xs" color="text.muted">
														Default visibility is enrolled-only for future course-player access.
													</Text>
												</Box>

												{selectedSubsection.contentBlocks.length ? (
													selectedSubsection.contentBlocks.map((block, blockIndex) => (
														<CurriculumContentBlockEditor
															key={block.id ?? `block-${blockIndex}`}
															moduleIndex={moduleIndex}
															subsectionIndex={subsectionIndex}
															subsection={selectedSubsection}
															block={block}
															blockIndex={blockIndex}
															uploadingBlockKey={uploadingBlockKey}
															onUpdateSubsection={onUpdateSubsection}
															onUpdateContentBlock={onUpdateContentBlock}
															onRequestRemoveContentBlock={onRequestRemoveContentBlock}
															onMediaUpload={onMediaUpload}
														/>
													))
												) : (
													<Box border="1px dashed" borderColor="border.default" borderRadius="lg" p={3}>
														<Text fontSize="sm" color="text.muted">
															No detailed content added yet.
														</Text>
													</Box>
												)}
											</Stack>
										</Box>
									</Stack>
								</Box>
							) : (
								<Box border="1px dashed" borderColor="border.default" borderRadius="xl" p={5}>
									<Text fontWeight="semibold">No subsection selected</Text>
									<Text mt={1} fontSize="sm" color="text.muted">
										Add a subsection to start managing preview rows and detailed content blocks.
									</Text>
								</Box>
							)}
						</Box>
					</Box>
				</Stack>
			</Box>
		</>
	);
};
