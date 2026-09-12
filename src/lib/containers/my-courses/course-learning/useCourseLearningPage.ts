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
import { buildCourseWorkspacePath, getCourseWorkspaceRoute, parseCourseWorkspacePath } from './routes';
import type { CourseTabId, CourseWorkspaceRoute } from './types';
import { getActiveLessonContext, getCourseWorkspaceGridColumns, getNextLessonRow, isAdminLearner } from './utils';

const CONTENT_WIDTH_STORAGE_KEY = 'shattak-course-content-width';
const LESSON_NAVIGATION_PINNED_SESSION_KEY = 'shattak-course-lesson-navigation-pinned';

type RouteNavigationMode = 'push' | 'replace';

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

export const useCourseLearningPage = (courseId: string, initialRoute: CourseWorkspaceRoute) => {
	const initialPathRef = useRef(buildCourseWorkspacePath(courseId, initialRoute));
	const currentPathRef = useRef(initialPathRef.current);
	const hasTrackedCertificateRef = useRef<string | null>(null);
	const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
	const [dashboard, setDashboard] = useState<CourseLearningDashboard | null>(null);
	const [currentRoute, setCurrentRoute] = useState<CourseWorkspaceRoute>(initialRoute);
	const [activeTab, setActiveTab] = useState<CourseTabId>(initialRoute.tab);
	const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
	const [learnerName, setLearnerName] = useState('');
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
	const [isWorkspaceSidebarCollapsed, setIsWorkspaceSidebarCollapsed] = useState(false);
	const [isLearningRailCollapsed, setIsLearningRailCollapsed] = useState(false);
	const [isContentExpanded, setIsContentExpanded] = useState(false);
	const [isLessonNavigationPinned, setIsLessonNavigationPinned] = useState(false);
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

	const navigateToRoute = useCallback(
		(route: CourseWorkspaceRoute, mode: RouteNavigationMode = 'push') => {
			const nextPath = buildCourseWorkspacePath(courseId, route);
			setCurrentRoute(route);
			setActiveTab(route.tab);

			if (nextPath === currentPathRef.current) {
				return;
			}

			currentPathRef.current = nextPath;

			if (mode === 'replace') {
				window.history.replaceState(window.history.state, '', nextPath);
				return;
			}

			window.history.pushState(window.history.state, '', nextPath);
		},
		[courseId]
	);

	const applyDashboardResult = useCallback(
		(result: { enrollment: CourseEnrollment; dashboard: CourseLearningDashboard }, user: AuthenticatedUser | null) => {
			setEnrollment(result.enrollment);
			setDashboard(result.dashboard);
			const trackingContext = {
				courseId,
				currentPath: currentPathRef.current,
				result,
				trackedCertificateEnrollmentId: hasTrackedCertificateRef.current,
				user
			};

			trackDashboardOpened(trackingContext);
			trackDashboardStreakUpdate(trackingContext);
			hasTrackedCertificateRef.current = trackDashboardCertificateEarned(trackingContext);
		},
		[courseId]
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
		async (subsectionId?: string, navigationMode: RouteNavigationMode = 'replace') => {
			setIsLessonsLoading(true);
			setLessonErrorMessage('');

			try {
				const result = await getCourseLessons(courseId, subsectionId);
				const activeContext = getActiveLessonContext(result.lessons);

				setLessonsResult(result);
				setEnrollment(result.enrollment);
				setHasReachedLessonBottom(result.lessons.hasAdminAccess);

				if (activeContext) {
					const lessonRoute = getCourseWorkspaceRoute('lessons', {
						moduleId: activeContext.courseModule.id,
						subsectionId: activeContext.subsection.id
					});
					const lessonPath = buildCourseWorkspacePath(courseId, lessonRoute);

					if (lessonPath !== currentPathRef.current) {
						navigateToRoute(lessonRoute, navigationMode);
					}

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
						sourcePage: lessonPath
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
		[courseId, currentUser?.id, navigateToRoute]
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
		currentPath: initialPathRef.current,
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

	useEffect(() => {
		currentPathRef.current = buildCourseWorkspacePath(courseId, initialRoute);
		setCurrentRoute(initialRoute);
		setActiveTab(initialRoute.tab);
	}, [courseId, initialRoute]);

	useEffect(() => {
		const handleHistoryNavigation = () => {
			const route = parseCourseWorkspacePath(window.location.pathname, courseId);
			if (!route) {
				return;
			}

			currentPathRef.current = buildCourseWorkspacePath(courseId, route);
			setCurrentRoute(route);
			setActiveTab(route.tab);
		};

		window.addEventListener('popstate', handleHistoryNavigation);
		return () => window.removeEventListener('popstate', handleHistoryNavigation);
	}, [courseId]);

	useEffect(() => {
		try {
			setIsContentExpanded(window.localStorage.getItem(CONTENT_WIDTH_STORAGE_KEY) === 'expanded');
		} catch {
			setIsContentExpanded(false);
		}
	}, []);

	useEffect(() => {
		try {
			setIsLessonNavigationPinned(window.sessionStorage.getItem(LESSON_NAVIGATION_PINNED_SESSION_KEY) === 'true');
		} catch {
			setIsLessonNavigationPinned(false);
		}
	}, []);

	useEffect(() => {
		if (!enrollment || currentRoute.tab === 'overview' || canOpenLearningTabs) {
			return;
		}

		setActiveTab('overview');
		navigateToRoute(getCourseWorkspaceRoute('overview'), 'replace');
	}, [canOpenLearningTabs, currentRoute.tab, enrollment, navigateToRoute]);

	const handleTabChange = useCallback(
		(tabId: CourseTabId) => {
			if (tabId !== 'overview' && !canOpenLearningTabs) {
				setActiveTab('overview');
				navigateToRoute(getCourseWorkspaceRoute('overview'), 'replace');
				return;
			}

			setActiveTab(tabId);

			if (tabId === 'lessons') {
				const activeContext = getActiveLessonContext(lessonsResult?.lessons ?? null);
				navigateToRoute(
					getCourseWorkspaceRoute(
						'lessons',
						activeContext
							? {
									moduleId: activeContext.courseModule.id,
									subsectionId: activeContext.subsection.id
								}
							: null
					)
				);
				return;
			}

			navigateToRoute(getCourseWorkspaceRoute(tabId));
		},
		[canOpenLearningTabs, lessonsResult?.lessons, navigateToRoute]
	);

	useEffect(() => {
		if (activeTab !== 'lessons') {
			return;
		}

		if (!enrollment || !canOpenLearningTabs) {
			return;
		}

		const requestedSubsectionId = currentRoute.tab === 'lessons' ? (currentRoute.subsectionId ?? undefined) : undefined;
		const activeSubsectionId = lessonsResult?.lessons.activeSubsectionId;
		const shouldLoadLessons = !lessonsResult || (requestedSubsectionId && requestedSubsectionId !== activeSubsectionId);

		if (shouldLoadLessons && !isLessonsLoading) {
			loadLessons(requestedSubsectionId, 'replace').catch(() => undefined);
		}
	}, [
		activeTab,
		canOpenLearningTabs,
		enrollment,
		currentRoute.subsectionId,
		currentRoute.tab,
		isLessonsLoading,
		lessonsResult,
		loadLessons
	]);

	const handleLessonSelect = useCallback(
		(subsectionId: string) => {
			setActiveTab('lessons');
			setHasReachedLessonBottom(canBypassProgression);
			loadLessons(subsectionId, 'push').catch(() => undefined);
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
			sourcePage: currentPathRef.current
		});

		if (whatsappGroupUrl && typeof window !== 'undefined') {
			window.open(whatsappGroupUrl, '_blank', 'noopener,noreferrer');
		}
	}, [courseId, currentUser?.id, enrollment, lessonsResult]);

	const handleToggleContentWidth = useCallback(() => {
		const nextExpanded = !isContentExpanded;
		const activeContext = getActiveLessonContext(lessonsResult?.lessons ?? null);

		setIsContentExpanded(nextExpanded);
		try {
			window.localStorage.setItem(CONTENT_WIDTH_STORAGE_KEY, nextExpanded ? 'expanded' : 'reading');
		} catch {
			// Keep the in-memory preference when browser storage is unavailable.
		}

		trackCourseDashboardEvent({
			eventName: 'course_content_width_toggled',
			courseId,
			courseTitle: enrollment?.course.title,
			userId: currentUser?.id,
			lessonId: activeContext?.subsection.id,
			lessonTitle: activeContext?.subsection.title,
			moduleId: activeContext?.courseModule.id,
			moduleTitle: activeContext?.courseModule.title,
			expanded: nextExpanded,
			sourcePage: currentPathRef.current
		});
	}, [courseId, currentUser?.id, enrollment?.course.title, isContentExpanded, lessonsResult?.lessons]);

	const handleToggleLessonNavigationPinned = useCallback(() => {
		setIsLessonNavigationPinned(currentValue => {
			const nextValue = !currentValue;

			try {
				window.sessionStorage.setItem(LESSON_NAVIGATION_PINNED_SESSION_KEY, String(nextValue));
			} catch {
				// Keep the in-memory session preference when browser storage is unavailable.
			}

			return nextValue;
		});
	}, []);

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
			sourcePage: currentPathRef.current
		});

		setIsCompletingLesson(true);
		setLessonErrorMessage('');

		try {
			const result = await completeCourseLesson(courseId, subsection.id);
			setLessonsResult(result);
			setEnrollment(result.enrollment);
			setHasReachedLessonBottom(result.lessons.hasAdminAccess);
			const nextActiveContext = getActiveLessonContext(result.lessons);

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
				sourcePage: currentPathRef.current
			});

			if (!nextLesson && !result.lessons.hasAdminAccess) {
				setActiveTab('assignment');
				navigateToRoute(getCourseWorkspaceRoute('assignment'));
			} else if (nextActiveContext) {
				navigateToRoute(
					getCourseWorkspaceRoute('lessons', {
						moduleId: nextActiveContext.courseModule.id,
						subsectionId: nextActiveContext.subsection.id
					})
				);
			}
		} catch {
			setLessonErrorMessage('Unable to mark this lesson complete right now. Please try again.');
		} finally {
			setIsCompletingLesson(false);
		}
	}, [courseId, currentUser?.id, enrollment, lessonsResult, navigateToRoute]);

	const activeTabLabel = useMemo(() => courseTabs.find(tab => tab.id === activeTab)?.label ?? 'Overview', [activeTab]);
	const shouldShowUnlockedOverviewRail =
		activeTab === 'overview' && Boolean(enrollment?.accessUnlockedAt && dashboard && !isDashboardLoading);
	const shouldShowLessonRail = activeTab === 'lessons' && canOpenLearningTabs;
	const shouldShowOverviewRail = activeTab === 'overview' || shouldShowLessonRail;
	const workspaceGridColumns = getCourseWorkspaceGridColumns(shouldShowOverviewRail, isLearningRailCollapsed);

	return {
		activeTab,
		activeTabLabel,
		canBypassProgression,
		currentUser,
		dashboard,
		dashboardErrorMessage,
		enrollment,
		errorMessage,
		handleAskDoubt,
		handleCompleteLesson,
		handleCourseUnlocked,
		handleLessonBottomReached,
		handleLessonSelect,
		handleTabChange,
		handleToggleContentWidth,
		handleToggleLessonNavigationPinned,
		hasReachedLessonBottom,
		isCompletingLesson,
		isContentExpanded,
		isDashboardLoading,
		isLearningRailCollapsed,
		isLessonNavigationPinned,
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
		workspaceGridColumns
	};
};
