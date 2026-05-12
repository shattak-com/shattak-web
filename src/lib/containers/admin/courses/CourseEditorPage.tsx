'use client';

import { Badge, Box, Button, HStack, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	useFieldArray,
	useForm,
	type Control,
	type FieldErrors,
	type Path,
	type UseFormRegister
} from 'react-hook-form';
import { z } from 'zod';

import {
	createAdminCourse,
	getAdminCourse,
	updateAdminCourse,
	type AdminCourse,
	type AdminCourseInput,
	type AdminCourseLevel,
	type AdminCourseMode,
	type AdminCourseStatus
} from '~/lib/api/admin-courses';

type CourseEditorPageProps = {
	courseId?: string;
};

type CourseEditorStepId = 'basics' | 'media' | 'value' | 'proof' | 'curriculum' | 'review';

const courseEditorSteps: Array<{ id: CourseEditorStepId; label: string; description: string }> = [
	{ id: 'basics', label: 'Basics', description: 'Public identity, category, and course positioning.' },
	{ id: 'media', label: 'Pricing & Media', description: 'Commercial details, links, images, and visible metrics.' },
	{
		id: 'value',
		label: 'Course Value',
		description: 'Outcomes, requirements, highlights, tools, and completion data.'
	},
	{ id: 'proof', label: 'People & Proof', description: 'Instructors, projects, reviews, gallery, and FAQs.' },
	{ id: 'curriculum', label: 'Curriculum', description: 'Prerequisites, live sessions, and post-session materials.' },
	{ id: 'review', label: 'Review', description: 'Confirm status and save the course.' }
];

const courseLevelOptions: Array<{ label: string; value: AdminCourseLevel }> = [
	{ label: 'Beginner', value: 'BEGINNER' },
	{ label: 'Intermediate', value: 'INTERMEDIATE' },
	{ label: 'Advanced', value: 'ADVANCED' }
];

const courseModeOptions: Array<{ label: string; value: AdminCourseMode }> = [
	{ label: 'Live', value: 'LIVE' },
	{ label: 'Recorded', value: 'RECORDED' },
	{ label: 'Hybrid', value: 'HYBRID' }
];

const courseStatusOptions: Array<{ label: string; value: AdminCourseStatus }> = [
	{ label: 'Draft', value: 'DRAFT' },
	{ label: 'Published', value: 'PUBLISHED' }
];

const toneOptions = [
	{ label: 'Default', value: '' },
	{ label: 'Success', value: 'success' },
	{ label: 'Accent', value: 'accent' },
	{ label: 'Warning', value: 'warning' },
	{ label: 'Info', value: 'info' }
];

const textRecordSchema = z.object({
	id: z.string(),
	label: z.string().max(120),
	value: z.string().max(240)
});

const courseEditorSchema = z.object({
	slug: z
		.union([
			z.literal(''),
			z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only.')
		])
		.optional(),
	title: z.string().trim().min(1, 'Course title is required.').max(180),
	subtitle: z.string().max(240),
	summary: z.string().max(600),
	category: z.string().max(120),
	categoriesText: z.string(),
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
	paymentLink: z.string().max(1200),
	status: z.enum(['DRAFT', 'PUBLISHED']),
	about: z.string().max(20000),
	liveUrl: z.string().max(1200),
	requirementsText: z.string(),
	completionCertificateImage: z.string().max(1200),
	completionBenefitsText: z.string(),
	highlights: z.array(textRecordSchema),
	schedule: z.array(
		z.object({
			id: z.string(),
			label: z.string().max(160),
			time: z.string().max(160),
			duration: z.string().max(80)
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
			text: z.string().max(300)
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
	prerequisites: z.array(
		z.object({
			sectionName: z.string().max(180),
			subsectionsText: z.string()
		})
	),
	liveSessions: z.array(
		z.object({
			sectionName: z.string().max(180),
			subsectionsText: z.string()
		})
	),
	postSessionMaterials: z.array(
		z.object({
			sectionName: z.string().max(180),
			subsectionsText: z.string()
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

type CourseEditorFormValues = z.infer<typeof courseEditorSchema>;

type CourseEditorSectionProps = {
	control: Control<CourseEditorFormValues>;
	register: UseFormRegister<CourseEditorFormValues>;
	errors: FieldErrors<CourseEditorFormValues>;
};

const defaultFormValues: CourseEditorFormValues = {
	slug: '',
	title: '',
	subtitle: '',
	summary: '',
	category: '',
	categoriesText: '',
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
	prerequisites: [],
	liveSessions: [],
	postSessionMaterials: [],
	tools: [],
	instructors: [],
	reviews: []
};

const createRowId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const textListToArray = (value: string) =>
	value
		.split(/\r?\n|,/)
		.map(item => item.trim())
		.filter(Boolean);

const textLinesToArray = (value: string) =>
	value
		.split(/\r?\n/)
		.map(item => item.trim())
		.filter(Boolean);

const getFieldError = (errors: FieldErrors<CourseEditorFormValues>, name: Path<CourseEditorFormValues>) => {
	const error = errors[name];

	return typeof error?.message === 'string' ? error.message : '';
};

const getString = (value: unknown) => (typeof value === 'string' ? value : '');

const getNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

const sectionItemsToText = (items: Array<{ title: string; time: string }>) =>
	items.map(item => (item.time ? [item.title, item.time].join(' | ') : item.title)).join('\n');

const textToSectionItems = (value: string) =>
	textLinesToArray(value).map(line => {
		const [title = '', time = ''] = line.split('|').map(part => part.trim());

		return {
			title,
			time
		};
	});

const courseToFormValues = (course: AdminCourse): CourseEditorFormValues => ({
	slug: course.slug,
	title: course.title,
	subtitle: course.subtitle,
	summary: course.summary,
	category: course.category,
	categoriesText: course.categories.join('\n'),
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
	schedule: course.schedule.map(item => ({
		id: item.id || createRowId('schedule'),
		label: item.label,
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
	prerequisites: course.prerequisites.map(item => ({
		sectionName: item.sectionName,
		subsectionsText: sectionItemsToText(item.subsections)
	})),
	liveSessions: course.liveSessions.map(item => ({
		sectionName: item.sectionName,
		subsectionsText: sectionItemsToText(item.subsections)
	})),
	postSessionMaterials: course.postSessionMaterials.map(item => ({
		sectionName: item.sectionName,
		subsectionsText: sectionItemsToText(item.subsections)
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

const formValuesToPayload = (values: CourseEditorFormValues): AdminCourseInput => ({
	slug: values.slug?.trim() || undefined,
	title: values.title.trim(),
	subtitle: values.subtitle.trim(),
	summary: values.summary.trim(),
	category: values.category.trim(),
	categories: textListToArray(values.categoriesText),
	level: values.level,
	price: values.price,
	originalPrice: values.originalPrice,
	durationHours: values.durationHours,
	durationMinutes: values.durationMinutes,
	mode: values.mode,
	enrollmentCount: values.enrollmentCount,
	rating: values.rating,
	thumbnailImage: values.thumbnailImage.trim(),
	promoImage: values.promoImage.trim(),
	promoImageBrand: values.promoImageBrand.trim(),
	paymentLink: values.paymentLink.trim(),
	status: values.status,
	about: values.about.trim(),
	liveUrl: values.liveUrl.trim(),
	requirements: textLinesToArray(values.requirementsText),
	completion: {
		...(values.completionCertificateImage.trim()
			? {
					certificateImage: values.completionCertificateImage.trim()
				}
			: {}),
		benefits: textLinesToArray(values.completionBenefitsText)
	},
	highlights: values.highlights
		.filter(item => hasAnyValue([item.label, item.value]))
		.map(item => ({ id: item.id || createRowId('highlight'), label: item.label.trim(), value: item.value.trim() })),
	schedule: values.schedule
		.filter(item => hasAnyValue([item.label, item.time, item.duration]))
		.map(item => ({
			id: item.id || createRowId('schedule'),
			label: item.label.trim(),
			time: item.time.trim(),
			...(item.duration.trim() ? { duration: item.duration.trim() } : {})
		})),
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
	prerequisites: values.prerequisites
		.filter(item => hasAnyValue([item.sectionName, item.subsectionsText]))
		.map(item => ({ sectionName: item.sectionName.trim(), subsections: textToSectionItems(item.subsectionsText) })),
	liveSessions: values.liveSessions
		.filter(item => hasAnyValue([item.sectionName, item.subsectionsText]))
		.map(item => ({ sectionName: item.sectionName.trim(), subsections: textToSectionItems(item.subsectionsText) })),
	postSessionMaterials: values.postSessionMaterials
		.filter(item => hasAnyValue([item.sectionName, item.subsectionsText]))
		.map(item => ({ sectionName: item.sectionName.trim(), subsections: textToSectionItems(item.subsectionsText) })),
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
});

const FormField = ({
	label,
	name,
	register,
	errors,
	type = 'text',
	placeholder
}: {
	label: string;
	name: Path<CourseEditorFormValues>;
	register: UseFormRegister<CourseEditorFormValues>;
	errors: FieldErrors<CourseEditorFormValues>;
	type?: string;
	placeholder?: string;
}) => {
	const error = getFieldError(errors, name);
	const registration = type === 'number' ? register(name, { valueAsNumber: true }) : register(name);

	return (
		<Box>
			<Text fontSize="xs" color="text.muted" mb={1}>
				{label}
			</Text>
			<Input {...registration} type={type} placeholder={placeholder} h="40px" />
			{error ? (
				<Text mt={1} fontSize="xs" color="red.500">
					{error}
				</Text>
			) : null}
		</Box>
	);
};

const TextareaField = ({
	label,
	name,
	register,
	errors,
	minH = '100px',
	placeholder
}: {
	label: string;
	name: Path<CourseEditorFormValues>;
	register: UseFormRegister<CourseEditorFormValues>;
	errors: FieldErrors<CourseEditorFormValues>;
	minH?: string;
	placeholder?: string;
}) => {
	const error = getFieldError(errors, name);

	return (
		<Box>
			<Text fontSize="xs" color="text.muted" mb={1}>
				{label}
			</Text>
			<textarea
				{...register(name)}
				placeholder={placeholder}
				style={{
					minHeight: minH,
					width: '100%',
					border: '1px solid var(--chakra-colors-border-default)',
					borderRadius: '6px',
					background: 'var(--chakra-colors-bg-card)',
					padding: '8px 12px',
					fontSize: '14px',
					resize: 'vertical'
				}}
			/>
			{error ? (
				<Text mt={1} fontSize="xs" color="red.500">
					{error}
				</Text>
			) : null}
		</Box>
	);
};

const SelectField = ({
	label,
	name,
	register,
	options
}: {
	label: string;
	name: Path<CourseEditorFormValues>;
	register: UseFormRegister<CourseEditorFormValues>;
	options: Array<{ label: string; value: string }>;
}) => (
	<Box>
		<Text fontSize="xs" color="text.muted" mb={1}>
			{label}
		</Text>
		<select
			{...register(name)}
			style={{
				width: '100%',
				height: '40px',
				border: '1px solid var(--chakra-colors-border-default)',
				borderRadius: '6px',
				background: 'var(--chakra-colors-bg-card)',
				paddingInline: '12px',
				fontSize: '14px'
			}}
		>
			{options.map(option => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	</Box>
);

const EmptyEditorState = ({ label }: { label: string }) => (
	<Box border="1px dashed" borderColor="border.default" borderRadius="lg" p={4}>
		<Text fontSize="sm" color="text.muted">
			No {label.toLowerCase()} added yet.
		</Text>
	</Box>
);

const EditorCard = ({
	title,
	onRemove,
	children
}: {
	title: string;
	onRemove: () => void;
	children: React.ReactNode;
}) => (
	<Box border="1px solid" borderColor="border.default" borderRadius="lg" p={4}>
		<Stack gap={3}>
			<HStack justify="space-between" gap={3}>
				<Text fontSize="sm" fontWeight="semibold">
					{title}
				</Text>
				<Button size="xs" variant="outline" borderRadius="full" color="red.500" onClick={onRemove}>
					Remove
				</Button>
			</HStack>
			{children}
		</Stack>
	</Box>
);

const EditorSectionHeader = ({ title, action }: { title: string; action: React.ReactNode }) => (
	<HStack justify="space-between" gap={3} flexWrap="wrap">
		<Text fontSize="sm" fontWeight="semibold">
			{title}
		</Text>
		{action}
	</HStack>
);

const HighlightsEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
	const { fields, append, remove } = useFieldArray({ control, name: 'highlights' });

	return (
		<Stack gap={3}>
			<EditorSectionHeader
				title="Highlights"
				action={
					<Button
						size="sm"
						variant="outline"
						borderRadius="full"
						onClick={() => append({ id: createRowId('highlight'), label: '', value: '' })}
					>
						Add highlight
					</Button>
				}
			/>
			{fields.length ? null : <EmptyEditorState label="highlights" />}
			{fields.map((field, index) => (
				<EditorCard key={field.id} title={`Highlight ${index + 1}`} onRemove={() => remove(index)}>
					<SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
						<FormField label="Label" name={`highlights.${index}.label`} register={register} errors={errors} />
						<FormField label="Value" name={`highlights.${index}.value`} register={register} errors={errors} />
					</SimpleGrid>
				</EditorCard>
			))}
		</Stack>
	);
};

const ScheduleEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
	const { fields, append, remove } = useFieldArray({ control, name: 'schedule' });

	return (
		<Stack gap={3}>
			<EditorSectionHeader
				title="Schedule"
				action={
					<Button
						size="sm"
						variant="outline"
						borderRadius="full"
						onClick={() => append({ id: createRowId('schedule'), label: '', time: '', duration: '' })}
					>
						Add schedule item
					</Button>
				}
			/>
			{fields.length ? null : <EmptyEditorState label="schedule items" />}
			{fields.map((field, index) => (
				<EditorCard key={field.id} title={`Schedule item ${index + 1}`} onRemove={() => remove(index)}>
					<SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
						<FormField label="Label" name={`schedule.${index}.label`} register={register} errors={errors} />
						<FormField label="Time" name={`schedule.${index}.time`} register={register} errors={errors} />
						<FormField label="Duration" name={`schedule.${index}.duration`} register={register} errors={errors} />
					</SimpleGrid>
				</EditorCard>
			))}
		</Stack>
	);
};

const OutcomesEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
	const { fields, append, remove } = useFieldArray({ control, name: 'outcomes' });

	return (
		<Stack gap={3}>
			<EditorSectionHeader
				title="Outcomes"
				action={
					<Button
						size="sm"
						variant="outline"
						borderRadius="full"
						onClick={() => append({ id: createRowId('outcome'), text: '' })}
					>
						Add outcome
					</Button>
				}
			/>
			{fields.length ? null : <EmptyEditorState label="outcomes" />}
			{fields.map((field, index) => (
				<EditorCard key={field.id} title={`Outcome ${index + 1}`} onRemove={() => remove(index)}>
					<TextareaField
						label="Outcome"
						name={`outcomes.${index}.text`}
						register={register}
						errors={errors}
						minH="80px"
					/>
				</EditorCard>
			))}
		</Stack>
	);
};

const AudienceEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
	const { fields, append, remove } = useFieldArray({ control, name: 'audience' });

	return (
		<Stack gap={3}>
			<EditorSectionHeader
				title="Audience"
				action={
					<Button
						size="sm"
						variant="outline"
						borderRadius="full"
						onClick={() => append({ id: createRowId('audience'), title: '', tone: '', bulletsText: '' })}
					>
						Add audience
					</Button>
				}
			/>
			{fields.length ? null : <EmptyEditorState label="audience cards" />}
			{fields.map((field, index) => (
				<EditorCard key={field.id} title={`Audience card ${index + 1}`} onRemove={() => remove(index)}>
					<SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
						<FormField label="Title" name={`audience.${index}.title`} register={register} errors={errors} />
						<SelectField label="Tone" name={`audience.${index}.tone`} register={register} options={toneOptions} />
					</SimpleGrid>
					<TextareaField
						label="Bullets"
						name={`audience.${index}.bulletsText`}
						register={register}
						errors={errors}
						minH="90px"
						placeholder="One bullet per line"
					/>
				</EditorCard>
			))}
		</Stack>
	);
};

const ToolsEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
	const { fields, append, remove } = useFieldArray({ control, name: 'tools' });

	return (
		<Stack gap={3}>
			<EditorSectionHeader
				title="Tools"
				action={
					<Button
						size="sm"
						variant="outline"
						borderRadius="full"
						onClick={() => append({ id: createRowId('tool'), name: '', image: '' })}
					>
						Add tool
					</Button>
				}
			/>
			{fields.length ? null : <EmptyEditorState label="tools" />}
			{fields.map((field, index) => (
				<EditorCard key={field.id} title={`Tool ${index + 1}`} onRemove={() => remove(index)}>
					<SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
						<FormField label="Name" name={`tools.${index}.name`} register={register} errors={errors} />
						<FormField label="Image URL" name={`tools.${index}.image`} register={register} errors={errors} />
					</SimpleGrid>
				</EditorCard>
			))}
		</Stack>
	);
};

const CompletionEditor = ({ register, errors }: Pick<CourseEditorSectionProps, 'register' | 'errors'>) => (
	<Stack gap={3}>
		<Text fontSize="sm" fontWeight="semibold">
			Completion
		</Text>
		<FormField label="Certificate image URL" name="completionCertificateImage" register={register} errors={errors} />
		<TextareaField
			label="Completion benefits"
			name="completionBenefitsText"
			register={register}
			errors={errors}
			minH="100px"
			placeholder="One benefit per line"
		/>
	</Stack>
);

const GalleryEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
	const { fields, append, remove } = useFieldArray({ control, name: 'projectGallery' });

	return (
		<Stack gap={3}>
			<EditorSectionHeader
				title="Project gallery"
				action={
					<Button
						size="sm"
						variant="outline"
						borderRadius="full"
						onClick={() => append({ id: createRowId('gallery'), image: '', alt: '' })}
					>
						Add gallery item
					</Button>
				}
			/>
			{fields.length ? null : <EmptyEditorState label="gallery items" />}
			{fields.map((field, index) => (
				<EditorCard key={field.id} title={`Gallery item ${index + 1}`} onRemove={() => remove(index)}>
					<SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
						<FormField label="Image URL" name={`projectGallery.${index}.image`} register={register} errors={errors} />
						<FormField label="Alt text" name={`projectGallery.${index}.alt`} register={register} errors={errors} />
					</SimpleGrid>
				</EditorCard>
			))}
		</Stack>
	);
};

const ProjectsEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
	const { fields, append, remove } = useFieldArray({ control, name: 'projects' });

	return (
		<Stack gap={3}>
			<EditorSectionHeader
				title="Student projects"
				action={
					<Button
						size="sm"
						variant="outline"
						borderRadius="full"
						onClick={() =>
							append({ id: createRowId('project'), title: '', author: '', previewImage: '', likes: 0, liveUrl: '' })
						}
					>
						Add project
					</Button>
				}
			/>
			{fields.length ? null : <EmptyEditorState label="student projects" />}
			{fields.map((field, index) => (
				<EditorCard key={field.id} title={`Project ${index + 1}`} onRemove={() => remove(index)}>
					<SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
						<FormField label="Title" name={`projects.${index}.title`} register={register} errors={errors} />
						<FormField label="Author" name={`projects.${index}.author`} register={register} errors={errors} />
						<FormField
							label="Preview image URL"
							name={`projects.${index}.previewImage`}
							register={register}
							errors={errors}
						/>
						<FormField label="Live URL" name={`projects.${index}.liveUrl`} register={register} errors={errors} />
						<FormField
							label="Likes"
							name={`projects.${index}.likes`}
							register={register}
							errors={errors}
							type="number"
						/>
					</SimpleGrid>
				</EditorCard>
			))}
		</Stack>
	);
};

const InstructorsEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
	const { fields, append, remove } = useFieldArray({ control, name: 'instructors' });

	return (
		<Stack gap={3}>
			<EditorSectionHeader
				title="Instructors"
				action={
					<Button
						size="sm"
						variant="outline"
						borderRadius="full"
						onClick={() =>
							append({ id: createRowId('instructor'), name: '', role: '', photo: '', linkedInUrl: '', bio: '' })
						}
					>
						Add instructor
					</Button>
				}
			/>
			{fields.length ? null : <EmptyEditorState label="instructors" />}
			{fields.map((field, index) => (
				<EditorCard key={field.id} title={`Instructor ${index + 1}`} onRemove={() => remove(index)}>
					<SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
						<FormField label="Name" name={`instructors.${index}.name`} register={register} errors={errors} />
						<FormField label="Role" name={`instructors.${index}.role`} register={register} errors={errors} />
						<FormField label="Photo URL" name={`instructors.${index}.photo`} register={register} errors={errors} />
						<FormField
							label="LinkedIn URL"
							name={`instructors.${index}.linkedInUrl`}
							register={register}
							errors={errors}
						/>
					</SimpleGrid>
					<TextareaField
						label="Bio"
						name={`instructors.${index}.bio`}
						register={register}
						errors={errors}
						minH="90px"
					/>
				</EditorCard>
			))}
		</Stack>
	);
};

const FaqsEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
	const { fields, append, remove } = useFieldArray({ control, name: 'faqs' });

	return (
		<Stack gap={3}>
			<EditorSectionHeader
				title="FAQs"
				action={
					<Button
						size="sm"
						variant="outline"
						borderRadius="full"
						onClick={() => append({ id: createRowId('faq'), question: '', answer: '' })}
					>
						Add FAQ
					</Button>
				}
			/>
			{fields.length ? null : <EmptyEditorState label="FAQs" />}
			{fields.map((field, index) => (
				<EditorCard key={field.id} title={`FAQ ${index + 1}`} onRemove={() => remove(index)}>
					<FormField label="Question" name={`faqs.${index}.question`} register={register} errors={errors} />
					<TextareaField label="Answer" name={`faqs.${index}.answer`} register={register} errors={errors} minH="90px" />
				</EditorCard>
			))}
		</Stack>
	);
};

const ReviewsEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
	const { fields, append, remove } = useFieldArray({ control, name: 'reviews' });

	return (
		<Stack gap={3}>
			<EditorSectionHeader
				title="Reviews"
				action={
					<Button
						size="sm"
						variant="outline"
						borderRadius="full"
						onClick={() =>
							append({
								id: createRowId('review'),
								name: '',
								affiliation: '',
								rating: 5,
								body: '',
								avatar: '',
								likes: 0,
								show: true
							})
						}
					>
						Add review
					</Button>
				}
			/>
			{fields.length ? null : <EmptyEditorState label="reviews" />}
			{fields.map((field, index) => (
				<EditorCard key={field.id} title={`Review ${index + 1}`} onRemove={() => remove(index)}>
					<SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
						<FormField label="Name" name={`reviews.${index}.name`} register={register} errors={errors} />
						<FormField label="Affiliation" name={`reviews.${index}.affiliation`} register={register} errors={errors} />
						<FormField
							label="Rating"
							name={`reviews.${index}.rating`}
							register={register}
							errors={errors}
							type="number"
						/>
						<FormField
							label="Likes"
							name={`reviews.${index}.likes`}
							register={register}
							errors={errors}
							type="number"
						/>
						<FormField label="Avatar URL" name={`reviews.${index}.avatar`} register={register} errors={errors} />
					</SimpleGrid>
					<TextareaField
						label="Review body"
						name={`reviews.${index}.body`}
						register={register}
						errors={errors}
						minH="100px"
					/>
					<HStack gap={2}>
						<input type="checkbox" {...register(`reviews.${index}.show`)} />
						<Text fontSize="sm">Show this review publicly</Text>
					</HStack>
				</EditorCard>
			))}
		</Stack>
	);
};

const SessionSectionsEditor = ({
	title,
	name,
	control,
	register,
	errors
}: CourseEditorSectionProps & {
	title: string;
	name: 'prerequisites' | 'liveSessions' | 'postSessionMaterials';
}) => {
	const { fields, append, remove } = useFieldArray({ control, name });

	return (
		<Stack gap={3}>
			<EditorSectionHeader
				title={title}
				action={
					<Button
						size="sm"
						variant="outline"
						borderRadius="full"
						onClick={() => append({ sectionName: '', subsectionsText: '' })}
					>
						Add section
					</Button>
				}
			/>
			{fields.length ? null : <EmptyEditorState label={`${title} sections`} />}
			{fields.map((field, index) => (
				<EditorCard key={field.id} title={`${title} ${index + 1}`} onRemove={() => remove(index)}>
					<FormField label="Section name" name={`${name}.${index}.sectionName`} register={register} errors={errors} />
					<TextareaField
						label="Items"
						name={`${name}.${index}.subsectionsText`}
						register={register}
						errors={errors}
						minH="100px"
						placeholder="One item per line. Use: Title | Time"
					/>
				</EditorCard>
			))}
		</Stack>
	);
};

const BasicsStep = ({ register, errors }: Pick<CourseEditorSectionProps, 'register' | 'errors'>) => (
	<Stack gap={4}>
		<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
			<FormField label="Title" name="title" register={register} errors={errors} />
			<FormField label="Slug" name="slug" register={register} errors={errors} placeholder="generated-from-title" />
			<SelectField label="Status" name="status" register={register} options={courseStatusOptions} />
			<FormField label="Primary category" name="category" register={register} errors={errors} />
			<SelectField label="Level" name="level" register={register} options={courseLevelOptions} />
			<SelectField label="Mode" name="mode" register={register} options={courseModeOptions} />
		</SimpleGrid>
		<TextareaField
			label="Categories"
			name="categoriesText"
			register={register}
			errors={errors}
			minH="84px"
			placeholder="One category per line, or comma separated"
		/>
		<TextareaField label="Subtitle" name="subtitle" register={register} errors={errors} minH="80px" />
		<TextareaField label="Summary" name="summary" register={register} errors={errors} minH="110px" />
		<TextareaField label="About" name="about" register={register} errors={errors} minH="180px" />
	</Stack>
);

const MediaStep = ({ register, errors }: Pick<CourseEditorSectionProps, 'register' | 'errors'>) => (
	<Stack gap={4}>
		<SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
			<FormField label="Price" name="price" register={register} errors={errors} type="number" />
			<FormField label="Original price" name="originalPrice" register={register} errors={errors} type="number" />
			<FormField label="Rating" name="rating" register={register} errors={errors} type="number" />
			<FormField label="Duration hours" name="durationHours" register={register} errors={errors} type="number" />
			<FormField label="Duration minutes" name="durationMinutes" register={register} errors={errors} type="number" />
			<FormField label="Enrollment count" name="enrollmentCount" register={register} errors={errors} type="number" />
		</SimpleGrid>
		<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
			<FormField label="Thumbnail image URL" name="thumbnailImage" register={register} errors={errors} />
			<FormField label="Promo image URL" name="promoImage" register={register} errors={errors} />
			<FormField label="Promo brand image URL" name="promoImageBrand" register={register} errors={errors} />
			<FormField label="Payment link" name="paymentLink" register={register} errors={errors} />
			<FormField label="Live URL" name="liveUrl" register={register} errors={errors} />
		</SimpleGrid>
	</Stack>
);

const ValueStep = ({ control, register, errors }: CourseEditorSectionProps) => (
	<Stack gap={5}>
		<TextareaField
			label="Requirements"
			name="requirementsText"
			register={register}
			errors={errors}
			minH="100px"
			placeholder="One requirement per line"
		/>
		<CompletionEditor register={register} errors={errors} />
		<HighlightsEditor control={control} register={register} errors={errors} />
		<ScheduleEditor control={control} register={register} errors={errors} />
		<OutcomesEditor control={control} register={register} errors={errors} />
		<AudienceEditor control={control} register={register} errors={errors} />
		<ToolsEditor control={control} register={register} errors={errors} />
	</Stack>
);

const ProofStep = ({ control, register, errors }: CourseEditorSectionProps) => (
	<Stack gap={5}>
		<InstructorsEditor control={control} register={register} errors={errors} />
		<GalleryEditor control={control} register={register} errors={errors} />
		<ProjectsEditor control={control} register={register} errors={errors} />
		<ReviewsEditor control={control} register={register} errors={errors} />
		<FaqsEditor control={control} register={register} errors={errors} />
	</Stack>
);

const CurriculumStep = ({ control, register, errors }: CourseEditorSectionProps) => (
	<Stack gap={5}>
		<SessionSectionsEditor
			title="Prerequisites"
			name="prerequisites"
			control={control}
			register={register}
			errors={errors}
		/>
		<SessionSectionsEditor
			title="Live sessions"
			name="liveSessions"
			control={control}
			register={register}
			errors={errors}
		/>
		<SessionSectionsEditor
			title="Post-session materials"
			name="postSessionMaterials"
			control={control}
			register={register}
			errors={errors}
		/>
	</Stack>
);

const ReviewStep = ({
	summaryItems,
	course
}: {
	summaryItems: Array<{ label: string; value: string | number }>;
	course: AdminCourse | null;
}) => (
	<Stack gap={4}>
		<SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={3}>
			{summaryItems.map(item => (
				<Box key={item.label} border="1px solid" borderColor="border.default" borderRadius="lg" p={3}>
					<Text fontSize="xs" color="text.muted">
						{item.label}
					</Text>
					<Text mt={1} fontWeight="semibold">
						{item.value}
					</Text>
				</Box>
			))}
		</SimpleGrid>
		<Text color="text.muted" fontSize="sm">
			Published courses become visible on public course listing and detail pages. Keep the status as Draft until the
			public content is ready.
		</Text>
		{course ? (
			<Text color="text.muted" fontSize="sm">
				Last saved: {new Date(course.updatedAt).toLocaleString()}
			</Text>
		) : null}
	</Stack>
);

const CourseEditorStepFields = ({
	activeStepId,
	control,
	register,
	errors,
	summaryItems,
	course
}: CourseEditorSectionProps & {
	activeStepId: CourseEditorStepId;
	summaryItems: Array<{ label: string; value: string | number }>;
	course: AdminCourse | null;
}) => {
	switch (activeStepId) {
		case 'basics':
			return <BasicsStep register={register} errors={errors} />;
		case 'media':
			return <MediaStep register={register} errors={errors} />;
		case 'value':
			return <ValueStep control={control} register={register} errors={errors} />;
		case 'proof':
			return <ProofStep control={control} register={register} errors={errors} />;
		case 'curriculum':
			return <CurriculumStep control={control} register={register} errors={errors} />;
		case 'review':
			return <ReviewStep summaryItems={summaryItems} course={course} />;
		default:
			return null;
	}
};

const CourseEditorPage = ({ courseId }: CourseEditorPageProps) => {
	const router = useRouter();
	const [activeStepIndex, setActiveStepIndex] = useState(0);
	const [course, setCourse] = useState<AdminCourse | null>(null);
	const [isLoading, setIsLoading] = useState(Boolean(courseId));
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState('');
	const isEditMode = Boolean(courseId);
	const activeStep = courseEditorSteps[activeStepIndex];

	const {
		control,
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors }
	} = useForm<CourseEditorFormValues>({
		resolver: zodResolver(courseEditorSchema),
		defaultValues: defaultFormValues
	});

	useEffect(() => {
		if (!courseId) {
			setIsLoading(false);
			return undefined;
		}

		let isMounted = true;

		getAdminCourse(courseId)
			.then(result => {
				if (isMounted) {
					setCourse(result.course);
					reset(courseToFormValues(result.course));
				}
			})
			.catch(() => {
				if (isMounted) {
					setMessage('Unable to load course.');
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [courseId, reset]);

	const handleSave = useCallback(
		async (values: CourseEditorFormValues) => {
			setIsSaving(true);
			setMessage('');

			try {
				const payload = formValuesToPayload(values);
				const result = courseId ? await updateAdminCourse(courseId, payload) : await createAdminCourse(payload);

				setCourse(result.course);
				reset(courseToFormValues(result.course));
				setMessage(courseId ? 'Course saved.' : 'Course draft created.');

				if (!courseId) {
					router.replace(`/admin/courses/${result.course.id}/edit`);
				}
			} catch (error) {
				setMessage(error instanceof Error ? error.message : 'Unable to save course.');
			} finally {
				setIsSaving(false);
			}
		},
		[courseId, reset, router]
	);

	const watchedValues = watch();
	const summaryItems = useMemo(
		() => [
			{ label: 'Status', value: watchedValues.status },
			{ label: 'Slug', value: watchedValues.slug || 'Generated on create' },
			{ label: 'Category', value: watchedValues.category || 'Not set' },
			{ label: 'Level', value: watchedValues.level },
			{ label: 'Mode', value: watchedValues.mode },
			{ label: 'Price', value: watchedValues.price > 0 ? `INR ${watchedValues.price}` : 'Free' }
		],
		[watchedValues]
	);

	if (isLoading) {
		return (
			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" p={5}>
				<Text color="text.muted">Loading course editor...</Text>
			</Box>
		);
	}

	return (
		<form onSubmit={handleSubmit(handleSave)}>
			<Stack gap={4}>
				<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" p={4}>
					<HStack justify="space-between" gap={3} flexWrap="wrap">
						<Box>
							<HStack gap={2} flexWrap="wrap">
								<Text fontSize="md" fontWeight="bold">
									{isEditMode ? 'Edit course' : 'Add course'}
								</Text>
								<Badge colorPalette={watchedValues.status === 'PUBLISHED' ? 'green' : 'gray'}>
									{watchedValues.status}
								</Badge>
							</HStack>
							<Text mt={1} fontSize="xs" color="text.muted">
								Split into focused sections so long course details stay manageable.
							</Text>
						</Box>
						<HStack gap={2}>
							<Button asChild variant="outline" borderRadius="full">
								<Link href="/admin/courses">Back</Link>
							</Button>
							<Button type="submit" bg="primary" color="text.inverse" borderRadius="full" disabled={isSaving}>
								{isSaving ? 'Saving...' : 'Save'}
							</Button>
						</HStack>
					</HStack>
				</Box>

				<Box
					display="grid"
					gridTemplateColumns={{ base: '1fr', xl: '230px minmax(0, 1fr)' }}
					gap={4}
					alignItems="start"
				>
					<Box
						border="1px solid"
						borderColor="border.default"
						borderRadius="xl"
						bg="bg.card"
						p={3}
						position={{ xl: 'sticky' }}
						top={{ xl: 4 }}
					>
						<Stack gap={2}>
							{courseEditorSteps.map((step, index) => {
								const isActive = index === activeStepIndex;

								return (
									<Button
										key={step.id}
										justifyContent="flex-start"
										variant={isActive ? 'solid' : 'ghost'}
										bg={isActive ? 'primary' : undefined}
										color={isActive ? 'text.inverse' : 'text.primary'}
										borderRadius="full"
										onClick={() => setActiveStepIndex(index)}
									>
										{index + 1}. {step.label}
									</Button>
								);
							})}
						</Stack>
					</Box>

					<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" p={{ base: 4, md: 5 }}>
						<Stack gap={5}>
							<Box>
								<Text fontSize="lg" fontWeight="bold">
									{activeStep.label}
								</Text>
								<Text mt={1} fontSize="sm" color="text.muted">
									{activeStep.description}
								</Text>
							</Box>

							<CourseEditorStepFields
								activeStepId={activeStep.id}
								control={control}
								register={register}
								errors={errors}
								summaryItems={summaryItems}
								course={course}
							/>

							{message ? (
								<Text color={message.includes('Unable') || message.includes('must be') ? 'red.500' : 'text.muted'}>
									{message}
								</Text>
							) : null}

							<HStack justify="space-between" gap={3} flexWrap="wrap">
								<Button
									variant="outline"
									borderRadius="full"
									disabled={activeStepIndex === 0}
									onClick={() => setActiveStepIndex(value => Math.max(0, value - 1))}
								>
									Previous
								</Button>
								<HStack gap={2}>
									<Button
										variant="outline"
										borderRadius="full"
										disabled={activeStepIndex === courseEditorSteps.length - 1}
										onClick={() => setActiveStepIndex(value => Math.min(courseEditorSteps.length - 1, value + 1))}
									>
										Next
									</Button>
									<Button type="submit" bg="primary" color="text.inverse" borderRadius="full" disabled={isSaving}>
										{isSaving ? 'Saving...' : 'Save course'}
									</Button>
								</HStack>
							</HStack>
						</Stack>
					</Box>
				</Box>
			</Stack>
		</form>
	);
};

export default CourseEditorPage;
