import { getJson, postJson } from '~/lib/api/client';

export type CourseEnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type EnrolledCourse = {
	id: string;
	status: 'DRAFT' | 'PUBLISHED';
	slug: string;
	title: string;
	summary: string;
	thumbnailImage: string;
	promoImage: string;
	price: number;
	level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
	mode: 'LIVE' | 'RECORDED' | 'HYBRID';
	updatedAt: string;
};

export type CourseEnrollment = {
	id: string;
	status: CourseEnrollmentStatus;
	progressPercent: number;
	enrolledAt: string;
	lastAccessedAt: string | null;
	completedAt: string | null;
	course: EnrolledCourse;
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

export const getCourseEnrollmentStatus = (slug: string) =>
	getJson<CourseEnrollmentStatusResult>(`/enrollments/courses/${encodeURIComponent(slug)}/status`);

export const enrollInFreeCourse = (slug: string) =>
	postJson<CourseEnrollmentResult>(`/enrollments/courses/${encodeURIComponent(slug)}`);

export const listMyCourseEnrollments = () => getJson<{ enrollments: CourseEnrollment[] }>('/enrollments/my-courses');
