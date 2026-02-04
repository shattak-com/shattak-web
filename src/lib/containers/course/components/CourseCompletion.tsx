'use client';

import { Box, Container, HStack, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Image from 'next/image';
import { FiCheckCircle } from 'react-icons/fi';

import type { CourseCompletion } from '~/lib/containers/course/types';
import SectionHeader from '~/lib/containers/course/components/SectionHeader';

type CourseCompletionProps = {
	completion: CourseCompletion;
};

const CourseCompletion = ({ completion }: CourseCompletionProps) => (
	<Box as="section" py={{ base: 10, md: 14 }} bg="bg.surface">
		<Container maxW="7xl">
			<Stack spacing={6}>
				<SectionHeader title="What you will get after completing this course" />
				<SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 6, lg: 8 }} alignItems="stretch">
					<Box
						bg="bg.card"
						borderRadius="card"
						border="1px solid"
						borderColor="border.default"
						p={{ base: 5, md: 6 }}
						boxShadow="card"
						position="relative"
						overflow="hidden"
						h="100%"
					>
						<Box
							position="absolute"
							top="-30px"
							left="-30px"
							w="140px"
							h="140px"
							borderRadius="full"
							bgGradient="var(--chakra-gradients-hero-cool-orb)"
							opacity={{ base: 0.35, _dark: 0.18 }}
						/>
						<Box
							position="relative"
							aspectRatio="8 / 4"
							borderRadius="panel"
							overflow="hidden"
							bg="bg.subtle"
							display="flex"
							alignItems="center"
							justifyContent="center"
							minH={{ base: '180px', md: '200px' }}
						>
							{completion.certificateImage ? (
								<Image
									src={completion.certificateImage}
									alt="Completion certificate"
									fill
									sizes="480px"
									style={{ objectFit: 'contain' }}
								/>
							) : (
								<Text fontWeight="semibold" color="text.muted">
									Certificate Preview
								</Text>
							)}
						</Box>
					</Box>
					<Box
						bg="bg.card"
						borderRadius="card"
						border="1px solid"
						borderColor="border.default"
						p={{ base: 5, md: 6 }}
						boxShadow="card"
						position="relative"
						overflow="hidden"
						h="100%"
					>
						<Box
							position="absolute"
							bottom="-24px"
							right="-24px"
							w="120px"
							h="120px"
							borderRadius="full"
							bgGradient="var(--chakra-gradients-hero-warm-orb)"
							opacity={{ base: 0.28, _dark: 0.16 }}
						/>
						<Stack spacing={3} position="relative">
							{completion.benefits.map(benefit => (
								<HStack key={benefit} spacing={3} align="start">
									<Box
										w="24px"
										h="24px"
										borderRadius="full"
										bg="bg.accent"
										border="1px solid"
										borderColor="border.accentSoft"
										display="flex"
										alignItems="center"
										justifyContent="center"
										flexShrink={0}
									>
										<Icon as={FiCheckCircle} color="icon.accent" boxSize={4} />
									</Box>
									<Text color="text.secondary">{benefit}</Text>
								</HStack>
							))}
							<Box bg="bg.subtle" borderRadius="soft" border="1px solid" borderColor="border.subtle" p={4}>
								<Text fontWeight="semibold">Completion bonus</Text>
								<Text fontSize="sm" color="text.muted" mt={1}>
									Certificate access, community showcase, and lifetime mentor guidance.
								</Text>
							</Box>
						</Stack>
					</Box>
				</SimpleGrid>
			</Stack>
		</Container>
	</Box>
);

export default CourseCompletion;
