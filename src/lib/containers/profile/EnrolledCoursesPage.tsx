'use client';

import { Badge, Box, Button, Container, Heading, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

import { identifyAuthenticatedMixpanelUser, trackEnrollmentEvent } from '~/lib/analytics/mixpanel';
import { listMyCourseEnrollments, type CourseEnrollment } from '~/lib/api/enrollments';
import { getOnboardingStatus } from '~/lib/api/onboarding';
import { SkeletonBlock } from '~/lib/components/feedback/LoadingStates';
import { EnrolledCoursesEmptyState, EnrolledCoursesGrid } from '~/lib/containers/profile/components/EnrolledCourses';
import { getProtectedUserRouteRedirectPath } from '~/lib/utils/onboarding';

const EnrolledCoursesPageSkeleton = () => (
	<Box as="main" minH="calc(100vh - 72px)" bg="bg.surface">
		<Container maxW="6xl" py={{ base: 8, md: 12 }}>
			<Stack gap={8}>
				<Stack gap={3}>
					<SkeletonBlock h="20px" w="128px" />
					<SkeletonBlock h="44px" w="320px" maxW="90%" />
					<SkeletonBlock h="18px" w="520px" maxW="100%" />
				</Stack>
				<SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={{ base: 5, lg: 6 }}>
					{Array.from({ length: 3 }, (_, index) => (
						<SkeletonBlock key={index} h="480px" borderRadius="card" />
					))}
				</SimpleGrid>
			</Stack>
		</Container>
	</Box>
);

const EnrolledCoursesPage = () => {
	const router = useRouter();
	const hasTrackedViewRef = useRef(false);
	const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	const loadEnrollments = useCallback(async () => {
		setIsLoading(true);
		setErrorMessage('');

		try {
			const [onboardingResult, enrollmentResult] = await Promise.all([
				getOnboardingStatus(),
				listMyCourseEnrollments()
			]);
			const redirectPath = getProtectedUserRouteRedirectPath(onboardingResult.profile);

			if (redirectPath) {
				router.replace(redirectPath);
				return;
			}

			setEnrollments(enrollmentResult.enrollments);
			identifyAuthenticatedMixpanelUser({
				userId: onboardingResult.user.id,
				email: onboardingResult.user.email,
				name: onboardingResult.user.name,
				roles: onboardingResult.user.roles,
				status: onboardingResult.user.status,
				authContext: 'user',
				onboardingNextStep: onboardingResult.profile.nextStep
			});

			if (!hasTrackedViewRef.current) {
				hasTrackedViewRef.current = true;
				trackEnrollmentEvent({
					location: 'profile_enrolled_courses',
					eventName: 'All Enrolled Courses Viewed',
					userId: onboardingResult.user.id,
					enrollmentStatus: enrollmentResult.enrollments.length ? 'HAS_ENROLLMENTS' : 'EMPTY',
					sourcePage: '/my-courses'
				});
			}
		} catch {
			setErrorMessage('Unable to load your enrolled courses right now. Please try again.');
		} finally {
			setIsLoading(false);
		}
	}, [router]);

	useEffect(() => {
		loadEnrollments().catch(() => undefined);
	}, [loadEnrollments]);

	if (isLoading) {
		return <EnrolledCoursesPageSkeleton />;
	}

	let coursesContent;

	if (errorMessage) {
		coursesContent = (
			<Box
				role="alert"
				border="1px solid"
				borderColor="border.default"
				borderRadius="card"
				bg="bg.card"
				p={{ base: 5, md: 6 }}
			>
				<Stack gap={4} align="flex-start">
					<Heading size="md">Courses unavailable</Heading>
					<Text color="text.muted">{errorMessage}</Text>
					<Button
						variant="outline"
						borderRadius="full"
						minH="44px"
						onClick={() => loadEnrollments().catch(() => undefined)}
					>
						<FiRefreshCw />
						Try again
					</Button>
				</Stack>
			</Box>
		);
	} else if (enrollments.length) {
		coursesContent = <EnrolledCoursesGrid enrollments={enrollments} sourcePage="/my-courses" />;
	} else {
		coursesContent = <EnrolledCoursesEmptyState />;
	}

	return (
		<Box as="main" minH="calc(100vh - 72px)" bg="bg.surface">
			<Container maxW="6xl" py={{ base: 8, md: 12 }}>
				<Stack gap={{ base: 6, md: 8 }}>
					<Box>
						<Button asChild variant="ghost" borderRadius="full" minH="44px" px={3}>
							<Link href="/profile">
								<FiArrowLeft />
								Back to profile
							</Link>
						</Button>

						<HStack mt={5} gap={3} align="center" flexWrap="wrap">
							<Heading fontSize={{ base: '3xl', md: '4xl' }} lineHeight="title">
								Your enrolled courses
							</Heading>
							<Badge bg="bg.brand" color="text.brand" borderRadius="full" px={3} py={1}>
								{enrollments.length} {enrollments.length === 1 ? 'course' : 'courses'}
							</Badge>
						</HStack>
						<Text mt={3} maxW="680px" color="text.muted" lineHeight="relaxed">
							Continue learning, revisit completed material, and track progress across your Shattak courses.
						</Text>
					</Box>

					{coursesContent}
				</Stack>
			</Container>
		</Box>
	);
};

export default EnrolledCoursesPage;
