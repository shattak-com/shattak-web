import { getJson, putJson } from '~/lib/api/client';

export type AdminCurriculumSectionType = 'LESSONS' | 'LIVE_SESSIONS' | 'POST_SESSION_MATERIALS';

export type AdminCurriculumContentBlockType =
	| 'TEXT'
	| 'VIDEO_UPLOAD'
	| 'VIDEO_YOUTUBE'
	| 'PDF_UPLOAD'
	| 'PDF_LINK'
	| 'PPT_UPLOAD'
	| 'PPT_LINK';

export type AdminCurriculumContentVisibility = 'PUBLIC_PREVIEW' | 'ENROLLED_ONLY';

export type AdminCurriculumContentBlock = {
	id?: string;
	type: AdminCurriculumContentBlockType;
	visibility: AdminCurriculumContentVisibility;
	title: string;
	body: string;
	url: string;
	publicId: string;
	mimeType: string;
	fileName: string;
	fileSize: number | null;
	sortOrder: number;
	metadata: Record<string, unknown>;
};

export type AdminCurriculumSubsection = {
	id?: string;
	title: string;
	previewSummary: string;
	durationLabel: string;
	durationMinutes: number | null;
	sortOrder: number;
	contentBlocks: AdminCurriculumContentBlock[];
};

export type AdminCurriculumModule = {
	id?: string;
	sectionType?: AdminCurriculumSectionType;
	title: string;
	description: string;
	sortOrder: number;
	subsections: AdminCurriculumSubsection[];
};

export type AdminCourseCurriculum = {
	sections: {
		lessons: AdminCurriculumModule[];
		liveSessions: AdminCurriculumModule[];
		postSessionMaterials: AdminCurriculumModule[];
	};
};

export const getAdminCourseCurriculum = (courseId: string) =>
	getJson<{ curriculum: AdminCourseCurriculum }>(`/admin/courses/${courseId}/curriculum`);

export const replaceAdminCourseCurriculum = (courseId: string, curriculum: AdminCourseCurriculum) =>
	putJson<{ curriculum: AdminCourseCurriculum }>(`/admin/courses/${courseId}/curriculum`, curriculum);
