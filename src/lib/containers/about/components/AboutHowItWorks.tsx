'use client';

import { Box, Container, Heading, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { FiClipboard, FiMessageSquare, FiTarget, FiUsers } from 'react-icons/fi';

import Reveal from '~/lib/components/Reveal';
import { features } from '~/lib/constants/landing';
import SectionHeader from '~/lib/containers/course/components/SectionHeader';

const iconMap = {
	mentors: FiUsers,
	projects: FiClipboard,
	support: FiMessageSquare,
	outcomes: FiTarget
};

const AboutHowItWorks = () => (
	<Box as="section" id="how-shattak-works" py={{ base: 12, md: 16 }} bg="bg.surface">
		<Container maxW="6xl">
			<Stack gap={8}>
				<SectionHeader title="How Shattak works" subtitle="A focused system designed to build practical, job-ready skills." />
				<SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={{ base: 6, md: 8 }}>
					{features.map((feature, index) => (
						<Reveal key={feature.id} delay={index * 0.05} hover hoverLift={6}>
							<Box
								bg="bg.card"
								borderRadius="card"
								border="1px solid"
								borderColor="border.default"
								p={6}
								h="100%"
								boxShadow="card"
								_hover={{ borderColor: 'border.brandSoft', bg: 'bg.brand' }}
								transition="border-color 0.2s ease, background 0.2s ease"
							>
								<Stack gap={3}>
									<Box
										bg="bg.subtle"
										borderRadius="tile"
										w="46px"
										h="46px"
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										<Icon as={iconMap[feature.iconKey]} boxSize={5} color="icon.brand" />
									</Box>
									<Heading as="h3" fontSize="lg" lineHeight="compact">
										{feature.title}
									</Heading>
									<Text color="text.muted" fontSize="sm" lineHeight="relaxed">
										{feature.description}
									</Text>
								</Stack>
							</Box>
						</Reveal>
					))}
				</SimpleGrid>
			</Stack>
		</Container>
	</Box>
);

export default AboutHowItWorks;
