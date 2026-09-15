import { getPublishedLandingCourseCards } from '~/lib/api/courses';
import { getFeaturedCourses } from '~/lib/containers/notes/utils';

export const loadFeaturedCourses = async () => {
	try {
		return getFeaturedCourses(await getPublishedLandingCourseCards());
	} catch {
		return [];
	}
};
