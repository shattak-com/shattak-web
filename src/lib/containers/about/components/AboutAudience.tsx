import { Box, Button, Container, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';

import { instructorApplicationUrl, instructorBenefits, learnerBenefits } from '~/lib/containers/about/constants';
import SectionHeader from '~/lib/containers/course/components/SectionHeader';

const renderBullets = (items: string[]) => (
	<Stack as="ul" gap={3} pl={4}>
		{items.map(item => (
			<Text as="li" key={item} color="text.secondary" lineHeight="relaxed">
				{item}
			</Text>
		))}
	</Stack>
);

const AboutAudience = () => (
	<Box as="section" id="for-learners-and-instructors" py={{ base: 12, md: 16 }} bg="bg.surface">
		<Container maxW="6xl">
			<Stack gap={8}>
				<SectionHeader
					title="Built for learners and instructors"
					subtitle="Two sides of one mission: practical teaching and real outcomes."
				/>
				<SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
					<Box
						bg="bg.card"
						borderRadius="card"
						border="1px solid"
						borderColor="border.default"
						p={{ base: 5, md: 6 }}
						boxShadow="card"
					>
						<Stack gap={4}>
							<Heading as="h3" fontSize="xl">
								For learners
							</Heading>
							{renderBullets(learnerBenefits)}
							<Button
								asChild
								alignSelf="flex-start"
								borderRadius="full"
								bg="primary"
								color="text.inverse"
								_hover={{ bg: 'primaryHover' }}
							>
								<Link href="/#courses">Explore Courses</Link>
							</Button>
						</Stack>
					</Box>

					<Box
						bg="bg.card"
						borderRadius="card"
						border="1px solid"
						borderColor="border.default"
						p={{ base: 5, md: 6 }}
						boxShadow="card"
					>
						<Stack gap={4}>
							<Heading as="h3" fontSize="xl">
								For instructors
							</Heading>
							{renderBullets(instructorBenefits)}
							<Button
								asChild
								alignSelf="flex-start"
								borderRadius="full"
								variant="outline"
								borderColor="border.default"
								color="text.primary"
								_hover={{ bg: 'bg.subtle' }}
							>
								<Link href={instructorApplicationUrl} target="_blank" rel="noopener noreferrer">
									Become an Instructor
								</Link>
							</Button>
						</Stack>
					</Box>
				</SimpleGrid>
			</Stack>
		</Container>
	</Box>
);

export default AboutAudience;
