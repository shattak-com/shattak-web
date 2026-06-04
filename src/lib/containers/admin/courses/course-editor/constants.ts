import type { AdminCourseLevel, AdminCourseMode, AdminCourseStatus } from '~/lib/api/admin-courses';

import type { CourseEditorFormValues } from './schema';
import type { CourseEditorStep, CourseEditorStepId } from './types';

export const courseEditorSteps: CourseEditorStep[] = [
	{ id: 'basics', label: 'Basics', description: 'Public identity, categories, and course positioning.' },
	{ id: 'media', label: 'Pricing & Media', description: 'Commercial details, links, images, and visible metrics.' },
	{
		id: 'highlights',
		label: 'Highlights',
		description: 'Key stats and schedule items shown near the course overview.'
	},
	{
		id: 'outcomes',
		label: 'Outcomes',
		description: 'Requirements, learning outcomes, audience, tools, and completion benefits.'
	},
	{ id: 'instructors', label: 'Instructors', description: 'Mentor profile details shown on the course page.' },
	{ id: 'gallery', label: 'Project Gallery', description: 'Project overview, live link, gallery, and student proof.' },
	{ id: 'reviews', label: 'Reviews & FAQs', description: 'Testimonials and common course questions.' },
	{ id: 'prerequisites', label: 'Prerequisites', description: 'Pre-course requirements and prep materials.' },
	{ id: 'liveSessions', label: 'Live Sessions', description: 'Live class sections and session items.' },
	{
		id: 'postSessionMaterials',
		label: 'Post Session',
		description: 'Materials learners receive after sessions.'
	},
	{ id: 'review', label: 'Review', description: 'Confirm status and save the course.' }
];

export const courseEditorStepFieldPrefixes: Record<CourseEditorStepId, string[]> = {
	basics: ['slug', 'title', 'subtitle', 'summary', 'categories', 'level', 'mode', 'status'],
	media: [
		'price',
		'originalPrice',
		'rating',
		'enrollmentCount',
		'thumbnailImage',
		'promoImage',
		'promoImageBrand',
		'paymentLink'
	],
	highlights: ['highlights', 'schedule'],
	outcomes: [
		'requirementsText',
		'completionCertificateImage',
		'completionBenefitsText',
		'outcomes',
		'audience',
		'tools'
	],
	instructors: ['instructors'],
	gallery: ['about', 'liveUrl', 'projectGallery', 'projects'],
	reviews: ['reviews', 'faqs'],
	prerequisites: ['prerequisites'],
	liveSessions: ['liveSessions'],
	postSessionMaterials: ['postSessionMaterials'],
	review: ['durationHours', 'durationMinutes']
};

export const courseLevelOptions: Array<{ label: string; value: AdminCourseLevel }> = [
	{ label: 'Beginner', value: 'BEGINNER' },
	{ label: 'Intermediate', value: 'INTERMEDIATE' },
	{ label: 'Advanced', value: 'ADVANCED' }
];

export const courseModeOptions: Array<{ label: string; value: AdminCourseMode }> = [
	{ label: 'Live', value: 'LIVE' },
	{ label: 'Recorded', value: 'RECORDED' },
	{ label: 'Hybrid', value: 'HYBRID' }
];

export const courseStatusOptions: Array<{ label: string; value: AdminCourseStatus }> = [
	{ label: 'Draft', value: 'DRAFT' },
	{ label: 'Published', value: 'PUBLISHED' }
];

export const toneOptions = [
	{ label: 'Default', value: '' },
	{ label: 'Success', value: 'success' },
	{ label: 'Accent', value: 'accent' },
	{ label: 'Warning', value: 'warning' },
	{ label: 'Info', value: 'info' }
];

export const defaultFormValues: CourseEditorFormValues = {
	slug: '',
	title: '',
	subtitle: '',
	summary: '',
	categories: [],
	level: 'BEGINNER',
	price: 0,
	originalPrice: 0,
	durationHours: 0,
	durationMinutes: 0,
	mode: 'LIVE',
	enrollmentCount: 0,
	rating: 0,
	thumbnailImage: '',
	promoImage: '',
	promoImageBrand: '',
	paymentLink: '',
	status: 'DRAFT',
	about: '',
	liveUrl: '',
	requirementsText: '',
	completionCertificateImage: '',
	completionBenefitsText: '',
	highlights: [],
	schedule: [],
	projectGallery: [],
	outcomes: [],
	audience: [],
	projects: [],
	faqs: [],
	tools: [],
	instructors: [],
	reviews: []
};
