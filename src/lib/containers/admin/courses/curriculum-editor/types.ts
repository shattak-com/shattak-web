import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

import type {
	AdminCourseCurriculum,
	AdminCurriculumContentBlock,
	AdminCurriculumModule,
	AdminCurriculumSubsection
} from '~/lib/api/admin-curriculum';

export type CurriculumSectionKey = keyof AdminCourseCurriculum['sections'];

export type CourseCurriculumEditorProps = {
	courseId?: string;
	sectionKey: CurriculumSectionKey;
	title: string;
	description: string;
};

export type CurriculumFeedback = {
	tone: 'success' | 'error' | 'info';
	message: string;
};

export type PendingRemoval = {
	title: string;
	message: string;
	confirmLabel: string;
	onConfirm: () => void;
};

export type UpdateModule = (
	moduleIndex: number,
	update: (module: AdminCurriculumModule) => AdminCurriculumModule
) => void;

export type UpdateSubsection = (
	moduleIndex: number,
	subsectionIndex: number,
	update: (subsection: AdminCurriculumSubsection) => AdminCurriculumSubsection
) => void;

export type UpdateContentBlock = (
	moduleIndex: number,
	subsectionIndex: number,
	blockIndex: number,
	update: (block: AdminCurriculumContentBlock) => AdminCurriculumContentBlock
) => void;

export type MediaUploadHandler = (
	event: ChangeEvent<HTMLInputElement>,
	moduleIndex: number,
	subsectionIndex: number,
	blockIndex: number
) => Promise<void>;

export type SetSelectedSubsectionIndex = Dispatch<SetStateAction<number | null>>;
