'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { trackCourseDashboardEvent, trackEnrollmentEvent } from '~/lib/analytics/mixpanel';
import { getCurrentUser, type AuthenticatedUser } from '~/lib/api/auth';
import { ApiRequestError } from '~/lib/api/client';
import {
	completeCourseLesson,
	getCourseEnrollmentStatus,
	getCourseLearningDashboard,
	getCourseLessons,
	type CourseEnrollment,
	type CourseLearningDashboard,
	type CourseLessonsResult
} from '~/lib/api/enrollments';

import { courseTabs } from './constants';
import type { CourseTabId } from './types';
import { getActiveLessonContext, getCourseWorkspaceGridColumns, getNextLessonRow, isAdminLearner } from './utils';

type DashboardTrackingContext = {
	courseId: string;
	currentPath: string;
	result: {
		enrollment: CourseEnrollment;
		dashboard: CourseLearningDashboard;
	};
	trackedCertificateEnrollmentId: string | null;
	user: AuthenticatedUser | null;
};

const trackDashboardOpened = ({ courseId, currentPath, result, user }: DashboardTrackingContext) => {
	trackCourseDashboardEvent({
		eventName: 'course_opened',
		courseId,
		courseTitle: result.enrollment.course.title,
		userId: user?.id,
		streakDay: result.dashboard.streak.currentStreak,
		completionPercentage: result.dashboard.completion.percentage,
		enrollmentStatus: result.enrollment.status,
		sourcePage: currentPath
	});
};

const trackDashboardStreakUpdate = ({ courseId, currentPath, result, user }: DashboardTrackingContext) => {
	if (!result.dashboard.streak.streakUpdated) {
		return;
	}

	trackCourseDashboardEvent({
		eventName: 'course_streak_updated',
		courseId,
		courseTitle: result.enrollment.course.title,
		userId: user?.id,
		previousStreak: result.dashboard.streak.previousStreak,
		currentStreak: result.dashboard.streak.currentStreak,
		completionPercentage: result.dashboard.completion.percentage,
		enrollmentStatus: result.enrollment.status,
		sourcePage: currentPath
	});
};

const trackDashboardCertificateEarned = ({
	courseId,
	currentPath,
	result,
	trackedCertificateEnrollmentId,
	user
}: DashboardTrackingContext) => {
	if (
		result.dashboard.completion.certificateStatus !== 'EARNED' ||
		trackedCertificateEnrollmentId === result.enrollment.id
	) {
		return trackedCertificateEnrollmentId;
	}

	trackCourseDashboardEvent({
		eventName: 'course_certificate_earned',
		courseId,
		courseTitle: result.enrollment.course.title,
		userId: user?.id,
		completionPercentage: result.dashboard.completion.percentage,
		enrollmentStatus: result.enrollment.status,
		sourcePage: currentPath
	});

	return result.enrollment.id;
};

type CourseWorkspaceBootstrapOptions = {
	courseId: string;
	currentPath: string;
	loadDashboard: (user: AuthenticatedUser | null) => Promise<void>;
	onEnrollmentLoaded: (enrollment: CourseEnrollment) => void;
	onError: (message: string) => void;
	onLoadingComplete: () => void;
	onUserLoaded: (user: AuthenticatedUser) => void;
};

const useCourseWorkspaceBootstrap = ({
	courseId,
	currentPath,
	loadDashboard,
	onEnrollmentLoaded,
	onError,
	onLoadingComplete,
	onUserLoaded
}: CourseWorkspaceBootstrapOptions) => {
	const router = useRouter();

	useEffect(() => {
		let isMounted = true;

		const loadCourseWorkspace = async () => {
			try {
				const [userResult, enrollmentResult] = await Promise.all([
					getCurrentUser(),
					getCourseEnrollmentStatus(courseId)
				]);

				if (!isMounted) {
					return;
				}

				onUserLoaded(userResult.user);

				if (!enrollmentResult.isEnrolled || !enrollmentResult.enrollment) {
					onError('You are not enrolled in this course yet.');
					return;
				}

				onEnrollmentLoaded(enrollmentResult.enrollment);
				trackEnrollmentEvent({
					location: 'course_learning',
					eventName: 'Course Learning Page Viewed',
					courseId,
					courseTitle: enrollmentResult.enrollment.course.title,
					userId: userResult.user.id,
					isFreeCourse: enrollmentResult.enrollment.course.price === 0,
					enrollmentStatus: enrollmentResult.enrollment.status,
					sourcePage: currentPath
				});

				if (enrollmentResult.enrollment.accessUnlockedAt && isMounted) {
					await loadDashboard(userResult.user);
				}
			} catch (error) {
				if (error instanceof ApiRequestError && error.statusCode === 401) {
					router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
					return;
				}

				if (isMounted) {
					onError('Unable to load this course right now.');
				}
			} finally {
				if (isMounted) {
					onLoadingComplete();
				}
			}
		};

		loadCourseWorkspace().catch(() => undefined);

		return () => {
			isMounted = false;
		};
	}, [courseId, currentPath, loadDashboard, onEnrollmentLoaded, onError, onLoadingComplete, onUserLoaded, router]);
};

export const useCourseLearningPage = (courseId: string) => {
	const currentPath = `/my-courses/${courseId}`;
	const hasTrackedCertificateRef = useRef<string | null>(null);
	const workspaceRootRef = useRef<HTMLDivElement | null>(null);
	const focusModeButtonRef = useRef<HTMLButtonElement | null>(null);
	const exitFocusModeButtonRef = useRef<HTMLButtonElement | null>(null);
	const wasFocusModeRef = useRef(false);
	const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
	const [dashboard, setDashboard] = useState<CourseLearningDashboard | null>(null);
	const [activeTab, setActiveTab] = useState<CourseTabId>('overview');
	const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
	const [learnerName, setLearnerName] = useState('');
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
	const [isWorkspaceSidebarCollapsed, setIsWorkspaceSidebarCollapsed] = useState(false);
	const [isLearningRailCollapsed, setIsLearningRailCollapsed] = useState(false);
	const [isFocusMode, setIsFocusMode] = useState(false);
	const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
	const [isBrowserFullscreenSupported, setIsBrowserFullscreenSupported] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isDashboardLoading, setIsDashboardLoading] = useState(false);
	const [lessonsResult, setLessonsResult] = useState<CourseLessonsResult | null>(null);
	const [isLessonsLoading, setIsLessonsLoading] = useState(false);
	const [lessonErrorMessage, setLessonErrorMessage] = useState('');
	const [hasReachedLessonBottom, setHasReachedLessonBottom] = useState(false);
	const [isCompletingLesson, setIsCompletingLesson] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [dashboardErrorMessage, setDashboardErrorMessage] = useState('');
	const canBypassProgression = isAdminLearner(currentUser);
	const canOpenLearningTabs = Boolean(enrollment?.accessUnlockedAt) || canBypassProgression;

	const applyDashboardResult = useCallback(
		(result: { enrollment: CourseEnrollment; dashboard: CourseLearningDashboard }, user: AuthenticatedUser | null) => {
			setEnrollment(result.enrollment);
			setDashboard(result.dashboard);
			const trackingContext = {
				courseId,
				currentPath,
				result,
				trackedCertificateEnrollmentId: hasTrackedCertificateRef.current,
				user
			};

			trackDashboardOpened(trackingContext);
			trackDashboardStreakUpdate(trackingContext);
			hasTrackedCertificateRef.current = trackDashboardCertificateEarned(trackingContext);
		},
		[courseId, currentPath]
	);

	const loadDashboard = useCallback(
		async (user: AuthenticatedUser | null) => {
			setIsDashboardLoading(true);
			setDashboardErrorMessage('');

			try {
				const result = await getCourseLearningDashboard(courseId);
				applyDashboardResult(result, user);
			} catch {
				setDashboardErrorMessage('Unable to load your course dashboard right now. Please try again.');
			} finally {
				setIsDashboardLoading(false);
			}
		},
		[applyDashboardResult, courseId]
	);

	const loadLessons = useCallback(
		async (subsectionId?: string) => {
			setIsLessonsLoading(true);
			setLessonErrorMessage('');

			try {
				const result = await getCourseLessons(courseId, subsectionId);
				const activeContext = getActiveLessonContext(result.lessons);

				setLessonsResult(result);
				setEnrollment(result.enrollment);
				setHasReachedLessonBottom(result.lessons.hasAdminAccess);

				if (activeContext) {
					trackCourseDashboardEvent({
						eventName: 'course_lesson_opened',
						courseId,
						courseTitle: result.course.title,
						userId: currentUser?.id,
						lessonId: activeContext.subsection.id,
						lessonTitle: activeContext.subsection.title,
						moduleId: activeContext.courseModule.id,
						moduleTitle: activeContext.courseModule.title,
						completionPercentage: result.enrollment.progressPercent,
						enrollmentStatus: result.enrollment.status,
						sourcePage: currentPath
					});
				}
			} catch (error) {
				if (error instanceof ApiRequestError && error.code === 'COURSE_ACCESS_LOCKED') {
					setLessonErrorMessage('Lessons unlock after you confirm your WhatsApp community access from Overview.');
					return;
				}

				setLessonErrorMessage('Unable to load lessons right now. Please try again.');
			} finally {
				setIsLessonsLoading(false);
			}
		},
		[courseId, currentPath, currentUser?.id]
	);

	const handleWorkspaceUserLoaded = useCallback((user: AuthenticatedUser) => {
		setCurrentUser(user);
		setLearnerName(user.name.split(' ')[0] ?? '');
	}, []);
	const handleWorkspaceEnrollmentLoaded = useCallback((loadedEnrollment: CourseEnrollment) => {
		setEnrollment(loadedEnrollment);
	}, []);
	const handleWorkspaceError = useCallback((message: string) => {
		setErrorMessage(message);
	}, []);
	const handleWorkspaceLoadingComplete = useCallback(() => {
		setIsLoading(false);
	}, []);

	useCourseWorkspaceBootstrap({
		courseId,
		currentPath,
		loadDashboard,
		onEnrollmentLoaded: handleWorkspaceEnrollmentLoaded,
		onError: handleWorkspaceError,
		onLoadingComplete: handleWorkspaceLoadingComplete,
		onUserLoaded: handleWorkspaceUserLoaded
	});

	const handleCourseUnlocked = useCallback(
		(updatedEnrollment: CourseEnrollment) => {
			setEnrollment(updatedEnrollment);
			setDashboard(null);
			setLessonsResult(null);
			loadDashboard(currentUser).catch(() => undefined);
		},
		[currentUser, loadDashboard]
	);

	const handleTabChange = useCallback(
		(tabId: CourseTabId) => {
			if (tabId !== 'overview' && !canOpenLearningTabs) {
				setActiveTab('overview');
				return;
			}

			setActiveTab(tabId);
		},
		[canOpenLearningTabs]
	);

	useEffect(() => {
		if (activeTab !== 'lessons') {
			return;
		}

		if (!canOpenLearningTabs) {
			setActiveTab('overview');
			return;
		}

		if (!lessonsResult && !isLessonsLoading) {
			loadLessons().catch(() => undefined);
		}
	}, [activeTab, canOpenLearningTabs, isLessonsLoading, lessonsResult, loadLessons]);

	const handleLessonSelect = useCallback(
		(subsectionId: string) => {
			setHasReachedLessonBottom(canBypassProgression);
			loadLessons(subsectionId).catch(() => undefined);
		},
		[canBypassProgression, loadLessons]
	);

	const handleLessonBottomReached = useCallback(() => {
		setHasReachedLessonBottom(true);
	}, []);

	const handleAskDoubt = useCallback(() => {
		const whatsappGroupUrl = lessonsResult?.course.whatsappGroupUrl || enrollment?.course.whatsappGroupUrl || '';

		trackCourseDashboardEvent({
			eventName: 'course_doubt_clicked',
			courseId,
			courseTitle: lessonsResult?.course.title ?? enrollment?.course.title,
			userId: currentUser?.id,
			destination: 'community',
			enrollmentStatus: enrollment?.status,
			sourcePage: currentPath
		});

		if (whatsappGroupUrl && typeof window !== 'undefined') {
			window.open(whatsappGroupUrl, '_blank', 'noopener,noreferrer');
		}
	}, [courseId, currentPath, currentUser?.id, enrollment, lessonsResult]);

	const restoreScrollAfterWorkspaceChange = useCallback((scrollTop: number) => {
		window.requestAnimationFrame(() => {
			window.requestAnimationFrame(() => {
				window.scrollTo({ top: scrollTop, behavior: 'auto' });
			});
		});
	}, []);

	const handleEnterFocusMode = useCallback(() => {
		const scrollTop = window.scrollY;
		const activeContext = getActiveLessonContext(lessonsResult?.lessons ?? null);

		trackCourseDashboardEvent({
			eventName: 'course_focus_mode_entered',
			courseId,
			courseTitle: enrollment?.course.title,
			userId: currentUser?.id,
			lessonId: activeContext?.subsection.id,
			lessonTitle: activeContext?.subsection.title,
			moduleId: activeContext?.courseModule.id,
			moduleTitle: activeContext?.courseModule.title,
			displayMode: 'focus',
			sourcePage: currentPath
		});

		setIsMobileNavOpen(false);
		setIsFocusMode(true);
		restoreScrollAfterWorkspaceChange(scrollTop);
	}, [
		courseId,
		currentPath,
		currentUser?.id,
		enrollment?.course.title,
		lessonsResult?.lessons,
		restoreScrollAfterWorkspaceChange
	]);

	const handleExitFocusMode = useCallback(() => {
		const scrollTop = window.scrollY;
		const activeContext = getActiveLessonContext(lessonsResult?.lessons ?? null);

		trackCourseDashboardEvent({
			eventName: 'course_focus_mode_exited',
			courseId,
			courseTitle: enrollment?.course.title,
			userId: currentUser?.id,
			lessonId: activeContext?.subsection.id,
			lessonTitle: activeContext?.subsection.title,
			moduleId: activeContext?.courseModule.id,
			moduleTitle: activeContext?.courseModule.title,
			displayMode: 'standard',
			sourcePage: currentPath
		});

		if (document.fullscreenElement) {
			document.exitFullscreen().catch(() => undefined);
		}

		setIsFocusMode(false);
		restoreScrollAfterWorkspaceChange(scrollTop);
	}, [
		courseId,
		currentPath,
		currentUser?.id,
		enrollment?.course.title,
		lessonsResult?.lessons,
		restoreScrollAfterWorkspaceChange
	]);

	const handleToggleBrowserFullscreen = useCallback(async () => {
		const workspaceRoot = workspaceRootRef.current;
		if (!workspaceRoot || !document.fullscreenEnabled) {
			return;
		}

		if (document.fullscreenElement) {
			trackCourseDashboardEvent({
				eventName: 'course_fullscreen_toggled',
				courseId,
				courseTitle: enrollment?.course.title,
				userId: currentUser?.id,
				displayMode: 'focus',
				sourcePage: currentPath
			});
			await document.exitFullscreen();
			return;
		}

		trackCourseDashboardEvent({
			eventName: 'course_fullscreen_toggled',
			courseId,
			courseTitle: enrollment?.course.title,
			userId: currentUser?.id,
			displayMode: 'fullscreen',
			sourcePage: currentPath
		});
		await workspaceRoot.requestFullscreen();
	}, [courseId, currentPath, currentUser?.id, enrollment?.course.title]);

	useEffect(() => {
		setIsBrowserFullscreenSupported(document.fullscreenEnabled);

		const handleFullscreenChange = () => {
			setIsBrowserFullscreen(Boolean(document.fullscreenElement));
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);
		return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
	}, []);

	useEffect(() => {
		if (isFocusMode) {
			exitFocusModeButtonRef.current?.focus({ preventScroll: true });
		} else if (wasFocusModeRef.current) {
			focusModeButtonRef.current?.focus({ preventScroll: true });
		}

		wasFocusModeRef.current = isFocusMode;
	}, [isFocusMode]);

	useEffect(() => {
		if (!isFocusMode) {
			return undefined;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && !document.fullscreenElement) {
				handleExitFocusMode();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleExitFocusMode, isFocusMode]);

	useEffect(() => {
		if (isFocusMode && activeTab !== 'lessons') {
			handleExitFocusMode();
		}
	}, [activeTab, handleExitFocusMode, isFocusMode]);

	const handleCompleteLesson = useCallback(async () => {
		const lessons = lessonsResult?.lessons ?? null;
		const activeContext = getActiveLessonContext(lessons);

		if (!lessons || !activeContext || !enrollment) {
			return;
		}

		const { courseModule, subsection } = activeContext;
		const nextLesson = getNextLessonRow(lessons, subsection.id);

		trackCourseDashboardEvent({
			eventName: 'course_lesson_next_clicked',
			courseId,
			courseTitle: lessonsResult?.course.title,
			userId: currentUser?.id,
			lessonId: subsection.id,
			lessonTitle: subsection.title,
			moduleId: courseModule.id,
			moduleTitle: courseModule.title,
			destination: nextLesson ? 'lesson' : 'assignment',
			completionPercentage: enrollment.progressPercent,
			enrollmentStatus: enrollment.status,
			sourcePage: currentPath
		});

		setIsCompletingLesson(true);
		setLessonErrorMessage('');

		try {
			const result = await completeCourseLesson(courseId, subsection.id);
			setLessonsResult(result);
			setEnrollment(result.enrollment);
			setHasReachedLessonBottom(result.lessons.hasAdminAccess);

			trackCourseDashboardEvent({
				eventName: 'course_lesson_completed',
				courseId,
				courseTitle: result.course.title,
				userId: currentUser?.id,
				lessonId: subsection.id,
				lessonTitle: subsection.title,
				moduleId: courseModule.id,
				moduleTitle: courseModule.title,
				completionPercentage: result.enrollment.progressPercent,
				enrollmentStatus: result.enrollment.status,
				sourcePage: currentPath
			});

			if (!nextLesson && !result.lessons.hasAdminAccess) {
				setActiveTab('assignment');
			}
		} catch {
			setLessonErrorMessage('Unable to mark this lesson complete right now. Please try again.');
		} finally {
			setIsCompletingLesson(false);
		}
	}, [courseId, currentPath, currentUser?.id, enrollment, lessonsResult]);

	const activeTabLabel = useMemo(() => courseTabs.find(tab => tab.id === activeTab)?.label ?? 'Overview', [activeTab]);
	const activeLessonContext = useMemo(
		() => getActiveLessonContext(lessonsResult?.lessons ?? null),
		[lessonsResult?.lessons]
	);
	const shouldShowUnlockedOverviewRail =
		activeTab === 'overview' && Boolean(enrollment?.accessUnlockedAt && dashboard && !isDashboardLoading);
	const shouldShowLessonRail = activeTab === 'lessons' && canOpenLearningTabs;
	const shouldShowOverviewRail = activeTab === 'overview' || shouldShowLessonRail;
	const workspaceGridColumns = isFocusMode
		? 'minmax(0, 1fr)'
		: getCourseWorkspaceGridColumns(shouldShowOverviewRail, isLearningRailCollapsed);

	return {
		activeLessonContext,
		activeTab,
		activeTabLabel,
		canBypassProgression,
		currentUser,
		dashboard,
		dashboardErrorMessage,
		enrollment,
		errorMessage,
		exitFocusModeButtonRef,
		focusModeButtonRef,
		handleAskDoubt,
		handleCompleteLesson,
		handleCourseUnlocked,
		handleEnterFocusMode,
		handleExitFocusMode,
		handleLessonBottomReached,
		handleLessonSelect,
		handleTabChange,
		handleToggleBrowserFullscreen,
		hasReachedLessonBottom,
		isBrowserFullscreen,
		isBrowserFullscreenSupported,
		isCompletingLesson,
		isDashboardLoading,
		isFocusMode,
		isLearningRailCollapsed,
		isLessonsLoading,
		isLoading,
		isMobileNavOpen,
		isWorkspaceSidebarCollapsed,
		learnerName,
		lessonErrorMessage,
		lessonsResult,
		loadDashboard,
		loadLessons,
		setIsLearningRailCollapsed,
		setIsMobileNavOpen,
		setIsWorkspaceSidebarCollapsed,
		shouldShowLessonRail,
		shouldShowOverviewRail,
		shouldShowUnlockedOverviewRail,
		workspaceGridColumns,
		workspaceRootRef
	};
};
