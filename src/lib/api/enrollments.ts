import { getJson, postJson } from '~/lib/api/client';

export type CourseEnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type CourseAssignmentStatus = 'NOT_STARTED' | 'SUBMITTED' | 'APPROVED';

export type EnrolledCourse = {
	id: string;
	status: 'DRAFT' | 'PUBLISHED';
	slug: string;
	title: string;
	summary: string;
	thumbnailImage: string;
	promoImage: string;
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

export type CourseEnrollmentStatusResult = {
	isFreeCourse: boolean;
	isEnrolled: boolean;
	enrollment: CourseEnrollment | null;
};

export type CourseEnrollmentResult = {
	alreadyEnrolled: boolean;
	enrollment: CourseEnrollment;
};

export type CourseLearningDashboardResult = {
	enrollment: CourseEnrollment;
	dashboard: CourseLearningDashboard;
};

export const getCourseEnrollmentStatus = (slug: string) =>
	getJson<CourseEnrollmentStatusResult>(`/enrollments/courses/${encodeURIComponent(slug)}/status`);

export const enrollInFreeCourse = (slug: string) =>
	postJson<CourseEnrollmentResult>(`/enrollments/courses/${encodeURIComponent(slug)}`);

export const unlockCourseAccess = (slug: string, accessCode: string) =>
	postJson<{ enrollment: CourseEnrollment }>(`/enrollments/courses/${encodeURIComponent(slug)}/unlock`, { accessCode });

export const getCourseLearningDashboard = (slug: string) =>
	getJson<CourseLearningDashboardResult>(`/enrollments/courses/${encodeURIComponent(slug)}/dashboard`);

export const listMyCourseEnrollments = () => getJson<{ enrollments: CourseEnrollment[] }>('/enrollments/my-courses');
