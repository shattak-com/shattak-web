import { Badge, Box, Button, Heading, HStack, SimpleGrid, Stack, Text, Textarea } from '@chakra-ui/react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { FiCheckCircle, FiLock, FiMessageSquare, FiRefreshCw } from 'react-icons/fi';

import type { CourseFeedbackInput, CourseFeedbackState } from '~/lib/api/enrollments';
import { SkeletonBlock } from '~/lib/components/feedback/LoadingStates';

import { courseRatings, feedbackQuestions } from './constants';
import type { CourseFeedbackNotice } from './useCourseFeedback';

const noticeStyles: Record<CourseFeedbackNotice['tone'], { bg: string; borderColor: string; color: string }> = {
	success: { bg: 'green.50', borderColor: 'green.300', color: 'green.800' },
	error: { bg: 'red.50', borderColor: 'red.300', color: 'red.800' },
	info: { bg: 'blue.50', borderColor: 'blue.300', color: 'blue.800' }
};

const FeedbackLoadingState = () => (
	<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
		<Stack gap={5}>
			<SkeletonBlock h="24px" w="132px" borderRadius="full" />
			<SkeletonBlock h="32px" w="72%" />
			<SimpleGrid columns={{ base: 5, sm: 10 }} gap={2}>
				{courseRatings.map(rating => (
					<SkeletonBlock key={rating} h="44px" borderRadius="lg" />
				))}
			</SimpleGrid>
			{feedbackQuestions.map(question => (
				<Stack key={question.name} gap={2}>
					<SkeletonBlock h="16px" w="88%" />
					<SkeletonBlock h="96px" borderRadius="lg" />
				</Stack>
			))}
		</Stack>
	</Box>
);

type CourseFeedbackSectionProps = {
	feedbackState: CourseFeedbackState | null;
	form: UseFormReturn<CourseFeedbackInput>;
	isAdmin: boolean;
	isLoading: boolean;
	isSubmitting: boolean;
	loadErrorMessage: string;
	notice: CourseFeedbackNotice | null;
	onRetry: () => void;
	onSubmit: (values: CourseFeedbackInput) => Promise<void>;
};

const CourseFeedbackHeader = ({ feedbackSubmitted }: { feedbackSubmitted: boolean }) => (
	<Stack gap={2}>
		<HStack justify="space-between" gap={3} flexWrap="wrap">
			<Badge bg="bg.brand" color="text.brand" borderRadius="full" px={3} py={1}>
				Course feedback
			</Badge>
			{feedbackSubmitted ? (
				<HStack color="green.600" gap={1.5} fontSize="sm" fontWeight="semibold">
					<FiCheckCircle />
					<Text>Submitted</Text>
				</HStack>
			) : null}
		</HStack>
		<Heading size={{ base: 'lg', md: 'xl' }}>Tell us about your learning experience</Heading>
		<Text color="text.muted" lineHeight="relaxed">
			Your feedback helps us improve the course experience for future learners.
		</Text>
	</Stack>
);

const FeedbackContextMessages = ({
	feedbackSubmitted,
	isAdmin,
	isCourseIncomplete,
	notice
}: {
	feedbackSubmitted: boolean;
	isAdmin: boolean;
	isCourseIncomplete: boolean;
	notice: CourseFeedbackNotice | null;
}) => (
	<>
		{isCourseIncomplete ? (
			<HStack
				align="flex-start"
				gap={3}
				border="1px solid"
				borderColor="border.default"
				borderRadius="lg"
				bg="bg.subtle"
				p={4}
			>
				<Box color="primary" pt={0.5} aria-hidden="true">
					<FiLock />
				</Box>
				<Box>
					<Text fontWeight="semibold">Available after course completion</Text>
					<Text mt={1} color="text.muted" fontSize="sm">
						Complete all course requirements to enable and submit this form.
					</Text>
				</Box>
			</HStack>
		) : null}

		{isAdmin && !feedbackSubmitted ? (
			<Box borderRadius="lg" bg="bg.subtle" p={4}>
				<Text fontSize="sm" color="text.muted">
					Admin access: this form is available regardless of course completion.
				</Text>
			</Box>
		) : null}

		{notice ? (
			<Box
				role={notice.tone === 'error' ? 'alert' : 'status'}
				border="1px solid"
				borderColor={noticeStyles[notice.tone].borderColor}
				borderRadius="lg"
				bg={noticeStyles[notice.tone].bg}
				color={noticeStyles[notice.tone].color}
				_dark={{ bg: 'bg.subtle', color: 'text.primary' }}
				p={4}
			>
				<Text fontSize="sm" fontWeight="semibold">
					{notice.message}
				</Text>
			</Box>
		) : null}
	</>
);

const getQuestionDescriptionIds = (helperId: string, errorId: string, hasError: boolean) =>
	hasError ? `${helperId} ${errorId}` : helperId;

const getSubmitButtonLabel = (feedbackSubmitted: boolean, isCourseIncomplete: boolean) => {
	if (feedbackSubmitted) {
		return 'Feedback submitted';
	}

	return isCourseIncomplete ? 'Available after completion' : 'Submit feedback';
};

export const CourseFeedbackSection = ({
	feedbackState,
	form,
	isAdmin,
	isLoading,
	isSubmitting,
	loadErrorMessage,
	notice,
	onRetry,
	onSubmit
}: CourseFeedbackSectionProps) => {
	if (isLoading && !feedbackState) {
		return <FeedbackLoadingState />;
	}

	if (loadErrorMessage && !feedbackState) {
		return (
			<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
				<Stack gap={4} align="flex-start">
					<Box color="primary" fontSize="2xl" aria-hidden="true">
						<FiMessageSquare />
					</Box>
					<Heading size="md">Feedback form unavailable</Heading>
					<Text color="text.muted">{loadErrorMessage}</Text>
					<Button variant="outline" borderRadius="full" onClick={onRetry}>
						<FiRefreshCw />
						Try again
					</Button>
				</Stack>
			</Box>
		);
	}

	const feedbackSubmitted = Boolean(feedbackState?.feedback);
	const canSubmit = Boolean(feedbackState?.canSubmit);
	const isCourseIncomplete = !feedbackState?.courseCompleted && !isAdmin;
	const controlsDisabled = isSubmitting || (!canSubmit && !feedbackSubmitted);
	const controlsReadOnly = feedbackSubmitted;
	const { errors } = form.formState;

	return (
		<Box
			as="section"
			border="1px solid"
			borderColor="border.default"
			borderRadius="card"
			bg="bg.card"
			p={{ base: 5, md: 6 }}
		>
			<Stack gap={6}>
				<CourseFeedbackHeader feedbackSubmitted={feedbackSubmitted} />
				<FeedbackContextMessages
					feedbackSubmitted={feedbackSubmitted}
					isAdmin={isAdmin}
					isCourseIncomplete={isCourseIncomplete}
					notice={notice}
				/>

				<form noValidate onSubmit={form.handleSubmit(onSubmit)}>
					<Stack gap={6}>
						<Controller
							control={form.control}
							name="rating"
							render={({ field }) => (
								<fieldset
									disabled={controlsDisabled || controlsReadOnly}
									style={{ border: 0, margin: 0, minWidth: 0, padding: 0 }}
								>
									<Stack gap={3}>
										<Text asChild fontWeight="semibold">
											<legend>Rate this course between 1 and 10</legend>
										</Text>
										<SimpleGrid columns={{ base: 5, sm: 10 }} gap={2}>
											{courseRatings.map(rating => {
												const ratingId = `course-rating-${rating}`;

												return (
													<Box
														key={rating}
														position="relative"
														css={{
															'& input:checked + label': {
																background: 'var(--chakra-colors-primary)',
																borderColor: 'var(--chakra-colors-primary)',
																color: 'var(--chakra-colors-text-inverse)'
															},
															'& input:focus-visible + label': {
																outline: '2px solid var(--chakra-colors-primary)',
																outlineOffset: '2px'
															}
														}}
													>
														<input
															id={ratingId}
															name={field.name}
															type="radio"
															value={rating}
															checked={field.value === rating}
															onBlur={field.onBlur}
															onChange={() => field.onChange(rating)}
															ref={field.ref}
															style={{ height: 1, opacity: 0, position: 'absolute', width: 1 }}
														/>
														<Box
															asChild
															w="full"
															h="44px"
															border="1px solid"
															borderColor="border.default"
															borderRadius="lg"
															bg="bg.card"
															display="grid"
															placeItems="center"
															fontWeight="bold"
															cursor="pointer"
															_disabled={{ cursor: 'not-allowed', opacity: 0.6 }}
														>
															<label htmlFor={ratingId}>{rating}</label>
														</Box>
													</Box>
												);
											})}
										</SimpleGrid>
										<HStack justify="space-between" color="text.muted" fontSize="xs">
											<Text>Not good</Text>
											<Text>Very good</Text>
										</HStack>
										{errors.rating?.message ? (
											<Text color="red.500" fontSize="sm" role="alert">
												{errors.rating.message}
											</Text>
										) : null}
									</Stack>
								</fieldset>
							)}
						/>

						{feedbackQuestions.map(question => {
							const error = errors[question.name]?.message;
							const helperId = `${question.name}-helper`;
							const errorId = `${question.name}-error`;

							return (
								<Stack key={question.name} gap={2}>
									<Box>
										<Text asChild fontWeight="semibold" lineHeight="snug">
											<label htmlFor={question.name}>{question.label}</label>
										</Text>
										<Text id={helperId} mt={1} color="text.muted" fontSize="sm">
											({question.helper})
										</Text>
									</Box>
									<Textarea
										id={question.name}
										{...form.register(question.name)}
										aria-describedby={getQuestionDescriptionIds(helperId, errorId, Boolean(error))}
										aria-invalid={Boolean(error)}
										disabled={controlsDisabled}
										readOnly={controlsReadOnly}
										minH="104px"
										resize="vertical"
										bg={controlsReadOnly ? 'bg.subtle' : 'bg.card'}
									/>
									{error ? (
										<Text id={errorId} color="red.500" fontSize="sm" role="alert">
											{error}
										</Text>
									) : null}
								</Stack>
							);
						})}

						<Button
							type="submit"
							alignSelf="flex-end"
							minH="44px"
							borderRadius="full"
							bg="primary"
							color="text.inverse"
							_hover={{ bg: 'primaryHover' }}
							disabled={!canSubmit || feedbackSubmitted}
							loading={isSubmitting}
							loadingText="Submitting feedback"
						>
							{getSubmitButtonLabel(feedbackSubmitted, isCourseIncomplete)}
						</Button>
					</Stack>
				</form>
			</Stack>
		</Box>
	);
};
