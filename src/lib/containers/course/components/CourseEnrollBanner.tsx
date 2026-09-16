'use client';

import { Box, Container, HStack, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import CourseEnrollAction from '~/lib/containers/course/components/CourseEnrollAction';
import type { CourseDetails } from '~/lib/containers/course/types';
import { formatCourseDuration, getCourseContentDurationMinutes } from '~/lib/containers/course/utils/duration';

type CourseEnrollBannerProps = {
	course: CourseDetails;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN').format(value);
const formatRupee = (value: number) => `\u20B9${formatCurrency(value)}`;
const formatLearners = (value: number) => `${new Intl.NumberFormat('en-IN').format(value)}${value > 0 ? '+' : ''}`;

const CourseEnrollBanner = ({ course }: CourseEnrollBannerProps) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsVisible(window.scrollY > 360);
		};

		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const discountPercent =
		course.originalPrice > course.price
			? Math.floor(((course.originalPrice - course.price) / course.originalPrice) * 100)
			: 0;

	const courseContentDuration = formatCourseDuration(getCourseContentDurationMinutes(course));

	return (
		<Box
			position="fixed"
			left="0"
			right="0"
			bottom={{ base: 3, md: 4 }}
			zIndex="sticky"
			pointerEvents={isVisible ? 'auto' : 'none'}
		>
			<Container maxW="7xl">
				<Box
					bgGradient="var(--chakra-gradients-brand-sunset)"
					color="text.onDark"
					borderRadius={{ base: 'xl', md: 'card' }}
					border="1px solid"
					borderColor="border.onDark"
					boxShadow="elevated"
					px={{ base: 4, md: 6 }}
					py={{ base: 3, md: 3 }}
					opacity={isVisible ? 1 : 0}
					transform={isVisible ? 'translateY(0)' : 'translateY(16px)'}
					transition="all 0.2s ease"
				>
					<Box display={{ base: 'none', md: 'block' }}>
						<HStack gap={6} align="center">
							<HStack gap={6} flex="1" minW="0">
								<Stack gap={1} flex="1" minW="0">
									<Text fontSize="xs" color="text.onDarkMuted">
										Learners
									</Text>
									<Text fontWeight="semibold">{formatLearners(course.enrollmentCount)}</Text>
								</Stack>
								<Box w="1px" h="40px" bg="border.onDark" />
								<Stack gap={1} flex="1" minW="0">
									<Text fontSize="xs" color="text.onDarkMuted">
										Duration
									</Text>
									<Text fontWeight="semibold">{courseContentDuration}</Text>
								</Stack>
							</HStack>
							<HStack gap={4} justify="flex-end" flex="1">
								<Stack gap={1} flex="1" minW="0">
									<Text fontSize="xs" color="text.onDarkMuted">
										Get Life Time Access
									</Text>
									<HStack gap={2} align="baseline">
										<Text fontWeight="bold">{formatRupee(course.price)}</Text>
										<Text fontSize="sm" color="text.onDarkMuted" textDecoration="line-through">
											{formatRupee(course.originalPrice)}
										</Text>
										{discountPercent > 0 ? (
											<Text fontSize="xs" color="text.onDark" fontWeight="semibold">
												{discountPercent}% off
											</Text>
										) : null}
									</HStack>
								</Stack>
								<Box>
									<CourseEnrollAction course={course} location="course_sticky_banner" size="sm" fullWidth={false} />
								</Box>
							</HStack>
						</HStack>
					</Box>

					<Box display={{ base: 'block', md: 'none' }}>
						<HStack justify="space-between" align="center" gap={3}>
							<Stack gap={1}>
								<Text fontSize="xs" color="text.onDarkMuted">
									Get Life Time Access
								</Text>
								<HStack gap={2} align="baseline">
									<Text fontWeight="bold">{formatRupee(course.price)}</Text>
									<Text fontSize="xs" color="text.onDarkMuted" textDecoration="line-through">
										{formatRupee(course.originalPrice)}
									</Text>
									{discountPercent > 0 ? (
										<Text fontSize="xs" color="text.onDark" fontWeight="semibold">
											{discountPercent}% off
										</Text>
									) : null}
								</HStack>
							</Stack>
							<Box>
								<CourseEnrollAction
									course={course}
									location="course_sticky_banner_mobile"
									size="sm"
									fullWidth={false}
								/>
							</Box>
						</HStack>
					</Box>
				</Box>
			</Container>
		</Box>
	);
};

export default CourseEnrollBanner;
