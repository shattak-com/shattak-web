'use client';

import {
	Box,
	Button,
	Heading,
	HStack,
	Icon,
	Image as ChakraImage,
	LinkBox,
	LinkOverlay,
	Separator,
	Stack,
	Text,
	VisuallyHidden
} from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import { FiBarChart2, FiClock, FiHeart, FiStar, FiUsers, FiVideo } from 'react-icons/fi';

import { trackCourseCardClicked } from '~/lib/analytics/mixpanel';
import type { LandingCourseCard } from '~/lib/api/courses';
import Reveal from '~/lib/components/Reveal';

type CourseCardProps = {
	course: LandingCourseCard;
	index?: number;
	analyticsLocation: string;
	actionAnalyticsLocation?: string;
};

const formatLearners = (count: number) => {
	if (count >= 1000) {
		const rounded = Math.round(count / 100) / 10;
		const label = Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1);
		return `${label}k+`;
	}

	return `${count}+`;
};

type LogoImageProps = {
	src: string;
	alt: string;
	boxSize: string;
	borderRadius?: string;
};

const LogoImage = ({ src, alt, boxSize, borderRadius = 'full' }: LogoImageProps) => (
	<ChakraImage src={src} alt={alt} boxSize={boxSize} borderRadius={borderRadius} objectFit="cover" />
);

const CourseCard = ({ course, index = 0, analyticsLocation, actionAnalyticsLocation }: CourseCardProps) => {
	const courseHref = `/course/${course.id}`;
	const discountPercent =
		course.price && course.originalPrice > course.price
			? Math.floor(((course.originalPrice - course.price) / course.originalPrice) * 100)
			: 0;

	const trackClick = (location: string) =>
		trackCourseCardClicked({
			location,
			courseId: course.id,
			courseTitle: course.title,
			destination: courseHref
		});

	return (
		<Reveal delay={index * 0.05} hover hoverLift={8}>
			<LinkBox
				as="article"
				bg="bg.card"
				borderRadius="card"
				p={{ base: 4, md: 5 }}
				display="flex"
				flexDirection="column"
				gap={{ base: 4, md: 5 }}
				h="100%"
				border="1px solid"
				borderColor="border.default"
				boxShadow="card"
				transition="border-color 0.2s ease, background 0.2s ease"
				_hover={{ borderColor: 'border.brandSoft', bg: 'bg.brand' }}
				cursor="pointer"
				position="relative"
			>
				<LinkOverlay
					as={Link}
					href={courseHref}
					aria-label={`View details for ${course.title}`}
					position="absolute"
					inset="0"
					zIndex={1}
					onClick={() => trackClick(analyticsLocation)}
				>
					<VisuallyHidden>View details</VisuallyHidden>
				</LinkOverlay>

				<Box position="relative" width="100%" aspectRatio="1 / 1" borderRadius="panel" overflow="hidden" bg="bg.subtle">
					<Image
						src={course.image}
						alt={`Instructor for ${course.title}`}
						fill
						sizes="(min-width: 62em) 320px, (min-width: 48em) 45vw, 90vw"
						style={{ objectFit: 'cover', objectPosition: '50% 10%' }}
					/>

					<HStack
						position="absolute"
						top={2}
						left={3}
						zIndex={1}
						px={1.5}
						py={1.5}
						borderRadius="full"
						bg="bg.badgeStrong"
					>
						{course.tools
							?.slice(0, 5)
							.map(tool =>
								tool.image ? <LogoImage key={tool.id} src={tool.image} alt={tool.name} boxSize="27px" /> : null
							)}
					</HStack>

					<HStack position="absolute" top={2} right={3} zIndex={1}>
						<HStack gap={1} px={3} py={3} borderRadius="full" bg="bg.badgeStrong" boxShadow="soft">
							<Icon as={FiHeart} boxSize={6} color="red.400" />
						</HStack>
					</HStack>

					{course.promoImageBrand ? (
						<HStack
							position="absolute"
							bottom={2}
							left={3}
							zIndex={1}
							px={1}
							py={1}
							borderRadius="md"
							bg="bg.badgeStrong"
							boxShadow="soft"
						>
							<LogoImage src={course.promoImageBrand} alt={`${course.title} brand`} boxSize="50px" borderRadius="sm" />
						</HStack>
					) : null}

					<HStack position="absolute" bottom={3} right={3} gap={2} zIndex={1}>
						<HStack
							gap={1.5}
							px={3}
							py={1}
							borderRadius="full"
							backdropFilter="blur(8px)"
							boxShadow="soft"
							bg="bg.badgeStrong"
						>
							<Icon as={FiUsers} boxSize={3.5} color="icon.inverse" />
							<Text fontSize="xs" fontWeight="semibold" color="text.inverse">
								{formatLearners(course.learners)} Learners
							</Text>
						</HStack>
						<HStack gap={1} px={2.5} py={1} borderRadius="full" bg="bg.badgeStrong" boxShadow="soft">
							<Icon as={FiStar} boxSize={3} color="yellow.400" />
							<Text fontSize="xs" fontWeight="semibold" color="text.inverse">
								{course.rating.toFixed(1)}
							</Text>
						</HStack>
					</HStack>
				</Box>

				<Stack gap={3} flex="1">
					<Heading size="md" lineClamp={2} lineHeight="compact">
						{course.title}
					</Heading>
					<Separator borderColor="border.default" />
					<HStack gap={3} color="text.muted" fontSize="xs" flexWrap="wrap">
						<HStack gap={1}>
							<Icon as={FiBarChart2} />
							<Text>{course.level}</Text>
						</HStack>
						<HStack gap={1}>
							<Icon as={FiClock} />
							<Text>{course.duration}</Text>
						</HStack>
						<HStack gap={1}>
							<Icon as={FiVideo} />
							<Text>{course.format}</Text>
						</HStack>
					</HStack>
					<HStack justify="space-between" align="center" mt="auto">
						<HStack gap={2} align="baseline" flexWrap="wrap">
							<Text fontSize="sm" color="text.muted" textDecoration="line-through">
								₹{course.originalPrice}
							</Text>
							<Text fontWeight="bold" fontSize="lg" color="text.primary">
								{course.price ? `₹${course.price}` : 'Free'}
							</Text>
							{discountPercent > 0 ? (
								<Text fontSize="sm" color="text.muted">
									{discountPercent}% off
								</Text>
							) : null}
						</HStack>
						<Button
							position="relative"
							zIndex={2}
							size="sm"
							borderRadius="full"
							bg="bg.inverse"
							color="text.inverse"
							_hover={{ bg: 'bg.inverseHover' }}
							asChild
						>
							<Link
								href={courseHref}
								onClick={() => trackClick(actionAnalyticsLocation ?? `${analyticsLocation}_button`)}
							>
								View Details
							</Link>
						</Button>
					</HStack>
				</Stack>
			</LinkBox>
		</Reveal>
	);
};

export default CourseCard;
