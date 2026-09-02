import { createMetaConversionContext } from '~/lib/analytics/meta-pixel';
import { getJson, postJson } from '~/lib/api/client';

export type CourseEnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type CourseAssignmentStatus = 'NOT_STARTED' | 'SUBMITTED' | 'APPROVED';
export type CourseLessonContentBlockType =
	| 'TEXT'
	| 'VIDEO_UPLOAD'
	| 'VIDEO_YOUTUBE'
	| 'PDF_UPLOAD'
	| 'PDF_LINK'
	| 'PPT_UPLOAD'
	| 'PPT_LINK';

export type CourseLessonContentVisibility = 'PUBLIC_PREVIEW' | 'ENROLLED_ONLY';

export type EnrolledCourse = {
	id: string;
	status: 'DRAFT' | 'PUBLISHED';
	slug: string;
	title: string;
	summary: string;
	thumbnailImage: string;
	promoImage: string;
	instructors: Array<{
		id: string;
		name: string;
		role: string;
		photo: string;
	}>;
	whatsappGroupUrl: string;
	price: number;
	level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
	mode: 'LIVE' | 'RECORDED' | 'HYBRID';
	updatedAt: string;
};

export type CourseEnrollment = {
	id: string;
	status: CourseEnrollmentStatus;
	progressPercent: number;
	currentStreak: number;
	lastActiveDate: string | null;
	completedSubsectionIds: string[];
	currentSubsectionId: string;
	assignmentStatus: CourseAssignmentStatus;
	enrolledAt: string;
	lastAccessedAt: string | null;
	accessUnlockedAt: string | null;
	certificateEarnedAt: string | null;
	completedAt: string | null;
	course: EnrolledCourse;
};

export type CourseLearningDashboard = {
	overviewUnlocked: boolean;
	whatsappVerified: boolean;
	streak: {
		hidden: boolean;
		currentStreak: number;
		previousStreak: number;
		streakUpdated: boolean;
		lastActiveDate: string | null;
		timeZone: string;
		targetDays: number;
		bufferDays: number;
		cycleDays: number;
		message: string;
	};
	completion: {
		percentage: number;
		lessonsPercentage: number;
		assignmentPercentage: number;
		completedSubsections: number;
		totalSubsections: number;
		assignmentStatus: CourseAssignmentStatus;
		certificateStatus: 'NOT_EARNED' | 'EARNED';
		certificateEarnedAt: string | null;
	};
	learningProgress: {
		destination: 'lesson' | 'assignment' | 'certificate';
		tabId: 'lessons' | 'assignment' | 'certificate';
		title: string;
		subtitle: string;
		buttonLabel: string;
		moduleId: string | null;
		moduleTitle: string | null;
		subsectionId: string | null;
		subsectionTitle: string | null;
		module: {
			id: string;
			title: string;
			completedSubsections: number;
			totalSubsections: number;
			subsections: Array<{
				id: string;
				title: string;
				isCompleted: boolean;
				isCurrent: boolean;
				isLocked: boolean;
			}>;
		} | null;
	};
	community: {
		whatsappGroupUrl: string;
	};
	leaderboard: Array<{
		id: string;
		learnerName: string;
		avatarUrl: string;
		courseName: string;
		certificateEarnedAt: string | null;
	}>;
};

export type CourseLessonContentBlock = {
	id: string;
	type: CourseLessonContentBlockType;
	visibility: CourseLessonContentVisibility;
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

export type CourseLessonSubsection = {
	id: string;
	title: string;
	previewSummary: string;
	durationLabel: string;
	durationMinutes: number | null;
	sortOrder: number;
	isActive: boolean;
	isCompleted: boolean;
	isLocked: boolean;
	isCurrent: boolean;
	contentBlocks: CourseLessonContentBlock[];
};

export type CourseLessonModule = {
	id: string;
	title: string;
	description: string;
	sortOrder: number;
	isLocked: boolean;
	subsections: CourseLessonSubsection[];
};

export type CourseLessonsState = {
	activeSubsectionId: string;
	completedSubsections: number;
	hasAdminAccess: boolean;
	lessonProgressPercentage: number;
	modules: CourseLessonModule[];
	totalSubsections: number;
};

export type CourseLessonsResult = {
	enrollment: CourseEnrollment;
	lessons: CourseLessonsState;
	course: {
		id: string;
		slug: string;
		title: string;
		summary: string;
		whatsappGroupUrl: string;
	};
};

export type CourseEnrollmentStatusResult = {
	isFreeCourse: boolean;
	isEnrolled: boolean;
	enrollment: CourseEnrollment | null;
};

export type CourseEnrollmentResult = {
	alreadyEnrolled: boolean;
	enrollment: CourseEnrollment;
	metaEventId: string | null;
};

export type CourseLearningDashboardResult = {
	enrollment: CourseEnrollment;
	dashboard: CourseLearningDashboard;
};

export type CourseFeedbackInput = {
	rating: number;
	aboutYourself: string;
	preCourseChallenge: string;
	courseExperience: string;
	supportExperience: string;
	nextStep: string;
};

export type CourseFeedback = CourseFeedbackInput & {
	id: string;
	submittedAt: string;
};

export type CourseFeedbackState = {
	courseCompleted: boolean;
	canSubmit: boolean;
	feedback: CourseFeedback | null;
};

export const getCourseEnrollmentStatus = (slug: string) =>
	getJson<CourseEnrollmentStatusResult>(`/enrollments/courses/${encodeURIComponent(slug)}/status`);

export const enrollInFreeCourse = (slug: string) =>
	postJson<CourseEnrollmentResult>(`/enrollments/courses/${encodeURIComponent(slug)}`, {
		conversion: createMetaConversionContext()
	});

export const unlockCourseAccess = (slug: string, accessCode: string) =>
	postJson<{ enrollment: CourseEnrollment }>(`/enrollments/courses/${encodeURIComponent(slug)}/unlock`, { accessCode });

export const getCourseLearningDashboard = (slug: string) =>
	getJson<CourseLearningDashboardResult>(`/enrollments/courses/${encodeURIComponent(slug)}/dashboard`);

export const getCourseLessons = (slug: string, subsectionId?: string) => {
	const query = subsectionId ? `?subsectionId=${encodeURIComponent(subsectionId)}` : '';

	return getJson<CourseLessonsResult>(`/enrollments/courses/${encodeURIComponent(slug)}/lessons${query}`);
};

export const completeCourseLesson = (slug: string, subsectionId: string) =>
	postJson<CourseLessonsResult>(
		`/enrollments/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(subsectionId)}/complete`
	);

export const getCourseFeedback = (slug: string) =>
	getJson<CourseFeedbackState>(`/enrollments/courses/${encodeURIComponent(slug)}/feedback`);

export const submitCourseFeedback = (slug: string, input: CourseFeedbackInput) =>
	postJson<CourseFeedbackState>(`/enrollments/courses/${encodeURIComponent(slug)}/feedback`, input);

export const listMyCourseEnrollments = () => getJson<{ enrollments: CourseEnrollment[] }>('/enrollments/my-courses');
