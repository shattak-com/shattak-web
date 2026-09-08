import type { LandingCourseCard } from '~/lib/api/courses';
import type { NoteCategory, NoteResourceType } from '~/lib/api/notes';

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

export const createNoteViewerUrl = (sourceUrl: string, resourceType: NoteResourceType) => {
	try {
		const url = new URL(sourceUrl);
		const { pathname } = url;

		if (resourceType === 'PPT' || pathname.includes('/presentation/d/')) {
			const [, presentationId] = pathname.match(/\/presentation\/d\/([^/]+)/) ?? [];
			if (presentationId) {
				return `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`;
			}
		}

		const driveFileMatch = pathname.match(/\/file\/d\/([^/]+)/);
		if (driveFileMatch?.[1]) {
			return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
		}

		const [, documentId] = pathname.match(/\/document\/d\/([^/]+)/) ?? [];
		if (documentId) {
			return `https://docs.google.com/document/d/${documentId}/preview`;
		}

		if (url.hostname.includes('drive.google.com') && url.searchParams.get('id')) {
			return `https://drive.google.com/file/d/${url.searchParams.get('id')}/preview`;
		}

		return sourceUrl;
	} catch {
		return sourceUrl;
	}
};
