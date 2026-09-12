'use client';

import { Box, Button, Container, Heading, SimpleGrid, Stack, Text, Wrap, WrapItem } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { trackCourseFilterChanged } from '~/lib/analytics/mixpanel';
import type { LandingCourseCard } from '~/lib/api/courses';
import CourseCard from '~/lib/components/CourseCard';
import { courseCategories } from '~/lib/constants/landing';

const CATEGORY_QUERY_KEY = 'category';

const slugifyCategory = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

const getCategoryFromQuery = (value: string | null, categories: readonly string[]) => {
	if (!value) {
		return null;
	}

	const normalized = value.trim().toLowerCase();
	const exactMatch = categories.find(category => category.toLowerCase() === normalized);
	if (exactMatch) {
		return exactMatch;
	}

	return categories.find(category => slugifyCategory(category) === normalized) ?? null;
};

type CoursesSectionProps = {
	courses: LandingCourseCard[];
};

const CoursesSection = ({ courses }: CoursesSectionProps) => {
	const categories = courseCategories as readonly string[];
	const pathname = usePathname();
	const defaultCategory = categories[0] ?? '';
	const headingRef = useRef<HTMLHeadingElement | null>(null);
	const [activeCategory, setActiveCategory] = useState(defaultCategory);

	useEffect(() => {
		const query = typeof window === 'undefined' ? '' : window.location.search;
		const selectedCategory = getCategoryFromQuery(new URLSearchParams(query).get(CATEGORY_QUERY_KEY), categories);
		setActiveCategory(selectedCategory ?? defaultCategory);
	}, [categories, defaultCategory]);

	const filteredItems = useMemo(() => {
		if (!activeCategory) {
			return courses;
		}
		return courses.filter(item => item.categories.includes(activeCategory));
	}, [activeCategory, courses]);

	const handleCategoryChange = (category: string) => {
		trackCourseFilterChanged({
			location: 'home_courses',
			selectedCategory: category,
			previousCategory: activeCategory
		});

		setActiveCategory(category);
		const nextParams = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
		const categorySlug = slugifyCategory(category);
		const defaultCategorySlug = slugifyCategory(defaultCategory);

		if (!categorySlug || categorySlug === defaultCategorySlug) {
			nextParams.delete(CATEGORY_QUERY_KEY);
		} else {
			nextParams.set(CATEGORY_QUERY_KEY, categorySlug);
		}

		const query = nextParams.toString();
		const queryString = query ? `?${query}` : '';
		const hash = typeof window === 'undefined' ? '' : window.location.hash;
		const nextUrl = `${pathname}${queryString}${hash}`;

		if (typeof window !== 'undefined') {
			window.history.replaceState(window.history.state, '', nextUrl);
		}
		headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	return (
		<Box as="section" id="courses" py={{ base: 14, md: 20 }}>
			<Container maxW={{ base: '6xl', xl: '7xl' }}>
				<Stack gap={6}>
					<Box>
						<Wrap gap={{ base: 3, md: 4 }} align="center" mb={{ base: 4, md: 6 }}>
							{categories
								.filter(currentCourse => !currentCourse.includes('Private'))
								.map(category => (
									<WrapItem key={category}>
										<Button
											size={{ base: 'xs', md: 'sm' }}
											borderRadius="full"
											bg={activeCategory === category ? 'primary' : 'bg.card'}
											color={activeCategory === category ? 'text.inverse' : 'text.primary'}
											border="2px solid"
											borderColor="border.brand"
											fontWeight="semibold"
											fontSize={{ base: 'xs', md: 'sm' }}
											px={{ base: 4, md: 6 }}
											_hover={{
												bg: activeCategory === category ? 'primaryHover' : 'bg.brand',
												color: activeCategory === category ? 'text.inverse' : 'text.primary'
											}}
											onClick={() => handleCategoryChange(category)}
										>
											{category}
										</Button>
									</WrapItem>
								))}
						</Wrap>
					</Box>

					<Stack mb={{ base: 4, md: 6 }} gap={2}>
						<Heading ref={headingRef} size="lg">
							Live Class From Expert Mentors
						</Heading>
					</Stack>

					<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: 10, md: 12, lg: 14 }}>
						{filteredItems.map((course, index) => (
							<CourseCard
								key={course.id}
								course={course}
								index={index}
								analyticsLocation="home_courses_grid"
								actionAnalyticsLocation="home_courses_button"
							/>
						))}
					</SimpleGrid>
					{!filteredItems.length ? (
						<Box
							bg="bg.card"
							border="1px solid"
							borderColor="border.default"
							borderRadius="card"
							p={{ base: 6, md: 8 }}
							textAlign="center"
						>
							<Text color="text.muted">No published courses found for this category yet.</Text>
						</Box>
					) : null}
				</Stack>
			</Container>
		</Box>
	);
};

export default CoursesSection;
