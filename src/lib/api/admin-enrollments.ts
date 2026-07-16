import type { AdminCourseLevel, AdminCourseMode, AdminCourseStatus } from '~/lib/api/admin-courses';
import { getJson } from '~/lib/api/client';

export type AdminEnrollmentCourseSummary = {
	id: string;
	slug: string;
	title: string;
	status: 'DRAFT' | 'PUBLISHED';
	categories: string[];
	level: AdminCourseLevel;
	mode: AdminCourseMode;
	price: number;
	thumbnailImage: string;
	enrollmentCount: number;
	displayEnrollmentCount: number;
};

export type AdminCourseEnrollmentUser = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	avatarUrl: string;
	status: string;
	createdAt: string;
	profile: {
		college: string | null;
		department: string | null;
		passoutYear: string | null;
		mobileNumberE164: string | null;
	} | null;
};

export type AdminCourseEnrollment = {
	id: string;
	status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
	progressPercent: number;
	enrolledAt: string;
	lastAccessedAt: string | null;
	completedAt: string | null;
	user: AdminCourseEnrollmentUser;
};

export type AdminEnrollmentPagination = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
};

export type AdminEnrollmentCourseListParams = {
	q?: string;
	status?: AdminCourseStatus | '';
	categories?: string[];
	level?: AdminCourseLevel | '';
	mode?: AdminCourseMode | '';
	sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'status' | 'publishedAt' | 'price' | 'enrollmentCount' | 'rating';
	sortOrder?: 'asc' | 'desc';
	page?: number;
	pageSize?: number;
};

export const listAdminEnrollmentCourses = (params: AdminEnrollmentCourseListParams = {}) => {
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== '') {
			if (Array.isArray(value)) {
				if (value.length) {
					searchParams.set(key, value.join(','));
				}
			} else {
				searchParams.set(key, String(value));
			}
		}
	});

	const query = searchParams.toString();

	return getJson<{ courses: AdminEnrollmentCourseSummary[]; pagination: AdminEnrollmentPagination }>(
		query ? `/admin/enrollments/courses?${query}` : '/admin/enrollments/courses'
	);
};

export const listAdminCourseEnrollments = (courseId: string) =>
	getJson<{ course: AdminEnrollmentCourseSummary; enrollments: AdminCourseEnrollment[] }>(
		`/admin/courses/${encodeURIComponent(courseId)}/enrollments`
	);
