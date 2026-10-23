import { postJson } from '~/lib/api/client';
import { getPublicJson } from '~/lib/api/public-requests';

export type NoteCategory = 'NOTES' | 'PYQ' | 'LAB';
export type NoteResourceType = 'PDF' | 'PPT' | 'FOLDER';

export type NoteDepartment = {
	id: string;
	slug: string;
	name: string;
	icon: string;
	subjectCount: number;
};

export type NoteDepartmentReference = Pick<NoteDepartment, 'id' | 'slug' | 'name' | 'icon'>;

export type NoteSubject = {
	id: string;
	slug: string;
	name: string;
	noteCount: number;
	departments: NoteDepartmentReference[];
};

export type PublicNote = {
	id: string;
	slug: string;
	title: string;
	category: NoteCategory;
	resourceType: NoteResourceType;
	resourceDate: string;
	viewCount: number;
	downloadCount: number;
};

export type NotesLandingData = {
	departments: NoteDepartment[];
	popularSubjects: NoteSubject[];
};

export type NotesDepartmentData = {
	department: NoteDepartment;
	subjects: NoteSubject[];
};

export type NotesSubjectData = {
	department: NoteDepartment;
	subject: NoteSubject;
	notes: PublicNote[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
	departmentSubjects: NoteSubject[];
};

export type NoteDetailData = {
	department: NoteDepartment;
	subject: NoteSubject;
	note: PublicNote;
	subjectNotes: PublicNote[];
};

export const getNotesLanding = () => getPublicJson<NotesLandingData>('/notes');

export const getNotesDepartment = (departmentSlug: string) =>
	getPublicJson<NotesDepartmentData>(`/notes/departments/${encodeURIComponent(departmentSlug)}`);

export const getNotesSubject = (
	departmentSlug: string,
	subjectSlug: string,
	options?: { category?: NoteCategory; page?: number; pageSize?: number }
) => {
	const searchParams = new URLSearchParams();
	if (options?.category) searchParams.set('category', options.category);
	if (options?.page) searchParams.set('page', String(options.page));
	if (options?.pageSize) searchParams.set('pageSize', String(options.pageSize));
	const query = searchParams.size ? `?${searchParams.toString()}` : '';

	return getPublicJson<NotesSubjectData>(
		`/notes/departments/${encodeURIComponent(departmentSlug)}/subjects/${encodeURIComponent(subjectSlug)}${query}`
	);
};

export const getNoteDetail = (departmentSlug: string, subjectSlug: string, noteSlug: string) =>
	getPublicJson<NoteDetailData>(
		`/notes/departments/${encodeURIComponent(departmentSlug)}/subjects/${encodeURIComponent(subjectSlug)}/notes/${encodeURIComponent(noteSlug)}`
	);

export const accessNote = (noteId: string, action: 'VIEW' | 'DOWNLOAD') =>
	postJson<{ resourceUrl: string; resourceType: NoteResourceType }>(`/notes/${encodeURIComponent(noteId)}/access`, {
		action
	});
