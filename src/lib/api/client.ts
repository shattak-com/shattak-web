import { getApiBaseUrl } from '~/lib/api/config';

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

export class ApiRequestError extends Error {
	public readonly statusCode: number;
	public readonly code?: string;
	public readonly details?: unknown;

	constructor(message: string, statusCode: number, code?: string, details?: unknown) {
		super(message);
		this.name = 'ApiRequestError';
		this.statusCode = statusCode;
		this.code = code;
		this.details = details;
	}
}

const getApiUrl = (path: string) => `${getApiBaseUrl()}${path}`;

const readApiData = async <T>(response: Response): Promise<T> => {
	let body: ApiResponse<T> | null = null;

	try {
		body = (await response.json()) as ApiResponse<T>;
	} catch {
		body = null;
	}

	if (!response.ok || !body?.success) {
		throw new ApiRequestError(
			body?.message || `Shattak API request failed with status ${response.status}`,
			response.status,
			body?.success === false ? body.error?.code : undefined,
			body?.success === false ? body.error?.details : undefined
		);
	}

	return body.data;
};

export const getJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
	const response = await fetch(getApiUrl(path), {
		...init,
		method: 'GET',
		credentials: 'include',
		headers: {
			Accept: 'application/json',
			...init?.headers
		}
	});

	return readApiData<T>(response);
};

export const postJson = async <T>(path: string, body?: unknown, init?: RequestInit): Promise<T> => {
	const response = await fetch(getApiUrl(path), {
		...init,
		method: 'POST',
		credentials: 'include',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...init?.headers
		},
		body: body === undefined ? undefined : JSON.stringify(body)
	});

	return readApiData<T>(response);
};
