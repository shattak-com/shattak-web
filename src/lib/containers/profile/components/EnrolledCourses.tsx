import { Badge, Box, Button, Heading, HStack, Image, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FiArrowRight, FiBookOpen } from 'react-icons/fi';

import { trackEnrollmentEvent } from '~/lib/analytics/mixpanel';
import type { CourseEnrollment } from '~/lib/api/enrollments';

type EnrolledCourseCardProps = {
	enrollment: CourseEnrollment;
	sourcePage: '/profile' | '/my-courses';
};

const enrollmentStatusStyles: Record<CourseEnrollment['status'], { bg: string; color: string }> = {
	ACTIVE: { bg: 'bg.success', color: 'text.secondary' },
	COMPLETED: { bg: 'bg.accent', color: 'text.accent' },
	CANCELLED: { bg: 'bg.subtle', color: 'text.muted' }
};

const formatEnrollmentDate = (value: string) =>
	new Intl.DateTimeFormat('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	}).format(new Date(value));

export const EnrolledCourseCard = ({ enrollment, sourcePage }: EnrolledCourseCardProps) => {
	const courseImage = enrollment.course.promoImage || enrollment.course.thumbnailImage;
	const learningPath = `/my-courses/${encodeURIComponent(enrollment.course.slug)}`;
	const statusStyle = enrollmentStatusStyles[enrollment.status];

	return (
		<Box
			as="article"
			h="full"
			minH={{ base: '460px', sm: '480px' }}
			display="flex"
			flexDirection="column"
			border="1px solid"
			borderColor="border.default"
			borderRadius="card"
			bg="bg.card"
			overflow="hidden"
			boxShadow="soft"
			transition="transform 180ms ease, box-shadow 180ms ease"
			_hover={{ boxShadow: 'card', transform: 'translateY(-2px)' }}
			_focusWithin={{ boxShadow: 'card' }}
			_motionReduce={{ transition: 'none', _hover: { transform: 'none' } }}
		>
			<Box h="176px" bg="bg.accent" overflow="hidden" flexShrink={0}>
				{courseImage ? (
					<Image src={courseImage} alt="" w="full" h="full" objectFit="cover" />
				) : (
					<Box h="full" display="grid" placeItems="center" color="text.muted">
						<Stack align="center" gap={2}>
							<Box fontSize="2xl" aria-hidden="true">
								<FiBookOpen />
							</Box>
							<Text fontSize="sm">Course preview</Text>
						</Stack>
					</Box>
				)}
			</Box>

			<Stack flex={1} minH={0} gap={4} p={5}>
				<Stack gap={3}>
					<HStack gap={2} flexWrap="wrap">
						<Badge bg={statusStyle.bg} color={statusStyle.color} borderRadius="full" px={2.5} py={1}>
							{enrollment.status}
						</Badge>
						<Badge bg="bg.accent" color="text.accent" borderRadius="full" px={2.5} py={1}>
							{enrollment.progressPercent}% progress
						</Badge>
					</HStack>
					<Heading as="h3" fontSize="lg" lineHeight="compact" lineClamp={2} minH="3rem">
						{enrollment.course.title}
					</Heading>
					<Text color="text.muted" fontSize="sm" lineHeight="body" lineClamp={2} minH="2.8rem">
						{enrollment.course.summary || 'Continue your enrolled Shattak learning experience.'}
					</Text>
				</Stack>

				<Box mt="auto">
					<Text color="text.muted" fontSize="xs">
						Enrolled {formatEnrollmentDate(enrollment.enrolledAt)}
					</Text>
					<Box
						mt={3}
						h="6px"
						borderRadius="full"
						bg="bg.subtle"
						overflow="hidden"
						role="progressbar"
						aria-label={`${enrollment.course.title} progress`}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={enrollment.progressPercent}
					>
						<Box h="full" w={`${enrollment.progressPercent}%`} borderRadius="full" bg="primary" />
					</Box>
					<Button
						asChild
						mt={4}
						minH="44px"
						w="full"
						borderRadius="full"
						bg="primary"
						color="text.inverse"
						_hover={{ bg: 'primaryHover' }}
					>
						<Link
							href={learningPath}
							onClick={() =>
								trackEnrollmentEvent({
									location: 'profile_enrolled_courses',
									eventName: 'Go To Course Clicked',
									courseId: enrollment.course.slug,
									courseTitle: enrollment.course.title,
									isFreeCourse: enrollment.course.price === 0,
									enrollmentStatus: enrollment.status,
									sourcePage,
									destination: learningPath
								})
							}
						>
							Continue learning
							<FiArrowRight />
						</Link>
					</Button>
				</Box>
			</Stack>
		</Box>
	);
};

export const EnrolledCoursesGrid = ({
	enrollments,
	sourcePage
}: {
	enrollments: CourseEnrollment[];
	sourcePage: EnrolledCourseCardProps['sourcePage'];
}) => (
	<SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={{ base: 5, lg: 6 }} alignItems="stretch">
		{enrollments.map(enrollment => (
			<EnrolledCourseCard key={enrollment.id} enrollment={enrollment} sourcePage={sourcePage} />
		))}
	</SimpleGrid>
);

export const EnrolledCoursesEmptyState = () => (
	<Box
		border="1px dashed"
		borderColor="border.muted"
		borderRadius="card"
		bg="bg.surface"
		px={{ base: 5, md: 8 }}
		py={{ base: 8, md: 10 }}
		textAlign="center"
	>
		<Box
			mx="auto"
			boxSize="52px"
			borderRadius="full"
			bg="bg.brand"
			color="primary"
			display="grid"
			placeItems="center"
			fontSize="xl"
			aria-hidden="true"
		>
			<FiBookOpen />
		</Box>
		<Heading mt={4} size="md">
			No enrolled courses yet
		</Heading>
		<Text mt={2} mx="auto" maxW="520px" color="text.muted" fontSize="sm" lineHeight="body">
			Explore available Shattak courses and enroll in a free course to start learning.
		</Text>
		<Button asChild mt={5} minH="44px" borderRadius="full" variant="outline">
			<Link href="/">Browse courses</Link>
		</Button>
	</Box>
);
