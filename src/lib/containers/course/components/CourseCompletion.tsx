'use client';

import { Box, Container, HStack, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Image from 'next/image';
import { FiCheckCircle } from 'react-icons/fi';

import SectionHeader from '~/lib/containers/course/components/SectionHeader';

const certificationBenefits = [
	'Receive an official course completion certificate',
	'Live verification URL with PDF and downloadable option',
	'Signed by your course designer and the Director of Shattak',
	'Carries your name, course title, and completion date',
	'Recruiters can check it in seconds from your LinkedIn or resume'
];

const CourseCompletion = () => (
	<Box as="section" py={{ base: 10, md: 14 }} bg="bg.surface">
		<Container maxW="7xl">
			<Stack gap={6}>
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
							minH={{ base: '180px', md: '200px' }}
						>
							<Image
								src="/images/courses/course-2.svg"
								alt="Illustration of a verified course completion certificate"
								fill
								sizes="(min-width: 62em) 560px, 90vw"
								style={{ objectFit: 'cover' }}
							/>
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
						<Stack gap={3} position="relative" h="full">
							{certificationBenefits.map(benefit => (
								<HStack key={benefit} gap={3} align="start">
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
							<Box
								mt="auto"
								bg="bg.accent"
								borderRadius="soft"
								border="1px solid"
								borderColor="border.accentSoft"
								p={4}
							>
								<Text fontWeight="semibold">Pay After Certification</Text>
								<Text fontSize="sm" color="text.muted" mt={1}>
									Pay whatever you feel it is worth, only after you get certified. No questions asked.
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
