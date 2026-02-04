'use client';

import { Box, Container, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Image from 'next/image';

import type { CourseTool } from '~/lib/containers/course/types';
import SectionHeader from '~/lib/containers/course/components/SectionHeader';

type CourseToolsProps = {
	tools: CourseTool[];
};

const CourseTools = ({ tools }: CourseToolsProps) => (
	<Box as="section" py={{ base: 10, md: 14 }} bg="bg.surface">
		<Container maxW="7xl">
			<Stack spacing={6}>
				<SectionHeader title="Tools you are going to use" />
				<Box
					bg="bg.card"
					borderRadius="surface"
					border="1px solid"
					borderColor="border.default"
					p={{ base: 5, md: 6 }}
					boxShadow="card"
					position="relative"
					overflow="hidden"
				>
					<Box
						position="absolute"
						top="-50px"
						right="-50px"
						w="180px"
						h="180px"
						borderRadius="full"
						bgGradient="var(--chakra-gradients-hero-warm-orb)"
						opacity={{ base: 0.18, _dark: 0.1 }}
					/>
					<SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} gap={{ base: 4, md: 5 }} position="relative">
						{tools.map(tool => (
							<Stack
								key={tool.id}
								role="group"
								align="center"
								spacing={3}
								bg="bg.subtle"
								borderRadius="tile"
								border="1px solid"
								borderColor="border.subtle"
								px={4}
								py={4}
								textAlign="center"
								transition="transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
								_hover={{ transform: 'translateY(-3px)', boxShadow: 'soft', borderColor: 'border.brandSoft' }}
							>
								<Box
									w="52px"
									h="52px"
									borderRadius="full"
									bg="bg.card"
									border="1px solid"
									borderColor="border.default"
									display="flex"
									alignItems="center"
									justifyContent="center"
									boxShadow="soft"
								>
									{tool.image ? (
										<Image src={tool.image} alt={tool.name} width={28} height={28} />
									) : (
										<Text fontWeight="semibold" fontSize="md">
											{tool.name.slice(0, 1).toUpperCase()}
										</Text>
									)}
								</Box>
								<Text fontSize="sm" fontWeight="semibold" color="text.primary">
									{tool.name}
								</Text>
							</Stack>
						))}
					</SimpleGrid>
				</Box>
			</Stack>
		</Container>
	</Box>
);

export default CourseTools;
