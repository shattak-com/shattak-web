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

export const createDriveFolderViewerUrl = (sourceUrl: string, layout: 'grid' | 'list' = 'grid') => {
	try {
		const url = new URL(sourceUrl);
		if (!['https:', 'http:'].includes(url.protocol) || url.hostname.replace(/^www\./, '') !== 'drive.google.com') {
			return '';
		}

		const [, pathFolderId] = url.pathname.match(/\/folders\/([A-Za-z0-9_-]+)/) ?? [];
		const folderId = pathFolderId || url.searchParams.get('id');
		if (!folderId || !/^[A-Za-z0-9_-]+$/.test(folderId)) return '';

		const previewUrl = new URL('https://drive.google.com/embeddedfolderview');
		previewUrl.searchParams.set('id', folderId);
		const resourceKey = url.searchParams.get('resourcekey');
		if (resourceKey) previewUrl.searchParams.set('resourcekey', resourceKey);
		previewUrl.hash = layout;
		return previewUrl.toString();
	} catch {
		return '';
	}
};

export const createNoteViewerUrl = (sourceUrl: string, resourceType: NoteResourceType) => {
	if (resourceType === 'FOLDER') return createDriveFolderViewerUrl(sourceUrl, 'list');

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
