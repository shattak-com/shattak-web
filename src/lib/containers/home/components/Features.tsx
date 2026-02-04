'use client';

import { Box, Container, Heading, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { FiClipboard, FiMessageSquare, FiTarget, FiUsers } from 'react-icons/fi';

import { features } from '~/lib/constants/landing';
import Reveal from '~/lib/components/Reveal';

const iconMap = {
	mentors: FiUsers,
	projects: FiClipboard,
	support: FiMessageSquare,
	outcomes: FiTarget
};

const Features = () => (
	<Box as="section" py={{ base: 14, md: 18 }} bg="bg.surface">
		<Container maxW="6xl">
			<Stack spacing={10}>
				<Stack spacing={2}>
					<Heading size="lg">	Why Shattak ? </Heading>
					<Text color="text.muted" mb={{ base: 3, md: 4 }}>
						Everything you need to stay consistent and keep learning.
					</Text>
				</Stack>
				<SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={{ base: 10, md: 12, lg: 14 }}>
					{features.map((feature, index) => (
						<Reveal key={feature.id} delay={index * 0.06} hover hoverLift={8}>
							<Box
								bg="bg.card"
								borderRadius="card"
								p={6}
								display="flex"
								flexDirection="column"
								h={{ base: 'auto', md: '200px', lg: '220px' }}
								border="1px solid"
								borderColor="border.default"
								boxShadow="card"
								transition="border-color 0.2s ease, background 0.2s ease"
								_hover={{ borderColor: 'border.brandSoft', bg: 'bg.brand' }}
							>
								<Box
									bg="bg.subtle"
									borderRadius="tile"
									width="48px"
									height="48px"
									display="flex"
									alignItems="center"
									justifyContent="center"
									mb={4}
								>
									<Icon as={iconMap[feature.iconKey]} color="icon.brand" boxSize={6} />
								</Box>
								<Text fontWeight="semibold" mb={2}>
									{feature.title}
								</Text>
								<Text fontSize="sm" color="text.muted" lineClamp={3}>
									{feature.description}
								</Text>
							</Box>
						</Reveal>
					))}
				</SimpleGrid>
			</Stack>
		</Container>
	</Box>
);

export default Features;
