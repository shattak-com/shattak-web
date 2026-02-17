import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

import type {
	CourseCompletion,
	CourseDetails,
	CourseLevel,
	CourseMode,
	CourseStatus
} from '~/lib/containers/course/types';
import { getFirestoreDb } from '~/lib/firebase';

export const COURSES_COLLECTION = 'courses';

export type CourseTool = {
	id: string;
	name: string;
	image : string; 
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
	promoImageBrand : string;
};

type CourseFetchOptions = {
	includeDrafts?: boolean;
};

const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);
const asNumber = (value: unknown, fallback = 0) => {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === 'string' && value.trim() !== '') {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : fallback;
	}

	return fallback;
};
const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
const asCourseLevel = (value: unknown): CourseLevel =>
	value === 'Beginner' || value === 'Intermediate' || value === 'Advanced' ? value : 'Beginner';
const asCourseMode = (value: unknown): CourseMode =>
	value === 'Live' || value === 'Recorded' || value === 'Hybrid' ? value : 'Live';
const asCourseStatus = (value: unknown): CourseStatus =>
	value === 'Draft' || value === 'Published' || value === 'draft' || value === 'published'
		? value === 'draft'
			? 'Draft'
			: value === 'published'
				? 'Published'
				: value
		: 'Published';

const toCategories = (data: Partial<CourseDetails>) => {
	const categories = asArray<string>(data.categories)
		.map(value => asString(value).trim())
		.filter(Boolean);
	const fallback = asString(data.category).trim();
	if (categories.length > 0) {
		return categories;
	}
	return fallback ? [fallback] : ['Futured'];
};

const formatDuration = (hours: number, minutes: number) => {
	const safeHours = Math.max(0, Math.floor(hours));
	const safeMinutes = Math.max(0, Math.floor(minutes));
	if (!safeHours && !safeMinutes) {
		return '0h';
	}
	if (!safeHours) {
		return `${safeMinutes}m`;
	}
	if (!safeMinutes) {
		return `${safeHours}h`;
	}
	return `${safeHours}h ${safeMinutes}m`;
};

const normalizeCourseDetails = (id: string, data: Partial<CourseDetails>): CourseDetails => {
	const completion = (data.completion ?? {}) as Partial<CourseCompletion>;
	const categories = toCategories(data);
	const primaryCategory = categories[0] ?? 'Futured';

	return {
		id,
		title: asString(data.title),
		subtitle: asString(data.subtitle),
		summary: asString(data.subtitle),
		category: primaryCategory,
		categories,
		level: asCourseLevel(data.level),
		price: asNumber(data.price),
		originalPrice: asNumber(data.originalPrice),
		durationHours: asNumber(data.durationHours),
		durationMinutes: asNumber(data.durationMinutes),
		mode: asCourseMode(data.mode),
		enrollmentCount: asNumber(data.enrollmentCount),
		rating: asNumber(data.rating),
		thumbnailImage: asString(data.thumbnailImage),
		promoImage: asString(data.promoImage),
		paymentLink: asString(data.paymentLink),
		status: asCourseStatus(data.status),
		highlights: asArray(data.highlights),
		schedule: asArray(data.schedule),
		projectGallery: asArray(data.projectGallery),
		about: asString(data.about),
		liveUrl: asString(data.liveUrl),
		outcomes: asArray(data.outcomes),
		audience: asArray(data.audience),
		completion: {
			certificateImage: asString(completion.certificateImage),
			benefits: asArray(completion.benefits)
		},
		projects: asArray(data.projects),
		faqs: asArray(data.faqs),
		prerequisites: asArray(data.prerequisites),
		liveSessions: asArray(data.liveSessions),
		postSessionMaterials: asArray(data.postSessionMaterials),
		requirements: asArray(data.requirements),
		tools: asArray(data.tools),
		instructors: asArray(data.instructors),
		reviews: asArray(data.reviews),
		promoImageBrand : asString(data.promoImageBrand),
	};
};

const toLandingCourseCard = (course: CourseDetails): LandingCourseCard => ({
	id: course.id,
	title: course.title,
	categories: course.categories,
	image: course.promoImage || course.thumbnailImage,
	level: course.level,
	duration: formatDuration(course.durationHours, course.durationMinutes),
	format: course.mode === 'Recorded' ? 'Recorded' : course.mode === 'Hybrid' ? 'Hybrid' : 'Live Class',
	rating: course.rating,
	learners: course.enrollmentCount,
	price: course.price > 0 ? course.price : null,
	originalPrice: course.originalPrice,
	tools: course.tools,
	promoImageBrand:  course.promoImageBrand
});

export const getCourseById = async (id: string, options?: CourseFetchOptions): Promise<CourseDetails | null> => {
	if (!id) {
		return null;
	}

	const includeDrafts = options?.includeDrafts ?? false;
	const db = getFirestoreDb();
	const snapshot = await getDoc(doc(db, COURSES_COLLECTION, id));

	if (!snapshot.exists()) {
		return null;
	}

	const data = snapshot.data() as Partial<CourseDetails>;
	const course = normalizeCourseDetails(snapshot.id, data);

	if (course.status === 'Draft' && !includeDrafts) {
		return null;
	}

	return course;
};

export const getCourseIds = async (options?: CourseFetchOptions): Promise<string[]> => {
	const db = getFirestoreDb();
	const includeDrafts = options?.includeDrafts ?? false;

	if (includeDrafts) {
		const snapshot = await getDocs(collection(db, COURSES_COLLECTION));
		return snapshot.docs.map(docSnap => docSnap.id);
	}

	const publishedQuery = query(collection(db, COURSES_COLLECTION), where('status', 'in', ['Published', 'published']));
	const snapshot = await getDocs(publishedQuery);

	return snapshot.docs
		.map(docSnap => {
			return docSnap.id;
		})
		.filter((id): id is string => Boolean(id));
};

export const getPublishedLandingCourseCards = async (): Promise<LandingCourseCard[]> => {
	const db = getFirestoreDb();
	const publishedQuery = query(collection(db, COURSES_COLLECTION), where('status', 'in', ['Published', 'published']));
	const snapshot = await getDocs(publishedQuery);

	return snapshot.docs
		.map(docSnap => normalizeCourseDetails(docSnap.id, docSnap.data() as Partial<CourseDetails>))
		.filter(course => course.status === 'Published')
		.map(toLandingCourseCard);
};
