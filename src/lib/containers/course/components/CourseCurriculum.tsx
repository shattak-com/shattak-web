'use client';

import {
	Accordion,
	Badge,
	Box,
	Container,
	Grid,
	Heading,
	HStack,
	Icon,
	SimpleGrid,
	Stack,
	Switch,
	Text
} from '@chakra-ui/react';
import type { ElementType } from 'react';
import { useMemo, useState } from 'react';
import {
	FiBook,
	FiBookOpen,
	FiCheckSquare,
	FiClock,
	FiCode,
	FiFile,
	FiFileText,
	FiHelpCircle,
	FiMessageSquare,
	FiMonitor,
	FiPlay,
	FiRadio,
	FiUsers
} from 'react-icons/fi';

import type { CourseSessionSection } from '~/lib/containers/course/types';

type CourseCurriculumProps = {
	lessons: CourseSessionSection[];
};

const liveSessionItems = [
	{
		title: 'Topic Explanation',
		description: 'Learn concepts live with practical examples and guidance.',
		frequency: 'Weekly Once',
		icon: FiRadio,
		color: 'pink.500',
		bg: 'pink.50'
	},
	{
		title: 'Doubt Clearing Sessions',
		description: 'Ask questions, clear doubts, and get help when you need it.',
		frequency: 'Weekly Twice',
		icon: FiHelpCircle,
		color: 'green.500',
		bg: 'green.50'
	},
	{
		title: 'Hands-on Projects',
		description: 'Work on projects with guidance and support from mentors.',
		frequency: 'Monthly Once',
		icon: FiCode,
		color: 'orange.500',
		bg: 'orange.50'
	},
	{
		title: 'Mock Interview',
		description: 'Practise interviews, exchange feedback, and build confidence.',
		frequency: 'Daily',
		icon: FiUsers,
		color: 'blue.500',
		bg: 'blue.50'
	}
] as const;

const bonusResources = [
	{ label: 'Study Materials', icon: FiBookOpen, color: 'blue.500', bg: 'blue.50' },
	{ label: 'Cheat Sheets', icon: FiFileText, color: 'blue.500', bg: 'blue.50' },
	{ label: 'Interview Q&A', icon: FiMessageSquare, color: 'purple.500', bg: 'purple.50' },
	{ label: 'PYQ PDFs', icon: FiFile, color: 'pink.500', bg: 'pink.50' },
	{ label: 'PPTs', icon: FiMonitor, color: 'purple.500', bg: 'purple.50' },
	{ label: 'Quizzes', icon: FiCheckSquare, color: 'blue.500', bg: 'blue.50' }
] as const;

const AccordionItem = Accordion.Item as ElementType;
const AccordionItemContent = Accordion.ItemContent as ElementType;
const AccordionItemTrigger = Accordion.ItemTrigger as ElementType;
const SwitchControl = Switch.Control as ElementType;

const getFallbackDuration = (key: string) => {
	let hash = 0;

	for (let index = 0; index < key.length; index += 1) {
		hash = (hash * 31 + key.charCodeAt(index)) % 2_147_483_647;
	}

	return `${12 + (hash % 8)} min`;
};

const getChapterDuration = (sectionName: string, title: string, duration: string, index: number) =>
	duration.trim() || getFallbackDuration(`${sectionName}:${title}:${index}`);

const getChapterCountLabel = (count: number) => `${count} ${count === 1 ? 'Chapter' : 'Chapters'}`;

const LessonsCurriculum = ({
	sections,
	values,
	onValueChange
}: {
	sections: CourseSessionSection[];
	values: string[];
	onValueChange: (value: string[]) => void;
}) => (
	<Box bg="bg.card" borderRadius="card" border="1px solid" borderColor="border.default" overflow="hidden">
		<HStack bg={{ base: '#ffebe5', _dark: 'bg.accent' }} px={{ base: 4, md: 5 }} py={4} gap={3} align="center">
			<Box
				boxSize={10}
				borderRadius="soft"
				bg="primary"
				color="ink.900"
				display="grid"
				placeItems="center"
				flexShrink={0}
			>
				<Icon as={FiBookOpen} boxSize={5} />
			</Box>
			<Box minW={0}>
				<Text fontWeight="bold">Lessons</Text>
				<Text fontSize="sm" color="text.muted" mt={0.5}>
					Start here after enrolling. These lessons build your core foundation step by step.
				</Text>
			</Box>
		</HStack>

		<Box px={{ base: 3, md: 5 }} py={{ base: 4, md: 5 }}>
			{sections.length ? (
				<Accordion.Root multiple collapsible value={values} onValueChange={({ value }) => onValueChange(value)}>
					<Stack gap={3}>
						{sections.map((section, sectionIndex) => {
							const itemValue = `lessons-${section.sectionName}`;

							return (
								<AccordionItem key={section.sectionName} value={itemValue}>
									<Box
										bg="bg.card"
										borderRadius="soft"
										border="1px solid"
										borderColor="border.default"
										overflow="hidden"
									>
										<AccordionItemTrigger
											display="flex"
											alignItems="center"
											justifyContent="space-between"
											gap={3}
											w="full"
											px={{ base: 3, md: 4 }}
											py={3}
											borderBottom="none"
											_before={{ display: 'none' }}
											_after={{ display: 'none' }}
											_hover={{ bg: 'bg.subtle' }}
										>
											<HStack gap={3} minW={0} textAlign="left">
												<Badge colorPalette="orange" variant="subtle" flexShrink={0}>
													{String(sectionIndex + 1).padStart(2, '0')}
												</Badge>
												<Text fontWeight="semibold" lineClamp={2}>
													{section.sectionName}
												</Text>
											</HStack>
											<HStack gap={{ base: 1.5, md: 3 }} flexShrink={0} color="text.muted">
												<Icon as={FiClock} />
												<Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="semibold">
													{getChapterCountLabel(section.subsections.length)}
												</Text>
												<Accordion.ItemIndicator />
											</HStack>
										</AccordionItemTrigger>
										<AccordionItemContent>
											<Accordion.ItemBody px={{ base: 3, md: 4 }} pb={4}>
												<Stack gap={2.5}>
													{section.subsections.map((item, itemIndex) => (
														<HStack key={`${section.sectionName}-${item.title}`} gap={3} align="center" minW={0}>
															<Box
																boxSize={7}
																borderRadius="full"
																bg="primary"
																color="ink.900"
																display="grid"
																placeItems="center"
																flexShrink={0}
																aria-hidden
															>
																<Icon as={FiPlay} boxSize={3} fill="currentColor" />
															</Box>
															<Text color="text.secondary" flex="1" minW={0} lineHeight="short">
																{item.title}
															</Text>
															<Text fontSize="sm" color="text.muted" whiteSpace="nowrap" flexShrink={0}>
																{getChapterDuration(section.sectionName, item.title, item.time, itemIndex)}
															</Text>
														</HStack>
													))}
												</Stack>
											</Accordion.ItemBody>
										</AccordionItemContent>
									</Box>
								</AccordionItem>
							);
						})}
					</Stack>
				</Accordion.Root>
			) : (
				<Box border="1px dashed" borderColor="border.default" borderRadius="soft" p={5} textAlign="center">
					<Text color="text.muted" fontSize="sm">
						The lesson curriculum is being prepared.
					</Text>
				</Box>
			)}
		</Box>
	</Box>
);

const LiveSessionRecordings = () => (
	<Box bg="bg.card" borderRadius="card" border="1px solid" borderColor="border.default" overflow="hidden">
		<HStack bg={{ base: '#ffebe5', _dark: 'bg.accent' }} px={{ base: 4, md: 5 }} py={4} gap={3} align="center">
			<Box
				boxSize={11}
				borderRadius="soft"
				bg="primary"
				color="ink.900"
				display="grid"
				placeItems="center"
				flexShrink={0}
			>
				<Icon as={FiRadio} boxSize={6} />
			</Box>
			<Box minW={0}>
				<HStack gap={2} flexWrap="wrap">
					<Text fontWeight="bold">Live Session Recordings</Text>
					<Badge colorPalette="red" variant="solid" borderRadius="full">
						Live
					</Badge>
				</HStack>
				<Text fontSize="sm" color="text.muted" mt={0.5}>
					Learn live with instructors, ask questions, and get real-time guidance. Previous recordings are included.
				</Text>
			</Box>
		</HStack>

		<Stack gap={2.5} p={{ base: 3, md: 5 }}>
			{liveSessionItems.map(item => (
				<HStack
					key={item.title}
					justify="space-between"
					align="center"
					gap={4}
					border="1px solid"
					borderColor="border.default"
					borderRadius="soft"
					px={{ base: 3, md: 4 }}
					py={3}
				>
					<HStack gap={3} align="start" minW={0}>
						<Box
							boxSize={8}
							borderRadius="soft"
							bg={{ base: item.bg, _dark: 'whiteAlpha.100' }}
							color={item.color}
							display="grid"
							placeItems="center"
							flexShrink={0}
						>
							<Icon as={item.icon} />
						</Box>
						<Box minW={0}>
							<Text fontSize="sm" fontWeight="bold">
								{item.title}
							</Text>
							<Text fontSize="xs" color="text.muted">
								{item.description}
							</Text>
						</Box>
					</HStack>
					<Badge bg="primary" color="ink.900" borderRadius="soft" px={3} py={1.5} whiteSpace="nowrap" flexShrink={0}>
						{item.frequency}
					</Badge>
				</HStack>
			))}
		</Stack>
	</Box>
);

const BonusResources = () => (
	<Box bg="bg.card" borderRadius="card" border="1px solid" borderColor="border.default" overflow="hidden">
		<HStack bg="bg.accent" px={{ base: 4, md: 5 }} py={4} gap={3} align="center">
			<Box
				boxSize={11}
				borderRadius="soft"
				bg="brand.600"
				color="white"
				display="grid"
				placeItems="center"
				flexShrink={0}
			>
				<Icon as={FiBook} boxSize={6} />
			</Box>
			<Box minW={0}>
				<Text fontWeight="bold">Bonus Resources</Text>
				<Text fontSize="sm" color="text.muted" mt={0.5}>
					Get bonus content and resources to practise, revise, and go deeper.
				</Text>
			</Box>
		</HStack>

		<SimpleGrid columns={{ base: 2, sm: 3, lg: 6 }} gap={3} p={{ base: 3, md: 5 }}>
			{bonusResources.map(resource => (
				<Stack
					key={resource.label}
					align="center"
					gap={2}
					border="1px solid"
					borderColor="border.default"
					borderRadius="soft"
					bg="bg.card"
					px={2}
					py={3}
					textAlign="center"
				>
					<Box
						boxSize={9}
						borderRadius="soft"
						bg={{ base: resource.bg, _dark: 'whiteAlpha.100' }}
						color={resource.color}
						display="grid"
						placeItems="center"
					>
						<Icon as={resource.icon} boxSize={5} />
					</Box>
					<Text fontSize="xs" fontWeight="semibold">
						{resource.label}
					</Text>
				</Stack>
			))}
		</SimpleGrid>
	</Box>
);

const CourseCurriculum = ({ lessons }: CourseCurriculumProps) => {
	const allLessonValues = useMemo(() => lessons.map(section => `lessons-${section.sectionName}`), [lessons]);
	const [expandedValues, setExpandedValues] = useState(allLessonValues);
	const [expandAll, setExpandAll] = useState(true);

	const handleToggle = (checked: boolean) => {
		setExpandAll(checked);
		setExpandedValues(checked ? allLessonValues : []);
	};

	const handleLessonChange = (value: string[]) => {
		setExpandedValues(value);
		setExpandAll(value.length === allLessonValues.length);
	};

	return (
		<Box as="section" py={{ base: 12, md: 16 }} bg="bg.surface">
			<Container maxW="7xl">
				<Stack gap={6}>
					<Stack gap={2}>
						<HStack justify="space-between" align="center">
							<Heading fontSize={{ base: 'xl', md: '2xl' }} lineHeight="title" letterSpacing="subtle">
								Course Curriculum
							</Heading>
							<Switch.Root
								checked={expandAll}
								onCheckedChange={({ checked }) => handleToggle(checked)}
								aria-label="Expand all lesson modules"
							>
								<SwitchControl>
									<Switch.Thumb />
								</SwitchControl>
								<Switch.HiddenInput />
							</Switch.Root>
						</HStack>
						<Text color="text.muted" fontSize={{ base: 'sm', md: 'md' }}>
							Follow this structured learning path to build skills from beginner to advanced.
						</Text>
					</Stack>

					<Stack gap={6} mt={{ base: 2, md: 4 }}>
						<LessonsCurriculum sections={lessons} values={expandedValues} onValueChange={handleLessonChange} />
						<Grid templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr)' }} gap={6}>
							<LiveSessionRecordings />
							<BonusResources />
						</Grid>
					</Stack>
				</Stack>
			</Container>
		</Box>
	);
};

export default CourseCurriculum;
