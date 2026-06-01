import { deleteJson, getJson, postJson } from '~/lib/api/client';
import type { OnboardingProfile } from '~/lib/api/onboarding';

export type RoleKey = 'STUDENT' | 'MENTOR' | 'ADMIN' | 'SUPER_ADMIN';

export type AuthenticatedUser = {
	id: string;
	email: string;
	emailVerified: boolean;
	name: string;
	avatarUrl: string;
	status: 'ACTIVE' | 'SUSPENDED';
	roles: RoleKey[];
};

export type AuthResult = {
	user: AuthenticatedUser;
	onboardingProfile?: OnboardingProfile;
};

export type AdminInvitation = {
	id: string;
	email: string;
	roleKey: 'ADMIN' | 'SUPER_ADMIN';
	status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
	invitedByUserId?: string | null;
	acceptedByUserId?: string | null;
	acceptedAt?: string | null;
	expiresAt: string;
	createdAt: string;
	updatedAt: string;
};

export type AdminManagedUserProfile = {
	mobileNumberE164: string | null;
	mobileCountryCode: string | null;
	mobileNumberVerified: boolean;
	mobileSkipCount: number;
	mobileSkipLimit: number;
	college: string | null;
	department: string | null;
	interests: string[];
	onboardingCompletedAt: string | null;
	onboardingCompleted: boolean;
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
	profile: AdminManagedUserProfile | null;
};

export const loginWithGoogleCredential = (credential: string) =>
	postJson<AuthResult>('/auth/google', {
		credential
	});

export const loginAdminWithGoogleCredential = (credential: string) =>
	postJson<AuthResult>('/admin/auth/google', {
		credential
	});

export const logout = () => postJson<null>('/auth/logout');

export const logoutAdmin = () => postJson<null>('/admin/auth/logout');

export const getCurrentUser = () => getJson<AuthResult>('/me');

export const getCurrentAdmin = () => getJson<AuthResult>('/admin/me');

export const listAdminInvitations = () => getJson<{ invitations: AdminInvitation[] }>('/admin/invitations');

export const createAdminInvitation = (email: string, roleKey: 'ADMIN' | 'SUPER_ADMIN') =>
	postJson<{ invitation: AdminInvitation }>('/admin/invitations', {
		email,
		roleKey
	});

export const revokeAdminInvitation = (id: string) =>
	postJson<{ invitation: AdminInvitation }>(`/admin/invitations/${encodeURIComponent(id)}/revoke`);

export const listAdminUsers = (query = '') => {
	const params = new URLSearchParams();

	if (query.trim()) {
		params.set('q', query.trim());
	}

	const queryString = params.toString();
	const path = queryString ? `/admin/users?${queryString}` : '/admin/users';

	return getJson<{ users: AdminManagedUser[] }>(path);
};

export const deleteAdminUser = (id: string) =>
	deleteJson<{ deletedUser: { id: string } }>(`/admin/users/${encodeURIComponent(id)}`);
