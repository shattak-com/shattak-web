'use client';

import {
	Badge,
	Box,
	Container,
	Grid,
	Heading,
	HStack,
	Icon,
	Image as ChakraImage,
	SimpleGrid,
	Stack,
	Text
} from '@chakra-ui/react';
import Image from 'next/image';
import {
	FiAward,
	FiCheck,
	FiClock,
	FiCode,
	FiGift,
	FiHelpCircle,
	FiMessageCircle,
	FiRadio,
	FiShield,
	FiStar,
	FiUsers,
	FiVideo
} from 'react-icons/fi';

import CourseEnrollAction from '~/lib/containers/course/components/CourseEnrollAction';
import type { CourseDetails } from '~/lib/containers/course/types';
import { formatCourseDuration, getCourseContentDurationMinutes } from '~/lib/containers/course/utils/duration';

type CourseHeroProps = {
	course: CourseDetails;
};

const courseBenefits = [
	{
		label: 'Lifetime Access',
		description: 'Learn anytime. No deadlines.',
		icon: FiClock,
		color: 'green.500',
		bg: 'green.50'
	},
	{
		label: 'Session Recordings',
		description: 'Rewatch sessions and learn at your pace.',
		icon: FiVideo,
		color: 'red.500',
		bg: 'red.50'
	},
	{
		label: 'Mentor Support',
		description: 'Get guidance and clear your doubts.',
		icon: FiMessageCircle,
		color: 'orange.500',
		bg: 'orange.50'
	},
	{
		label: 'Community Access',
		description: 'Learn, connect, and grow together.',
		icon: FiUsers,
		color: 'blue.500',
		bg: 'blue.50'
	}
] as const;

const liveSessionBenefits = [
	{
		label: 'Topic Explanation',
		description: 'Learn concepts live with practical examples.',
		icon: FiRadio,
		color: 'pink.500',
		bg: 'pink.50'
	},
	{
		label: 'Doubt Clearing Sessions',
		description: 'Ask questions, clear doubts, and get help.',
		icon: FiHelpCircle,
		color: 'green.500',
		bg: 'green.50'
	},
	{
		label: 'Hands-on Projects',
		description: 'Work on projects with guidance and support.',
		icon: FiCode,
		color: 'orange.500',
		bg: 'orange.50'
	},
	{
		label: 'Mock Interview',
		description: 'Practise interviews and exchange feedback.',
		icon: FiUsers,
		color: 'blue.500',
		bg: 'blue.50'
	}
] as const;

const purchaseBenefits = ['Get Full Course Access', 'Earn a Verified Certificate', 'Pay as Much as You Wish'] as const;

const toolBenefits = [
	{
		label: 'Lifetime Access',
		description: 'Learn at your own pace, anytime, anywhere.',
		icon: FiAward,
		color: 'purple.500',
		bg: 'purple.50'
	},
	{
		label: 'Certificate',
		description: 'Earn a verified certificate upon completion.',
		icon: FiShield,
		color: 'green.500',
		bg: 'green.50'
	},
	{
		label: 'Hands-on Projects',
		description: 'Build real-world projects for your portfolio.',
		icon: FiGift,
		color: 'blue.500',
		bg: 'blue.50'
	}
] as const;

const formatCount = (value: number) => {
	if (value >= 1000) {
		const rounded = Math.round(value / 100) / 10;
		return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}k+`;
	}

	return value > 0 ? `${value}+` : '0';
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN').format(value);
const formatRupee = (value: number) => `\u20B9${formatCurrency(value)}`;

const CourseHero = ({ course }: CourseHeroProps) => {
	const discountPercent =
		course.originalPrice > course.price
			? Math.floor(((course.originalPrice - course.price) / course.originalPrice) * 100)
			: 0;
	const courseDuration = formatCourseDuration(getCourseContentDurationMinutes(course));
	const stats = [
		{ label: 'Course Rating', value: course.rating.toFixed(1), icon: FiStar },
		{ label: 'Learners', value: formatCount(course.enrollmentCount), icon: FiUsers },
		{ label: 'Total Content', value: courseDuration, icon: FiClock },
		{ label: 'Level', value: course.level, icon: FiAward }
	];

	return (
		<Box as="section" id="enroll" py={{ base: 6, md: 10, xl: 12 }} bg="bg.canvas" position="relative" overflow="hidden">
			<Box position="absolute" inset="0" pointerEvents="none" aria-hidden>
				<Box
					position="absolute"
					top="-180px"
					right="-120px"
					w={{ base: '280px', lg: '440px' }}
					h={{ base: '280px', lg: '440px' }}
					borderRadius="full"
					bgGradient="var(--chakra-gradients-hero-warm-orb)"
					opacity={{ base: 0.32, _dark: 0.16 }}
				/>
				<Box
					position="absolute"
					bottom="-200px"
					left="-140px"
					w={{ base: '300px', lg: '480px' }}
					h={{ base: '300px', lg: '480px' }}
					borderRadius="full"
					bgGradient="var(--chakra-gradients-hero-cool-orb)"
					opacity={{ base: 0.28, _dark: 0.14 }}
				/>
			</Box>

			<Container maxW="8xl" position="relative">
				<Grid
					templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 0.92fr) minmax(0, 1.08fr)' }}
					templateAreas={{ base: '"media" "details" "lower" "tools"', lg: '"media details" "tools lower"' }}
					gap={{ base: 5, md: 6, xl: 7 }}
					alignItems="stretch"
				>
					<Box
						gridArea="media"
						bg="bg.card"
						borderRadius="surface"
						border="1px solid"
						borderColor="border.default"
						p={{ base: 2.5, md: 4 }}
						boxShadow="hero"
						minW={0}
					>
						<Box
							position="relative"
							w="100%"
							aspectRatio={{ base: '16 / 10', md: '16 / 9' }}
							borderRadius="panel"
							overflow="hidden"
							bg="bg.subtle"
						>
							<Image
								src={course.thumbnailImage}
								alt={`${course.title} course preview`}
								fill
								priority
								sizes="(min-width: 62em) 48vw, 94vw"
								style={{ objectFit: 'cover' }}
							/>
						</Box>

						<SimpleGrid columns={4} mt={{ base: 2.5, md: 4 }}>
							{stats.map((stat, index) => (
								<Stack
									key={stat.label}
									align="center"
									gap={1}
									px={{ base: 1, sm: 2 }}
									py={{ base: 1.5, md: 2 }}
									borderLeft={index ? '1px solid' : undefined}
									borderColor="border.default"
									minW={0}
									textAlign="center"
								>
									<Icon as={stat.icon} color="icon.brand" boxSize={{ base: 4, md: 5 }} />
									<Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold" lineClamp={1} maxW="full">
										{stat.value}
									</Text>
									<Text fontSize="2xs" color="text.muted" lineClamp={1} maxW="full">
										{stat.label}
									</Text>
								</Stack>
							))}
						</SimpleGrid>
					</Box>

					<Stack gridArea="details" gap={{ base: 5, md: 6 }} minW={0} justify="space-between">
						<Stack gap={3}>
							<Badge alignSelf="flex-start" colorPalette="purple" variant="subtle" borderRadius="full" px={3} py={1}>
								Level: {course.level}
							</Badge>
							<Heading
								as="h1"
								fontSize={{ base: '2xl', sm: '3xl', xl: '4xl', '2xl': '5xl' }}
								fontWeight="bold"
								lineHeight="title"
								letterSpacing="tight"
							>
								{course.title}
							</Heading>
							<Text color="text.muted" lineHeight="relaxed" fontSize={{ base: 'sm', md: 'md' }} maxW="72ch">
								{course.summary}
							</Text>
						</Stack>

						<SimpleGrid
							columns={{ base: 2, md: 4 }}
							bg="bg.card"
							border="1px solid"
							borderColor="border.default"
							borderRadius="surface"
							boxShadow="card"
							overflow="hidden"
						>
							{courseBenefits.map((benefit, index) => (
								<Stack
									key={benefit.label}
									align="center"
									gap={2}
									px={{ base: 2, md: 3 }}
									py={{ base: 4, md: 5 }}
									textAlign="center"
									borderLeft={{ base: index % 2 ? '1px solid' : undefined, md: index ? '1px solid' : undefined }}
									borderTop={{ base: index > 1 ? '1px solid' : undefined, md: undefined }}
									borderColor="border.default"
								>
									<Box
										boxSize={{ base: 8, md: 9 }}
										borderRadius="full"
										bg={{ base: benefit.bg, _dark: 'whiteAlpha.100' }}
										display="grid"
										placeItems="center"
										color={benefit.color}
									>
										<Icon as={benefit.icon} boxSize={{ base: 4, md: 5 }} />
									</Box>
									<Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold">
										{benefit.label}
									</Text>
									<Text fontSize="xs" color="text.muted" lineHeight="short">
										{benefit.description}
									</Text>
								</Stack>
							))}
						</SimpleGrid>
					</Stack>

					<Box
						gridArea="tools"
						bg="bg.card"
						border="1px solid"
						borderColor="border.default"
						borderRadius="surface"
						boxShadow="card"
						p={{ base: 4, md: 5 }}
						minW={0}
						display="flex"
						flexDirection="column"
					>
						<Text fontSize="sm" fontWeight="bold" mb={4}>
							Tools & Technologies You&apos;ll Use
						</Text>
						{course.tools.length ? (
							<SimpleGrid
								columns={{ base: Math.min(course.tools.length, 3), sm: Math.min(course.tools.length, 6) }}
								gap={{ base: 3, md: 4 }}
							>
								{course.tools.slice(0, 6).map(tool => (
									<Stack key={tool.id} align="center" gap={2} minW={0} textAlign="center">
										<Box
											boxSize={{ base: '85px', md: '100px' }}
											borderRadius="tile"
											bg="bg.subtle"
											border="1px solid"
											borderColor="border.subtle"
											display="grid"
											placeItems="center"
										>
											{tool.image ? (
												<ChakraImage src={tool.image} alt="" w="full" h="full" p={1.5} objectFit="contain" />
											) : (
												<Text fontWeight="bold">{tool.name.slice(0, 1).toUpperCase()}</Text>
											)}
										</Box>
										<Text fontSize="2xs" color="text.muted" fontWeight="semibold" lineClamp={2}>
											{tool.name}
										</Text>
									</Stack>
								))}
							</SimpleGrid>
						) : (
							<Text fontSize="sm" color="text.muted">
								Practical tools are introduced throughout the course.
							</Text>
						)}

						<SimpleGrid
							columns={{ base: 1, sm: 3 }}
							mt={{ base: 5, lg: 'auto' }}
							gap={0}
							borderRadius="panel"
							bg="bg.accent"
							overflow="hidden"
						>
							{toolBenefits.map((benefit, index) => (
								<HStack
									key={benefit.label}
									align="start"
									gap={3}
									px={{ base: 4, sm: 3 }}
									py={4}
									borderLeft={{ base: undefined, sm: index ? '1px solid' : undefined }}
									borderTop={{ base: index ? '1px solid' : undefined, sm: undefined }}
									borderColor="border.accentSoft"
									minW={0}
								>
									<Box
										boxSize={8}
										borderRadius="full"
										bg={{ base: benefit.bg, _dark: 'whiteAlpha.100' }}
										color={benefit.color}
										display="grid"
										placeItems="center"
										flexShrink={0}
									>
										<Icon as={benefit.icon} />
									</Box>
									<Stack gap={1} minW={0}>
										<Text fontSize="xs" fontWeight="bold">
											{benefit.label}
										</Text>
										<Text fontSize="2xs" color="text.muted" lineHeight="relaxed">
											{benefit.description}
										</Text>
									</Stack>
								</HStack>
							))}
						</SimpleGrid>
					</Box>

					<Grid
						gridArea="lower"
						templateColumns={{ base: 'minmax(0, 1fr)', md: '1.08fr minmax(260px, 0.92fr)' }}
						gap={5}
						minW={0}
					>
						<Box
							order={{ base: 2, md: 1 }}
							bg="bg.card"
							border="1px solid"
							borderColor="border.default"
							borderRadius="surface"
							boxShadow="card"
							p={{ base: 4, md: 5 }}
							display="flex"
							flexDirection="column"
							h="full"
						>
							<Heading as="h2" fontSize="lg" mb={4}>
								Live Sessions Including
							</Heading>
							<Stack gap={{ base: 4, md: 5 }} flex="1" justify="space-between">
								{liveSessionBenefits.map(benefit => (
									<HStack key={benefit.label} align="start" gap={3}>
										<Box
											boxSize={9}
											borderRadius="soft"
											bg={{ base: benefit.bg, _dark: 'whiteAlpha.100' }}
											color={benefit.color}
											display="grid"
											placeItems="center"
											flexShrink={0}
										>
											<Icon as={benefit.icon} />
										</Box>
										<Stack gap={0.5} minW={0}>
											<Text fontSize="sm" fontWeight="bold">
												{benefit.label}
											</Text>
											<Text fontSize="xs" color="text.muted">
												{benefit.description}
											</Text>
										</Stack>
									</HStack>
								))}
							</Stack>
							<HStack mt={5} p={3} borderRadius="soft" bg="bg.accent" color="text.accent" align="start">
								<Icon as={FiClock} mt={0.5} flexShrink={0} />
								<Text fontSize="xs" fontWeight="semibold">
									Session dates and times are scheduled based on community demand.
								</Text>
							</HStack>
						</Box>

						<Box
							order={{ base: 1, md: 2 }}
							bg="bg.card"
							border="1px solid"
							borderColor="border.default"
							borderRadius="surface"
							boxShadow="elevated"
							p={{ base: 4, md: 5 }}
							display="flex"
							flexDirection="column"
						>
							<Badge alignSelf="flex-start" colorPalette="purple" variant="subtle" borderRadius="full" px={3} py={1}>
								<Icon as={FiAward} mr={1.5} /> Learn First. Pay Later.
							</Badge>

							<HStack align="baseline" gap={3} mt={4}>
								<Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold" letterSpacing="tight">
									{formatRupee(course.price)}
								</Text>
								{course.originalPrice > course.price ? (
									<Text color="text.muted" textDecoration="line-through">
										{formatRupee(course.originalPrice)}
									</Text>
								) : null}
							</HStack>
							{discountPercent > 0 ? (
								<Text mt={1} color="green.500" fontSize="sm" fontWeight="bold">
									Discount {discountPercent}% off
								</Text>
							) : null}

							<Stack gap={2} my={5} fontSize="sm">
								<HStack justify="space-between">
									<Text color="text.muted">Course Fee</Text>
									<Text fontWeight="semibold">{formatRupee(course.price)}</Text>
								</HStack>
								{course.originalPrice > course.price ? (
									<>
										<HStack justify="space-between">
											<Text color="text.muted">Worth of</Text>
											<Text fontWeight="semibold">{formatRupee(course.originalPrice)}</Text>
										</HStack>
										<HStack justify="space-between">
											<Text color="text.muted">Your Savings</Text>
											<Text color="green.500" fontWeight="bold">
												{discountPercent}% Off
											</Text>
										</HStack>
									</>
								) : null}
							</Stack>

							<Text fontSize="sm" fontWeight="bold" mb={2}>
								Benefits
							</Text>
							<Stack gap={1.5} mb={5}>
								{purchaseBenefits.map(benefit => (
									<HStack key={benefit} gap={2} align="start">
										<Icon as={FiCheck} color="green.500" mt={0.5} flexShrink={0} />
										<Text fontSize="xs" color="text.muted">
											{benefit}
										</Text>
									</HStack>
								))}
							</Stack>

							<Box mt="auto">
								<CourseEnrollAction course={course} location="course_hero" size="md" />
								<Text mt={2} textAlign="center" fontSize="2xs" color="text.muted">
									Risk-free. Start learning today!
								</Text>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
};

export default CourseHero;
