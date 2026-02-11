import { Box, Container, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';

import { aboutValues } from '~/lib/containers/about/constants';
import SectionHeader from '~/lib/containers/course/components/SectionHeader';

const AboutValues = () => (
	<Box as="section" id="values" py={{ base: 12, md: 16 }}>
		<Container maxW="6xl">
			<Stack gap={8}>
				<SectionHeader title="Our values" subtitle="How we keep learning practical, consistent, and outcomes-focused." />
				<SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
					{aboutValues.map(value => (
						<Box
							key={value.id}
							bg="bg.card"
							borderRadius="card"
							border="1px solid"
							borderColor="border.default"
							p={6}
							boxShadow="soft"
						>
							<Stack gap={2}>
								<Heading as="h3" fontSize="lg" lineHeight="compact">
									{value.title}
								</Heading>
								<Text color="text.muted" fontSize="sm" lineHeight="relaxed">
									{value.description}
								</Text>
							</Stack>
						</Box>
					))}
				</SimpleGrid>
			</Stack>
		</Container>
	</Box>
);

export default AboutValues;
