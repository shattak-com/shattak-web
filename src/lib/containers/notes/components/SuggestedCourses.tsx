'use client';

import { AspectRatio, Badge, Box, Button, Heading, HStack, Image, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FiArrowRight, FiBookOpen, FiClock } from 'react-icons/fi';

import { trackCourseCardClicked, trackCtaClicked } from '~/lib/analytics/mixpanel';
import type { LandingCourseCard } from '~/lib/api/courses';

type SuggestedCoursesProps = { courses: LandingCourseCard[] };

const SuggestedCourses = ({ courses }: SuggestedCoursesProps) => (
	<Box as="section" aria-labelledby="suggested-courses-heading">
		<HStack justify="space-between" align="flex-end" gap={4} mb={5}>
			<Box>
				<Text color="text.brand" fontWeight="bold" fontSize="xs" letterSpacing="wider" textTransform="uppercase">
					Keep learning
				</Text>
				<Heading id="suggested-courses-heading" size={{ base: 'lg', md: 'xl' }} mt={1}>
					Suggested Courses For You
				</Heading>
			</Box>
			<Button asChild variant="outline" borderRadius="full" size={{ base: 'sm', md: 'md' }} flexShrink={0}>
				<Link
					href="/?category=futured#courses"
					onClick={() =>
						trackCtaClicked({
							label: 'View All Courses',
							location: 'notes_suggested_courses',
							destination: '/?category=futured#courses'
						})
					}
				>
					<Box as="span" display={{ base: 'none', sm: 'inline' }}>
						View All Courses
					</Box>
					<Box as="span" display={{ base: 'inline', sm: 'none' }}>
						View All
					</Box>
					<FiArrowRight />
				</Link>
			</Button>
		</HStack>

		{courses.length ? (
			<SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} gap={{ base: 3, md: 4 }}>
				{courses.map(course => {
					const href = `/course/${course.id}`;
					return (
						<Box
							key={course.id}
							asChild
							bg="bg.card"
							border="1px solid"
							borderColor="border.default"
							borderRadius="tile"
							overflow="hidden"
							transition="all 0.2s ease"
							_hover={{ transform: 'translateY(-3px)', boxShadow: 'soft', borderColor: 'border.brandSoft' }}
						>
							<Link
								href={href}
								onClick={() =>
									trackCourseCardClicked({
										location: 'notes_suggested_courses',
										courseId: course.id,
										courseTitle: course.title,
										destination: href
									})
								}
							>
								<AspectRatio ratio={4 / 3} bg="bg.subtle">
									{course.image ? (
										<Image src={course.image} alt="" objectFit="cover" loading="lazy" decoding="async" />
									) : (
										<Box display="grid" placeItems="center" color="text.muted">
											<FiBookOpen />
										</Box>
									)}
								</AspectRatio>
								<Stack p={{ base: 3, md: 3.5 }} gap={2}>
									<Badge colorPalette="orange" variant="subtle" borderRadius="full" width="fit-content" fontSize="2xs">
										{course.level}
									</Badge>
									<Text fontWeight="semibold" fontSize={{ base: 'xs', md: 'sm' }} lineHeight="compact" lineClamp={2}>
										{course.title}
									</Text>
									<HStack color="text.muted" fontSize="2xs" gap={1}>
										<FiClock /> <Text>{course.duration}</Text>
									</HStack>
								</Stack>
							</Link>
						</Box>
					);
				})}
			</SimpleGrid>
		) : (
			<Box border="1px dashed" borderColor="border.muted" borderRadius="panel" p={6} textAlign="center">
				<Text color="text.muted">Featured courses will appear here soon.</Text>
			</Box>
		)}
	</Box>
);

export default SuggestedCourses;
