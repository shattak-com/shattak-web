import { Box, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { Controller, useWatch } from 'react-hook-form';

import MultiSelectDropdown from '~/lib/components/forms/MultiSelectDropdown';
import { courseCategories } from '~/lib/constants/course-categories';

import {
	AudienceEditor,
	FaqsEditor,
	GalleryEditor,
	HighlightsEditor,
	InstructorsEditor,
	OutcomesEditor,
	ProjectsEditor,
	ReviewsEditor,
	ScheduleEditor,
	ToolsEditor
} from './ArrayEditors';
import { courseLevelOptions, courseModeOptions, courseStatusOptions } from './constants';
import { FormField, ImageField, SelectField, TextareaField } from './FormControls';
import type { CourseEditorSectionProps, CourseEditorStepFieldsProps } from './types';
import { getFieldError } from './utils';

const QrCodePreview = dynamic(() => import('~/lib/components/forms/QrCodePreview'));
const CourseCurriculumEditor = dynamic(() => import('~/lib/containers/admin/courses/CourseCurriculumEditor'));

const BasicsStep = ({
	control,
	register,
	errors,
	onSlugChange,
	onTitleChange
}: CourseEditorSectionProps & Pick<CourseEditorStepFieldsProps, 'onSlugChange' | 'onTitleChange'>) => {
	const whatsappGroupUrl = useWatch({ control, name: 'whatsappGroupUrl' });

	return (
		<Stack gap={5}>
			<Stack gap={4}>
				<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
					<FormField label="Title" name="title" register={register} errors={errors} onValueChange={onTitleChange} />
					<FormField
						label="Slug"
						name="slug"
						register={register}
						errors={errors}
						placeholder="generated-from-title"
						helperText="Generated from the title as you type. You can edit it before saving."
						onValueChange={onSlugChange}
					/>
				</SimpleGrid>
				<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
					<SelectField label="Status" name="status" register={register} options={courseStatusOptions} />
					<SelectField label="Level" name="level" register={register} options={courseLevelOptions} />
				</SimpleGrid>
				<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
					<SelectField label="Mode" name="mode" register={register} options={courseModeOptions} />
					<Controller
						control={control}
						name="categories"
						render={({ field }) => (
							<MultiSelectDropdown
								label="Categories"
								options={courseCategories}
								selectedValues={field.value}
								onChange={field.onChange}
								placeholder="Select course categories"
								error={getFieldError(errors, 'categories')}
							/>
						)}
					/>
				</SimpleGrid>
				<TextareaField label="Subtitle" name="summary" register={register} errors={errors} minH="110px" />
			</Stack>

			<Box borderTop="1px solid" borderColor="border.default" pt={5}>
				<Stack gap={4}>
					<Box>
						<Text fontSize="md" fontWeight="bold">
							WhatsApp group access
						</Text>
						<Text mt={1} fontSize="sm" color="text.muted" fontWeight="semibold">
							Add the group invitation link and course access code learners use after enrolling.
						</Text>
					</Box>
					<SimpleGrid columns={{ base: 1, lg: 3 }} gap={4} alignItems="start">
						<Box gridColumn={{ base: 'auto', lg: 'span 2' }}>
							<Stack gap={4}>
								<FormField
									label="WhatsApp Group Invitation Link"
									name="whatsappGroupUrl"
									register={register}
									errors={errors}
									placeholder="https://chat.whatsapp.com/..."
								/>
								<FormField
									label="Access Code"
									name="accessCode"
									register={register}
									errors={errors}
									placeholder="Example: CATDOG"
								/>
							</Stack>
						</Box>
						<QrCodePreview value={whatsappGroupUrl ?? ''} label="WhatsApp QR preview" />
					</SimpleGrid>
				</Stack>
			</Box>
		</Stack>
	);
};

const MediaStep = ({ control, register, errors }: CourseEditorSectionProps) => (
	<Stack gap={4}>
		<SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
			<FormField label="Price" name="price" register={register} errors={errors} type="number" />
			<FormField label="Original price" name="originalPrice" register={register} errors={errors} type="number" />
			<FormField label="Rating" name="rating" register={register} errors={errors} type="number" step={0.1} />
			<FormField label="Enrollment count" name="enrollmentCount" register={register} errors={errors} type="number" />
		</SimpleGrid>
		<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
			<ImageField label="Thumbnail image" name="thumbnailImage" control={control} errors={errors} />
			<ImageField label="Promo image" name="promoImage" control={control} errors={errors} />
			<ImageField label="Promo brand image" name="promoImageBrand" control={control} errors={errors} />
		</SimpleGrid>
	</Stack>
);

// TODO: Restore this step when highlights and schedules are admin-managed again.
const HighlightsStep = ({ control, register, errors }: CourseEditorSectionProps) => (
	<Stack gap={5}>
		<HighlightsEditor control={control} register={register} errors={errors} />
		<ScheduleEditor control={control} register={register} errors={errors} />
	</Stack>
);

const OutcomesStep = ({ control, register, errors }: CourseEditorSectionProps) => (
	<Stack gap={5}>
		<TextareaField
			label="Requirements"
			name="requirementsText"
			register={register}
			errors={errors}
			minH="100px"
			placeholder="One requirement per line"
		/>
		{/* TODO: Restore CompletionEditor when completion content is no longer hard-coded. */}
		<OutcomesEditor control={control} register={register} errors={errors} />
	</Stack>
);

const AudienceToolsStep = ({ control, register, errors }: CourseEditorSectionProps) => (
	<Stack gap={5}>
		<AudienceEditor control={control} register={register} errors={errors} />
		<ToolsEditor control={control} register={register} errors={errors} />
	</Stack>
);

const InstructorsStep = ({ control, register, errors }: CourseEditorSectionProps) => (
	<Stack gap={5}>
		<InstructorsEditor control={control} register={register} errors={errors} />
	</Stack>
);

const GalleryStep = ({ control, register, errors }: CourseEditorSectionProps) => (
	<Stack gap={5}>
		<TextareaField label="About the Project" name="about" register={register} errors={errors} minH="180px" />
		<FormField label="Live URL" name="liveUrl" register={register} errors={errors} />
		<GalleryEditor control={control} register={register} errors={errors} />
		<ProjectsEditor control={control} register={register} errors={errors} />
	</Stack>
);

const ReviewsFaqsStep = ({ control, register, errors }: CourseEditorSectionProps) => (
	<Stack gap={5}>
		<ReviewsEditor control={control} register={register} errors={errors} />
		<FaqsEditor control={control} register={register} errors={errors} />
	</Stack>
);

const LessonsStep = ({
	courseId,
	onCurriculumDirtyChange
}: Pick<CourseEditorStepFieldsProps, 'courseId' | 'onCurriculumDirtyChange'>) => (
	<CourseCurriculumEditor
		courseId={courseId}
		sectionKey="lessons"
		title="Lessons"
		description="Build ordered course lessons, preview rows, and enrolled-only learning content."
		onDirtyChange={onCurriculumDirtyChange}
	/>
);

const LiveSessionsStep = ({
	courseId,
	onCurriculumDirtyChange
}: Pick<CourseEditorStepFieldsProps, 'courseId' | 'onCurriculumDirtyChange'>) => (
	<CourseCurriculumEditor
		courseId={courseId}
		sectionKey="liveSessions"
		title="Live sessions"
		description="Organize live-session modules and attach content learners unlock after enrollment."
		onDirtyChange={onCurriculumDirtyChange}
	/>
);

const PostSessionMaterialsStep = ({
	courseId,
	onCurriculumDirtyChange
}: Pick<CourseEditorStepFieldsProps, 'courseId' | 'onCurriculumDirtyChange'>) => (
	<CourseCurriculumEditor
		courseId={courseId}
		sectionKey="postSessionMaterials"
		title="Post section"
		description="Manage follow-up modules, references, recordings, PDFs, and presentations."
		onDirtyChange={onCurriculumDirtyChange}
	/>
);

const ReviewStep = ({
	summaryItems,
	course
}: {
	summaryItems: CourseEditorStepFieldsProps['summaryItems'];
	course: CourseEditorStepFieldsProps['course'];
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

export const CourseEditorStepFields = ({
	activeStepId,
	control,
	register,
	errors,
	onSlugChange,
	onTitleChange,
	summaryItems,
	course,
	courseId,
	onCurriculumDirtyChange
}: CourseEditorStepFieldsProps) => {
	switch (activeStepId) {
		case 'basics':
			return (
				<BasicsStep
					control={control}
					register={register}
					errors={errors}
					onSlugChange={onSlugChange}
					onTitleChange={onTitleChange}
				/>
			);
		case 'media':
			return <MediaStep control={control} register={register} errors={errors} />;
		case 'highlights':
			return <HighlightsStep control={control} register={register} errors={errors} />;
		case 'outcomes':
			return <OutcomesStep control={control} register={register} errors={errors} />;
		case 'audienceTools':
			return <AudienceToolsStep control={control} register={register} errors={errors} />;
		case 'instructors':
			return <InstructorsStep control={control} register={register} errors={errors} />;
		case 'gallery':
			return <GalleryStep control={control} register={register} errors={errors} />;
		case 'reviews':
			return <ReviewsFaqsStep control={control} register={register} errors={errors} />;
		case 'lessons':
			return <LessonsStep courseId={courseId} onCurriculumDirtyChange={onCurriculumDirtyChange} />;
		case 'liveSessions':
			return <LiveSessionsStep courseId={courseId} onCurriculumDirtyChange={onCurriculumDirtyChange} />;
		case 'postSessionMaterials':
			return <PostSessionMaterialsStep courseId={courseId} onCurriculumDirtyChange={onCurriculumDirtyChange} />;
		case 'review':
			return <ReviewStep summaryItems={summaryItems} course={course} />;
		default:
			return null;
	}
};
