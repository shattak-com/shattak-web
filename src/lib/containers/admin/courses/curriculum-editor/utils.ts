import type {
	AdminCourseCurriculum,
	AdminCurriculumContentBlock,
	AdminCurriculumContentBlockType,
	AdminCurriculumContentVisibility,
	AdminCurriculumModule,
	AdminCurriculumSubsection
} from '~/lib/api/admin-curriculum';

import {
	contentBlockTypeOptions,
	sectionLabelByKey,
	sectionTypeByKey,
	uploadBlockTypes,
	visibilityOptions
} from './constants';
import type { CurriculumSectionKey } from './types';

export const createEditorId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const emptyCurriculum = (): AdminCourseCurriculum => ({
	sections: {
		lessons: [],
		liveSessions: [],
		postSessionMaterials: []
	}
});

export const createContentBlock = (type: AdminCurriculumContentBlockType = 'TEXT'): AdminCurriculumContentBlock => ({
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

export const createSubsection = (): AdminCurriculumSubsection => ({
	id: createEditorId('subsection'),
	title: '',
	previewSummary: '',
	durationLabel: '',
	durationMinutes: null,
	sortOrder: 0,
	contentBlocks: []
});

export const createModule = (sectionKey: CurriculumSectionKey): AdminCurriculumModule => ({
	id: createEditorId('module'),
	sectionType: sectionTypeByKey[sectionKey],
	title: '',
	description: '',
	sortOrder: 0,
	subsections: []
});

export const getModuleStateKey = (
	sectionKey: CurriculumSectionKey,
	module: AdminCurriculumModule,
	moduleIndex: number
) => module.id || `${sectionKey}-module-${moduleIndex}`;

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

export const normalizeContentBlocks = (blocks?: AdminCurriculumContentBlock[] | null) =>
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

export const normalizeSubsections = (subsections?: AdminCurriculumSubsection[] | null) =>
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

export const normalizeModules = (sectionKey: CurriculumSectionKey, modules?: AdminCurriculumModule[] | null) =>
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

export const normalizeCurriculum = (curriculum: AdminCourseCurriculum): AdminCourseCurriculum => {
	const sections = curriculum.sections ?? emptyCurriculum().sections;

	return {
		sections: {
			lessons: normalizeModules('lessons', sections.lessons),
			liveSessions: normalizeModules('liveSessions', sections.liveSessions),
			postSessionMaterials: normalizeModules('postSessionMaterials', sections.postSessionMaterials)
		}
	};
};

export const moveItem = <T>(items: T[], fromIndex: number, toIndex: number) => {
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

export const isValidUrl = (value: string) => {
	try {
		const url = new URL(value);

		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
};

export const getYouTubeVideoId = (value: string) => {
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

export const isValidYouTubeUrl = (value: string) => {
	if (!isValidUrl(value)) {
		return false;
	}

	return Boolean(getYouTubeVideoId(value));
};

export const formatBytes = (value: number | null) => {
	if (!value) {
		return '';
	}

	if (value < 1024 * 1024) {
		return `${Math.round(value / 1024)} KB`;
	}

	return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

export const parseOptionalInteger = (value: string) => {
	const trimmedValue = value.trim();

	if (!trimmedValue) {
		return null;
	}

	const parsedValue = Number.parseInt(trimmedValue, 10);

	return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const getCurriculumIssues = (curriculum: AdminCourseCurriculum) => {
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
