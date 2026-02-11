import { Box, Container, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';

import { portfolioExamples } from '~/lib/containers/about/constants';
import SectionHeader from '~/lib/containers/course/components/SectionHeader';

const AboutPortfolio = () => (
	<Box as="section" id="what-youll-build" py={{ base: 12, md: 16 }}>
		<Container maxW="6xl">
			<Stack gap={8}>
				<SectionHeader
					title="What you'll build"
					subtitle="Portfolio-first learning so your work can be reviewed, shared, and discussed with confidence."
				/>
				<SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
					{portfolioExamples.map(item => (
						<Box
							key={item.id}
							bg="bg.card"
							borderRadius="card"
							border="1px solid"
							borderColor="border.default"
							p={{ base: 5, md: 6 }}
							boxShadow="soft"
						>
							<Stack gap={2}>
								<Heading as="h3" fontSize="lg" lineHeight="compact">
									{item.title}
								</Heading>
								<Text color="text.muted" lineHeight="relaxed" fontSize="sm">
									{item.description}
								</Text>
							</Stack>
						</Box>
					))}
				</SimpleGrid>
			</Stack>
		</Container>
	</Box>
);

export default AboutPortfolio;
