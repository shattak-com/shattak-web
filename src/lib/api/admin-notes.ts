import { deleteJson, getJson, patchJson, postJson } from '~/lib/api/client';

export type AdminNoteCategory = 'NOTES' | 'PYQ' | 'LAB';
export type AdminNoteResourceType = 'PDF' | 'PPT' | 'FOLDER';

export type AdminNoteDepartmentReference = {
	id: string;
	slug: string;
	name: string;
	icon: string;
};

export type AdminNoteDepartment = AdminNoteDepartmentReference & {
	subjectCount: number;
	createdAt: string;
	updatedAt: string;
};

export type AdminNoteSubject = {
	id: string;
	slug: string;
	name: string;
	departments: AdminNoteDepartmentReference[];
	noteCount: number;
	createdAt: string;
	updatedAt: string;
};

export type AdminNote = {
	id: string;
	subjectId: string;
	slug: string;
	title: string;
	description: string;
	category: AdminNoteCategory;
	resourceType: AdminNoteResourceType;
	resourceUrl: string;
	resourceDate: string;
	viewCount: number;
	downloadCount: number;
	subject: Pick<AdminNoteSubject, 'id' | 'slug' | 'name'>;
	departments: AdminNoteDepartmentReference[];
	createdAt: string;
	updatedAt: string;
};

export type AdminNotePagination = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
};

export type AdminNoteDepartmentInput = {
	name: string;
	slug?: string;
	icon?: string;
};

export type AdminNoteSubjectInput = {
	name: string;
	slug?: string;
	departmentIds: string[];
};

export type AdminNoteInput = {
	subjectId: string;
	title: string;
	slug?: string;
	description?: string;
	category: AdminNoteCategory;
	resourceType: AdminNoteResourceType;
	resourceUrl: string;
	resourceDate: string;
};

export type AdminNoteBulkInput = {
	departmentId: string;
	subjectId: string;
	notes: Array<Omit<AdminNoteInput, 'subjectId'>>;
};

export type AdminNoteListParams = {
	q?: string;
	departmentId?: string;
	subjectId?: string;
	category?: AdminNoteCategory | '';
	resourceType?: AdminNoteResourceType | '';
	page?: number;
	pageSize?: number;
};

const buildQuery = (params: Record<string, string | number | undefined>) => {
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== '') {
			searchParams.set(key, String(value));
		}
	});

	return searchParams.toString();
};

export const listAdminNoteDepartments = (q = '') => {
	const query = buildQuery({ q });
	return getJson<{ departments: AdminNoteDepartment[] }>(
		query ? `/admin/notes/departments?${query}` : '/admin/notes/departments'
	);
};

export const createAdminNoteDepartment = (input: AdminNoteDepartmentInput) =>
	postJson<{ department: AdminNoteDepartment }>('/admin/notes/departments', input);

export const updateAdminNoteDepartment = (id: string, input: Partial<AdminNoteDepartmentInput>) =>
	patchJson<{ department: AdminNoteDepartment }>(`/admin/notes/departments/${encodeURIComponent(id)}`, input);

export const deleteAdminNoteDepartment = (id: string) =>
	deleteJson<{ deletedDepartment: { id: string; name: string } }>(`/admin/notes/departments/${encodeURIComponent(id)}`);

export const listAdminNoteSubjects = (params: { q?: string; departmentId?: string } = {}) => {
	const query = buildQuery(params);
	return getJson<{ subjects: AdminNoteSubject[] }>(query ? `/admin/notes/subjects?${query}` : '/admin/notes/subjects');
};

export const createAdminNoteSubject = (input: AdminNoteSubjectInput) =>
	postJson<{ subject: AdminNoteSubject }>('/admin/notes/subjects', input);

export const updateAdminNoteSubject = (id: string, input: Partial<AdminNoteSubjectInput>) =>
	patchJson<{ subject: AdminNoteSubject }>(`/admin/notes/subjects/${encodeURIComponent(id)}`, input);

export const deleteAdminNoteSubject = (id: string) =>
	deleteJson<{ deletedSubject: { id: string; name: string } }>(`/admin/notes/subjects/${encodeURIComponent(id)}`);

export const listAdminNotes = (params: AdminNoteListParams = {}) => {
	const query = buildQuery(params);
	return getJson<{ notes: AdminNote[]; pagination: AdminNotePagination }>(
		query ? `/admin/notes?${query}` : '/admin/notes'
	);
};

export const createAdminNote = (input: AdminNoteInput) => postJson<{ note: AdminNote }>('/admin/notes', input);

export const bulkCreateAdminNotes = (input: AdminNoteBulkInput) =>
	postJson<{ notes: AdminNote[]; createdCount: number }>('/admin/notes/bulk', input);

export const updateAdminNote = (id: string, input: Partial<AdminNoteInput>) =>
	patchJson<{ note: AdminNote }>(`/admin/notes/${encodeURIComponent(id)}`, input);

export const deleteAdminNote = (id: string) =>
	deleteJson<{ deletedNote: { id: string; title: string } }>(`/admin/notes/${encodeURIComponent(id)}`);
