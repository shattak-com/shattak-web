'use client';

import { Box, Container, HStack, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';

import SectionHeader from '~/lib/containers/course/components/SectionHeader';

type CourseRequirementsProps = {
	items: string[];
};

const CourseRequirements = ({ items }: CourseRequirementsProps) => (
	<Box as="section" py={{ base: 12, md: 16 }}>
		<Container maxW="7xl">
			<Stack spacing={8}>
				<SectionHeader title="Requirements" subtitle="What you should have before starting the course." />
				<Box bg="bg.card" borderRadius="card" border="1px solid" borderColor="border.default" p={{ base: 6, md: 8 }} boxShadow="card">
					<SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 4, md: 6 }}>
						{items.map(item => (
							<HStack key={item} spacing={3} align="start">
								<Icon as={FiCheckCircle} color="icon.success" mt={1} />
								<Text color="text.secondary">{item}</Text>
							</HStack>
						))}
					</SimpleGrid>
				</Box>
			</Stack>
		</Container>
	</Box>
);

export default CourseRequirements;
