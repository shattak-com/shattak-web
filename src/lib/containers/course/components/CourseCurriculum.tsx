'use client';

import { Accordion, Box, Container, Heading, HStack, Icon, Stack, Text, Switch } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';

import type { CourseSessionSection } from '~/lib/containers/course/types';

type CourseCurriculumProps = {
	prerequisites: CourseSessionSection[];
	liveSessions: CourseSessionSection[];
	postSessionMaterials: CourseSessionSection[];
};

type CurriculumGroupProps = {
	id: 'prerequisites' | 'liveSessions' | 'postSessionMaterials';
	title: string;
	description: string;
	tone: 'neutral' | 'brand' | 'accent';
	sections: CourseSessionSection[];
	values: string[];
	onValueChange: (value: string[]) => void;
};

const toneStyles = {
	neutral: {
		headerBg: '#ffebe5',
		headerBgDark: 'bg.accent',
		headerColor: 'text.primary',
		itemBg: 'bg.card',
		itemBorder: 'border.default',
		itemBorderDark: 'border.accentSoft',
		hoverBg: 'bg.subtle',
		hoverBgDark: 'bg.accent'
	},
	brand: {
		headerBg: 'primary',
		headerBgDark: 'primary',
		headerColor: 'text.inverse',
		itemBg: 'bg.brand',
		itemBorder: 'border.brandSoft',
		itemBorderDark: 'border.brandSoft',
		hoverBg: 'bg.brand',
		hoverBgDark: 'bg.brand'
	},
	accent: {
		headerBg: '#ffebe5',
		headerBgDark: 'bg.accent',
		headerColor: 'text.primary',
		itemBg: 'bg.card',
		itemBorder: 'border.default',
		itemBorderDark: 'border.accentSoft',
		hoverBg: 'bg.subtle',
		hoverBgDark: 'bg.accent'
	}
} as const;

const CurriculumGroup = ({ id, title, description, tone, sections, values, onValueChange }: CurriculumGroupProps) => {
	const styles = toneStyles[tone];

	return (
		<Box bg="bg.card" borderRadius="card" border="1px solid" borderColor="border.default" overflow="hidden">
			<Box
				bg={styles.headerBg}
				color={styles.headerColor}
				_dark={{ bg: styles.headerBgDark }}
				px={{ base: 4, md: 5 }}
				py={4}
			>
				<Text fontWeight="semibold" fontSize="md">
					{title}
				</Text>
				<Text fontSize="sm" color={tone === 'brand' ? 'text.inverse' : 'text.muted'} mt={1}>
					{description}
				</Text>
			</Box>
			<Box px={{ base: 4, md: 5 }} py={{ base: 4, md: 5 }}>
				<Accordion.Root multiple collapsible value={values} onValueChange={({ value }) => onValueChange(value)}>
					<Stack spacing={3}>
						{sections.map(section => {
							const itemValue = `${id}-${section.sectionName}`;

							return (
								<Accordion.Item key={section.sectionName} value={itemValue}>
									<Box
										bg={styles.itemBg}
										borderRadius="soft"
										border="1px solid"
										borderColor={styles.itemBorder}
										overflow="hidden"
										_dark={{ bg: 'bg.card', borderColor: styles.itemBorderDark }}
									>
										<Accordion.ItemTrigger
											display="flex"
											alignItems="center"
											justifyContent="space-between"
											w="full"
											px={4}
											py={3}
											borderBottom="none"
											borderColor="transparent"
											_before={{ display: 'none' }}
											_after={{ display: 'none' }}
											_hover={{ bg: styles.hoverBg, _dark: { bg: styles.hoverBgDark } }}
										>
											<Text fontWeight="semibold">{section.sectionName}</Text>
											<Accordion.ItemIndicator />
										</Accordion.ItemTrigger>
										<Accordion.ItemContent>
											<Accordion.ItemBody px={4} pb={4}>
												<Stack spacing={2}>
													{section.subsections.map(item => (
														<HStack key={`${section.sectionName}-${item.title}`} spacing={3} align="center">
															<Icon as={FiArrowRight} color="icon.brand" />
															<Text color="text.secondary" flex="1">
																{item.title}
															</Text>
															<Text fontSize="sm" color="text.muted">
																{item.time}
															</Text>
														</HStack>
													))}
												</Stack>
											</Accordion.ItemBody>
										</Accordion.ItemContent>
									</Box>
								</Accordion.Item>
							);
						})}
					</Stack>
				</Accordion.Root>
			</Box>
		</Box>
	);
};

const CourseCurriculum = ({ prerequisites, liveSessions, postSessionMaterials }: CourseCurriculumProps) => {
	const allValues = useMemo(
		() => ({
			prerequisites: prerequisites.map(section => `prerequisites-${section.sectionName}`),
			liveSessions: liveSessions.map(section => `liveSessions-${section.sectionName}`),
			postSessionMaterials: postSessionMaterials.map(section => `postSessionMaterials-${section.sectionName}`)
		}),
		[prerequisites, liveSessions, postSessionMaterials]
	);

	const [expandedValues, setExpandedValues] = useState(() => ({
		prerequisites: prerequisites.map(section => `prerequisites-${section.sectionName}`),
		liveSessions: liveSessions.map(section => `liveSessions-${section.sectionName}`),
		postSessionMaterials: postSessionMaterials.map(section => `postSessionMaterials-${section.sectionName}`)
	}));
	const [expandAll, setExpandAll] = useState(true);

	const handleToggle = (checked: boolean) => {
		setExpandAll(checked);
		setExpandedValues(
			checked
				? allValues
				: {
						prerequisites: [],
						liveSessions: [],
						postSessionMaterials: []
					}
		);
	};

	const handleGroupChange = (groupKey: keyof typeof expandedValues, value: string[]) => {
		setExpandedValues(prev => ({ ...prev, [groupKey]: value }));

		if (expandAll && value.length !== allValues[groupKey].length) {
			setExpandAll(false);
		}
	};

	return (
		<Box as="section" py={{ base: 12, md: 16 }} bg="bg.surface">
			<Container maxW="7xl">
				<Stack spacing={6}>
					<Stack spacing={2}>
						<HStack justify="space-between" align="center">
							<Heading fontSize={{ base: 'xl', md: '2xl' }} lineHeight="title" letterSpacing="subtle">
								Course Curriculum
							</Heading>
							<Switch.Root
								checked={expandAll}
								onCheckedChange={({ checked }) => handleToggle(checked)}
								aria-label="Expand all sections"
							>
								<Switch.Control>
									<Switch.Thumb />
								</Switch.Control>
								<Switch.HiddenInput />
							</Switch.Root>
						</HStack>
						<Text color="text.muted" fontSize={{ base: 'sm', md: 'md' }}>
							Expand or explore the full learning path.
						</Text>
					</Stack>

					<Stack spacing={6} mt={{ base: 2, md: 4 }}>
						<CurriculumGroup
							id="prerequisites"
							title="Pre-Requisites Content"
							description="Complete this section before the live session to get the most out of the course. You'll unlock this content immediately after enrolling."
							tone="neutral"
							sections={prerequisites}
							values={expandedValues.prerequisites}
							onValueChange={value => handleGroupChange('prerequisites', value)}
						/>
						<CurriculumGroup
							id="liveSessions"
							title="Live Session Content"
							description="This topic will be taught live in an interactive session, allowing you to engage with the instructor and ask questions in real time. While recordings will be available, attending live offers the best learning experience."
							tone="brand"
							sections={liveSessions}
							values={expandedValues.liveSessions}
							onValueChange={value => handleGroupChange('liveSessions', value)}
						/>
						<CurriculumGroup
							id="postSessionMaterials"
							title="Post Session Study Material"
							description="This section will be unlocked after the session. You'll get access to exclusive bonus content, additional examples, and on-demand resources to support continuous learning and deeper understanding."
							tone="accent"
							sections={postSessionMaterials}
							values={expandedValues.postSessionMaterials}
							onValueChange={value => handleGroupChange('postSessionMaterials', value)}
						/>
					</Stack>
				</Stack>
			</Container>
		</Box>
	);
};

export default CourseCurriculum;
