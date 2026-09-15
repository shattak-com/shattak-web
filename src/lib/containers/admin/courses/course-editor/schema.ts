import { z } from 'zod';

const textRecordSchema = z.object({
	id: z.string(),
	label: z.string(),
	value: z.string()
});

export const courseEditorSchema = z.object({
	slug: z
		.union([
			z.literal(''),
			z
				.string()
				.max(160, 'Keep the slug under 160 characters.')
				.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only.')
		])
		.optional(),
	title: z.string().trim().min(1, 'Course title is required.').max(180),
	subtitle: z.string().max(240),
	summary: z.string().max(600),
	categories: z.array(z.string()).min(1, 'Select at least one category.'),
	level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
	price: z.number().min(0),
	originalPrice: z.number().min(0),
	durationHours: z.number().int().min(0),
	durationMinutes: z.number().int().min(0).max(59),
	mode: z.enum(['LIVE', 'RECORDED', 'HYBRID']),
	enrollmentCount: z.number().int().min(0),
	rating: z.number().min(0).max(5),
	thumbnailImage: z.string().max(1200),
	promoImage: z.string().max(1200),
	promoImageBrand: z.string().max(1200),
	paymentLink: z.string(),
	whatsappGroupUrl: z.string().max(1200),
	accessCode: z.string().max(120),
	status: z.enum(['DRAFT', 'PUBLISHED']),
	about: z.string().max(20000),
	liveUrl: z.string().max(1200),
	requirementsText: z.string(),
	completionCertificateImage: z.string(),
	completionBenefitsText: z.string(),
	highlights: z.array(textRecordSchema),
	schedule: z.array(
		z.object({
			id: z.string(),
			label: z.string(),
			time: z.string(),
			duration: z.string()
		})
	),
	projectGallery: z.array(
		z.object({
			id: z.string(),
			image: z.string().max(1200),
			alt: z.string().max(180)
		})
	),
	outcomes: z.array(
		z.object({
			id: z.string(),
			text: z.string().max(120)
		})
	),
	audience: z.array(
		z.object({
			id: z.string(),
			title: z.string().max(160),
			tone: z.enum(['', 'success', 'accent', 'warning', 'info']),
			bulletsText: z.string()
		})
	),
	projects: z.array(
		z.object({
			id: z.string(),
			title: z.string().max(180),
			author: z.string().max(120),
			previewImage: z.string().max(1200),
			likes: z.number().int().min(0),
			liveUrl: z.string().max(1200)
		})
	),
	faqs: z.array(
		z.object({
			id: z.string(),
			question: z.string().max(300),
			answer: z.string().max(1200)
		})
	),
	tools: z.array(
		z.object({
			id: z.string(),
			name: z.string().max(120),
			image: z.string().max(1200)
		})
	),
	instructors: z.array(
		z.object({
			id: z.string(),
			name: z.string().max(120),
			role: z.string().max(160),
			photo: z.string().max(1200),
			linkedInUrl: z.string().max(1200),
			bio: z.string().max(2000)
		})
	),
	reviews: z.array(
		z.object({
			id: z.string(),
			name: z.string().max(120),
			affiliation: z.string().max(180),
			rating: z.number().min(0).max(5),
			body: z.string().max(2000),
			avatar: z.string().max(1200),
			likes: z.number().int().min(0),
			show: z.boolean()
		})
	)
});

export type CourseEditorFormValues = z.infer<typeof courseEditorSchema>;
