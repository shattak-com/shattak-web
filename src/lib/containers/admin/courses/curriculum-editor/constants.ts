import type {
	AdminCurriculumContentBlockType,
	AdminCurriculumContentVisibility,
	AdminCurriculumSectionType
} from '~/lib/api/admin-curriculum';

import type { CurriculumSectionKey } from './types';

export const sectionTypeByKey: Record<CurriculumSectionKey, AdminCurriculumSectionType> = {
	lessons: 'LESSONS',
	liveSessions: 'LIVE_SESSIONS',
	postSessionMaterials: 'POST_SESSION_MATERIALS'
};

export const sectionLabelByKey: Record<CurriculumSectionKey, string> = {
	lessons: 'Lessons',
	liveSessions: 'Live sessions',
	postSessionMaterials: 'Post-session materials'
};

export const contentBlockTypeOptions: Array<{ label: string; value: AdminCurriculumContentBlockType }> = [
	{ label: 'Text', value: 'TEXT' },
	{ label: 'Upload video', value: 'VIDEO_UPLOAD' },
	{ label: 'YouTube link', value: 'VIDEO_YOUTUBE' },
	{ label: 'Upload PDF', value: 'PDF_UPLOAD' },
	{ label: 'PDF link', value: 'PDF_LINK' },
	{ label: 'Upload PPT', value: 'PPT_UPLOAD' },
	{ label: 'PPT link', value: 'PPT_LINK' }
];

export const visibilityOptions: Array<{ label: string; value: AdminCurriculumContentVisibility }> = [
	{ label: 'Enrolled only', value: 'ENROLLED_ONLY' },
	{ label: 'Public preview', value: 'PUBLIC_PREVIEW' }
];

export const uploadBlockTypes = new Set<AdminCurriculumContentBlockType>(['VIDEO_UPLOAD', 'PDF_UPLOAD', 'PPT_UPLOAD']);

export const linkedBlockTypes = new Set<AdminCurriculumContentBlockType>(['VIDEO_YOUTUBE', 'PDF_LINK', 'PPT_LINK']);

export const getUploadAccept = (type: AdminCurriculumContentBlockType) => {
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
