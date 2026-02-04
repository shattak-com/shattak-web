export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type CourseMode = 'Live' | 'Recorded' | 'Hybrid';

export type CourseStatus = 'Draft' | 'Published' | 'draft' | 'published';

export type CourseSessionItem = {
	title: string;
	time: string;
};

export type CourseSessionSection = {
	sectionName: string;
	subsections: CourseSessionItem[];
};

export type CourseHighlight = {
	id: string;
	label: string;
	value: string;
};

export type CourseScheduleItem = {
	id: string;
	label: string;
	time: string;
	duration?: string;
};

export type CourseOutcomeCard = {
	id: string;
	text: string;
};

export type CourseGalleryItem = {
	id: string;
	image: string;
	alt: string;
};

export type CourseAudienceCard = {
	id: string;
	title: string;
	bullets: string[];
	tone?: 'success' | 'accent' | 'warning' | 'info';
};

export type CourseCompletion = {
	certificateImage?: string;
	benefits: string[];
};

export type CourseProject = {
	id: string;
	title: string;
	author: string;
	previewImage: string;
	likes: number;
	liveUrl: string;
};

export type CourseFaqItem = {
	id: string;
	question: string;
	answer: string;
};

export type CourseTool = {
	id: string;
	name: string;
	image: string;
};

export type CourseInstructor = {
	id: string;
	name: string;
	role: string;
	photo: string;
	bio: string;
	linkedInUrl: string;
};

export type CourseReview = {
	id: string;
	name: string;
	affiliation: string;
	rating: number;
	body: string;
	avatar?: string;
	likes: number;
	show: boolean;
};

export type CourseDetails = {
	id: string;
	title: string;
	subtitle: string;
	summary: string;
	category: string;
	categories: string[];
	level: CourseLevel;
	price: number;
	originalPrice: number;
	durationHours: number;
	durationMinutes: number;
	mode: CourseMode;
	enrollmentCount: number;
	rating: number;
	thumbnailImage: string;
	promoImage: string;
	paymentLink: string;
	status: CourseStatus;
	highlights: CourseHighlight[];
	schedule: CourseScheduleItem[];
	projectGallery: CourseGalleryItem[];
	about: string;
	liveUrl: string;
	outcomes: CourseOutcomeCard[];
	audience: CourseAudienceCard[];
	completion: CourseCompletion;
	projects: CourseProject[];
	faqs: CourseFaqItem[];
	prerequisites: CourseSessionSection[];
	liveSessions: CourseSessionSection[];
	postSessionMaterials: CourseSessionSection[];
	requirements: string[];
	tools: CourseTool[];
	instructors: CourseInstructor[];
	reviews: CourseReview[];
};
