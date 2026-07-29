import { getApiBaseUrl } from '~/lib/api/config';
import type { CourseDetails, CourseLevel } from '~/lib/containers/course/types';
import { normalizeCourseDetails } from '~/lib/containers/course/utils/normalize-course';

export type CourseTool = {
	id: string;
	name: string;
	image: string;
};

export type LandingCourseCard = {
	id: string;
	title: string;
	categories: string[];
	image: string;
	level: CourseLevel;
	duration: string;
	format: string;
	rating: number;
	learners: number;
	price: number | null;
	originalPrice: number;
	tools: CourseTool[];
	promoImageBrand: string;
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

const getJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
	const response = await fetch(getApiUrl(path), {
		...init,
		headers: {
			Accept: 'application/json',
			...init?.headers
		}
	});

	if (!response.ok) {
		throw new Error(`Shattak API request failed with status ${response.status}`);
	}

	return readApiData<T>(response);
};

export const getPublishedLandingCourseCards = async (): Promise<LandingCourseCard[]> =>
	getJson<LandingCourseCard[]>('/courses', {
		next: { revalidate: 60 }
	});

export const getCourseById = async (id: string): Promise<CourseDetails | null> => {
	if (!id) {
		return null;
	}

	const response = await fetch(getApiUrl(`/courses/${encodeURIComponent(id)}`), {
		headers: {
			Accept: 'application/json'
		},
		next: { revalidate: 60 }
	});

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		throw new Error(`Shattak API request failed with status ${response.status}`);
	}

	return normalizeCourseDetails(await readApiData<CourseDetails>(response));
};
