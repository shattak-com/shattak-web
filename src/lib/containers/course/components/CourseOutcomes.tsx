'use client';

import { Box, Container, HStack, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';

import type { CourseOutcomeCard } from '~/lib/containers/course/types';
import SectionHeader from '~/lib/containers/course/components/SectionHeader';

type CourseOutcomesProps = {
	outcomes: CourseOutcomeCard[];
};

const CourseOutcomes = ({ outcomes }: CourseOutcomesProps) => (
	<Box as="section" py={{ base: 8, md: 10 }} bg="bg.surface">
		<Container maxW="7xl">
			<Stack spacing={6}>
				<SectionHeader title="After this course, you can" />
				<SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={{ base: 4, lg: 5 }}>
					{outcomes.map(item => (
						<Box
							key={item.id}
							bg="bg.card"
							borderRadius="card"
							border="1px solid"
							borderColor="border.default"
							p={5}
							boxShadow="soft"
							position="relative"
							overflow="hidden"
							transition="transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
							_hover={{ transform: 'translateY(-2px)', boxShadow: 'card', borderColor: 'border.brand' }}
						>
							<Box
								position="absolute"
								top="-18px"
								right="-18px"
								w="68px"
								h="68px"
								borderRadius="full"
								bg="bg.accent"
								opacity={{ base: 0.35, _dark: 0.18 }}
							/>
							<HStack spacing={3} align="start">
								<Box
									w="32px"
									h="32px"
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
								<Text fontSize="sm" fontWeight="semibold" color="text.primary">
									{item.text}
								</Text>
							</HStack>
						</Box>
					))}
				</SimpleGrid>
			</Stack>
		</Container>
	</Box>
);

export default CourseOutcomes;
