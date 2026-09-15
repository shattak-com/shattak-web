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
	publishedAt: string | null;
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
	whatsappVerified: boolean;
	course?: {
		id: string;
		slug: string;
		title: string;
	};
	user: AdminCourseEnrollmentUser;
};

export type AdminEnrollmentOverviewItem = AdminCourseEnrollment & {
	course: {
		id: string;
		slug: string;
		title: string;
	};
};

export type AdminEnrollmentPagination = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
};

export type AdminEnrollmentStats = {
	totalEnrollmentCount: number;
	uniqueLearnerCount: number;
	currentMonthEnrollmentCount: number;
	previousMonthEnrollmentCount: number;
	averageEnrollmentsPerMonth: number;
	currentMonthKey: string;
	previousMonthKey: string;
	baselineMonthKey: string;
	monthCountFromBaseline: number;
	timeZone: string;
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

export type AdminEnrollmentListParams = Pick<
	AdminEnrollmentCourseListParams,
	'q' | 'status' | 'categories' | 'level' | 'mode' | 'page' | 'pageSize'
>;

const buildAdminEnrollmentQuery = (params: AdminEnrollmentCourseListParams | AdminEnrollmentListParams) => {
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

	return searchParams.toString();
};

export const listAdminEnrollmentCourses = (params: AdminEnrollmentCourseListParams = {}) => {
	const query = buildAdminEnrollmentQuery(params);

	return getJson<{ courses: AdminEnrollmentCourseSummary[]; pagination: AdminEnrollmentPagination }>(
		query ? `/admin/enrollments/courses?${query}` : '/admin/enrollments/courses'
	);
};

export const listAdminEnrollments = (params: AdminEnrollmentListParams = {}) => {
	const query = buildAdminEnrollmentQuery(params);

	return getJson<{
		enrollments: AdminEnrollmentOverviewItem[];
		uniqueLearnerCount: number;
		stats: AdminEnrollmentStats;
		pagination: AdminEnrollmentPagination;
	}>(query ? `/admin/enrollments?${query}` : '/admin/enrollments');
};

export const listAdminCourseEnrollments = (courseId: string) =>
	getJson<{ course: AdminEnrollmentCourseSummary; enrollments: AdminCourseEnrollment[] }>(
		`/admin/courses/${encodeURIComponent(courseId)}/enrollments`
	);
