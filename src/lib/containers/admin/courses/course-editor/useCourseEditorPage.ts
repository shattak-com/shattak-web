import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, type SubmitErrorHandler } from 'react-hook-form';

import { createAdminCourse, getAdminCourse, updateAdminCourse, type AdminCourse } from '~/lib/api/admin-courses';
import type { CurriculumSectionKey } from '~/lib/containers/admin/courses/curriculum-editor/types';

import { courseEditorSteps, defaultFormValues } from './constants';
import { courseEditorSchema, type CourseEditorFormValues } from './schema';
import type { CourseEditorFeedback } from './types';
import { useUnsavedCourseEditorGuard } from './useUnsavedCourseEditorGuard';
import {
	collectErrorPaths,
	countErrorsByStep,
	courseToFormValues,
	formatDurationFromMinutes,
	formValuesToPayload,
	getStepForErrorPath
} from './utils';

export const useCourseEditorPage = ({ courseId }: { courseId?: string }) => {
	const router = useRouter();
	const [activeStepIndex, setActiveStepIndex] = useState(0);
	const [course, setCourse] = useState<AdminCourse | null>(null);
	const [isLoading, setIsLoading] = useState(Boolean(courseId));
	const [isSaving, setIsSaving] = useState(false);
	const [feedback, setFeedback] = useState<CourseEditorFeedback | null>(null);
	const [dirtyCurriculumSection, setDirtyCurriculumSection] = useState<CurriculumSectionKey | null>(null);
	const isEditMode = Boolean(courseId);
	const activeStep = courseEditorSteps[activeStepIndex];

	const form = useForm<CourseEditorFormValues>({
		resolver: zodResolver(courseEditorSchema),
		defaultValues: defaultFormValues
	});

	const {
		reset,
		watch,
		formState: { errors, isDirty }
	} = form;

	useEffect(() => {
		if (!courseId) {
			setIsLoading(false);
			return undefined;
		}

		let isMounted = true;

		getAdminCourse(courseId)
			.then(result => {
				if (isMounted) {
					setCourse(result.course);
					reset(courseToFormValues(result.course));
				}
			})
			.catch(() => {
				if (isMounted) {
					setFeedback({ tone: 'error', message: 'Unable to load course.' });
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
	}, [courseId, reset]);

	const errorPaths = useMemo(() => collectErrorPaths(errors), [errors]);
	const errorCountsByStep = useMemo(() => countErrorsByStep(errorPaths), [errorPaths]);

	const hasUnsavedChanges = isDirty || dirtyCurriculumSection !== null;
	const confirmLeaveEditor = useUnsavedCourseEditorGuard({
		hasUnsavedChanges,
		isSaving: isSaving && dirtyCurriculumSection === null
	});

	const handleCurriculumDirtyChange = useCallback((sectionKey: CurriculumSectionKey, sectionIsDirty: boolean) => {
		setDirtyCurriculumSection(currentSection => {
			if (sectionIsDirty) {
				return sectionKey;
			}

			return currentSection === sectionKey ? null : currentSection;
		});
	}, []);

	const requestStepChange = useCallback(
		(targetStepIndex: number) => {
			if (targetStepIndex === activeStepIndex || !courseEditorSteps[targetStepIndex]) {
				return;
			}

			if (dirtyCurriculumSection) {
				const dirtyStep = courseEditorSteps.find(step => step.id === dirtyCurriculumSection);
				const sectionLabel = dirtyStep?.label ?? 'current';
				// eslint-disable-next-line no-alert -- Curriculum state is local to the active section until explicitly saved.
				const shouldDiscard = window.confirm(
					`You have unsaved ${sectionLabel} curriculum changes. Switch sections and discard them?`
				);

				if (!shouldDiscard) {
					return;
				}

				setDirtyCurriculumSection(null);
			}

			setActiveStepIndex(targetStepIndex);
		},
		[activeStepIndex, dirtyCurriculumSection]
	);

	const handleSave = useCallback(
		async (values: CourseEditorFormValues) => {
			setIsSaving(true);
			setFeedback(null);

			try {
				const payload = formValuesToPayload(values);
				const result = courseId ? await updateAdminCourse(courseId, payload) : await createAdminCourse(payload);

				setCourse(result.course);
				reset(courseToFormValues(result.course));
				setFeedback({ tone: 'success', message: courseId ? 'Course saved.' : 'Course draft created.' });

				if (!courseId) {
					router.replace(`/admin/courses/${result.course.id}/edit`);
				}
			} catch (error) {
				setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to save course.' });
			} finally {
				setIsSaving(false);
			}
		},
		[courseId, reset, router]
	);

	const handleInvalidSave = useCallback<SubmitErrorHandler<CourseEditorFormValues>>(
		formErrors => {
			const currentErrorPaths = collectErrorPaths(formErrors);
			const firstErrorPath = currentErrorPaths[0];
			const targetStepId = firstErrorPath ? getStepForErrorPath(firstErrorPath) : 'basics';
			const targetStepIndex = courseEditorSteps.findIndex(step => step.id === targetStepId);
			const targetStep = courseEditorSteps[targetStepIndex];
			const errorCount = currentErrorPaths.length;
			const issueLabel = errorCount === 1 ? 'issue' : 'issues';
			const targetStepMessage = targetStep ? `, starting in ${targetStep.label}` : '';

			if (targetStepIndex >= 0) {
				requestStepChange(targetStepIndex);
			}

			setFeedback({
				tone: 'error',
				message: `Course was not saved. Fix ${errorCount} validation ${issueLabel}${targetStepMessage}.`
			});
		},
		[requestStepChange]
	);

	const handleBackToCourses = useCallback(() => {
		if (confirmLeaveEditor()) {
			router.push('/admin/courses');
		}
	}, [confirmLeaveEditor, router]);

	const watchedValues = watch();
	const courseViewHref = course?.slug ? `/course/${course.slug}` : null;
	const summaryItems = useMemo(
		() => [
			{ label: 'Status', value: watchedValues.status },
			{ label: 'Slug', value: watchedValues.slug || 'Generated on create' },
			{ label: 'Categories', value: watchedValues.categories.length ? watchedValues.categories.join(', ') : 'Not set' },
			{ label: 'Level', value: watchedValues.level },
			{ label: 'Mode', value: watchedValues.mode },
			{
				label: 'Duration',
				value: formatDurationFromMinutes(watchedValues.durationHours * 60 + watchedValues.durationMinutes)
			},
			{ label: 'Price', value: watchedValues.price > 0 ? `INR ${watchedValues.price}` : 'Free' }
		],
		[watchedValues]
	);

	return {
		activeStep,
		activeStepIndex,
		course,
		courseViewHref,
		errorCountsByStep,
		feedback,
		form,
		handleBackToCourses,
		handleInvalidSave,
		handleCurriculumDirtyChange,
		handleSave,
		dirtyCurriculumSection,
		hasUnsavedChanges,
		isDirty,
		isEditMode,
		isLoading,
		isSaving,
		requestStepChange,
		summaryItems,
		watchedValues
	};
};
