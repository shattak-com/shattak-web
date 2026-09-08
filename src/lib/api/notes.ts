import { getJson, postJson } from '~/lib/api/client';

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
	otherSubjects: NoteSubject[];
};

export type NoteDetailData = {
	department: NoteDepartment;
	subject: NoteSubject;
	note: PublicNote;
	otherNotes: PublicNote[];
};

const publicCache = { next: { revalidate: 60 } } satisfies RequestInit;

export const getNotesLanding = () => getJson<NotesLandingData>('/notes', publicCache);

export const getNotesDepartment = (departmentSlug: string) =>
	getJson<NotesDepartmentData>(`/notes/departments/${encodeURIComponent(departmentSlug)}`, publicCache);

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

	return getJson<NotesSubjectData>(
		`/notes/departments/${encodeURIComponent(departmentSlug)}/subjects/${encodeURIComponent(subjectSlug)}${query}`,
		publicCache
	);
};

export const getNoteDetail = (departmentSlug: string, subjectSlug: string, noteSlug: string) =>
	getJson<NoteDetailData>(
		`/notes/departments/${encodeURIComponent(departmentSlug)}/subjects/${encodeURIComponent(subjectSlug)}/notes/${encodeURIComponent(noteSlug)}`,
		publicCache
	);

export const accessNote = (noteId: string, action: 'VIEW' | 'DOWNLOAD') =>
	postJson<{ resourceUrl: string; resourceType: NoteResourceType }>(`/notes/${encodeURIComponent(noteId)}/access`, {
		action
	});
