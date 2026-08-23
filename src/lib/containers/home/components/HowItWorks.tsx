'use client';

import { Box, Container, Heading, HStack, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import { FiAward, FiBookOpen, FiCreditCard, FiUserPlus } from 'react-icons/fi';

type HowItWorksStep = {
	title: string;
	description: string;
	icon: IconType;
};

const steps: HowItWorksStep[] = [
	{
		title: 'Enrol for free',
		description: 'Join any course without paying upfront. No card, no deposit, and nothing to cancel later.',
		icon: FiUserPlus
	},
	{
		title: 'Learn with mentors',
		description: 'Work through lessons at your pace and get guidance from mentors whenever you are stuck.',
		icon: FiBookOpen
	},
	{
		title: 'Submit and get certified',
		description: 'Finish the assignments, get them reviewed, and earn a certificate backed by real work.',
		icon: FiAward
	},
	{
		title: 'Pay what it was worth',
		description: 'Only at the end do you decide the fee. Pay whatever amount you feel the course earned from you.',
		icon: FiCreditCard
	}
];

const HowItWorks = () => (
	<Box as="section" aria-labelledby="how-it-works-heading" bg="bg.canvas" py={{ base: 12, md: 16, lg: 20 }}>
		<Container maxW="6xl">
			<Stack gap={{ base: 8, md: 10 }}>
				<Stack gap={2} maxW="2xl">
					<Heading id="how-it-works-heading" fontSize={{ base: '2xl', md: '3xl' }} lineHeight="title">
						How it works
					</Heading>
					<Text color="text.muted" fontSize={{ base: 'sm', md: 'md' }} lineHeight="body">
						Start free, learn with support, prove your work, and decide what the experience was worth.
					</Text>
				</Stack>

				<SimpleGrid as="ol" columns={{ base: 1, sm: 2, lg: 4 }} gap={{ base: 4, md: 5 }} listStyleType="none">
					{steps.map((step, index) => (
						<Box
							as="li"
							key={step.title}
							bg="bg.card"
							border="1px solid"
							borderColor="border.default"
							borderRadius="card"
							boxShadow="soft"
							p={{ base: 5, md: 6 }}
							h="100%"
							minW={0}
							transition="border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease"
							_hover={{ borderColor: 'border.brandSoft', transform: 'translateY(-4px)', boxShadow: 'card' }}
						>
							<Stack gap={4} h="100%">
								<HStack justify="space-between" align="center">
									<Box
										bg="bg.brand"
										color="icon.brand"
										borderRadius="tile"
										boxSize="44px"
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										<Icon as={step.icon} boxSize={5} aria-hidden="true" />
									</Box>
									<Text color="text.brand" fontSize="sm" fontWeight="bold" aria-hidden="true">
										{String(index + 1).padStart(2, '0')}
									</Text>
								</HStack>

								<Stack gap={2}>
									<Heading as="h3" fontSize="md" lineHeight="compact">
										{step.title}
									</Heading>
									<Text color="text.muted" fontSize="sm" lineHeight="body">
										{step.description}
									</Text>
								</Stack>
							</Stack>
						</Box>
					))}
				</SimpleGrid>
			</Stack>
		</Container>
	</Box>
);

export default HowItWorks;
