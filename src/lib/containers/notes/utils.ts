import type { LandingCourseCard } from '~/lib/api/courses';
import type { NoteCategory, NoteResourceType } from '~/lib/api/notes';

export const createNotesLoginHref = (returnPath: string) => `/login?redirect=${encodeURIComponent(returnPath)}`;

export const getFeaturedCourses = (courses: LandingCourseCard[]) =>
	courses.filter(course =>
		course.categories.some(category => ['featured', 'futured'].includes(category.trim().toLowerCase()))
	);

export const formatNoteDate = (value: string) =>
	new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		timeZone: 'Asia/Kolkata'
	}).format(new Date(value));

export const getCategoryLabel = (category: NoteCategory) => {
	if (category === 'PYQ') return 'PYQ';
	if (category === 'LAB') return 'Lab';
	return 'Notes';
};

export const getResourceLabel = (resourceType: NoteResourceType) => {
	if (resourceType === 'FOLDER') return 'Drive folder';
	return resourceType;
};
