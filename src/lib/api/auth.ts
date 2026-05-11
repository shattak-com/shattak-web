import { getJson, postJson } from '~/lib/api/client';

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
