import { Button, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useFieldArray } from 'react-hook-form';

import {
	EditorCard,
	EditorSectionHeader,
	EmptyEditorState,
	FormField,
	ImageField,
	TextareaField
} from './FormControls';
import type { CourseEditorSectionProps } from './types';
import { createRowId } from './utils';

export const OutcomesEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
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
						maxLength={120}
						minH="48px"
					/>
				</EditorCard>
			))}
		</Stack>
	);
};

export const ToolsEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
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
						<ImageField label="Image" name={`tools.${index}.image`} control={control} errors={errors} />
					</SimpleGrid>
				</EditorCard>
			))}
		</Stack>
	);
};

// TODO: Restore this editor when completion content is no longer hard-coded.
export const CompletionEditor = ({ control, register, errors }: CourseEditorSectionProps) => (
	<Stack gap={3}>
		<Text fontSize="sm" fontWeight="semibold">
			Completion
		</Text>
		<ImageField label="Certificate image" name="completionCertificateImage" control={control} errors={errors} />
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

export const GalleryEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
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
						<ImageField label="Image" name={`projectGallery.${index}.image`} control={control} errors={errors} />
						<FormField label="Alt text" name={`projectGallery.${index}.alt`} register={register} errors={errors} />
					</SimpleGrid>
				</EditorCard>
			))}
		</Stack>
	);
};

export const ProjectsEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
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
						<ImageField
							label="Preview image"
							name={`projects.${index}.previewImage`}
							control={control}
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

export const InstructorsEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
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
						<ImageField label="Photo" name={`instructors.${index}.photo`} control={control} errors={errors} />
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

export const FaqsEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
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

export const ReviewsEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
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
						<ImageField label="Avatar" name={`reviews.${index}.avatar`} control={control} errors={errors} />
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
