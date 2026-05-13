'use client';

import { Badge, Box, Button, HStack, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';

import {
	getAdminCourseCurriculum,
	replaceAdminCourseCurriculum,
	type AdminCourseCurriculum,
	type AdminCurriculumContentBlock,
	type AdminCurriculumContentBlockType,
	type AdminCurriculumContentVisibility,
	type AdminCurriculumModule,
	type AdminCurriculumSectionType,
	type AdminCurriculumSubsection
} from '~/lib/api/admin-curriculum';
import { uploadAdminMedia } from '~/lib/api/admin-uploads';

type CurriculumSectionKey = keyof AdminCourseCurriculum['sections'];

type CourseCurriculumEditorProps = {
	courseId?: string;
	sectionKey: CurriculumSectionKey;
	title: string;
	description: string;
};

type CurriculumFeedback = {
	tone: 'success' | 'error' | 'info';
	message: string;
};

const sectionTypeByKey: Record<CurriculumSectionKey, AdminCurriculumSectionType> = {
	prerequisites: 'PREREQUISITES',
	liveSessions: 'LIVE_SESSIONS',
	postSessionMaterials: 'POST_SESSION_MATERIALS'
};

const sectionLabelByKey: Record<CurriculumSectionKey, string> = {
	prerequisites: 'Prerequisites',
	liveSessions: 'Live sessions',
	postSessionMaterials: 'Post-session materials'
};

const contentBlockTypeOptions: Array<{ label: string; value: AdminCurriculumContentBlockType }> = [
	{ label: 'Text', value: 'TEXT' },
	{ label: 'Uploaded video', value: 'VIDEO_UPLOAD' },
	{ label: 'YouTube video', value: 'VIDEO_YOUTUBE' },
	{ label: 'Uploaded PDF', value: 'PDF_UPLOAD' },
	{ label: 'PDF link', value: 'PDF_LINK' },
	{ label: 'Uploaded PPT', value: 'PPT_UPLOAD' },
	{ label: 'PPT link', value: 'PPT_LINK' }
];

const visibilityOptions: Array<{ label: string; value: AdminCurriculumContentVisibility }> = [
	{ label: 'Enrolled only', value: 'ENROLLED_ONLY' },
	{ label: 'Public preview', value: 'PUBLIC_PREVIEW' }
];

const uploadBlockTypes = new Set<AdminCurriculumContentBlockType>(['VIDEO_UPLOAD', 'PDF_UPLOAD', 'PPT_UPLOAD']);

const linkedBlockTypes = new Set<AdminCurriculumContentBlockType>(['VIDEO_YOUTUBE', 'PDF_LINK', 'PPT_LINK']);

const getUploadAccept = (type: AdminCurriculumContentBlockType) => {
	if (type === 'VIDEO_UPLOAD') {
		return 'video/mp4,video/webm,video/quicktime';
	}

	if (type === 'PDF_UPLOAD') {
		return 'application/pdf';
	}

	if (type === 'PPT_UPLOAD') {
		return '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation';
	}

	return undefined;
};

const createEditorId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const emptyCurriculum = (): AdminCourseCurriculum => ({
	sections: {
		prerequisites: [],
		liveSessions: [],
		postSessionMaterials: []
	}
});

const createContentBlock = (type: AdminCurriculumContentBlockType = 'TEXT'): AdminCurriculumContentBlock => ({
	id: createEditorId('content'),
	type,
	visibility: 'ENROLLED_ONLY',
	title: '',
	body: '',
	url: '',
	publicId: '',
	mimeType: '',
	fileName: '',
	fileSize: null,
	sortOrder: 0,
	metadata: {}
});

const createSubsection = (): AdminCurriculumSubsection => ({
	id: createEditorId('subsection'),
	title: '',
	previewSummary: '',
	durationLabel: '',
	durationMinutes: null,
	sortOrder: 0,
	contentBlocks: []
});

const createModule = (sectionKey: CurriculumSectionKey): AdminCurriculumModule => ({
	id: createEditorId('module'),
	sectionType: sectionTypeByKey[sectionKey],
	title: '',
	description: '',
	sortOrder: 0,
	subsections: []
});

const normalizeContentBlocks = (blocks: AdminCurriculumContentBlock[]) =>
	blocks.map((block, index) => ({
		...block,
		sortOrder: index,
		metadata: block.metadata ?? {}
	}));

const normalizeSubsections = (subsections: AdminCurriculumSubsection[]) =>
	subsections.map((subsection, index) => ({
		...subsection,
		sortOrder: index,
		contentBlocks: normalizeContentBlocks(subsection.contentBlocks ?? [])
	}));

const normalizeModules = (sectionKey: CurriculumSectionKey, modules: AdminCurriculumModule[]) =>
	modules.map((module, index) => ({
		...module,
		sectionType: sectionTypeByKey[sectionKey],
		sortOrder: index,
		subsections: normalizeSubsections(module.subsections ?? [])
	}));

const normalizeCurriculum = (curriculum: AdminCourseCurriculum): AdminCourseCurriculum => ({
	sections: {
		prerequisites: normalizeModules('prerequisites', curriculum.sections.prerequisites ?? []),
		liveSessions: normalizeModules('liveSessions', curriculum.sections.liveSessions ?? []),
		postSessionMaterials: normalizeModules('postSessionMaterials', curriculum.sections.postSessionMaterials ?? [])
	}
});

const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number) => {
	if (toIndex < 0 || toIndex >= items.length) {
		return items;
	}

	const nextItems = [...items];
	const [item] = nextItems.splice(fromIndex, 1);

	if (item === undefined) {
		return items;
	}

	nextItems.splice(toIndex, 0, item);

	return nextItems;
};

const isValidUrl = (value: string) => {
	try {
		const url = new URL(value);

		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
};

const isValidYouTubeUrl = (value: string) => {
	if (!isValidUrl(value)) {
		return false;
	}

	const hostname = new URL(value).hostname.replace(/^www\./, '');

	return hostname === 'youtube.com' || hostname === 'youtu.be' || hostname === 'm.youtube.com';
};

const formatBytes = (value: number | null) => {
	if (!value) {
		return '';
	}

	if (value < 1024 * 1024) {
		return `${Math.round(value / 1024)} KB`;
	}

	return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const getCurriculumIssues = (curriculum: AdminCourseCurriculum) => {
	const issues: string[] = [];

	Object.entries(curriculum.sections).forEach(([sectionKey, modules]) => {
		const sectionLabel = sectionLabelByKey[sectionKey as CurriculumSectionKey];

		modules.forEach((module, moduleIndex) => {
			if (!module.title.trim()) {
				issues.push(`${sectionLabel}: module ${moduleIndex + 1} needs a title.`);
			}

			module.subsections.forEach((subsection, subsectionIndex) => {
				const subsectionLabel = `${sectionLabel}: module ${moduleIndex + 1}, subsection ${subsectionIndex + 1}`;

				if (!subsection.title.trim()) {
					issues.push(`${subsectionLabel} needs a title.`);
				}

				subsection.contentBlocks.forEach((block, blockIndex) => {
					const blockLabel = `${subsectionLabel}, content block ${blockIndex + 1}`;

					if (block.type === 'TEXT' && !block.body.trim()) {
						issues.push(`${blockLabel} needs text content.`);
					}

					if (block.type === 'VIDEO_YOUTUBE' && !isValidYouTubeUrl(block.url.trim())) {
						issues.push(`${blockLabel} needs a valid YouTube URL.`);
					}

					if ((block.type === 'PDF_LINK' || block.type === 'PPT_LINK') && !isValidUrl(block.url.trim())) {
						issues.push(`${blockLabel} needs a valid file URL.`);
					}

					if (
						uploadBlockTypes.has(block.type) &&
						(!block.url.trim() || !block.publicId.trim() || !block.mimeType.trim())
					) {
						issues.push(`${blockLabel} needs an uploaded file.`);
					}
				});
			});
		});
	});

	return issues;
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
	<Text fontSize="xs" color="text.muted" mb={1}>
		{children}
	</Text>
);

const TextareaInput = ({
	value,
	onChange,
	placeholder,
	minH = '88px'
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	minH?: string;
}) => (
	<textarea
		value={value}
		placeholder={placeholder}
		onChange={event => onChange(event.currentTarget.value)}
		style={{
			minHeight: minH,
			width: '100%',
			border: '1px solid var(--chakra-colors-border-default)',
			borderRadius: '6px',
			background: 'var(--chakra-colors-bg-card)',
			padding: '8px 12px',
			fontSize: '14px',
			resize: 'vertical'
		}}
	/>
);

const SelectInput = ({
	value,
	options,
	onChange
}: {
	value: string;
	options: Array<{ label: string; value: string }>;
	onChange: (value: string) => void;
}) => (
	<select
		value={value}
		onChange={event => onChange(event.currentTarget.value)}
		style={{
			width: '100%',
			height: '40px',
			border: '1px solid var(--chakra-colors-border-default)',
			borderRadius: '6px',
			background: 'var(--chakra-colors-bg-card)',
			paddingInline: '12px',
			fontSize: '14px'
		}}
	>
		{options.map(option => (
			<option key={option.value} value={option.value}>
				{option.label}
			</option>
		))}
	</select>
);

const getFeedbackColor = (tone: CurriculumFeedback['tone']) => {
	if (tone === 'error') {
		return 'red.500';
	}

	if (tone === 'success') {
		return 'green.500';
	}

	return 'text.muted';
};

const FeedbackBox = ({ feedback }: { feedback: CurriculumFeedback }) => (
	<Box
		border="1px solid"
		borderColor={feedback.tone === 'error' ? 'red.400' : 'border.default'}
		borderRadius="lg"
		p={3}
	>
		<Text fontSize="sm" color={getFeedbackColor(feedback.tone)}>
			{feedback.message}
		</Text>
	</Box>
);

const CourseCurriculumEditor = ({ courseId, sectionKey, title, description }: CourseCurriculumEditorProps) => {
	const [curriculum, setCurriculum] = useState<AdminCourseCurriculum>(emptyCurriculum);
	const [isLoading, setIsLoading] = useState(Boolean(courseId));
	const [isSaving, setIsSaving] = useState(false);
	const [uploadingBlockKey, setUploadingBlockKey] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<CurriculumFeedback | null>(null);
	const sectionModules = useMemo(() => curriculum.sections[sectionKey] ?? [], [curriculum.sections, sectionKey]);
	const totalSubsections = sectionModules.reduce((total, module) => total + module.subsections.length, 0);
	const totalContentBlocks = sectionModules.reduce(
		(total, module) =>
			total +
			module.subsections.reduce((subsectionTotal, subsection) => subsectionTotal + subsection.contentBlocks.length, 0),
		0
	);

	useEffect(() => {
		if (!courseId) {
			setIsLoading(false);
			return undefined;
		}

		let isMounted = true;

		setIsLoading(true);
		setFeedback(null);

		getAdminCourseCurriculum(courseId)
			.then(result => {
				if (isMounted) {
					setCurriculum(normalizeCurriculum(result.curriculum));
				}
			})
			.catch(error => {
				if (isMounted) {
					setFeedback({
						tone: 'error',
						message: error instanceof Error ? error.message : 'Unable to load curriculum.'
					});
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [courseId]);

	const updateSectionModules = (update: (modules: AdminCurriculumModule[]) => AdminCurriculumModule[]) => {
		setCurriculum(currentCurriculum => {
			const nextModules = normalizeModules(sectionKey, update(currentCurriculum.sections[sectionKey] ?? []));

			return {
				sections: {
					...currentCurriculum.sections,
					[sectionKey]: nextModules
				}
			};
		});
	};

	const updateModule = (moduleIndex: number, update: (module: AdminCurriculumModule) => AdminCurriculumModule) => {
		updateSectionModules(modules => modules.map((module, index) => (index === moduleIndex ? update(module) : module)));
	};

	const updateSubsection = (
		moduleIndex: number,
		subsectionIndex: number,
		update: (subsection: AdminCurriculumSubsection) => AdminCurriculumSubsection
	) => {
		updateModule(moduleIndex, module => ({
			...module,
			subsections: module.subsections.map((subsection, index) =>
				index === subsectionIndex ? update(subsection) : subsection
			)
		}));
	};

	const updateContentBlock = (
		moduleIndex: number,
		subsectionIndex: number,
		blockIndex: number,
		update: (block: AdminCurriculumContentBlock) => AdminCurriculumContentBlock
	) => {
		updateSubsection(moduleIndex, subsectionIndex, subsection => ({
			...subsection,
			contentBlocks: subsection.contentBlocks.map((block, index) => (index === blockIndex ? update(block) : block))
		}));
	};

	const handleSave = async () => {
		if (!courseId) {
			setFeedback({ tone: 'error', message: 'Save the course draft before adding curriculum content.' });
			return;
		}

		const normalizedCurriculum = normalizeCurriculum(curriculum);
		const issues = getCurriculumIssues(normalizedCurriculum);

		if (issues.length) {
			setFeedback({ tone: 'error', message: `Curriculum was not saved. ${issues[0]}` });
			return;
		}

		setIsSaving(true);
		setFeedback(null);

		try {
			const result = await replaceAdminCourseCurriculum(courseId, normalizedCurriculum);

			setCurriculum(normalizeCurriculum(result.curriculum));
			setFeedback({ tone: 'success', message: 'Curriculum saved.' });
		} catch (error) {
			setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to save curriculum.' });
		} finally {
			setIsSaving(false);
		}
	};

	const handleMediaUpload = async (
		event: ChangeEvent<HTMLInputElement>,
		moduleIndex: number,
		subsectionIndex: number,
		blockIndex: number
	) => {
		const input = event.currentTarget;
		const file = input.files?.[0];

		if (!file) {
			return;
		}

		const blockKey = `${moduleIndex}-${subsectionIndex}-${blockIndex}`;

		setUploadingBlockKey(blockKey);
		setFeedback(null);

		try {
			const result = await uploadAdminMedia(file);

			updateContentBlock(moduleIndex, subsectionIndex, blockIndex, block => ({
				...block,
				url: result.upload.url,
				publicId: result.upload.publicId,
				mimeType: result.upload.mimeType,
				fileName: result.upload.originalFilename || file.name,
				fileSize: result.upload.size ?? result.upload.bytes ?? file.size,
				metadata: {
					...block.metadata,
					resourceType: result.upload.resourceType,
					format: result.upload.format
				}
			}));
			setFeedback({ tone: 'success', message: 'Media uploaded. Save the curriculum to persist it.' });
		} catch (error) {
			setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to upload media.' });
		} finally {
			input.value = '';
			setUploadingBlockKey(null);
		}
	};

	if (!courseId) {
		return (
			<Box border="1px dashed" borderColor="border.default" borderRadius="xl" p={5}>
				<Text fontWeight="semibold">Save the course first</Text>
				<Text mt={1} fontSize="sm" color="text.muted">
					Create the course draft before adding nested curriculum modules and enrolled-only content.
				</Text>
			</Box>
		);
	}

	if (isLoading) {
		return (
			<Box border="1px solid" borderColor="border.default" borderRadius="xl" p={5}>
				<Text color="text.muted">Loading curriculum...</Text>
			</Box>
		);
	}

	return (
		<Stack gap={4}>
			<Box border="1px solid" borderColor="border.default" borderRadius="xl" p={4}>
				<HStack justify="space-between" gap={3} flexWrap="wrap">
					<Box>
						<HStack gap={2} flexWrap="wrap">
							<Text fontWeight="bold">{title}</Text>
							<Badge colorPalette="gray">{sectionModules.length} modules</Badge>
							<Badge colorPalette="gray">{totalSubsections} subsections</Badge>
							<Badge colorPalette="gray">{totalContentBlocks} content blocks</Badge>
						</HStack>
						<Text mt={1} fontSize="sm" color="text.muted">
							{description}
						</Text>
					</Box>
					<HStack gap={2} flexWrap="wrap">
						<Button
							type="button"
							variant="outline"
							borderRadius="full"
							onClick={() => updateSectionModules(modules => [...modules, createModule(sectionKey)])}
						>
							Add module
						</Button>
						<Button
							type="button"
							bg="primary"
							color="text.inverse"
							borderRadius="full"
							disabled={isSaving}
							onClick={handleSave}
						>
							{isSaving ? 'Saving...' : 'Save curriculum'}
						</Button>
					</HStack>
				</HStack>
			</Box>

			{feedback ? <FeedbackBox feedback={feedback} /> : null}

			{sectionModules.length ? null : (
				<Box border="1px dashed" borderColor="border.default" borderRadius="xl" p={5}>
					<Text fontSize="sm" color="text.muted">
						No modules added yet. Add a module, then add subsections and optional enrolled-only content blocks.
					</Text>
				</Box>
			)}

			{sectionModules.map((module, moduleIndex) => (
				<Box
					key={module.id ?? `module-${moduleIndex}`}
					border="1px solid"
					borderColor="border.default"
					borderRadius="xl"
					p={4}
				>
					<Stack gap={4}>
						<HStack justify="space-between" gap={3} flexWrap="wrap">
							<HStack gap={2} flexWrap="wrap">
								<Badge colorPalette="orange">Module {moduleIndex + 1}</Badge>
								<Text fontWeight="semibold">{module.title.trim() || 'Untitled module'}</Text>
							</HStack>
							<HStack gap={2}>
								<Button
									type="button"
									size="xs"
									variant="outline"
									borderRadius="full"
									disabled={moduleIndex === 0}
									onClick={() => updateSectionModules(modules => moveItem(modules, moduleIndex, moduleIndex - 1))}
								>
									Move up
								</Button>
								<Button
									type="button"
									size="xs"
									variant="outline"
									borderRadius="full"
									disabled={moduleIndex === sectionModules.length - 1}
									onClick={() => updateSectionModules(modules => moveItem(modules, moduleIndex, moduleIndex + 1))}
								>
									Move down
								</Button>
								<Button
									type="button"
									size="xs"
									variant="outline"
									borderRadius="full"
									color="red.500"
									onClick={() => updateSectionModules(modules => modules.filter((_, index) => index !== moduleIndex))}
								>
									Remove
								</Button>
							</HStack>
						</HStack>

						<SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
							<Box>
								<FieldLabel>Module title</FieldLabel>
								<Input
									value={module.title}
									onChange={event =>
										updateModule(moduleIndex, currentModule => ({
											...currentModule,
											title: event.currentTarget.value
										}))
									}
									placeholder="Guitar fundamentals"
								/>
							</Box>
							<Box>
								<FieldLabel>Short description</FieldLabel>
								<Input
									value={module.description}
									onChange={event =>
										updateModule(moduleIndex, currentModule => ({
											...currentModule,
											description: event.currentTarget.value
										}))
									}
									placeholder="Optional admin/public context"
								/>
							</Box>
						</SimpleGrid>

						<Box borderTop="1px solid" borderColor="border.default" pt={4}>
							<HStack justify="space-between" gap={3} flexWrap="wrap" mb={3}>
								<Box>
									<Text fontSize="sm" fontWeight="semibold">
										Subsections
									</Text>
									<Text fontSize="xs" color="text.muted">
										These rows are safe for public preview. Detailed content stays enrolled-only unless changed.
									</Text>
								</Box>
								<Button
									type="button"
									size="sm"
									variant="outline"
									borderRadius="full"
									onClick={() =>
										updateModule(moduleIndex, currentModule => ({
											...currentModule,
											subsections: [...currentModule.subsections, createSubsection()]
										}))
									}
								>
									Add subsection
								</Button>
							</HStack>

							<Stack gap={3}>
								{module.subsections.length ? null : (
									<Box border="1px dashed" borderColor="border.default" borderRadius="lg" p={4}>
										<Text fontSize="sm" color="text.muted">
											No subsections in this module yet.
										</Text>
									</Box>
								)}

								{module.subsections.map((subsection, subsectionIndex) => (
									<Box
										key={subsection.id ?? `subsection-${subsectionIndex}`}
										border="1px solid"
										borderColor="border.default"
										borderRadius="lg"
										p={3}
									>
										<Stack gap={3}>
											<HStack justify="space-between" gap={3} flexWrap="wrap">
												<HStack gap={2} flexWrap="wrap">
													<Badge colorPalette="gray">Subsection {subsectionIndex + 1}</Badge>
													<Text fontSize="sm" fontWeight="semibold">
														{subsection.title.trim() || 'Untitled subsection'}
													</Text>
												</HStack>
												<HStack gap={2}>
													<Button
														type="button"
														size="xs"
														variant="outline"
														borderRadius="full"
														disabled={subsectionIndex === 0}
														onClick={() =>
															updateModule(moduleIndex, currentModule => ({
																...currentModule,
																subsections: moveItem(currentModule.subsections, subsectionIndex, subsectionIndex - 1)
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
														disabled={subsectionIndex === module.subsections.length - 1}
														onClick={() =>
															updateModule(moduleIndex, currentModule => ({
																...currentModule,
																subsections: moveItem(currentModule.subsections, subsectionIndex, subsectionIndex + 1)
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
														onClick={() =>
															updateModule(moduleIndex, currentModule => ({
																...currentModule,
																subsections: currentModule.subsections.filter((_, index) => index !== subsectionIndex)
															}))
														}
													>
														Remove
													</Button>
												</HStack>
											</HStack>

											<SimpleGrid columns={{ base: 1, lg: 4 }} gap={3}>
												<Box>
													<FieldLabel>Subsection title</FieldLabel>
													<Input
														value={subsection.title}
														onChange={event =>
															updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
																...currentSubsection,
																title: event.currentTarget.value
															}))
														}
														placeholder="Understanding guitar parts"
													/>
												</Box>
												<Box>
													<FieldLabel>Preview summary</FieldLabel>
													<Input
														value={subsection.previewSummary}
														onChange={event =>
															updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
																...currentSubsection,
																previewSummary: event.currentTarget.value
															}))
														}
														placeholder="Optional preview note"
													/>
												</Box>
												<Box>
													<FieldLabel>Duration label</FieldLabel>
													<Input
														value={subsection.durationLabel}
														onChange={event =>
															updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
																...currentSubsection,
																durationLabel: event.currentTarget.value
															}))
														}
														placeholder="20 min"
													/>
												</Box>
												<Box>
													<FieldLabel>Duration minutes</FieldLabel>
													<Input
														type="number"
														min={0}
														value={subsection.durationMinutes ?? ''}
														onChange={event =>
															updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
																...currentSubsection,
																durationMinutes: event.currentTarget.value
																	? Number.parseInt(event.currentTarget.value, 10)
																	: null
															}))
														}
														placeholder="20"
													/>
												</Box>
											</SimpleGrid>

											<Box bg="bg.subtle" borderRadius="lg" p={3}>
												<HStack justify="space-between" gap={3} flexWrap="wrap" mb={3}>
													<Box>
														<Text fontSize="sm" fontWeight="semibold">
															Detailed content
														</Text>
														<Text fontSize="xs" color="text.muted">
															Default visibility is enrolled-only for future course-player access.
														</Text>
													</Box>
													<HStack gap={2} flexWrap="wrap">
														{contentBlockTypeOptions.map(option => (
															<Button
																key={option.value}
																type="button"
																size="xs"
																variant="outline"
																borderRadius="full"
																onClick={() =>
																	updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
																		...currentSubsection,
																		contentBlocks: [
																			...currentSubsection.contentBlocks,
																			createContentBlock(option.value)
																		]
																	}))
																}
															>
																Add {option.label}
															</Button>
														))}
													</HStack>
												</HStack>

												<Stack gap={3}>
													{subsection.contentBlocks.length ? null : (
														<Box border="1px dashed" borderColor="border.default" borderRadius="lg" p={3}>
															<Text fontSize="sm" color="text.muted">
																No detailed content added yet.
															</Text>
														</Box>
													)}

													{subsection.contentBlocks.map((block, blockIndex) => {
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
																					updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
																						...currentSubsection,
																						contentBlocks: moveItem(
																							currentSubsection.contentBlocks,
																							blockIndex,
																							blockIndex - 1
																						)
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
																					updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
																						...currentSubsection,
																						contentBlocks: moveItem(
																							currentSubsection.contentBlocks,
																							blockIndex,
																							blockIndex + 1
																						)
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
																				onClick={() =>
																					updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
																						...currentSubsection,
																						contentBlocks: currentSubsection.contentBlocks.filter(
																							(_, index) => index !== blockIndex
																						)
																					}))
																				}
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
																					updateContentBlock(
																						moduleIndex,
																						subsectionIndex,
																						blockIndex,
																						currentBlock => ({
																							...createContentBlock(value as AdminCurriculumContentBlockType),
																							id: currentBlock.id,
																							visibility: currentBlock.visibility,
																							title: currentBlock.title
																						})
																					)
																				}
																			/>
																		</Box>
																		<Box>
																			<FieldLabel>Visibility</FieldLabel>
																			<SelectInput
																				value={block.visibility}
																				options={visibilityOptions}
																				onChange={value =>
																					updateContentBlock(
																						moduleIndex,
																						subsectionIndex,
																						blockIndex,
																						currentBlock => ({
																							...currentBlock,
																							visibility: value as AdminCurriculumContentVisibility
																						})
																					)
																				}
																			/>
																		</Box>
																		<Box>
																			<FieldLabel>Title</FieldLabel>
																			<Input
																				value={block.title}
																				onChange={event =>
																					updateContentBlock(
																						moduleIndex,
																						subsectionIndex,
																						blockIndex,
																						currentBlock => ({
																							...currentBlock,
																							title: event.currentTarget.value
																						})
																					)
																				}
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
																					updateContentBlock(
																						moduleIndex,
																						subsectionIndex,
																						blockIndex,
																						currentBlock => ({
																							...currentBlock,
																							body: value
																						})
																					)
																				}
																				minH="130px"
																				placeholder="Markdown-compatible text content"
																			/>
																		</Box>
																	) : null}

																	{isLinkedType ? (
																		<Box>
																			<FieldLabel>
																				{block.type === 'VIDEO_YOUTUBE' ? 'YouTube URL' : 'File URL'}
																			</FieldLabel>
																			<Input
																				value={block.url}
																				onChange={event =>
																					updateContentBlock(
																						moduleIndex,
																						subsectionIndex,
																						blockIndex,
																						currentBlock => ({
																							...currentBlock,
																							url: event.currentTarget.value
																						})
																					)
																				}
																				placeholder={
																					block.type === 'VIDEO_YOUTUBE'
																						? 'https://www.youtube.com/watch?v=...'
																						: 'https://example.com/file.pdf'
																				}
																			/>
																		</Box>
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
																						handleMediaUpload(event, moduleIndex, subsectionIndex, blockIndex).catch(
																							() => undefined
																						);
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
																						onChange={event =>
																							updateContentBlock(
																								moduleIndex,
																								subsectionIndex,
																								blockIndex,
																								currentBlock => ({
																									...currentBlock,
																									url: event.currentTarget.value
																								})
																							)
																						}
																						placeholder="Uploaded URL"
																					/>
																				</Box>
																				<Box>
																					<FieldLabel>Public ID</FieldLabel>
																					<Input
																						value={block.publicId}
																						onChange={event =>
																							updateContentBlock(
																								moduleIndex,
																								subsectionIndex,
																								blockIndex,
																								currentBlock => ({
																									...currentBlock,
																									publicId: event.currentTarget.value
																								})
																							)
																						}
																						placeholder="Cloudinary public ID"
																					/>
																				</Box>
																				<Box>
																					<FieldLabel>MIME type</FieldLabel>
																					<Input
																						value={block.mimeType}
																						onChange={event =>
																							updateContentBlock(
																								moduleIndex,
																								subsectionIndex,
																								blockIndex,
																								currentBlock => ({
																									...currentBlock,
																									mimeType: event.currentTarget.value
																								})
																							)
																						}
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
																			<a
																				href={block.url}
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
																		</HStack>
																	) : null}
																</Stack>
															</Box>
														);
													})}
												</Stack>
											</Box>
										</Stack>
									</Box>
								))}
							</Stack>
						</Box>
					</Stack>
				</Box>
			))}
		</Stack>
	);
};

export default CourseCurriculumEditor;
