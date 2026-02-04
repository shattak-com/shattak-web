'use client';

import { Box, Button, Container, Heading, HStack, Icon, Separator, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import { FiLinkedin } from 'react-icons/fi';

import Reveal from '~/lib/components/Reveal';
import type { CourseInstructor } from '~/lib/containers/course/types';
import SectionHeader from '~/lib/containers/course/components/SectionHeader';

type CourseInstructorProps = {
	instructors: CourseInstructor[];
};

const CourseInstructor = ({ instructors }: CourseInstructorProps) => (
	<Box as="section" py={{ base: 10, md: 14 }}>
		<Container maxW="7xl">
			<Stack spacing={6}>
				<SectionHeader title="Learn From Expert Instructor" subtitle="Meet the mentors leading the live sessions." />
				<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: 6, md: 8 }} alignItems="stretch">
					{instructors?.map((instructor, index) => (
						<Reveal key={instructor.id} delay={index * 0.05} hover hoverLift={6}>
							<Box
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
							>
								<Box
									position="relative"
									width="100%"
									aspectRatio="1 / 1"
									borderRadius="panel"
									overflow="hidden"
									bg="bg.subtle"
								>
									<Image
										src={instructor.photo}
										alt={instructor.name}
										fill
										sizes="(min-width: 62em) 320px, (min-width: 48em) 45vw, 90vw"
										style={{ objectFit: 'cover', objectPosition: '50% 20%' }}
									/>
								</Box>
								<Stack spacing={3} flex="1">
									<Heading size="md" lineClamp={1} lineHeight="compact">
										{instructor.name}
									</Heading>
									<Text fontSize="sm" color="text.muted">
										{instructor.role}
									</Text>
									<Separator borderColor="border.default" />
									<Text fontSize="sm" color="text.secondary" lineClamp={4}>
										{instructor.bio}
									</Text>
									<Button
										asChild
										size="sm"
										borderRadius="full"
										bg="bg.inverse"
										color="text.inverse"
										_hover={{ bg: 'bg.inverseHover' }}
										alignSelf="flex-start"
									>
										<Link href={instructor.linkedInUrl} target="_blank" rel="noopener noreferrer">
											<Icon as={FiLinkedin} mr={2} />
											LinkedIn
										</Link>
									</Button>
								</Stack>
							</Box>
						</Reveal>
					))}
				</SimpleGrid>
			</Stack>
		</Container>
	</Box>
);

export default CourseInstructor;

