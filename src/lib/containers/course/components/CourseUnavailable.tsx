'use client';

import { Box, Button, Container, Heading, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FiAlertCircle, FiClock, FiMessageCircle } from 'react-icons/fi';

type CourseUnavailableProps = {
	variant?: 'draft' | 'missing';
	title?: string;
	slug?: string;
};

const CourseUnavailable = ({ variant = 'draft', title, slug }: CourseUnavailableProps) => {
	const isDraft = variant === 'draft';
	const heading = isDraft ? 'Course not published yet' : 'Course Not Available';
	const description = isDraft
		? 'This course is currently in draft and will be available once it is published. Please check back soon.'
		: 'The course you are looking for is currently unavailable.';
	const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ?? '#';

	return (
		<Box
			as="section"
			py={{ base: 12, md: 16 }}
			bgGradient="var(--chakra-gradients-cta-surface)"
			_dark={{ bgGradient: 'var(--chakra-gradients-cta-surface-dark)' }}
			position="relative"
			overflow="hidden"
			display="flex"
			alignItems="center"
			flex="1"
		>
			<Box position="absolute" inset="0" pointerEvents="none">
				<Box
					position="absolute"
					top={{ base: '-120px', lg: '-160px' }}
					left={{ base: '-120px', lg: '-140px' }}
					w={{ base: '280px', md: '340px' }}
					h={{ base: '280px', md: '340px' }}
					borderRadius="full"
					bgGradient="var(--chakra-gradients-hero-cool-orb)"
					_dark={{ bgGradient: 'var(--chakra-gradients-hero-cool-orb-dark)' }}
					opacity={0.4}
				/>
				<Box
					position="absolute"
					bottom={{ base: '-140px', lg: '-170px' }}
					right={{ base: '-120px', lg: '-160px' }}
					w={{ base: '300px', md: '360px' }}
					h={{ base: '300px', md: '360px' }}
					borderRadius="full"
					bgGradient="var(--chakra-gradients-hero-warm-orb)"
					_dark={{ bgGradient: 'var(--chakra-gradients-hero-warm-orb-dark)' }}
					opacity={0.35}
				/>
			</Box>

			<Container maxW="5xl" position="relative" w="100%">
				<Box
					bg="bg.card"
					borderRadius="card"
					border="1px solid"
					borderColor="border.default"
					p={{ base: 6, md: 8 }}
					boxShadow="card"
					maxW="3xl"
					mx="auto"
				>
						<Stack spacing={4} textAlign="center" align="center">
						<Box
							w="56px"
							h="56px"
							borderRadius="full"
							bg="bg.accent"
							border="1px solid"
							borderColor="border.accent"
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							<Icon as={isDraft ? FiClock : FiAlertCircle} color="primary" boxSize={6} />
						</Box>
						<Heading size={{ base: 'lg', md: 'xl' }}>{heading}</Heading>
						{title ? (
							<Text fontWeight="semibold" color="text.secondary">
								{title}
							</Text>
						) : null}
						<Text color="text.muted">{description}</Text>
						<Box w="full" h="1px" bg="border.muted" />
						<Text fontSize="sm" color="text.muted">
							Stay updated with the latest news and updates.
						</Text>
						<Box
							bg="bg.success"
							borderRadius="xl"
							border="1px solid"
							borderColor="border.default"
							p={{ base: 4, md: 5 }}
							w="full"
						>
							<Stack
								direction="column"
								spacing={{ base: 3, md: 4 }}
								align="center"
								justify="center"
								textAlign="center"
							>
								<Box
									w="40px"
									h="40px"
									borderRadius="full"
									bg="success.500"
									display="flex"
									alignItems="center"
									justifyContent="center"
								>
									<Icon as={FiMessageCircle} color="white" boxSize={5} />
								</Box>
								<Stack spacing={1} align="center">
									<Text fontWeight="semibold">Join Our WhatsApp Group for Updates</Text>
									<Text fontSize="xs" color="text.muted">
										Get notified when the course is available.
									</Text>
								</Stack>
								<Button
									asChild
									borderRadius="full"
									bg="text.primary"
									color="text.inverse"
									_hover={{ bg: 'text.primary', opacity: 0.9 }}
									px={6}
								>
									<Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
										Join WhatsApp Group
									</Link>
								</Button>
							</Stack>
						</Box>
						<Button asChild borderRadius="full" bg="primary" color="text.inverse" _hover={{ bg: 'primaryHover' }}>
							<Link href="/">Back to home</Link>
						</Button>
					</Stack>
				</Box>
			</Container>
		</Box>
	);
};

export default CourseUnavailable;
