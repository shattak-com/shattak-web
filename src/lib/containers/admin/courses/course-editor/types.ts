import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';

import type { AdminCourse } from '~/lib/api/admin-courses';
import type { CurriculumSectionKey } from '~/lib/containers/admin/courses/curriculum-editor/types';

import type { CourseEditorFormValues } from './schema';

export type CourseEditorPageProps = {
	courseId?: string;
};

export type CourseEditorStepId =
	| 'basics'
	| 'media'
	| 'highlights'
	| 'outcomes'
	| 'audienceTools'
	| 'instructors'
	| 'gallery'
	| 'reviews'
	| 'lessons'
	| 'liveSessions'
	| 'postSessionMaterials'
	| 'review';

export type CourseEditorStep = {
	id: CourseEditorStepId;
	label: string;
	description: string;
};

export type CourseEditorStepGroup = {
	label: string;
	stepIds: CourseEditorStepId[];
};

export type CourseEditorSectionProps = {
	control: Control<CourseEditorFormValues>;
	register: UseFormRegister<CourseEditorFormValues>;
	errors: FieldErrors<CourseEditorFormValues>;
};

export type CourseEditorFeedback = {
	tone: 'success' | 'error' | 'info';
	message: string;
};

export type CourseEditorSummaryItem = {
	label: string;
	value: string | number;
};

export type CourseEditorStepFieldsProps = CourseEditorSectionProps & {
	activeStepId: CourseEditorStepId;
	summaryItems: CourseEditorSummaryItem[];
	course: AdminCourse | null;
	courseId?: string;
	onCurriculumDirtyChange: (sectionKey: CurriculumSectionKey, isDirty: boolean) => void;
};
