'use client';

import { Box, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';

import type { CourseEnrollment } from '~/lib/api/enrollments';

import { currentCertificateAvailabilityResolver } from './certificate-state';
import { CertificateSection } from './CertificateSection';
import { CourseFeedbackSection } from './CourseFeedbackSection';
import { useCourseFeedback } from './useCourseFeedback';

type CourseCertificateTabProps = {
	courseCompleted: boolean;
	courseId: string;
	currentPath: string;
	enrollment: CourseEnrollment;
	isAdmin: boolean;
	userId?: string;
};

export const CourseCertificateTab = ({
	courseCompleted,
	courseId,
	currentPath,
	enrollment,
	isAdmin,
	userId
}: CourseCertificateTabProps) => {
	const feedback = useCourseFeedback({
		courseId,
		courseTitle: enrollment.course.title,
		currentPath,
		enrollment,
		userId
	});
	const feedbackSubmitted = Boolean(feedback.feedbackState?.feedback);
	const certificateAvailability = currentCertificateAvailabilityResolver.resolve({
		isAdmin,
		courseCompleted: feedback.feedbackState?.courseCompleted ?? courseCompleted,
		feedbackSubmitted
	});

	return (
		<Box minW={0} w="full">
			<Stack gap={{ base: 5, md: 6 }}>
				<Stack gap={2}>
					<Heading size={{ base: 'xl', md: '2xl' }}>Feedback &amp; certificate</Heading>
					<Text color="text.muted" lineHeight="relaxed" maxW="760px">
						Share your course experience and track the status of your certificate in one place.
					</Text>
				</Stack>

				<SimpleGrid columns={{ base: 1, xl: 2 }} gap={{ base: 5, xl: 6 }} alignItems="start">
					<CourseFeedbackSection
						feedbackState={feedback.feedbackState}
						form={feedback.form}
						isAdmin={isAdmin}
						isLoading={feedback.isLoading}
						isSubmitting={feedback.isSubmitting}
						loadErrorMessage={feedback.loadErrorMessage}
						notice={feedback.notice}
						onRetry={() => {
							feedback.loadFeedback().catch(() => undefined);
						}}
						onSubmit={feedback.handleSubmit}
					/>
					<CertificateSection availability={certificateAvailability} />
				</SimpleGrid>
			</Stack>
		</Box>
	);
};
