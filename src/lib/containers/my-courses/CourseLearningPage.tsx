'use client';

import { Badge, Box, Button, Container, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { trackEnrollmentEvent } from '~/lib/analytics/mixpanel';
import { ApiRequestError } from '~/lib/api/client';
import { getCourseEnrollmentStatus, type CourseEnrollment } from '~/lib/api/enrollments';
import { ProfilePageSkeleton } from '~/lib/components/feedback/LoadingStates';

type CourseLearningPageProps = {
	courseId: string;
};

const CourseLearningPage = ({ courseId }: CourseLearningPageProps) => {
	const router = useRouter();
	const currentPath = `/my-courses/${courseId}`;
	const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		let isMounted = true;

		getCourseEnrollmentStatus(courseId)
			.then(result => {
				if (!isMounted) {
					return;
				}

				if (!result.isEnrolled || !result.enrollment) {
					setErrorMessage('You are not enrolled in this course yet.');
					return;
				}

				setEnrollment(result.enrollment);
				trackEnrollmentEvent({
					location: 'course_learning',
					eventName: 'Course Learning Page Viewed',
					courseId,
					courseTitle: result.enrollment.course.title,
					isFreeCourse: result.enrollment.course.price === 0,
					enrollmentStatus: result.enrollment.status,
					sourcePage: currentPath
				});
			})
			.catch(error => {
				if (error instanceof ApiRequestError && error.statusCode === 401) {
					router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
					return;
				}

				if (isMounted) {
					setErrorMessage('Unable to load this course right now.');
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
	}, [courseId, currentPath, router]);

	if (isLoading) {
		return <ProfilePageSkeleton />;
	}

	if (!enrollment) {
		return (
			<Container maxW="3xl" py={{ base: 12, md: 16 }}>
				<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
					<Stack gap={4}>
						<Heading size="lg">Course access unavailable</Heading>
						<Text color="text.muted">{errorMessage}</Text>
						<HStack gap={3} flexWrap="wrap">
							<Button asChild borderRadius="full" bg="primary" color="text.inverse" _hover={{ bg: 'primaryHover' }}>
								<Link href={`/course/${courseId}`}>View course details</Link>
							</Button>
							<Button asChild borderRadius="full" variant="outline">
								<Link href="/profile">Back to profile</Link>
							</Button>
						</HStack>
					</Stack>
				</Box>
			</Container>
		);
	}

	return (
		<Container maxW="5xl" py={{ base: 10, md: 14 }}>
			<Stack gap={6}>
				<Box border="1px solid" borderColor="border.default" borderRadius="surface" bg="bg.card" p={{ base: 5, md: 7 }}>
					<Stack gap={4}>
						<HStack gap={2} flexWrap="wrap">
							<Badge>{enrollment.status}</Badge>
							<Badge>{enrollment.progressPercent}% progress</Badge>
						</HStack>
						<Box>
							<Text fontSize="xs" fontWeight="bold" color="primary" textTransform="uppercase">
								My Course
							</Text>
							<Heading mt={2} size="xl" lineHeight="short">
								{enrollment.course.title}
							</Heading>
							<Text mt={3} color="text.muted" maxW="3xl">
								{enrollment.course.summary || 'Your enrolled course workspace is ready.'}
							</Text>
						</Box>
					</Stack>
				</Box>

				<Box border="1px dashed" borderColor="border.default" borderRadius="card" bg="bg.subtle" p={{ base: 5, md: 6 }}>
					<Stack gap={3}>
						<Heading size="md">Course player coming next</Heading>
						<Text color="text.muted">
							Your enrollment is active. The detailed course-player experience will use the nested curriculum modules,
							subsections, and enrolled-only content already managed by admins.
						</Text>
						<Button asChild borderRadius="full" w="fit-content">
							<Link href="/profile">View all enrolled courses</Link>
						</Button>
					</Stack>
				</Box>
			</Stack>
		</Container>
	);
};

export default CourseLearningPage;
