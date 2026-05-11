'use client';

import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import Header from '~/lib/components/layout/Header';

type OnboardingFrameProps = {
	eyebrow: string;
	title: string;
	description: string;
	children: ReactNode;
};

const OnboardingFrame = ({ eyebrow, title, description, children }: OnboardingFrameProps) => (
	<>
		<Header />
		<Container maxW="6xl" py={{ base: 8, md: 12 }}>
			<Box
				display="grid"
				gridTemplateColumns={{ base: '1fr', lg: '0.8fr 1.2fr' }}
				gap={{ base: 6, lg: 10 }}
				alignItems="start"
			>
				<Stack gap={5} pt={{ base: 0, lg: 6 }} position={{ lg: 'sticky' }} top={{ lg: '112px' }}>
					<Text fontSize="sm" fontWeight="bold" color="primary">
						{eyebrow}
					</Text>
					<Heading size="xl" lineHeight="short">
						{title}
					</Heading>
					<Text color="text.muted" lineHeight="relaxed" maxW="md">
						{description}
					</Text>
					<Box display={{ base: 'none', lg: 'block' }} h="1px" bg="border.default" maxW="sm" />
				</Stack>
				<Box
					border="1px solid"
					borderColor="border.default"
					borderRadius="2xl"
					bg="bg.card"
					p={{ base: 5, md: 7 }}
					boxShadow="soft"
				>
					{children}
				</Box>
			</Box>
		</Container>
	</>
);

export default OnboardingFrame;
