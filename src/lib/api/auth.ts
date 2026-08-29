import { getJson, postJson } from '~/lib/api/client';
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

let userBootstrapResult: AuthResult | null = null;
let adminBootstrapResult: AuthResult | null = null;
let currentUserRequest: Promise<AuthResult> | null = null;
let currentAdminRequest: Promise<AuthResult> | null = null;

const consumeBootstrapResult = (context: 'user' | 'admin') => {
	const result = context === 'admin' ? adminBootstrapResult : userBootstrapResult;

	if (context === 'admin') {
		adminBootstrapResult = null;
	} else {
		userBootstrapResult = null;
	}

	return result;
};

export const loginWithGoogleCredential = async (credential: string) => {
	const result = await postJson<AuthResult>('/auth/google', {
		credential
	});
	userBootstrapResult = result;
	return result;
};

export const loginAdminWithGoogleCredential = async (credential: string) => {
	const result = await postJson<AuthResult>('/admin/auth/google', {
		credential
	});
	adminBootstrapResult = result;
	return result;
};

export const logout = () => {
	userBootstrapResult = null;
	currentUserRequest = null;
	return postJson<null>('/auth/logout');
};

export const logoutAdmin = () => {
	adminBootstrapResult = null;
	currentAdminRequest = null;
	return postJson<null>('/admin/auth/logout');
};

export const getCurrentUser = () => {
	const bootstrapResult = consumeBootstrapResult('user');
	if (bootstrapResult) {
		return Promise.resolve(bootstrapResult);
	}

	currentUserRequest ??= getJson<AuthResult>('/me').finally(() => {
		currentUserRequest = null;
	});

	return currentUserRequest;
};

export const getCurrentAdmin = () => {
	const bootstrapResult = consumeBootstrapResult('admin');
	if (bootstrapResult) {
		return Promise.resolve(bootstrapResult);
	}

	currentAdminRequest ??= getJson<AuthResult>('/admin/me').finally(() => {
		currentAdminRequest = null;
	});

	return currentAdminRequest;
};

export const listAdminInvitations = () => getJson<{ invitations: AdminInvitation[] }>('/admin/invitations');

export const createAdminInvitation = (email: string, roleKey: 'ADMIN' | 'SUPER_ADMIN') =>
	postJson<{ invitation: AdminInvitation }>('/admin/invitations', {
		email,
		roleKey
	});

export const revokeAdminInvitation = (id: string) =>
	postJson<{ invitation: AdminInvitation }>(`/admin/invitations/${encodeURIComponent(id)}/revoke`);
