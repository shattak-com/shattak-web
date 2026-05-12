import { getJson, patchJson, postJson } from '~/lib/api/client';

export type AdminCourseStatus = 'DRAFT' | 'PUBLISHED';
export type AdminCourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type AdminCourseMode = 'LIVE' | 'RECORDED' | 'HYBRID';

export type AdminCourseHighlight = {
	id: string;
	label: string;
	value: string;
};

export type AdminCourseScheduleItem = {
	id: string;
	label: string;
	time: string;
	duration?: string;
};

export type AdminCourseGalleryItem = {
	id: string;
	image: string;
	alt: string;
};

export type AdminCourseOutcome = {
	id: string;
	text: string;
};

export type AdminCourseAudience = {
	id: string;
	title: string;
	bullets: string[];
	tone?: 'success' | 'accent' | 'warning' | 'info';
};

export type AdminCourseCompletion = {
	certificateImage?: string;
	benefits?: string[];
};

export type AdminCourseProject = {
	id: string;
	title: string;
	author: string;
	previewImage: string;
	likes: number;
	liveUrl: string;
};

export type AdminCourseFaq = {
	id: string;
	question: string;
	answer: string;
};

export type AdminCourseSessionItem = {
	title: string;
	time: string;
};

export type AdminCourseSessionSection = {
	sectionName: string;
	subsections: AdminCourseSessionItem[];
};

export type AdminCourseTool = {
	id: string;
	name: string;
	image: string;
};

export type AdminCourseInstructor = {
	id: string;
	name: string;
	role: string;
	photo: string;
	bio: string;
	linkedInUrl: string;
};

export type AdminCourseReview = {
	id: string;
	name: string;
	affiliation: string;
	rating: number;
	body: string;
	avatar?: string;
	likes: number;
	show: boolean;
};

export type AdminCourse = {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	summary: string;
	category: string;
	categories: string[];
	level: AdminCourseLevel;
	price: number;
	originalPrice: number;
	durationHours: number;
	durationMinutes: number;
	mode: AdminCourseMode;
	enrollmentCount: number;
	rating: number;
	thumbnailImage: string;
	promoImage: string;
	promoImageBrand: string;
	paymentLink: string;
	status: AdminCourseStatus;
	publishedAt: string | null;
	highlights: AdminCourseHighlight[];
	schedule: AdminCourseScheduleItem[];
	projectGallery: AdminCourseGalleryItem[];
	about: string;
	liveUrl: string;
	outcomes: AdminCourseOutcome[];
	audience: AdminCourseAudience[];
	completion: AdminCourseCompletion;
	projects: AdminCourseProject[];
	faqs: AdminCourseFaq[];
	prerequisites: AdminCourseSessionSection[];
	liveSessions: AdminCourseSessionSection[];
	postSessionMaterials: AdminCourseSessionSection[];
	requirements: string[];
	tools: AdminCourseTool[];
	instructors: AdminCourseInstructor[];
	reviews: AdminCourseReview[];
	createdAt: string;
	updatedAt: string;
};

export type AdminCourseInput = Partial<
	Pick<
		AdminCourse,
		| 'slug'
		| 'title'
		| 'subtitle'
		| 'summary'
		| 'category'
		| 'categories'
		| 'level'
		| 'price'
		| 'originalPrice'
		| 'durationHours'
		| 'durationMinutes'
		| 'mode'
		| 'enrollmentCount'
		| 'rating'
		| 'thumbnailImage'
		| 'promoImage'
		| 'promoImageBrand'
		| 'paymentLink'
		| 'status'
		| 'highlights'
		| 'schedule'
		| 'projectGallery'
		| 'about'
		| 'liveUrl'
		| 'outcomes'
		| 'audience'
		| 'completion'
		| 'projects'
		| 'faqs'
		| 'prerequisites'
		| 'liveSessions'
		| 'postSessionMaterials'
		| 'requirements'
		| 'tools'
		| 'instructors'
		| 'reviews'
	>
>;

export type AdminCourseListParams = {
	q?: string;
	status?: AdminCourseStatus | '';
	category?: string;
	level?: AdminCourseLevel | '';
	mode?: AdminCourseMode | '';
	sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'status' | 'publishedAt' | 'price' | 'enrollmentCount' | 'rating';
	sortOrder?: 'asc' | 'desc';
	page?: number;
	pageSize?: number;
};

export type AdminCoursePagination = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
};

export const listAdminCourses = (params: AdminCourseListParams = {}) => {
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== '') {
			searchParams.set(key, String(value));
		}
	});

	const query = searchParams.toString();

	return getJson<{ courses: AdminCourse[]; pagination: AdminCoursePagination }>(
		query ? `/admin/courses?${query}` : '/admin/courses'
	);
};

export const getAdminCourse = (id: string) =>
	getJson<{ course: AdminCourse }>(`/admin/courses/${encodeURIComponent(id)}`);

export const createAdminCourse = (input: AdminCourseInput) =>
	postJson<{ course: AdminCourse }>('/admin/courses', input);

export const updateAdminCourse = (id: string, input: AdminCourseInput) =>
	patchJson<{ course: AdminCourse }>(`/admin/courses/${encodeURIComponent(id)}`, input);
