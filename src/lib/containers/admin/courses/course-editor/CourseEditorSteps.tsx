import { Box, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { Controller } from 'react-hook-form';

import MultiSelectDropdown from '~/lib/components/forms/MultiSelectDropdown';
import { courseCategories } from '~/lib/constants/course-categories';
import CourseCurriculumEditor from '~/lib/containers/admin/courses/CourseCurriculumEditor';

import {
	AudienceEditor,
	CompletionEditor,
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

const BasicsStep = ({ control, register, errors }: CourseEditorSectionProps) => (
	<Stack gap={4}>
		<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
			<FormField label="Title" name="title" register={register} errors={errors} />
			<FormField label="Slug" name="slug" register={register} errors={errors} placeholder="generated-from-title" />
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
		<TextareaField label="Subtitle" name="subtitle" register={register} errors={errors} minH="80px" />
		<TextareaField label="Summary" name="summary" register={register} errors={errors} minH="110px" />
	</Stack>
);

const MediaStep = ({ control, register, errors }: CourseEditorSectionProps) => (
	<Stack gap={4}>
		<SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
			<FormField label="Price" name="price" register={register} errors={errors} type="number" />
			<FormField label="Original price" name="originalPrice" register={register} errors={errors} type="number" />
			<FormField label="Rating" name="rating" register={register} errors={errors} type="number" />
			<FormField label="Enrollment count" name="enrollmentCount" register={register} errors={errors} type="number" />
		</SimpleGrid>
		<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
			<ImageField label="Thumbnail image" name="thumbnailImage" control={control} errors={errors} />
			<ImageField label="Promo image" name="promoImage" control={control} errors={errors} />
			<ImageField label="Promo brand image" name="promoImageBrand" control={control} errors={errors} />
			<FormField label="Payment link" name="paymentLink" register={register} errors={errors} />
		</SimpleGrid>
	</Stack>
);

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
		<CompletionEditor control={control} register={register} errors={errors} />
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

const PrerequisitesStep = ({ courseId }: { courseId?: string }) => (
	<CourseCurriculumEditor
		courseId={courseId}
		sectionKey="prerequisites"
		title="Prerequisites"
		description="Build ordered pre-course modules, preview rows, and enrolled-only prep content."
	/>
);

const LiveSessionsStep = ({ courseId }: { courseId?: string }) => (
	<CourseCurriculumEditor
		courseId={courseId}
		sectionKey="liveSessions"
		title="Live sessions"
		description="Organize live-session modules and attach content learners unlock after enrollment."
	/>
);

const PostSessionMaterialsStep = ({ courseId }: { courseId?: string }) => (
	<CourseCurriculumEditor
		courseId={courseId}
		sectionKey="postSessionMaterials"
		title="Post section"
		description="Manage follow-up modules, references, recordings, PDFs, and presentations."
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
	summaryItems,
	course,
	courseId
}: CourseEditorStepFieldsProps) => {
	switch (activeStepId) {
		case 'basics':
			return <BasicsStep control={control} register={register} errors={errors} />;
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
		case 'prerequisites':
			return <PrerequisitesStep courseId={courseId} />;
		case 'liveSessions':
			return <LiveSessionsStep courseId={courseId} />;
		case 'postSessionMaterials':
			return <PostSessionMaterialsStep courseId={courseId} />;
		case 'review':
			return <ReviewStep summaryItems={summaryItems} course={course} />;
		default:
			return null;
	}
};
