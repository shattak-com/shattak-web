import { Badge, Box, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { FiAward, FiCheckCircle, FiClock, FiLock } from 'react-icons/fi';

import type { CertificateAvailability } from './certificate-state';

const certificateStateContent = {
	LOCKED: {
		badge: 'Locked',
		title: 'Complete the course first',
		description: 'Finish all course requirements to make the feedback step available.',
		icon: FiLock
	},
	AWAITING_FEEDBACK: {
		badge: 'Feedback required',
		title: 'Submit your course feedback',
		description: 'Complete the feedback form to move to the certificate release stage.',
		icon: FiLock
	},
	COMING_SOON: {
		badge: 'Coming soon',
		title: 'Certificates are on the way',
		description: 'Certificate generation and downloads are planned for a future Shattak release.',
		icon: FiClock
	},
	AVAILABLE: {
		badge: 'Available',
		title: 'Your certificate is ready',
		description: 'Certificate access will appear here when the certificate service is enabled.',
		icon: FiCheckCircle
	}
} satisfies Record<
	CertificateAvailability,
	{ badge: string; title: string; description: string; icon: typeof FiAward }
>;

type CertificateSectionProps = {
	availability: CertificateAvailability;
};

export const CertificateSection = ({ availability }: CertificateSectionProps) => {
	const content = certificateStateContent[availability];
	const StateIcon = content.icon;
	const isComingSoon = availability === 'COMING_SOON';

	return (
		<Box
			as="section"
			border="1px solid"
			borderColor="border.default"
			borderRadius="card"
			bg="bg.card"
			p={{ base: 5, md: 6 }}
			minH={{ base: '360px', xl: '520px' }}
			display="flex"
		>
			<Stack gap={6} w="full">
				<HStack justify="space-between" gap={3} flexWrap="wrap">
					<Badge bg="bg.accent" color="text.accent" borderRadius="full" px={3} py={1}>
						Certificate
					</Badge>
					<Badge variant="outline" borderRadius="full" px={3} py={1} color={isComingSoon ? 'primary' : 'text.muted'}>
						{content.badge}
					</Badge>
				</HStack>

				<Stack flex="1" align="center" justify="center" textAlign="center" gap={5} py={{ base: 5, md: 8 }}>
					<Box
						position="relative"
						boxSize={{ base: '104px', md: '124px' }}
						borderRadius="3xl"
						bg={isComingSoon ? 'bg.brand' : 'bg.subtle'}
						border="1px solid"
						borderColor={isComingSoon ? 'border.accent' : 'border.default'}
						color="primary"
						display="grid"
						placeItems="center"
						fontSize={{ base: '4xl', md: '5xl' }}
					>
						<FiAward aria-hidden="true" />
						<Box
							position="absolute"
							right="-6px"
							bottom="-6px"
							boxSize="40px"
							borderRadius="full"
							bg="bg.card"
							border="1px solid"
							borderColor="border.default"
							display="grid"
							placeItems="center"
							fontSize="lg"
						>
							<StateIcon aria-hidden="true" />
						</Box>
					</Box>

					<Stack gap={2} maxW="440px">
						<Heading size={{ base: 'lg', md: 'xl' }}>{content.title}</Heading>
						<Text color="text.muted" lineHeight="relaxed">
							{content.description}
						</Text>
					</Stack>

					{isComingSoon ? (
						<Box borderRadius="full" bg="bg.subtle" px={4} py={2}>
							<HStack gap={2} color="text.muted" fontSize="sm">
								<FiClock aria-hidden="true" />
								<Text>No generation, preview, or download is available yet.</Text>
							</HStack>
						</Box>
					) : null}
				</Stack>
			</Stack>
		</Box>
	);
};
