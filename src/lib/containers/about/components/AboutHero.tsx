import { Box, Button, Container, HStack, Heading, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';

import { instructorApplicationUrl } from '~/lib/containers/about/constants';

const AboutHero = () => {
	const joinNowUrl = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ?? '/#whatsapp';
	const isJoinNowExternal = /^https?:\/\//i.test(joinNowUrl);

	return (
		<Box as="section" id="about-hero" py={{ base: 14, md: 20 }} bg="bg.subtle" position="relative" overflow="hidden">
			<Container maxW="6xl">
				<Stack gap={5} maxW="3xl">
					<Heading as="h1" id="about-hero-heading" fontSize={{ base: '2xl', md: '4xl' }} lineHeight="title">
						About Shattak
					</Heading>
					<Text color="text.secondary" fontSize={{ base: 'md', md: 'lg' }} lineHeight="relaxed">
						Learn from experts through outcome-driven live mentor sessions. Build practical portfolio projects and develop
						job-ready skills with clear, structured guidance.
					</Text>
					<HStack gap={3} flexWrap="wrap">
						<Button
							asChild
							borderRadius="full"
							bg="primary"
							color="text.inverse"
							_hover={{ bg: 'primaryHover' }}
							_focusVisible={{ outline: '2px solid', outlineColor: 'border.brand', outlineOffset: '2px' }}
						>
							<Link href="/#courses" aria-label="Explore Shattak courses">
								Explore Courses
							</Link>
						</Button>
						<Button
							asChild
							borderRadius="full"
							variant="outline"
							borderColor="border.default"
							color="text.primary"
							_hover={{ bg: 'bg.card' }}
							_focusVisible={{ outline: '2px solid', outlineColor: 'border.brand', outlineOffset: '2px' }}
						>
							<Link
								href={instructorApplicationUrl}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Apply to become a Shattak instructor"
							>
								Become an Instructor
							</Link>
						</Button>
					</HStack>
					<Text color="text.muted" fontSize="sm">
						Explore learner stories in our{' '}
						<Link href="/#testimonials" style={{ textDecoration: 'underline' }}>
							Testimonials
						</Link>{' '}
						or{' '}
						<Link
							href={joinNowUrl}
							target={isJoinNowExternal ? '_blank' : undefined}
							rel={isJoinNowExternal ? 'noopener noreferrer' : undefined}
							style={{ textDecoration: 'underline' }}
						>
							Join Now
						</Link>{' '}
						to stay updated on new live classes.
					</Text>
				</Stack>
			</Container>
		</Box>
	);
};

export default AboutHero;
