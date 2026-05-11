import { getApiBaseUrl } from '~/lib/api/config';

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

type ApiSuccessResponse<T> = {
	success: true;
	message: string;
	data: T;
};

type ApiErrorResponse = {
	success: false;
	message: string;
	error?: {
		code?: string;
		details?: unknown;
	};
};

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

const getApiUrl = (path: string) => `${getApiBaseUrl()}${path}`;

const readApiData = async <T>(response: Response): Promise<T> => {
	const body = (await response.json()) as ApiResponse<T>;

	if (!body.success) {
		throw new Error(body.message || `Shattak API request failed with status ${response.status}`);
	}

	return body.data;
};

const postJson = async <T>(path: string, body?: unknown): Promise<T> => {
	const response = await fetch(getApiUrl(path), {
		method: 'POST',
		credentials: 'include',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: body === undefined ? undefined : JSON.stringify(body)
	});

	if (!response.ok) {
		throw new Error(`Shattak API request failed with status ${response.status}`);
	}

	return readApiData<T>(response);
};

const getJson = async <T>(path: string): Promise<T> => {
	const response = await fetch(getApiUrl(path), {
		method: 'GET',
		credentials: 'include',
		headers: {
			Accept: 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`Shattak API request failed with status ${response.status}`);
	}

	return readApiData<T>(response);
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
