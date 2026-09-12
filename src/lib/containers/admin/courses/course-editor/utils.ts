import type { FieldErrors, Path } from 'react-hook-form';

import type { AdminCourse, AdminCourseInput } from '~/lib/api/admin-courses';

import { courseEditorStepFieldPrefixes, courseEditorSteps } from './constants';
import type { CourseEditorFormValues } from './schema';
import type { CourseEditorFeedback, CourseEditorStepId } from './types';

export const getFeedbackBorderColor = (tone: CourseEditorFeedback['tone']) =>
	tone === 'error' ? 'red.400' : 'border.default';

export const getFeedbackTextColor = (tone: CourseEditorFeedback['tone']) => {
	if (tone === 'error') {
		return 'red.500';
	}

	if (tone === 'success') {
		return 'green.500';
	}

	return 'text.muted';
};

export const createRowId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createCourseSlug = (value: string) => {
	if (!value.trim()) {
		return '';
	}

	const slug = value
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-')
		.slice(0, 160)
		.replace(/-+$/g, '');

	return slug || 'course';
};

const textLinesToArray = (value: string) =>
	value
		.split(/\r?\n/)
		.map(item => item.trim())
		.filter(Boolean);

export const normalizeDurationParts = (hours: number, minutes: number) => {
	const totalMinutes = Math.max(0, Math.trunc(hours) * 60 + Math.trunc(minutes));

	return {
		hours: Math.floor(totalMinutes / 60),
		minutes: totalMinutes % 60
	};
};

export const formatDurationFromMinutes = (totalMinutes: number) => {
	const { hours, minutes } = normalizeDurationParts(0, totalMinutes);
	const parts: string[] = [];

	if (hours) {
		parts.push(`${hours}h`);
	}

	if (minutes) {
		parts.push(`${minutes}m`);
	}

	return parts.length ? parts.join(' ') : '0m';
};

export const formatDurationParts = (hours: number, minutes: number) => {
	const normalizedDuration = normalizeDurationParts(hours, minutes);

	return formatDurationFromMinutes(normalizedDuration.hours * 60 + normalizedDuration.minutes);
};

export const parseDurationToMinutes = (value: string) => {
	const normalizedValue = value.toLowerCase().replace(/\s+/g, ' ').trim();

	if (!normalizedValue) {
		return 0;
	}

	const colonMatch = normalizedValue.match(/^(\d+)\s*:\s*([0-5]?\d)$/);

	if (colonMatch) {
		return Number.parseInt(colonMatch[1] ?? '0', 10) * 60 + Number.parseInt(colonMatch[2] ?? '0', 10);
	}

	const hourMatch = normalizedValue.match(/(\d+)\s*(?:hours?|hrs?|h)/);
	const minuteMatch = normalizedValue.match(/(\d+)\s*(?:minutes?|mins?|m)/);

	if (hourMatch || minuteMatch) {
		return Number.parseInt(hourMatch?.[1] ?? '0', 10) * 60 + Number.parseInt(minuteMatch?.[1] ?? '0', 10);
	}

	const plainNumber = Number.parseInt(normalizedValue, 10);

	return Number.isFinite(plainNumber) ? plainNumber : 0;
};

export const parseDurationParts = (value: string) => normalizeDurationParts(0, parseDurationToMinutes(value));

export const getScheduleTotalMinutes = (schedule: CourseEditorFormValues['schedule']) =>
	schedule.reduce((total, item) => total + parseDurationToMinutes(item.duration), 0);

export const parseDurationInputValue = (value: string) => {
	const parsedValue = Number.parseInt(value, 10);

	return Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : 0;
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

export const collectErrorPaths = (value: unknown, prefix = ''): string[] => {
	if (!isObjectRecord(value)) {
		return [];
	}

	if (typeof value.message === 'string') {
		return prefix ? [prefix] : [];
	}

	return Object.entries(value).flatMap(([key, nestedValue]) => {
		if (key === 'ref' || key === 'type' || key === 'message') {
			return [];
		}

		const nextPrefix = prefix ? `${prefix}.${key}` : key;

		return collectErrorPaths(nestedValue, nextPrefix);
	});
};

export const getStepForErrorPath = (errorPath: string): CourseEditorStepId => {
	const rootField = errorPath.split('.')[0] ?? errorPath;

	return (
		courseEditorSteps.find(step =>
			courseEditorStepFieldPrefixes[step.id].some(prefix => rootField === prefix || errorPath.startsWith(`${prefix}.`))
		)?.id ?? 'basics'
	);
};

export const countErrorsByStep = (errorPaths: string[]) =>
	courseEditorSteps.reduce<Record<CourseEditorStepId, number>>(
		(counts, step) => ({
			...counts,
			[step.id]: errorPaths.filter(errorPath => getStepForErrorPath(errorPath) === step.id).length
		}),
		{
			basics: 0,
			media: 0,
			highlights: 0,
			outcomes: 0,
			audienceTools: 0,
			instructors: 0,
			gallery: 0,
			reviews: 0,
			lessons: 0,
			liveSessions: 0,
			postSessionMaterials: 0,
			review: 0
		}
	);

export const getFieldError = (errors: FieldErrors<CourseEditorFormValues>, name: Path<CourseEditorFormValues>) => {
	const error = errors[name];

	return typeof error?.message === 'string' ? error.message : '';
};

const getString = (value: unknown) => (typeof value === 'string' ? value : '');

const getNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

const getCourseCategories = (course: AdminCourse) => {
	if (course.categories.length) {
		return course.categories;
	}

	return course.category ? [course.category] : [];
};

export const courseToFormValues = (course: AdminCourse): CourseEditorFormValues => ({
	slug: course.slug,
	title: course.title,
	subtitle: '',
	summary: course.summary || course.subtitle,
	categories: getCourseCategories(course),
	level: course.level,
	price: course.price,
	originalPrice: course.originalPrice,
	durationHours: course.durationHours,
	durationMinutes: course.durationMinutes,
	mode: course.mode,
	enrollmentCount: course.enrollmentCount,
	rating: course.rating,
	thumbnailImage: course.thumbnailImage,
	promoImage: course.promoImage,
	promoImageBrand: course.promoImageBrand,
	paymentLink: course.paymentLink,
	whatsappGroupUrl: course.whatsappGroupUrl,
	accessCode: course.accessCode,
	status: course.status,
	about: course.about,
	liveUrl: course.liveUrl,
	requirementsText: course.requirements.join('\n'),
	completionCertificateImage: getString(course.completion.certificateImage),
	completionBenefitsText: (course.completion.benefits ?? []).join('\n'),
	highlights: course.highlights.map(item => ({
		id: item.id || createRowId('highlight'),
		label: item.label,
		value: item.value
	})),
	schedule: course.schedule.map((item, index) => ({
		id: item.id || createRowId('schedule'),
		label: `Session ${index + 1}`,
		time: item.time,
		duration: item.duration ?? ''
	})),
	projectGallery: course.projectGallery.map(item => ({
		id: item.id || createRowId('gallery'),
		image: item.image,
		alt: item.alt
	})),
	outcomes: course.outcomes.map(item => ({
		id: item.id || createRowId('outcome'),
		text: item.text
	})),
	audience: course.audience.map(item => ({
		id: item.id || createRowId('audience'),
		title: item.title,
		tone: item.tone ?? '',
		bulletsText: item.bullets.join('\n')
	})),
	projects: course.projects.map(item => ({
		id: item.id || createRowId('project'),
		title: item.title,
		author: item.author,
		previewImage: item.previewImage,
		likes: item.likes,
		liveUrl: item.liveUrl
	})),
	faqs: course.faqs.map(item => ({
		id: item.id || createRowId('faq'),
		question: item.question,
		answer: item.answer
	})),
	tools: course.tools.map(item => ({
		id: item.id || createRowId('tool'),
		name: item.name,
		image: item.image
	})),
	instructors: course.instructors.map(item => ({
		id: item.id || createRowId('instructor'),
		name: item.name,
		role: item.role,
		photo: item.photo,
		linkedInUrl: item.linkedInUrl,
		bio: item.bio
	})),
	reviews: course.reviews.map(item => ({
		id: item.id || createRowId('review'),
		name: item.name,
		affiliation: item.affiliation,
		rating: item.rating,
		body: item.body,
		avatar: item.avatar ?? '',
		likes: item.likes,
		show: item.show
	}))
});

const hasAnyValue = (values: Array<string | number | boolean | undefined>) =>
	values.some(value => {
		if (typeof value === 'string') {
			return value.trim().length > 0;
		}

		return Boolean(value);
	});

export const formValuesToPayload = (values: CourseEditorFormValues): AdminCourseInput => {
	return {
		slug: values.slug?.trim() || undefined,
		title: values.title.trim(),
		subtitle: '',
		summary: values.summary.trim(),
		category: values.categories[0] ?? '',
		categories: values.categories,
		level: values.level,
		price: values.price,
		originalPrice: values.originalPrice,
		mode: values.mode,
		enrollmentCount: values.enrollmentCount,
		rating: values.rating,
		thumbnailImage: values.thumbnailImage.trim(),
		promoImage: values.promoImage.trim(),
		promoImageBrand: values.promoImageBrand.trim(),
		whatsappGroupUrl: values.whatsappGroupUrl.trim(),
		accessCode: values.accessCode.trim(),
		status: values.status,
		about: values.about.trim(),
		liveUrl: values.liveUrl.trim(),
		requirements: textLinesToArray(values.requirementsText),
		projectGallery: values.projectGallery
			.filter(item => hasAnyValue([item.image, item.alt]))
			.map(item => ({ id: item.id || createRowId('gallery'), image: item.image.trim(), alt: item.alt.trim() })),
		outcomes: values.outcomes
			.filter(item => hasAnyValue([item.text]))
			.map(item => ({ id: item.id || createRowId('outcome'), text: item.text.trim() })),
		audience: values.audience
			.filter(item => hasAnyValue([item.title, item.bulletsText]))
			.map(item => ({
				id: item.id || createRowId('audience'),
				title: item.title.trim(),
				...(item.tone ? { tone: item.tone } : {}),
				bullets: textLinesToArray(item.bulletsText)
			})),
		projects: values.projects
			.filter(item => hasAnyValue([item.title, item.author, item.previewImage, item.liveUrl, item.likes]))
			.map(item => ({
				id: item.id || createRowId('project'),
				title: item.title.trim(),
				author: item.author.trim(),
				previewImage: item.previewImage.trim(),
				likes: getNumber(item.likes),
				liveUrl: item.liveUrl.trim()
			})),
		faqs: values.faqs
			.filter(item => hasAnyValue([item.question, item.answer]))
			.map(item => ({ id: item.id || createRowId('faq'), question: item.question.trim(), answer: item.answer.trim() })),
		tools: values.tools
			.filter(item => hasAnyValue([item.name, item.image]))
			.map(item => ({ id: item.id || createRowId('tool'), name: item.name.trim(), image: item.image.trim() })),
		instructors: values.instructors
			.filter(item => hasAnyValue([item.name, item.role, item.photo, item.linkedInUrl, item.bio]))
			.map(item => ({
				id: item.id || createRowId('instructor'),
				name: item.name.trim(),
				role: item.role.trim(),
				photo: item.photo.trim(),
				linkedInUrl: item.linkedInUrl.trim(),
				bio: item.bio.trim()
			})),
		reviews: values.reviews
			.filter(item => hasAnyValue([item.name, item.affiliation, item.body, item.avatar, item.likes]))
			.map(item => ({
				id: item.id || createRowId('review'),
				name: item.name.trim(),
				affiliation: item.affiliation.trim(),
				rating: getNumber(item.rating),
				body: item.body.trim(),
				...(item.avatar.trim() ? { avatar: item.avatar.trim() } : {}),
				likes: getNumber(item.likes),
				show: item.show
			}))
	};
};
