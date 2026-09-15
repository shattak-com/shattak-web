'use client';

import { Box, Container, HStack, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import { FiBookOpen, FiBriefcase, FiCheck, FiEdit3, FiRefreshCw, FiStar } from 'react-icons/fi';

import SectionHeader from '~/lib/containers/course/components/SectionHeader';

type AudienceCard = {
	title: string;
	description: string;
	bullets: string[];
	icon: IconType;
	color: string;
	iconBg: string;
	accentBorder: string;
};

const audienceCards: AudienceCard[] = [
	{
		title: 'Students & Fresh Graduates',
		description: 'Build a strong foundation and turn what you learn into practical experience.',
		bullets: ['Learn from beginner to advanced', 'Build real-world projects', 'Get feedback and improve'],
		icon: FiBookOpen,
		color: 'purple.500',
		iconBg: 'purple.50',
		accentBorder: 'purple.300'
	},
	{
		title: 'Working Professionals',
		description: 'Upgrade your skills and apply new knowledge directly in your career.',
		bullets: ['Learn in-demand skills', 'Apply directly to your work', 'Grow with practical knowledge'],
		icon: FiBriefcase,
		color: 'blue.500',
		iconBg: 'blue.50',
		accentBorder: 'blue.300'
	},
	{
		title: 'Career Switchers',
		description: 'Follow a clear path as you transition confidently into a new career.',
		bullets: ['Structured learning path', 'Hands-on practice', 'Mentor support at every step'],
		icon: FiRefreshCw,
		color: 'green.500',
		iconBg: 'green.50',
		accentBorder: 'green.300'
	},
	{
		title: 'Freelancers & Creators',
		description: 'Sharpen your craft and deliver better results for your clients and audience.',
		bullets: ['Work on client-ready projects', 'Improve efficiency and quality', 'Stay current with modern tools'],
		icon: FiEdit3,
		color: 'orange.500',
		iconBg: 'orange.50',
		accentBorder: 'orange.300'
	}
];

const CourseAudience = () => (
	<Box as="section" py={{ base: 10, md: 14 }} bg="bg.surface">
		<Container maxW="7xl">
			<Stack gap={{ base: 6, md: 8 }}>
				<Box textAlign="center">
					<SectionHeader
						title="This course is for you if you want to"
						subtitle="Wherever you are in your journey, this course helps you learn, build, and grow with confidence."
					/>
				</Box>

				<SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={{ base: 4, md: 5 }}>
					{audienceCards.map(card => (
						<Stack
							key={card.title}
							bg="bg.card"
							borderRadius="panel"
							border="1px solid"
							borderColor="border.default"
							borderBottomWidth="3px"
							borderBottomColor={card.accentBorder}
							p={{ base: 5, md: 6 }}
							gap={4}
							h="full"
							boxShadow="soft"
							transition="transform 0.2s ease, box-shadow 0.2s ease"
							_hover={{ transform: 'translateY(-3px)', boxShadow: 'card' }}
						>
							<Box
								boxSize={11}
								borderRadius="full"
								bg={{ base: card.iconBg, _dark: 'whiteAlpha.100' }}
								color={card.color}
								display="grid"
								placeItems="center"
							>
								<Icon as={card.icon} boxSize={5} aria-hidden />
							</Box>

							<Stack gap={2}>
								<Text fontSize="md" fontWeight="bold" lineHeight="title" color={card.color}>
									{card.title}
								</Text>
								<Box w={10} h="2px" bg={card.accentBorder} borderRadius="full" />
								<Text fontSize="sm" color="text.secondary" lineHeight="body">
									{card.description}
								</Text>
							</Stack>

							<Stack gap={2.5} mt="auto">
								{card.bullets.map(bullet => (
									<HStack key={bullet} gap={2.5} align="start">
										<Box
											boxSize={5}
											borderRadius="full"
											bg={{ base: card.iconBg, _dark: 'whiteAlpha.100' }}
											color={card.color}
											display="grid"
											placeItems="center"
											flexShrink={0}
										>
											<Icon as={FiCheck} boxSize={3} strokeWidth={3} aria-hidden />
										</Box>
										<Text fontSize="sm" color="text.secondary" lineHeight="short">
											{bullet}
										</Text>
									</HStack>
								))}
							</Stack>
						</Stack>
					))}
				</SimpleGrid>

				<HStack
					justify="center"
					align="start"
					gap={2.5}
					bg="bg.accent"
					border="1px solid"
					borderColor="border.accentSoft"
					borderRadius="soft"
					px={{ base: 4, md: 6 }}
					py={3}
					textAlign={{ base: 'left', md: 'center' }}
				>
					<Icon as={FiStar} color="icon.accent" boxSize={4} mt={0.5} flexShrink={0} aria-hidden />
					<Text fontSize="sm" color="text.secondary">
						<Text as="span" fontWeight="bold" color="text.primary">
							For anyone who wants to learn, build, and grow.
						</Text>{' '}
						All you need is curiosity and a willingness to take the first step.
					</Text>
				</HStack>
			</Stack>
		</Container>
	</Box>
);

export default CourseAudience;
