import { Box, Button, HStack, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';

import { toneOptions } from './constants';
import {
	EditorCard,
	EditorSectionHeader,
	EmptyEditorState,
	FormField,
	ImageField,
	SelectField,
	TextareaField
} from './FormControls';
import type { CourseEditorSectionProps } from './types';
import {
	createRowId,
	formatDurationFromMinutes,
	formatDurationParts,
	getFieldError,
	getScheduleTotalMinutes,
	parseDurationInputValue,
	parseDurationParts
} from './utils';

const scheduleMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const scheduleMonthIndexByName = scheduleMonthNames.reduce<Record<string, number>>((acc, month, index) => {
	acc[month.toLowerCase()] = index;
	return acc;
}, {});

const padNumber = (value: number) => value.toString().padStart(2, '0');

const parseScheduleDateInput = (value: string) => {
	const dateMatch = value.match(/(\d{1,2})\s+([A-Za-z]{3,})/);
	if (!dateMatch) {
		return '';
	}

	const day = Number(dateMatch[1]);
	const monthIndex = scheduleMonthIndexByName[dateMatch[2].slice(0, 3).toLowerCase()];
	if (!day || monthIndex === undefined) {
		return '';
	}

	return `${new Date().getFullYear()}-${padNumber(monthIndex + 1)}-${padNumber(day)}`;
};

const parseScheduleTimeInput = (value: string) => {
	const timeMatch = value.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
	if (!timeMatch) {
		return '';
	}

	const rawHours = Number(timeMatch[1]);
	const minutes = timeMatch[2] ? Number(timeMatch[2]) : 0;
	const meridiem = timeMatch[3].toUpperCase();
	let hours = rawHours;

	if (meridiem === 'PM' && rawHours !== 12) {
		hours = rawHours + 12;
	}

	if (meridiem === 'AM' && rawHours === 12) {
		hours = 0;
	}

	return `${padNumber(hours)}:${padNumber(minutes)}`;
};

const formatScheduleDateDisplay = (dateInput: string) => {
	if (!dateInput) {
		return '';
	}

	const [, month, day] = dateInput.split('-').map(Number);
	if (!month || !day) {
		return '';
	}

	return `${day} ${scheduleMonthNames[month - 1]}`;
};

const formatScheduleTimeDisplay = (timeInput: string) => {
	if (!timeInput) {
		return '';
	}

	const [hoursValue, minutesValue] = timeInput.split(':').map(Number);
	if (!Number.isFinite(hoursValue) || !Number.isFinite(minutesValue)) {
		return '';
	}

	const meridiem = hoursValue >= 12 ? 'PM' : 'AM';
	const displayHours = hoursValue % 12 || 12;
	return `${displayHours}:${padNumber(minutesValue)} ${meridiem}`;
};

const formatScheduleDateTime = (dateInput: string, timeInput: string) => {
	const dateDisplay = formatScheduleDateDisplay(dateInput);
	const timeDisplay = formatScheduleTimeDisplay(timeInput);

	if (dateDisplay && timeDisplay) {
		return `${dateDisplay} - ${timeDisplay}`;
	}

	return dateDisplay || timeDisplay;
};

export const HighlightsEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
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

export const ScheduleEditor = ({ control, errors }: CourseEditorSectionProps) => {
	const { fields, append, remove } = useFieldArray({ control, name: 'schedule' });
	const watchedSchedule = useWatch({ control, name: 'schedule' }) ?? [];
	const totalScheduleMinutes = getScheduleTotalMinutes(watchedSchedule);

	return (
		<Stack gap={3}>
			<EditorSectionHeader
				title="Schedule"
				action={
					<HStack gap={3} flexWrap="wrap">
						<Text fontSize="xs" color="text.muted">
							Total duration: {formatDurationFromMinutes(totalScheduleMinutes)}
						</Text>
						<Button
							size="sm"
							variant="outline"
							borderRadius="full"
							onClick={() =>
								append({ id: createRowId('schedule'), label: `Session ${fields.length + 1}`, time: '', duration: '' })
							}
						>
							Add session
						</Button>
					</HStack>
				}
			/>
			{fields.length ? null : <EmptyEditorState label="sessions" />}
			{fields.map((field, index) => (
				<EditorCard key={field.id} title={`Session ${index + 1}`} onRemove={() => remove(index)}>
					<SimpleGrid columns={{ base: 1, lg: 2 }} gap={3}>
						<Controller
							control={control}
							name={`schedule.${index}.time`}
							render={({ field: timeField }) => {
								const timeValue = String(timeField.value ?? '');
								const dateInput = parseScheduleDateInput(timeValue);
								const startTimeInput = parseScheduleTimeInput(timeValue);
								const updateScheduleTime = (nextDateInput: string, nextTimeInput: string) => {
									timeField.onChange(formatScheduleDateTime(nextDateInput, nextTimeInput));
								};

								return (
									<Box>
										<Text fontSize="xs" color="text.muted" mb={1}>
											Session date and start time
										</Text>
										<SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
											<Input
												aria-label={`Session ${index + 1} date`}
												type="date"
												value={dateInput}
												onBlur={timeField.onBlur}
												onChange={event => updateScheduleTime(event.currentTarget.value, startTimeInput)}
											/>
											<Input
												aria-label={`Session ${index + 1} start time`}
												type="time"
												value={startTimeInput}
												onBlur={timeField.onBlur}
												onChange={event => updateScheduleTime(dateInput, event.currentTarget.value)}
											/>
										</SimpleGrid>
										<Text mt={1} fontSize="xs" color="text.muted">
											Saved as: {timeValue || 'No date/time selected'}
										</Text>
										{getFieldError(errors, `schedule.${index}.time`) ? (
											<Text mt={1} fontSize="xs" color="red.500">
												{getFieldError(errors, `schedule.${index}.time`)}
											</Text>
										) : null}
									</Box>
								);
							}}
						/>
						<Controller
							control={control}
							name={`schedule.${index}.duration`}
							render={({ field: durationField }) => {
								const durationParts = parseDurationParts(String(durationField.value ?? ''));
								const updateDuration = (hours: number, minutes: number) => {
									durationField.onChange(formatDurationParts(hours, minutes));
								};

								return (
									<Box>
										<Text fontSize="xs" color="text.muted" mb={1}>
											Duration
										</Text>
										<SimpleGrid columns={2} gap={2}>
											<Box>
												<Input
													aria-label={`Session ${index + 1} duration hours`}
													type="number"
													min={0}
													value={durationParts.hours}
													onBlur={durationField.onBlur}
													onChange={event =>
														updateDuration(parseDurationInputValue(event.currentTarget.value), durationParts.minutes)
													}
												/>
												<Text mt={1} fontSize="xs" color="text.muted">
													Hours
												</Text>
											</Box>
											<Box>
												<Input
													aria-label={`Session ${index + 1} duration minutes`}
													type="number"
													min={0}
													max={59}
													value={durationParts.minutes}
													onBlur={durationField.onBlur}
													onChange={event =>
														updateDuration(durationParts.hours, parseDurationInputValue(event.currentTarget.value))
													}
												/>
												<Text mt={1} fontSize="xs" color="text.muted">
													Minutes
												</Text>
											</Box>
										</SimpleGrid>
										{getFieldError(errors, `schedule.${index}.duration`) ? (
											<Text mt={1} fontSize="xs" color="red.500">
												{getFieldError(errors, `schedule.${index}.duration`)}
											</Text>
										) : null}
									</Box>
								);
							}}
						/>
					</SimpleGrid>
				</EditorCard>
			))}
		</Stack>
	);
};

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

export const AudienceEditor = ({ control, register, errors }: CourseEditorSectionProps) => {
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
