'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { trackCourseDashboardEvent } from '~/lib/analytics/mixpanel';
import { ApiRequestError } from '~/lib/api/client';
import {
	getCourseFeedback,
	submitCourseFeedback,
	type CourseEnrollment,
	type CourseFeedbackInput,
	type CourseFeedbackState
} from '~/lib/api/enrollments';

import { courseFeedbackSchema, defaultCourseFeedbackValues } from './feedback-schema';

export type CourseFeedbackNotice = {
	tone: 'success' | 'error' | 'info';
	message: string;
};

type UseCourseFeedbackOptions = {
	courseId: string;
	courseTitle: string;
	currentPath: string;
	enrollment: CourseEnrollment;
	userId?: string;
};

export const useCourseFeedback = ({
	courseId,
	courseTitle,
	currentPath,
	enrollment,
	userId
}: UseCourseFeedbackOptions) => {
	const requestIdRef = useRef(0);
	const [feedbackState, setFeedbackState] = useState<CourseFeedbackState | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [loadErrorMessage, setLoadErrorMessage] = useState('');
	const [notice, setNotice] = useState<CourseFeedbackNotice | null>(null);
	const form = useForm<CourseFeedbackInput>({
		resolver: zodResolver(courseFeedbackSchema),
		defaultValues: defaultCourseFeedbackValues
	});

	const applyFeedbackState = useCallback(
		(state: CourseFeedbackState) => {
			setFeedbackState(state);
			if (state.feedback) {
				form.reset(state.feedback);
			}
		},
		[form]
	);

	const loadFeedback = useCallback(async () => {
		requestIdRef.current += 1;
		const requestId = requestIdRef.current;
		setIsLoading(true);
		setLoadErrorMessage('');

		try {
			const state = await getCourseFeedback(courseId);
			if (requestId === requestIdRef.current) {
				applyFeedbackState(state);
			}
		} catch {
			if (requestId === requestIdRef.current) {
				setLoadErrorMessage('Unable to load the feedback form right now. Please try again.');
			}
		} finally {
			if (requestId === requestIdRef.current) {
				setIsLoading(false);
			}
		}
	}, [applyFeedbackState, courseId]);

	useEffect(() => {
		loadFeedback().catch(() => undefined);

		return () => {
			requestIdRef.current += 1;
		};
	}, [loadFeedback]);

	const handleSubmit = useCallback(
		async (values: CourseFeedbackInput) => {
			if (!feedbackState?.canSubmit || feedbackState.feedback || isSubmitting) {
				return;
			}

			setIsSubmitting(true);
			setNotice(null);

			try {
				const state = await submitCourseFeedback(courseId, values);
				applyFeedbackState(state);
				setNotice({ tone: 'success', message: 'Thank you. Your course feedback has been submitted.' });
				trackCourseDashboardEvent({
					eventName: 'course_feedback_submitted',
					courseId,
					courseTitle,
					userId,
					completionPercentage: state.courseCompleted ? 100 : enrollment.progressPercent,
					enrollmentStatus: enrollment.status,
					feedbackRating: state.feedback?.rating,
					sourcePage: currentPath
				});
			} catch (error) {
				if (error instanceof ApiRequestError && error.code === 'COURSE_FEEDBACK_ALREADY_SUBMITTED') {
					await loadFeedback();
					setNotice({ tone: 'info', message: 'Feedback has already been submitted for this course.' });
				} else if (error instanceof ApiRequestError && error.code === 'COURSE_FEEDBACK_COURSE_INCOMPLETE') {
					await loadFeedback();
					setNotice({ tone: 'error', message: 'Complete the course before submitting feedback.' });
				} else {
					setNotice({ tone: 'error', message: 'Your feedback was not submitted. Please try again.' });
				}
			} finally {
				setIsSubmitting(false);
			}
		},
		[
			applyFeedbackState,
			courseId,
			courseTitle,
			currentPath,
			enrollment.progressPercent,
			enrollment.status,
			feedbackState,
			isSubmitting,
			loadFeedback,
			userId
		]
	);

	return {
		feedbackState,
		form,
		handleSubmit,
		isLoading,
		isSubmitting,
		loadErrorMessage,
		loadFeedback,
		notice
	};
};
