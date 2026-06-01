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

type PendingRemoval = {
	title: string;
	message: string;
	confirmLabel: string;
	onConfirm: () => void;
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

const getModuleStateKey = (sectionKey: CurriculumSectionKey, module: AdminCurriculumModule, moduleIndex: number) =>
	module.id || `${sectionKey}-module-${moduleIndex}`;

const toSafeString = (value: unknown) => {
	if (typeof value === 'string') {
		return value;
	}

	if (value === null || value === undefined) {
		return '';
	}

	return String(value);
};

const toSafeNumberOrNull = (value: unknown) => {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		return null;
	}

	return value;
};

const getContentBlockType = (value: unknown): AdminCurriculumContentBlockType =>
	contentBlockTypeOptions.some(option => option.value === value) ? (value as AdminCurriculumContentBlockType) : 'TEXT';

const getContentVisibility = (value: unknown): AdminCurriculumContentVisibility =>
	visibilityOptions.some(option => option.value === value)
		? (value as AdminCurriculumContentVisibility)
		: 'ENROLLED_ONLY';

const normalizeContentBlocks = (blocks?: AdminCurriculumContentBlock[] | null) =>
	(Array.isArray(blocks) ? blocks : []).map((block, index) => {
		const currentBlock = block ?? createContentBlock();

		return {
			...currentBlock,
			type: getContentBlockType(currentBlock.type),
			visibility: getContentVisibility(currentBlock.visibility),
			title: toSafeString(currentBlock.title),
			body: toSafeString(currentBlock.body),
			url: toSafeString(currentBlock.url),
			publicId: toSafeString(currentBlock.publicId),
			mimeType: toSafeString(currentBlock.mimeType),
			fileName: toSafeString(currentBlock.fileName),
			fileSize: toSafeNumberOrNull(currentBlock.fileSize),
			sortOrder: index,
			metadata: currentBlock.metadata ?? {}
		};
	});

const normalizeSubsections = (subsections?: AdminCurriculumSubsection[] | null) =>
	(Array.isArray(subsections) ? subsections : []).map((subsection, index) => {
		const currentSubsection = subsection ?? createSubsection();

		return {
			...currentSubsection,
			title: toSafeString(currentSubsection.title),
			previewSummary: toSafeString(currentSubsection.previewSummary),
			durationLabel: toSafeString(currentSubsection.durationLabel),
			durationMinutes: toSafeNumberOrNull(currentSubsection.durationMinutes),
			sortOrder: index,
			contentBlocks: normalizeContentBlocks(currentSubsection.contentBlocks)
		};
	});

const normalizeModules = (sectionKey: CurriculumSectionKey, modules?: AdminCurriculumModule[] | null) =>
	(Array.isArray(modules) ? modules : []).map((module, index) => {
		const currentModule = module ?? createModule(sectionKey);

		return {
			...currentModule,
			sectionType: sectionTypeByKey[sectionKey],
			title: toSafeString(currentModule.title),
			description: toSafeString(currentModule.description),
			sortOrder: index,
			subsections: normalizeSubsections(currentModule.subsections)
		};
	});

const normalizeCurriculum = (curriculum: AdminCourseCurriculum): AdminCourseCurriculum => {
	const sections = curriculum.sections ?? emptyCurriculum().sections;

	return {
		sections: {
			prerequisites: normalizeModules('prerequisites', sections.prerequisites),
			liveSessions: normalizeModules('liveSessions', sections.liveSessions),
			postSessionMaterials: normalizeModules('postSessionMaterials', sections.postSessionMaterials)
		}
	};
};

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

const getYouTubeVideoId = (value: string) => {
	if (!value.trim()) {
		return null;
	}

	try {
		const url = new URL(value.trim());
		const hostname = url.hostname.replace(/^www\./, '');

		if (hostname === 'youtu.be') {
			return url.pathname.split('/').filter(Boolean)[0] ?? null;
		}

		if (!['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(hostname)) {
			return null;
		}

		if (url.pathname === '/watch') {
			return url.searchParams.get('v');
		}

		const [firstSegment, secondSegment] = url.pathname.split('/').filter(Boolean);

		if (['embed', 'shorts', 'live'].includes(firstSegment ?? '')) {
			return secondSegment ?? null;
		}

		return null;
	} catch {
		return null;
	}
};

const isValidYouTubeUrl = (value: string) => {
	if (!isValidUrl(value)) {
		return false;
	}

	return Boolean(getYouTubeVideoId(value));
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

const parseOptionalInteger = (value: string) => {
	const trimmedValue = value.trim();

	if (!trimmedValue) {
		return null;
	}

	const parsedValue = Number.parseInt(trimmedValue, 10);

	return Number.isFinite(parsedValue) ? parsedValue : null;
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
		onChange={event => {
			const nextValue = event.currentTarget.value ?? '';

			onChange(nextValue);
		}}
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
		onChange={event => {
			const nextValue = event.currentTarget.value ?? '';

			onChange(nextValue);
		}}
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

const getLinkPreviewLabel = (type: AdminCurriculumContentBlockType) => {
	if (type === 'PDF_LINK') {
		return 'PDF link';
	}

	if (type === 'PPT_LINK') {
		return 'Presentation link';
	}

	if (type === 'VIDEO_YOUTUBE') {
		return 'YouTube video';
	}

	return 'Linked content';
};

const isSafeYouTubeVideoId = (value: string) => /^[A-Za-z0-9_-]{6,}$/.test(value);

const CurriculumLinkPreview = ({
	type,
	url,
	title
}: {
	type: AdminCurriculumContentBlockType;
	url: string;
	title?: string;
}) => {
	const trimmedUrl = url.trim();

	if (!trimmedUrl) {
		return null;
	}

	const isSafeUrl = isValidUrl(trimmedUrl);
	const linkLabel = getLinkPreviewLabel(type);
	const displayTitle = title?.trim() || linkLabel;

	if (!isSafeUrl) {
		return (
			<Box border="1px solid" borderColor="red.300" borderRadius="lg" bg="bg.subtle" p={3}>
				<Text fontSize="sm" fontWeight="semibold" color="red.500">
					Invalid or incomplete link
				</Text>
				<Text mt={1} fontSize="xs" color="text.muted" wordBreak="break-word">
					{trimmedUrl}
				</Text>
			</Box>
		);
	}

	if (type === 'VIDEO_YOUTUBE') {
		const videoId = getYouTubeVideoId(trimmedUrl);
		const canEmbed = videoId && isSafeYouTubeVideoId(videoId);

		if (!canEmbed) {
			return (
				<Box border="1px solid" borderColor="red.300" borderRadius="lg" bg="bg.subtle" p={3}>
					<Text fontSize="sm" fontWeight="semibold" color="red.500">
						Unsupported YouTube link
					</Text>
					<Text mt={1} fontSize="xs" color="text.muted" wordBreak="break-word">
						Use a standard YouTube watch, short, live, embed, or youtu.be link.
					</Text>
				</Box>
			);
		}

		return (
			<Box border="1px solid" borderColor="border.default" borderRadius="lg" bg="bg.subtle" overflow="hidden">
				<iframe
					src={`https://www.youtube-nocookie.com/embed/${videoId}`}
					title={displayTitle}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowFullScreen
					style={{
						aspectRatio: '16 / 9',
						border: 0,
						display: 'block',
						width: '100%'
					}}
				/>
				<HStack justify="space-between" gap={3} flexWrap="wrap" p={3}>
					<Box minW={0}>
						<Text fontSize="sm" fontWeight="semibold">
							{displayTitle}
						</Text>
						<Text fontSize="xs" color="text.muted">
							YouTube preview
						</Text>
					</Box>
					<a
						href={trimmedUrl}
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
			</Box>
		);
	}

	return (
		<Box border="1px solid" borderColor="border.default" borderRadius="lg" bg="bg.subtle" p={3}>
			<HStack justify="space-between" gap={3} align="start" flexWrap="wrap">
				<Box minW={0}>
					<Text fontSize="sm" fontWeight="semibold">
						{displayTitle}
					</Text>
					<Text fontSize="xs" color="text.muted">
						{linkLabel}
					</Text>
					<Text mt={2} fontSize="xs" color="text.muted" wordBreak="break-word">
						{trimmedUrl}
					</Text>
				</Box>
				<a
					href={trimmedUrl}
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
		</Box>
	);
};

const ConfirmationDialog = ({
	confirmation,
	onCancel,
	onConfirm
}: {
	confirmation: PendingRemoval;
	onCancel: () => void;
	onConfirm: () => void;
}) => (
	<>
		<Box position="fixed" inset={0} bg="blackAlpha.700" zIndex={1690} onClick={onCancel} />
		<Box
			position="fixed"
			top="50%"
			left="50%"
			transform="translate(-50%, -50%)"
			w={{ base: 'calc(100vw - 32px)', sm: '420px' }}
			maxW="100vw"
			bg="bg.card"
			border="1px solid"
			borderColor="border.default"
			borderRadius="xl"
			boxShadow="2xl"
			p={5}
			zIndex={1700}
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="curriculum-remove-title"
			aria-describedby="curriculum-remove-description"
		>
			<Stack gap={4}>
				<Box>
					<Text id="curriculum-remove-title" fontSize="lg" fontWeight="bold">
						{confirmation.title}
					</Text>
					<Text id="curriculum-remove-description" mt={2} fontSize="sm" color="text.muted">
						{confirmation.message}
					</Text>
				</Box>
				<HStack justify="flex-end" gap={2} flexWrap="wrap">
					<Button type="button" variant="outline" borderRadius="full" onClick={onCancel}>
						Cancel
					</Button>
					<Button type="button" bg="red.500" color="white" borderRadius="full" onClick={onConfirm}>
						{confirmation.confirmLabel}
					</Button>
				</HStack>
			</Stack>
		</Box>
	</>
);

const shouldUseLegacyInlineSubsectionEditor = false;

const CourseCurriculumEditor = ({ courseId, sectionKey, title, description }: CourseCurriculumEditorProps) => {
	const [curriculum, setCurriculum] = useState<AdminCourseCurriculum>(emptyCurriculum);
	const [isLoading, setIsLoading] = useState(Boolean(courseId));
	const [isSaving, setIsSaving] = useState(false);
	const [uploadingBlockKey, setUploadingBlockKey] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<CurriculumFeedback | null>(null);
	const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
	const [collapsedModuleKeys, setCollapsedModuleKeys] = useState<Set<string>>(() => new Set());
	const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
	const [selectedSubsectionIndex, setSelectedSubsectionIndex] = useState<number | null>(null);
	const sectionModules = useMemo(() => curriculum.sections[sectionKey] ?? [], [curriculum.sections, sectionKey]);
	const selectedModule = selectedModuleIndex === null ? null : (sectionModules[selectedModuleIndex] ?? null);
	const selectedSubsection =
		selectedModule && selectedSubsectionIndex !== null
			? (selectedModule.subsections[selectedSubsectionIndex] ?? null)
			: null;
	const totalSubsections = sectionModules.reduce((total, module) => total + module.subsections.length, 0);
	const totalContentBlocks = sectionModules.reduce(
		(total, module) =>
			total +
			module.subsections.reduce((subsectionTotal, subsection) => subsectionTotal + subsection.contentBlocks.length, 0),
		0
	);
	const collapsedModuleCount = sectionModules.filter((module, moduleIndex) =>
		collapsedModuleKeys.has(getModuleStateKey(sectionKey, module, moduleIndex))
	).length;

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

	useEffect(() => {
		if (selectedModuleIndex === null) {
			return;
		}

		const currentModule = sectionModules[selectedModuleIndex];

		if (!currentModule) {
			setSelectedModuleIndex(null);
			setSelectedSubsectionIndex(null);
			return;
		}

		if (!currentModule.subsections.length) {
			setSelectedSubsectionIndex(null);
			return;
		}

		if (selectedSubsectionIndex === null || selectedSubsectionIndex >= currentModule.subsections.length) {
			setSelectedSubsectionIndex(currentModule.subsections.length - 1);
		}
	}, [sectionModules, selectedModuleIndex, selectedSubsectionIndex]);

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

	const closeSubsectionPanel = () => {
		setSelectedModuleIndex(null);
		setSelectedSubsectionIndex(null);
	};

	const openSubsectionPanel = (moduleIndex: number, subsectionIndex = 0) => {
		const currentModule = sectionModules[moduleIndex];

		setSelectedModuleIndex(moduleIndex);
		setSelectedSubsectionIndex(
			currentModule?.subsections.length ? Math.min(subsectionIndex, currentModule.subsections.length - 1) : null
		);
	};

	const handleMoveModule = (moduleIndex: number, nextIndex: number) => {
		updateSectionModules(modules => moveItem(modules, moduleIndex, nextIndex));

		setSelectedModuleIndex(currentIndex => {
			if (currentIndex === null) {
				return currentIndex;
			}

			if (currentIndex === moduleIndex) {
				return nextIndex;
			}

			if (currentIndex === nextIndex) {
				return moduleIndex;
			}

			return currentIndex;
		});
	};

	const executeRemoveModule = (moduleIndex: number) => {
		updateSectionModules(modules => modules.filter((_, index) => index !== moduleIndex));

		setSelectedModuleIndex(currentIndex => {
			if (currentIndex === null) {
				return currentIndex;
			}

			if (currentIndex === moduleIndex) {
				setSelectedSubsectionIndex(null);
				return null;
			}

			return currentIndex > moduleIndex ? currentIndex - 1 : currentIndex;
		});

		setCollapsedModuleKeys(currentKeys => {
			const nextKeys = new Set(currentKeys);
			const currentModule = sectionModules[moduleIndex];

			if (currentModule) {
				nextKeys.delete(getModuleStateKey(sectionKey, currentModule, moduleIndex));
			}

			return nextKeys;
		});
	};

	const requestRemoveModule = (moduleIndex: number) => {
		const currentModule = sectionModules[moduleIndex];
		const moduleTitle = currentModule?.title.trim() || `Module ${moduleIndex + 1}`;

		setPendingRemoval({
			title: 'Remove module?',
			message: `This will remove "${moduleTitle}" with all of its subsections and detailed content blocks. This change is not saved until you save the curriculum.`,
			confirmLabel: 'Remove module',
			onConfirm: () => executeRemoveModule(moduleIndex)
		});
	};

	const handleAddSubsection = (moduleIndex: number) => {
		const nextSubsectionIndex = sectionModules[moduleIndex]?.subsections.length ?? 0;

		updateModule(moduleIndex, currentModule => ({
			...currentModule,
			subsections: [...currentModule.subsections, createSubsection()]
		}));
		setSelectedModuleIndex(moduleIndex);
		setSelectedSubsectionIndex(nextSubsectionIndex);
	};

	const handleMoveSubsection = (moduleIndex: number, subsectionIndex: number, nextIndex: number) => {
		updateModule(moduleIndex, currentModule => ({
			...currentModule,
			subsections: moveItem(currentModule.subsections, subsectionIndex, nextIndex)
		}));

		if (selectedModuleIndex !== moduleIndex) {
			return;
		}

		setSelectedSubsectionIndex(currentIndex => {
			if (currentIndex === null) {
				return currentIndex;
			}

			if (currentIndex === subsectionIndex) {
				return nextIndex;
			}

			if (currentIndex === nextIndex) {
				return subsectionIndex;
			}

			return currentIndex;
		});
	};

	const executeRemoveSubsection = (moduleIndex: number, subsectionIndex: number) => {
		const subsectionCount = sectionModules[moduleIndex]?.subsections.length ?? 0;

		updateModule(moduleIndex, currentModule => ({
			...currentModule,
			subsections: currentModule.subsections.filter((_, index) => index !== subsectionIndex)
		}));

		if (selectedModuleIndex !== moduleIndex) {
			return;
		}

		setSelectedSubsectionIndex(currentIndex => {
			if (currentIndex === null) {
				return currentIndex;
			}

			if (subsectionCount <= 1) {
				return null;
			}

			if (currentIndex === subsectionIndex) {
				return Math.max(0, subsectionIndex - 1);
			}

			return currentIndex > subsectionIndex ? currentIndex - 1 : currentIndex;
		});
	};

	const requestRemoveSubsection = (moduleIndex: number, subsectionIndex: number) => {
		const subsection = sectionModules[moduleIndex]?.subsections[subsectionIndex];
		const subsectionTitle = subsection?.title.trim() || `Subsection ${subsectionIndex + 1}`;

		setPendingRemoval({
			title: 'Remove subsection?',
			message: `This will remove "${subsectionTitle}" and all detailed content blocks inside it. This change is not saved until you save the curriculum.`,
			confirmLabel: 'Remove subsection',
			onConfirm: () => executeRemoveSubsection(moduleIndex, subsectionIndex)
		});
	};

	const executeRemoveContentBlock = (moduleIndex: number, subsectionIndex: number, blockIndex: number) => {
		updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
			...currentSubsection,
			contentBlocks: currentSubsection.contentBlocks.filter((_, index) => index !== blockIndex)
		}));
	};

	const requestRemoveContentBlock = (moduleIndex: number, subsectionIndex: number, blockIndex: number) => {
		const block = sectionModules[moduleIndex]?.subsections[subsectionIndex]?.contentBlocks[blockIndex];
		const blockLabel =
			block?.title.trim() ||
			contentBlockTypeOptions.find(option => option.value === block?.type)?.label ||
			`Content block ${blockIndex + 1}`;

		setPendingRemoval({
			title: 'Remove content block?',
			message: `This will remove "${blockLabel}" from the selected subsection. Uploaded files are not deleted from Cloudinary automatically. This change is not saved until you save the curriculum.`,
			confirmLabel: 'Remove block',
			onConfirm: () => executeRemoveContentBlock(moduleIndex, subsectionIndex, blockIndex)
		});
	};

	const confirmPendingRemoval = () => {
		const removal = pendingRemoval;

		if (!removal) {
			return;
		}

		setPendingRemoval(null);
		removal.onConfirm();
	};

	const isModuleCollapsed = (module: AdminCurriculumModule, moduleIndex: number) =>
		collapsedModuleKeys.has(getModuleStateKey(sectionKey, module, moduleIndex));

	const toggleModuleCollapse = (module: AdminCurriculumModule, moduleIndex: number) => {
		const moduleKey = getModuleStateKey(sectionKey, module, moduleIndex);

		setCollapsedModuleKeys(currentKeys => {
			const nextKeys = new Set(currentKeys);

			if (nextKeys.has(moduleKey)) {
				nextKeys.delete(moduleKey);
			} else {
				nextKeys.add(moduleKey);
			}

			return nextKeys;
		});
	};

	const collapseAllModules = () => {
		setCollapsedModuleKeys(
			new Set(sectionModules.map((module, moduleIndex) => getModuleStateKey(sectionKey, module, moduleIndex)))
		);
	};

	const expandAllModules = () => {
		setCollapsedModuleKeys(new Set());
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

	const renderContentBlockEditor = (
		moduleIndex: number,
		subsectionIndex: number,
		subsection: AdminCurriculumSubsection,
		block: AdminCurriculumContentBlock,
		blockIndex: number
	) => {
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
									updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
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
								onClick={() => requestRemoveContentBlock(moduleIndex, subsectionIndex, blockIndex)}
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
									updateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
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
									updateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
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

									updateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
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
									updateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
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

										updateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
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
										handleMediaUpload(event, moduleIndex, subsectionIndex, blockIndex).catch(() => undefined);
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

											updateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
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

											updateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
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

											updateContentBlock(moduleIndex, subsectionIndex, blockIndex, currentBlock => ({
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

	const renderSubsectionPanel = () => {
		if (selectedModuleIndex === null || !selectedModule) {
			return null;
		}

		const moduleIndex = selectedModuleIndex;
		const subsectionIndex = selectedSubsectionIndex;

		return (
			<>
				<Box position="fixed" inset={0} bg="blackAlpha.700" zIndex={1390} onClick={closeSubsectionPanel} />
				<Box
					position="fixed"
					top={0}
					right={0}
					bottom={0}
					w={{ base: '100%', lg: 'min(1180px, calc(100vw - 260px))', '2xl': 'min(1360px, calc(100vw - 280px))' }}
					maxW="100vw"
					bg="bg.card"
					borderLeft="1px solid"
					borderColor="border.default"
					boxShadow="2xl"
					zIndex={1400}
				>
					<Stack h="100%" gap={0}>
						<Box borderBottom="1px solid" borderColor="border.default" p={{ base: 4, md: 5 }}>
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
									</HStack>
									<Text mt={2} fontSize="xl" fontWeight="bold">
										{selectedModule.title.trim() || 'Untitled module'}
									</Text>
									<Text mt={1} fontSize="sm" color="text.muted">
										Manage a single module&apos;s subsections and detailed content without expanding the full page.
									</Text>
								</Box>
								<Button type="button" variant="outline" borderRadius="full" onClick={closeSubsectionPanel}>
									Close
								</Button>
							</HStack>
						</Box>

						<Box flex="1" overflowY="auto" p={{ base: 4, md: 5 }}>
							<Box
								display="grid"
								gridTemplateColumns={{
									base: '1fr',
									xl: selectedModule.subsections.length ? '340px minmax(0, 1fr)' : '1fr',
									'2xl': selectedModule.subsections.length ? '380px minmax(0, 1fr)' : '1fr'
								}}
								gap={4}
							>
								<Box border="1px solid" borderColor="border.default" borderRadius="xl" p={4} alignSelf="start">
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
											onClick={() => handleAddSubsection(moduleIndex)}
										>
											Add
										</Button>
									</HStack>

									{selectedModule.subsections.length ? (
										<Stack gap={2}>
											{selectedModule.subsections.map((subsection, currentSubsectionIndex) => (
												<Box
													key={subsection.id ?? `subsection-${currentSubsectionIndex}`}
													border="1px solid"
													borderColor={
														currentSubsectionIndex === selectedSubsectionIndex ? 'primary' : 'border.default'
													}
													borderRadius="lg"
													bg={currentSubsectionIndex === selectedSubsectionIndex ? 'bg.subtle' : 'transparent'}
													p={3}
												>
													<Stack gap={2}>
														<Button
															type="button"
															variant="ghost"
															justifyContent="flex-start"
															h="auto"
															p={0}
															onClick={() => setSelectedSubsectionIndex(currentSubsectionIndex)}
														>
															<Stack gap={1} align="stretch" w="100%">
																<HStack gap={2} flexWrap="wrap">
																	<Badge colorPalette="gray">Subsection {currentSubsectionIndex + 1}</Badge>
																	{subsection.contentBlocks.length ? (
																		<Badge colorPalette="purple">{subsection.contentBlocks.length} blocks</Badge>
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
																	handleMoveSubsection(moduleIndex, currentSubsectionIndex, currentSubsectionIndex - 1)
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
																	handleMoveSubsection(moduleIndex, currentSubsectionIndex, currentSubsectionIndex + 1)
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
																onClick={() => requestRemoveSubsection(moduleIndex, currentSubsectionIndex)}
															>
																Remove
															</Button>
														</HStack>
													</Stack>
												</Box>
											))}
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
									<Box border="1px solid" borderColor="border.default" borderRadius="xl" p={4}>
										<Stack gap={4}>
											<HStack justify="space-between" gap={3} flexWrap="wrap">
												<Box>
													<HStack gap={2} flexWrap="wrap">
														<Badge colorPalette="gray">Subsection {subsectionIndex + 1}</Badge>
														<Text fontWeight="semibold">
															{selectedSubsection.title.trim() || 'Untitled subsection'}
														</Text>
													</HStack>
													<Text mt={1} fontSize="xs" color="text.muted">
														Public preview fields plus enrolled-only content blocks.
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

															updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
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

															updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
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

															updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
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

															updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
																...currentSubsection,
																durationMinutes: nextDurationMinutes
															}));
														}}
														placeholder="20"
													/>
												</Box>
											</SimpleGrid>

											<Box bg="bg.subtle" borderRadius="lg" p={3}>
												<Stack gap={3}>
													<Box>
														<Text fontSize="sm" fontWeight="semibold">
															Detailed content
														</Text>
														<Text fontSize="xs" color="text.muted">
															Default visibility is enrolled-only for future course-player access.
														</Text>
													</Box>

													{selectedSubsection.contentBlocks.length ? (
														selectedSubsection.contentBlocks.map((block, blockIndex) =>
															renderContentBlockEditor(
																moduleIndex,
																subsectionIndex,
																selectedSubsection,
																block,
																blockIndex
															)
														)
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
							{collapsedModuleCount ? <Badge colorPalette="gray">{collapsedModuleCount} collapsed</Badge> : null}
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
							disabled={!sectionModules.length || collapsedModuleCount === sectionModules.length}
							onClick={collapseAllModules}
						>
							Collapse all
						</Button>
						<Button
							type="button"
							variant="outline"
							borderRadius="full"
							disabled={!collapsedModuleCount}
							onClick={expandAllModules}
						>
							Expand all
						</Button>
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
								<Badge colorPalette="gray">{module.subsections.length} subsections</Badge>
								<Badge colorPalette="gray">
									{module.subsections.reduce((total, subsection) => total + subsection.contentBlocks.length, 0)} content
									blocks
								</Badge>
								<Text fontWeight="semibold">{module.title.trim() || 'Untitled module'}</Text>
							</HStack>
							<HStack gap={2}>
								<Button
									type="button"
									size="xs"
									variant="outline"
									borderRadius="full"
									onClick={() => toggleModuleCollapse(module, moduleIndex)}
								>
									{isModuleCollapsed(module, moduleIndex) ? 'Expand' : 'Collapse'}
								</Button>
								<Button
									type="button"
									size="xs"
									variant="outline"
									borderRadius="full"
									disabled={moduleIndex === 0}
									onClick={() => handleMoveModule(moduleIndex, moduleIndex - 1)}
								>
									Move up
								</Button>
								<Button
									type="button"
									size="xs"
									variant="outline"
									borderRadius="full"
									disabled={moduleIndex === sectionModules.length - 1}
									onClick={() => handleMoveModule(moduleIndex, moduleIndex + 1)}
								>
									Move down
								</Button>
								<Button
									type="button"
									size="xs"
									variant="outline"
									borderRadius="full"
									color="red.500"
									onClick={() => requestRemoveModule(moduleIndex)}
								>
									Remove
								</Button>
							</HStack>
						</HStack>

						{isModuleCollapsed(module, moduleIndex) ? (
							<Box borderTop="1px solid" borderColor="border.default" pt={4}>
								<Text fontSize="sm" color="text.muted">
									Module details are collapsed. Expand this module to edit its title, description, and subsections.
								</Text>
							</Box>
						) : (
							<>
								<SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
									<Box>
										<FieldLabel>Module title</FieldLabel>
										<Input
											value={module.title}
											onChange={event => {
												const nextTitle = event.currentTarget.value ?? '';

												updateModule(moduleIndex, currentModule => ({
													...currentModule,
													title: nextTitle
												}));
											}}
											placeholder="Guitar fundamentals"
										/>
									</Box>
									<Box>
										<FieldLabel>Short description</FieldLabel>
										<Input
											value={module.description}
											onChange={event => {
												const nextDescription = event.currentTarget.value ?? '';

												updateModule(moduleIndex, currentModule => ({
													...currentModule,
													description: nextDescription
												}));
											}}
											placeholder="Optional admin/public context"
										/>
									</Box>
								</SimpleGrid>

								{shouldUseLegacyInlineSubsectionEditor ? (
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
																			subsections: moveItem(
																				currentModule.subsections,
																				subsectionIndex,
																				subsectionIndex - 1
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
																	disabled={subsectionIndex === module.subsections.length - 1}
																	onClick={() =>
																		updateModule(moduleIndex, currentModule => ({
																			...currentModule,
																			subsections: moveItem(
																				currentModule.subsections,
																				subsectionIndex,
																				subsectionIndex + 1
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
																		updateModule(moduleIndex, currentModule => ({
																			...currentModule,
																			subsections: currentModule.subsections.filter(
																				(_, index) => index !== subsectionIndex
																			)
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
																	onChange={event => {
																		const nextTitle = event.currentTarget.value ?? '';

																		updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
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
																	value={subsection.previewSummary}
																	onChange={event => {
																		const nextPreviewSummary = event.currentTarget.value ?? '';

																		updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
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
																	value={subsection.durationLabel}
																	onChange={event => {
																		const nextDurationLabel = event.currentTarget.value ?? '';

																		updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
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
																	value={subsection.durationMinutes ?? ''}
																	onChange={event => {
																		const nextDurationMinutes = parseOptionalInteger(event.currentTarget.value ?? '');

																		updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
																			...currentSubsection,
																			durationMinutes: nextDurationMinutes
																		}));
																	}}
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
																						<Badge
																							colorPalette={block.visibility === 'PUBLIC_PREVIEW' ? 'green' : 'orange'}
																						>
																							{block.visibility === 'PUBLIC_PREVIEW'
																								? 'Public preview'
																								: 'Enrolled only'}
																						</Badge>
																						<Text fontSize="sm" fontWeight="semibold">
																							{
																								contentBlockTypeOptions.find(option => option.value === block.type)
																									?.label
																							}
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
																							onChange={event => {
																								const nextTitle = event.currentTarget.value ?? '';

																								updateContentBlock(
																									moduleIndex,
																									subsectionIndex,
																									blockIndex,
																									currentBlock => ({
																										...currentBlock,
																										title: nextTitle
																									})
																								);
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
																							onChange={event => {
																								const nextUrl = event.currentTarget.value ?? '';

																								updateContentBlock(
																									moduleIndex,
																									subsectionIndex,
																									blockIndex,
																									currentBlock => ({
																										...currentBlock,
																										url: nextUrl
																									})
																								);
																							}}
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
																									handleMediaUpload(
																										event,
																										moduleIndex,
																										subsectionIndex,
																										blockIndex
																									).catch(() => undefined);
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

																										updateContentBlock(
																											moduleIndex,
																											subsectionIndex,
																											blockIndex,
																											currentBlock => ({
																												...currentBlock,
																												url: nextUrl
																											})
																										);
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

																										updateContentBlock(
																											moduleIndex,
																											subsectionIndex,
																											blockIndex,
																											currentBlock => ({
																												...currentBlock,
																												publicId: nextPublicId
																											})
																										);
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

																										updateContentBlock(
																											moduleIndex,
																											subsectionIndex,
																											blockIndex,
																											currentBlock => ({
																												...currentBlock,
																												mimeType: nextMimeType
																											})
																										);
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
								) : (
									<Box borderTop="1px solid" borderColor="border.default" pt={4}>
										<HStack justify="space-between" gap={3} flexWrap="wrap">
											<Box>
												<HStack gap={2} flexWrap="wrap">
													<Text fontSize="sm" fontWeight="semibold">
														Subsections
													</Text>
													<Badge colorPalette="gray">{module.subsections.length} total</Badge>
													<Badge colorPalette="gray">
														{module.subsections.reduce(
															(total, subsection) => total + subsection.contentBlocks.length,
															0
														)}{' '}
														content blocks
													</Badge>
												</HStack>
												<Text mt={1} fontSize="xs" color="text.muted">
													Manage subsection details in the side panel to keep this page compact.
												</Text>
											</Box>
											<HStack gap={2} flexWrap="wrap">
												<Button
													type="button"
													size="sm"
													variant="outline"
													borderRadius="full"
													onClick={() => handleAddSubsection(moduleIndex)}
												>
													Add subsection
												</Button>
												<Button
													type="button"
													size="sm"
													bg="primary"
													color="text.inverse"
													borderRadius="full"
													onClick={() => openSubsectionPanel(moduleIndex)}
												>
													Manage subsections
												</Button>
											</HStack>
										</HStack>

										{module.subsections.length ? (
											<SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={2} mt={3}>
												{module.subsections.slice(0, 6).map((subsection, subsectionIndex) => (
													<Button
														key={subsection.id ?? `subsection-summary-${subsectionIndex}`}
														type="button"
														variant="outline"
														borderRadius="lg"
														h="auto"
														justifyContent="flex-start"
														p={3}
														onClick={() => openSubsectionPanel(moduleIndex, subsectionIndex)}
													>
														<Stack gap={1} align="stretch" minW={0}>
															<HStack gap={2} flexWrap="wrap">
																<Badge colorPalette="gray">Subsection {subsectionIndex + 1}</Badge>
																{subsection.contentBlocks.length ? (
																	<Badge colorPalette="purple">{subsection.contentBlocks.length} blocks</Badge>
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
												))}
												{module.subsections.length > 6 ? (
													<Box border="1px dashed" borderColor="border.default" borderRadius="lg" p={3}>
														<Text fontSize="sm" fontWeight="semibold">
															+{module.subsections.length - 6} more subsections
														</Text>
														<Text mt={1} fontSize="xs" color="text.muted">
															Open the side panel to view and edit the full list.
														</Text>
													</Box>
												) : null}
											</SimpleGrid>
										) : (
											<Box border="1px dashed" borderColor="border.default" borderRadius="lg" p={4} mt={3}>
												<Text fontSize="sm" color="text.muted">
													No subsections in this module yet.
												</Text>
											</Box>
										)}
									</Box>
								)}
							</>
						)}
					</Stack>
				</Box>
			))}

			{renderSubsectionPanel()}
			{pendingRemoval ? (
				<ConfirmationDialog
					confirmation={pendingRemoval}
					onCancel={() => setPendingRemoval(null)}
					onConfirm={confirmPendingRemoval}
				/>
			) : null}
		</Stack>
	);
};

export default CourseCurriculumEditor;
