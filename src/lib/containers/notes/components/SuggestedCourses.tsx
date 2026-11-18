'use client';

import { Box, Button, Heading, HStack, SimpleGrid, Skeleton, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';

import { trackCtaClicked } from '~/lib/analytics/mixpanel';
import type { LandingCourseCard } from '~/lib/api/courses';
import CourseCard from '~/lib/components/CourseCard';
import { loadFeaturedCourses } from '~/lib/containers/notes/data';

const SuggestedCourses = () => {
	const section = useRef<HTMLElement>(null);
	const [courses, setCourses] = useState<LandingCourseCard[] | null>(null);
	useEffect(() => {
		let active = true;
		const load = () => {
			loadFeaturedCourses().then(result => {
				if (active) setCourses(result);
			});
		};
		if (!section.current || !('IntersectionObserver' in window)) {
			load();
			return () => {
				active = false;
			};
		}
		const observer = new IntersectionObserver(
			entries => {
				if (!entries.some(entry => entry.isIntersecting)) return;
				observer.disconnect();
				load();
			},
			{ rootMargin: '600px 0px' }
		);
		observer.observe(section.current);
		return () => {
			active = false;
			observer.disconnect();
		};
	}, []);

	return (
		<Box as="section" ref={section} aria-labelledby="suggested-courses-heading" aria-busy={courses === null}>
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
						prefetch={false}
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

			{courses === null && <Skeleton h={{ base: 48, md: 64 }} borderRadius="panel" aria-hidden="true" />}
			{courses &&
				(courses.length ? (
					<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: 8, md: 10, lg: 12 }}>
						{courses.map((course, index) => (
							<CourseCard key={course.id} course={course} index={index} analyticsLocation="notes_suggested_courses" />
						))}
					</SimpleGrid>
				) : (
					<Box border="1px dashed" borderColor="border.muted" borderRadius="panel" p={6} textAlign="center">
						<Text color="text.muted">Featured courses will appear here soon.</Text>
					</Box>
				))}
		</Box>
	);
};

export default SuggestedCourses;
