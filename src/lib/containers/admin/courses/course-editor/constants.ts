import type { AdminCourseLevel, AdminCourseMode, AdminCourseStatus } from '~/lib/api/admin-courses';

import type { CourseEditorFormValues } from './schema';
import type { CourseEditorStep, CourseEditorStepGroup, CourseEditorStepId } from './types';

export const courseEditorSteps: CourseEditorStep[] = [
	{ id: 'basics', label: 'Basics', description: 'Public identity, categories, and course positioning.' },
	{ id: 'media', label: 'Pricing & Media', description: 'Commercial details, images, and visible metrics.' },
	{
		id: 'outcomes',
		label: 'Outcomes',
		description: 'Requirements and learning outcomes shown on the course page.'
	},
	{
		id: 'audienceTools',
		label: 'Audience & Tools',
		description: 'Audience cards and tools shown on the public course page.'
	},
	{ id: 'instructors', label: 'Instructors', description: 'Mentor profile details shown on the course page.' },
	{ id: 'gallery', label: 'Project Gallery', description: 'Project overview, live link, gallery, and student proof.' },
	{ id: 'reviews', label: 'Reviews & FAQs', description: 'Testimonials and common course questions.' },
	{ id: 'lessons', label: 'Lessons', description: 'Course lessons and learning materials.' },
	{ id: 'review', label: 'Review', description: 'Confirm status and save the course.' }
];

export const courseEditorStepGroups: CourseEditorStepGroup[] = [
	{
		label: 'Course details',
		stepIds: ['basics', 'media', 'outcomes', 'audienceTools', 'instructors', 'gallery', 'reviews']
	},
	{
		label: 'Curriculum',
		stepIds: ['lessons']
	},
	{
		label: 'Final check',
		stepIds: ['review']
	}
];

export const courseEditorStepFieldPrefixes: Record<CourseEditorStepId, string[]> = {
	basics: ['slug', 'title', 'summary', 'categories', 'level', 'mode', 'status', 'whatsappGroupUrl', 'accessCode'],
	media: ['price', 'originalPrice', 'rating', 'enrollmentCount', 'thumbnailImage', 'promoImage', 'promoImageBrand'],
	outcomes: ['requirementsText', 'outcomes'],
	audienceTools: ['audience', 'tools'],
	instructors: ['instructors'],
	gallery: ['about', 'liveUrl', 'projectGallery', 'projects'],
	reviews: ['reviews', 'faqs'],
	lessons: ['lessons'],
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
	whatsappGroupUrl: '',
	accessCode: '',
	status: 'DRAFT',
	about: '',
	liveUrl: '',
	requirementsText: '',
	completionCertificateImage: '',
	completionBenefitsText: '',
	projectGallery: [],
	outcomes: [],
	audience: [],
	projects: [],
	faqs: [],
	tools: [],
	instructors: [],
	reviews: []
};
