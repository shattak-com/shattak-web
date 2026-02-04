'use client';

import { Box, Button, Container, HStack, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import { FiExternalLink, FiHeart } from 'react-icons/fi';

import type { CourseProject } from '~/lib/containers/course/types';
import SectionHeader from '~/lib/containers/course/components/SectionHeader';

type CourseProjectsProps = {
	projects: CourseProject[];
};

const getInitials = (name: string) =>
	name
		.split(' ')
		.filter(Boolean)
		.map(part => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

const CourseProjects = ({ projects }: CourseProjectsProps) => (
	<Box as="section" py={{ base: 10, md: 14 }} bg="bg.surface">
		<Container maxW="7xl">
			<Stack spacing={6}>
				<SectionHeader title="See what they have build" />
				<SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 4, md: 6 }}>
					{projects.map(project => (
						<Box
							key={project.id}
							bg="bg.card"
							borderRadius="card"
							border="1px solid"
							borderColor="border.default"
							p={5}
							boxShadow="card"
						>
							<Stack spacing={4}>
								<HStack spacing={3}>
									<Box
										w="36px"
										h="36px"
										borderRadius="full"
										bg="bg.subtle"
										border="1px solid"
										borderColor="border.default"
										display="flex"
										alignItems="center"
										justifyContent="center"
										fontWeight="semibold"
									>
										{getInitials(project.author)}
									</Box>
									<Box>
										<Text fontWeight="semibold">{project.author}</Text>
										<Text fontSize="xs" color="text.muted">
											{project.title}
										</Text>
									</Box>
								</HStack>
								<Box position="relative" aspectRatio="4 / 3" borderRadius="panel" overflow="hidden" bg="bg.subtle">
									<Image src={project.previewImage} alt={project.title} fill sizes="280px" style={{ objectFit: 'cover' }} />
								</Box>
								<HStack justify="space-between">
									<HStack spacing={2} color="text.muted">
										<Icon as={FiHeart} />
										<Text fontSize="sm">{project.likes} Likes</Text>
									</HStack>
									<Button
										asChild
										size="xs"
										borderRadius="full"
										bg="bg.inverse"
										color="text.inverse"
										_hover={{ bg: 'bg.inverseHover' }}
									>
										<Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
											View Live
											<Icon as={FiExternalLink} ml={1} />
										</Link>
									</Button>
								</HStack>
							</Stack>
						</Box>
					))}
				</SimpleGrid>
			</Stack>
		</Container>
	</Box>
);

export default CourseProjects;
