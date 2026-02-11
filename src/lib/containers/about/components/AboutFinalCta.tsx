import { Box, Button, Container, HStack, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';

import { instructorApplicationUrl } from '~/lib/containers/about/constants';

const AboutFinalCta = () => {
	const joinNowUrl = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ?? '/#whatsapp';
	const isJoinNowExternal = /^https?:\/\//i.test(joinNowUrl);

	return (
		<Box as="section" id="about-final-cta" py={{ base: 12, md: 16 }}>
			<Container maxW="6xl">
				<Box
					bgGradient="var(--chakra-gradients-cta-surface)"
					_dark={{ bgGradient: 'var(--chakra-gradients-cta-surface-dark)' }}
					borderRadius="surface"
					p={{ base: 6, md: 8 }}
					border="1px solid"
					borderColor="border.default"
					boxShadow="elevated"
				>
					<Stack gap={5} textAlign={{ base: 'left', md: 'center' }} align={{ base: 'flex-start', md: 'center' }}>
						<Text fontSize={{ base: 'xl', md: '3xl' }} fontWeight="bold" lineHeight="title">
							Join live classes that build real skills
						</Text>
						<Text color="text.muted" maxW="2xl">
							Start learning with mentor-led sessions, practical projects, and a portfolio that reflects what you can
							do.
						</Text>
						<HStack gap={3} flexWrap="wrap" justify={{ base: 'flex-start', md: 'center' }}>
							<Button asChild borderRadius="full" bg="primary" color="text.inverse" _hover={{ bg: 'primaryHover' }}>
								<Link
									href={joinNowUrl}
									target={isJoinNowExternal ? '_blank' : undefined}
									rel={isJoinNowExternal ? 'noopener noreferrer' : undefined}
								>
									Join Now
								</Link>
							</Button>
							<Button
								asChild
								borderRadius="full"
								variant="outline"
								borderColor="border.default"
								color="text.primary"
								_hover={{ bg: 'bg.card' }}
							>
								<Link href={instructorApplicationUrl} target="_blank" rel="noopener noreferrer">
									Become an Instructor
								</Link>
							</Button>
						</HStack>
					</Stack>
				</Box>
			</Container>
		</Box>
	);
};

export default AboutFinalCta;
