import type { RoleKey } from '~/lib/api/auth';
import { deleteJson, getJson } from '~/lib/api/client';

export type AdminManagedUserProfile = {
	mobileNumberE164: string | null;
	mobileCountryCode: string | null;
	mobileNumberVerified: boolean;
	college: string | null;
	department: string | null;
	passoutYear: string | null;
	interests: string[];
	onboardingCompletedAt: string | null;
	onboardingCompleted: boolean;
};

export type AdminManagedUserCourse = {
	id: string;
	slug: string;
	title: string;
	enrolledAt: string;
};

export type AdminManagedUser = {
	id: string;
	email: string;
	emailVerified: boolean;
	name: string;
	avatarUrl: string;
	status: 'ACTIVE' | 'SUSPENDED';
	googleLinked: boolean;
	roles: RoleKey[];
	lastLoginAt: string | null;
	createdAt: string;
	updatedAt: string;
	activeSessionCount: number;
	mentorApplicationCount: number;
	enrollmentCount: number;
	recentCourseEnrollments: AdminManagedUserCourse[];
	profile: AdminManagedUserProfile | null;
};

export type AdminUserStats = {
	totalUserCount: number;
	usersWithPhoneCount: number;
	currentMonthSignupCount: number;
	previousMonthSignupCount: number;
	averageSignupsPerMonth: number;
	currentMonthKey: string;
	previousMonthKey: string;
	baselineMonthKey: string;
	monthCountFromBaseline: number;
	timeZone: string;
};

export type AdminUserFilterOptions = {
	colleges: string[];
	departments: string[];
	passoutYears: string[];
	interests: string[];
};

export type AdminUserListParams = {
	q?: string;
	college?: string;
	department?: string;
	passoutYear?: string;
	interest?: string;
	joinedOrder?: 'asc' | 'desc';
	page?: number;
	pageSize?: number;
};

export type AdminUserPagination = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
};

export type AdminUserListResult = {
	users: AdminManagedUser[];
	stats: AdminUserStats;
	filterOptions: AdminUserFilterOptions;
	pagination: AdminUserPagination;
};

export const listAdminUsers = (params: AdminUserListParams = {}) => {
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (typeof value === 'number') {
			searchParams.set(key, String(value));
		} else if (value?.trim()) {
			searchParams.set(key, value.trim());
		}
	});

	const query = searchParams.toString();

	return getJson<AdminUserListResult>(query ? `/admin/users?${query}` : '/admin/users');
};

export const deleteAdminUser = (id: string) =>
	deleteJson<{ deletedUser: { id: string } }>(`/admin/users/${encodeURIComponent(id)}`);
