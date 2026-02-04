'use client';

import { Box, Button, Container, HStack, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import type { CourseDetails } from '~/lib/containers/course/types';
import { buildScheduleDisplayItems } from '~/lib/containers/course/utils/schedule';

type CourseEnrollBannerProps = {
	course: CourseDetails;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN').format(value);
const isExternalLink = (value: string) => /^https?:\/\//i.test(value);

const formatDurationSummary = (hours: number, minutes: number) => {
	const parts: string[] = [];
	if (hours > 0) {
		parts.push(`${hours}Hr`);
	}
	if (minutes > 0) {
		parts.push(`${minutes}Min`);
	}
	return parts.join(' ') || 'TBD';
};

const CourseEnrollBanner = ({ course }: CourseEnrollBannerProps) => {
	const [isVisible, setIsVisible] = useState(false);
	const paymentLink = course.paymentLink.trim();
	const enrollHref = paymentLink || `/booking/${course.id}`;
	const openExternal = isExternalLink(enrollHref);

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

	const startingSession = useMemo(() => {
		const items = buildScheduleDisplayItems(course.schedule.slice(0, 1), course.durationHours, course.durationMinutes);
		if (!items.length) {
			return null;
		}
		const [item] = items;
		const startTime = item.timeRange.split(' to ')[0] ?? item.timeRange;
		return `${item.badge.day} ${item.badge.month} - ${startTime}`;
	}, [course]);

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
					bgGradient="var(--chakra-gradients-cta-surface)"
					_dark={{ bgGradient: 'var(--chakra-gradients-cta-surface-dark)' }}
					borderRadius={{ base: 'xl', md: 'card' }}
					border="1px solid"
					borderColor="border.accentSoft"
					boxShadow="elevated"
					px={{ base: 4, md: 6 }}
					py={{ base: 3, md: 3 }}
					opacity={isVisible ? 1 : 0}
					transform={isVisible ? 'translateY(0)' : 'translateY(16px)'}
					transition="all 0.2s ease"
				>
					<Box display={{ base: 'none', md: 'block' }}>
						<HStack spacing={6} align="center">
							<HStack spacing={6} flex="1" minW="0">
								<Stack spacing={1} flex="1" minW="0">
									<Text fontSize="xs" color="text.muted">
										Starting From
									</Text>
									<Text fontWeight="semibold">{startingSession ?? 'TBD'}</Text>
								</Stack>
								<Box w="1px" h="40px" bg="border.default" />
								<Stack spacing={1} flex="1" minW="0">
									<Text fontSize="xs" color="text.muted">
										Live Session
									</Text>
									<Text fontWeight="semibold">
										{formatDurationSummary(course.durationHours, course.durationMinutes)}
									</Text>
								</Stack>
							</HStack>
							<HStack spacing={4} justify="flex-end" flex="1">
								<Stack spacing={1} flex="1" minW="0">
									<Text fontSize="xs" color="text.muted">
										Get Life Time Access
									</Text>
									<HStack spacing={2} align="baseline">
										<Text fontWeight="bold">INR {formatCurrency(course.price)}</Text>
										<Text fontSize="sm" color="text.muted" textDecoration="line-through">
											INR {formatCurrency(course.originalPrice)}
										</Text>
										{discountPercent > 0 ? (
											<Text fontSize="xs" color="text.accent" fontWeight="semibold">
												{discountPercent}% off
											</Text>
										) : null}
									</HStack>
								</Stack>
								<Button
									asChild
									size="sm"
									borderRadius="full"
									bg="text.primary"
									color="text.inverse"
									_hover={{ bg: 'text.primary', opacity: 0.9 }}
								>
									<Link
										href={enrollHref}
										target={openExternal ? '_blank' : undefined}
										rel={openExternal ? 'noopener noreferrer' : undefined}
									>
										Enroll Now
									</Link>
								</Button>
							</HStack>
						</HStack>
					</Box>

					<Box display={{ base: 'block', md: 'none' }}>
						<HStack justify="space-between" align="center" spacing={3}>
							<Stack spacing={1}>
								<Text fontSize="xs" color="text.muted">
									Get Life Time Access
								</Text>
								<HStack spacing={2} align="baseline">
									<Text fontWeight="bold">INR {formatCurrency(course.price)}</Text>
									<Text fontSize="xs" color="text.muted" textDecoration="line-through">
										INR {formatCurrency(course.originalPrice)}
									</Text>
									{discountPercent > 0 ? (
										<Text fontSize="xs" color="text.accent" fontWeight="semibold">
											{discountPercent}% off
										</Text>
									) : null}
								</HStack>
							</Stack>
							<Button
								asChild
								size="sm"
								borderRadius="full"
								bg="text.primary"
								color="text.inverse"
								_hover={{ bg: 'text.primary', opacity: 0.9 }}
							>
								<Link
									href={enrollHref}
									target={openExternal ? '_blank' : undefined}
									rel={openExternal ? 'noopener noreferrer' : undefined}
								>
									Enroll Now
								</Link>
							</Button>
						</HStack>
					</Box>
				</Box>
			</Container>
		</Box>
	);
};

export default CourseEnrollBanner;
