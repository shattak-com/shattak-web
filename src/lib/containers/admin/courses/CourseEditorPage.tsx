'use client';

import { Badge, Box, Button, HStack, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';

import { courseEditorSteps } from './course-editor/constants';
import { CourseEditorStepFields } from './course-editor/CourseEditorSteps';
import type { CourseEditorPageProps } from './course-editor/types';
import { useCourseEditorPage } from './course-editor/useCourseEditorPage';
import { getFeedbackBorderColor, getFeedbackTextColor } from './course-editor/utils';

const CourseEditorPage = ({ courseId }: CourseEditorPageProps) => {
	const editor = useCourseEditorPage({ courseId });
	const {
		control,
		register,
		handleSubmit,
		formState: { errors }
	} = editor.form;

	if (editor.isLoading) {
		return (
			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" p={5}>
				<Text color="text.muted">Loading course editor...</Text>
			</Box>
		);
	}

	return (
		<form onSubmit={handleSubmit(editor.handleSave, editor.handleInvalidSave)}>
			<Stack gap={4}>
				<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" p={4}>
					<HStack justify="space-between" gap={3} flexWrap="wrap">
						<Box>
							<HStack gap={2} flexWrap="wrap">
								<Text fontSize="md" fontWeight="bold">
									{editor.isEditMode ? 'Edit course' : 'Add course'}
								</Text>
								<Badge colorPalette={editor.watchedValues.status === 'PUBLISHED' ? 'green' : 'gray'}>
									{editor.watchedValues.status}
								</Badge>
								{editor.isDirty ? <Badge colorPalette="orange">Unsaved changes</Badge> : null}
							</HStack>
							<Text mt={1} fontSize="xs" color="text.muted">
								Split into focused sections so long course details stay manageable.
							</Text>
						</Box>
						<HStack gap={2}>
							{editor.courseViewHref ? (
								<Button asChild variant="outline" borderRadius="full">
									<Link href={editor.courseViewHref} target="_blank" rel="noopener noreferrer">
										View
									</Link>
								</Button>
							) : (
								<Button type="button" variant="outline" borderRadius="full" disabled>
									View
								</Button>
							)}
							<Button type="button" variant="outline" borderRadius="full" onClick={editor.handleBackToCourses}>
								Back
							</Button>
							<Button type="submit" bg="primary" color="text.inverse" borderRadius="full" disabled={editor.isSaving}>
								{editor.isSaving ? 'Saving...' : 'Save'}
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
								const isActive = index === editor.activeStepIndex;
								const stepErrorCount = editor.errorCountsByStep[step.id];

								return (
									<Button
										type="button"
										key={step.id}
										justifyContent="flex-start"
										variant={isActive ? 'solid' : 'ghost'}
										bg={isActive ? 'primary' : undefined}
										color={isActive ? 'text.inverse' : 'text.primary'}
										borderRadius="full"
										onClick={() => editor.setActiveStepIndex(index)}
									>
										<HStack w="full" justify="space-between" gap={2}>
											<Text as="span" truncate>
												{index + 1}. {step.label}
											</Text>
											{stepErrorCount ? (
												<Badge colorPalette="red" borderRadius="full">
													{stepErrorCount}
												</Badge>
											) : null}
										</HStack>
									</Button>
								);
							})}
						</Stack>
					</Box>

					<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" p={{ base: 4, md: 5 }}>
						<Stack gap={5}>
							<Box>
								<Text fontSize="lg" fontWeight="bold">
									{editor.activeStep.label}
								</Text>
								<Text mt={1} fontSize="sm" color="text.muted">
									{editor.activeStep.description}
								</Text>
							</Box>

							<CourseEditorStepFields
								activeStepId={editor.activeStep.id}
								control={control}
								register={register}
								errors={errors}
								summaryItems={editor.summaryItems}
								course={editor.course}
								courseId={courseId}
							/>

							{editor.feedback ? (
								<Box
									border="1px solid"
									borderColor={getFeedbackBorderColor(editor.feedback.tone)}
									borderRadius="lg"
									p={3}
								>
									<Text color={getFeedbackTextColor(editor.feedback.tone)}>{editor.feedback.message}</Text>
								</Box>
							) : null}

							<HStack justify="space-between" gap={3} flexWrap="wrap">
								<Button
									type="button"
									variant="outline"
									borderRadius="full"
									disabled={editor.activeStepIndex === 0}
									onClick={() => editor.setActiveStepIndex(value => Math.max(0, value - 1))}
								>
									Previous
								</Button>
								<HStack gap={2}>
									<Button
										type="button"
										variant="outline"
										borderRadius="full"
										disabled={editor.activeStepIndex === courseEditorSteps.length - 1}
										onClick={() =>
											editor.setActiveStepIndex(value => Math.min(courseEditorSteps.length - 1, value + 1))
										}
									>
										Next
									</Button>
									<Button
										type="submit"
										bg="primary"
										color="text.inverse"
										borderRadius="full"
										disabled={editor.isSaving}
									>
										{editor.isSaving ? 'Saving...' : 'Save course'}
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
