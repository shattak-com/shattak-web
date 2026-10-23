import { ApiRequestError } from '~/lib/api/client';
import { getPublicJson } from '~/lib/api/public-requests';
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

export const getPublishedLandingCourseCards = (): Promise<LandingCourseCard[]> =>
	getPublicJson<LandingCourseCard[]>('/courses');

export const getCourseById = async (id: string): Promise<CourseDetails | null> => {
	if (!id) {
		return null;
	}

	try {
		return normalizeCourseDetails(await getPublicJson<CourseDetails>(`/courses/${encodeURIComponent(id)}`));
	} catch (error) {
		if (error instanceof ApiRequestError && error.statusCode === 404) return null;
		throw error;
	}
};
