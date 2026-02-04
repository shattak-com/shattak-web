'use client';

import { Box, Button, Container, Grid, Heading, HStack, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import Image from 'next/image';
import Link from 'next/link';
import { FiCalendar, FiStar, FiUsers } from 'react-icons/fi';

import type { CourseDetails } from '~/lib/containers/course/types';
import { buildScheduleDisplayItems } from '~/lib/containers/course/utils/schedule';

type CourseHeroProps = {
	course: CourseDetails;
};

const formatCount = (value: number) => {
	if (value >= 1000) {
		const rounded = Math.round(value / 100) / 10;
		return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}k+`;
	}

	return `${value}+`;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN').format(value);
const isExternalLink = (value: string) => /^https?:\/\//i.test(value);
const enrollGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 rgba(255, 255, 255, 0), 0 0 0 rgba(78, 120, 255, 0); }
  50% { box-shadow: 0 0 14px rgba(255, 255, 255, 0.28), 0 0 28px rgba(78, 120, 255, 0.38); }
`;
const formatDuration = (hours: number, minutes: number) => {
	const parts: string[] = [];
	if (hours > 0) {
		parts.push(`${hours} hr`);
	}
	if (minutes > 0) {
		parts.push(`${minutes} min`);
	}
	return parts.join(' ') || '0 min';
};

const CourseHero = ({ course }: CourseHeroProps) => {
	const paymentLink = course.paymentLink.trim();
	const enrollHref = paymentLink || `/booking/${course.id}`;
	const openExternal = isExternalLink(enrollHref);
	const discountPercent =
		course.originalPrice > course.price
			? Math.floor(((course.originalPrice - course.price) / course.originalPrice) * 100)
			: 0;

	const hasMoreThanThree = course.schedule.length > 3;
	const scheduleItems = hasMoreThanThree ? course.schedule.slice(0, 4) : course.schedule.slice(0, 3);
	const scheduleDisplayItems = buildScheduleDisplayItems(scheduleItems, course.durationHours, course.durationMinutes);
	const highlights = [
		{
			id: 'highlight-duration',
			label: 'Duration',
			value: formatDuration(course.durationHours, course.durationMinutes)
		},
		{
			id: 'highlight-learners',
			label: 'Learners',
			value: `${formatCount(course.enrollmentCount)} Enrolled Students`
		},
		{
			id: 'highlight-recording',
			label: 'Session Recording',
			value: 'Lifetime Access'
		},
		{
			id: 'highlight-post-session',
			label: 'Post Session',
			value: 'Mentor support'
		}
	];
	const renderScheduleItem = (item: (typeof scheduleDisplayItems)[number]) => (
		<Box key={item.id} bg="bg.accent" borderRadius="soft" p={3} border="1px solid" borderColor="border.accentSoft">
			<HStack align="start" spacing={3}>
				<Box
					minW="48px"
					borderRadius="md"
					bg="bg.card"
					border="1px solid"
					borderColor="border.default"
					textAlign="center"
					py={2}
				>
					<Text fontSize="sm" fontWeight="bold" lineHeight="shorter">
						{item.badge.day}
					</Text>
					<Text fontSize="xs" color="text.muted" lineHeight="shorter">
						{item.badge.month}
					</Text>
				</Box>
				<Stack spacing={1} flex="1">
					<Text fontSize="sm" color="text.secondary">
						{item.label} • {item.day} • {item.durationLabel}
					</Text>
					<Text fontSize="sm" fontWeight="bold" color="text.primary">
						{item.timeRange}
					</Text>
				</Stack>
			</HStack>
		</Box>
	);

	return (
		<Box
			as="section"
			id="enroll"
			py={{ base: 12, md: 16 }}
			bgGradient="var(--chakra-gradients-cta-surface)"
			_dark={{ bgGradient: 'var(--chakra-gradients-cta-surface-dark)' }}
			position="relative"
			overflow="hidden"
		>
			<Box position="absolute" inset="0" pointerEvents="none">
				<Box
					position="absolute"
					top={{ base: '-120px', lg: '-160px' }}
					left={{ base: '-120px', lg: '-140px' }}
					w={{ base: '300px', md: '360px' }}
					h={{ base: '300px', md: '360px' }}
					borderRadius="full"
					bgGradient="var(--chakra-gradients-hero-cool-orb)"
					_dark={{ bgGradient: 'var(--chakra-gradients-hero-cool-orb-dark)' }}
					opacity={0.6}
				/>
				<Box
					position="absolute"
					bottom={{ base: '-140px', lg: '-170px' }}
					right={{ base: '-120px', lg: '-160px' }}
					w={{ base: '320px', md: '380px' }}
					h={{ base: '320px', md: '380px' }}
					borderRadius="full"
					bgGradient="var(--chakra-gradients-hero-warm-orb)"
					_dark={{ bgGradient: 'var(--chakra-gradients-hero-warm-orb-dark)' }}
					opacity={0.55}
				/>
			</Box>

			<Container maxW="8xl" position="relative">
				<Grid templateColumns={{ base: '1fr', lg: '1.1fr 1fr' }} gap={{ base: 8, lg: 12 }} alignItems="stretch">
					<Box
						bg="bg.card"
						borderRadius="surface"
						border="1px solid"
						borderColor="border.default"
						p={{ base: 3, md: 5 }}
						boxShadow="hero"
						display="flex"
						flexDirection="column"
						justifyContent="center"
					>
						<Box
							position="relative"
							w="100%"
							minH={{ base: '220px', md: '280px', lg: '320px' }}
							borderRadius="panel"
							overflow="hidden"
							bg="bg.accent"
						>
							<Image
								src={course.thumbnailImage}
								alt={`${course.title} hero`}
								fill
								sizes="(min-width: 62em) 540px, (min-width: 48em) 70vw, 92vw"
								style={{ objectFit: 'contain' }}
							/>
						</Box>
					</Box>

					<Stack spacing={{ base: 5, md: 6 }}>
						<Stack spacing={2}>
							<Text fontSize="sm" color="text.muted">
								Level: {course.level}
							</Text>
							<Heading fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }} fontWeight="bold" lineHeight="title">
								{course.title}
							</Heading>
							<Text fontSize="sm" color="text.muted" lineHeight="relaxed">
								{course.summary}
							</Text>
						</Stack>

						<HStack spacing={5} flexWrap="wrap" color="text.secondary">
							<HStack spacing={2}>
								<Icon as={FiStar} color="icon.warning" />
								<Text fontWeight="semibold">{course.rating.toFixed(1)}</Text>
							</HStack>
							<HStack spacing={2}>
								<Icon as={FiUsers} />
								<Text>{formatCount(course.enrollmentCount)} learners</Text>
							</HStack>
						</HStack>

						<SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
							{highlights.map(item => (
								<Box
									key={item.id}
									bg="bg.card"
									borderRadius="soft"
									border="1px solid"
									borderColor="border.accent"
									p={3}
									boxShadow="soft"
									aspectRatio={{ base: '5 / 3', md: '4 / 3' }}
									display="flex"
									flexDirection="column"
									justifyContent="flex-start"
									w="100%"
								>
									<Text fontSize="xs" color="text.muted">
										{item.label}
									</Text>
									<Text fontWeight="semibold">{item.value}</Text>
								</Box>
							))}
						</SimpleGrid>

						<Grid templateColumns={{ base: '1fr', md: '1.3fr 0.9fr' }} gap={4} alignItems="stretch">
							<Box
								bg="bg.card"
								borderRadius="card"
								border="1px solid"
								borderColor="border.default"
								p={4}
								boxShadow="soft"
								h="100%"
								display="flex"
								flexDirection="column"
							>
								<HStack spacing={2} color="text.muted" mb={3}>
									<Icon as={FiCalendar} />
									<Text fontSize="md" fontWeight="semibold">
										Session Schedule
									</Text>
								</HStack>
								<Stack spacing={4} flex="1">
									{scheduleDisplayItems.map(renderScheduleItem)}
								</Stack>
							</Box>

							<Box
								bg="bg.card"
								borderRadius="card"
								border="1px solid"
								borderColor="border.default"
								p={4}
								boxShadow="card"
								h="100%"
								display="flex"
								flexDirection="column"
							>
								<Stack spacing={2} flex="1">
									<Box>
										<Text fontWeight="semibold" fontSize="md">
											Get Life Time Access
										</Text>
										<HStack spacing={3} align="baseline" mt={2}>
											<Text fontSize="2xl" fontWeight="bold">
												₹{formatCurrency(course.price)}
											</Text>
											<Text fontSize="sm" color="text.muted" textDecoration="line-through">
												₹{formatCurrency(course.originalPrice)}
											</Text>
										</HStack>
										{discountPercent > 0 ? (
											<Text fontSize="sm" color="text.accent" fontWeight="semibold" mt={1}>
												Discount {discountPercent}% off
											</Text>
										) : null}
									</Box>
									<Stack spacing={1} color="text.muted" fontSize="sm">
										<HStack justify="space-between">
											<Text>Course Fee</Text>
											<Text fontWeight="semibold" color="text.primary">
												₹{formatCurrency(course.price)}
											</Text>
										</HStack>
										<HStack justify="space-between">
											<Text>Worth of</Text>
											<Text fontWeight="semibold" color="text.primary">
												₹{formatCurrency(course.originalPrice)}
											</Text>
										</HStack>
										{discountPercent > 0 ? (
											<HStack justify="space-between">
												<Text>Discount</Text>
												<Text fontWeight="semibold" color="text.primary">
													{discountPercent}% Off
												</Text>
											</HStack>
										) : null}
									</Stack>
									<Stack spacing={1} color="text.muted" fontSize="sm">
										<Text fontWeight="semibold" color="text.secondary">
											Includes
										</Text>
										<Text>• Expert Designed Curriculum</Text>
										<Text>• Doubt Clearing Session</Text>
										<Text>• Forever Community Access</Text>
									</Stack>
									<Button
										asChild
										size="sm"
										borderRadius="full"
										bg="text.primary"
										color="text.inverse"
										_hover={{ bg: 'text.primary', opacity: 0.9 }}
										w="full"
										mt="auto"
										animation={`${enrollGlow} 2.8s ease-in-out infinite`}
										_dark={{ animation: `${enrollGlow} 2.8s ease-in-out infinite` }}
									>
										<Link
											href={enrollHref}
											target={openExternal ? '_blank' : undefined}
											rel={openExternal ? 'noopener noreferrer' : undefined}
										>
											Enroll Now
										</Link>
									</Button>
								</Stack>
							</Box>
						</Grid>
					</Stack>
				</Grid>
			</Container>
		</Box>
	);
};

export default CourseHero;
