import { Box, Container, Stack, Text } from '@chakra-ui/react';

import SectionHeader from '~/lib/containers/course/components/SectionHeader';

const AboutWhy = () => (
	<Box as="section" id="why-we-exist" py={{ base: 12, md: 16 }}>
		<Container maxW="6xl">
			<Stack gap={6}>
				<SectionHeader
					title="Why we exist"
					subtitle="We are here to bridge the gap between college learning and industry expectations."
				/>
				<Box bg="bg.card" borderRadius="card" border="1px solid" borderColor="border.default" p={{ base: 5, md: 7 }} boxShadow="card">
					<Stack gap={4}>
						<Text color="text.secondary" lineHeight="relaxed">
							Many learners complete coursework but still struggle to apply skills in real project environments. Shattak
							closes this gap with mentor-led live classes, practical assignments, and guided execution.
						</Text>
						<Text color="text.secondary" lineHeight="relaxed">
							Our promise is simple: help you learn with clarity, build meaningful portfolio work, and move forward with
							job-ready confidence.
						</Text>
					</Stack>
				</Box>
			</Stack>
		</Container>
	</Box>
);

export default AboutWhy;
